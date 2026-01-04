// --- 1. DEFINE COLORS & LIVE TIME HELPERS ---
const r = "\x1b[1;31m"; const g = "\x1b[32m"; const w = "\x1b[1m"; 
const y = "\x1b[33m"; const x = "\x1b[0m";

const fs = require('fs');
const ms = require('ms');
const config = require('./config'); 
const logger = require('./lib/logger');
const { promoteToSpecial } = require('./lib/contactManager');

const getTime = () => {
    return new Date().toLocaleTimeString('en-GB', { 
        hour12: false, timeZone: 'Africa/Nairobi' 
    });
};

// 2. CONFIG & CACHE INITIALIZATION
const groupCache = new Map();
const contactsPath = './database/contacts.json';
const prefix = config.prefix || '.';

const formatJid = (id) => (id && id.includes('@')) ? id : `${id}@s.whatsapp.net`;
const ownerJids = (Array.isArray(config.owner) ? config.owner : [config.owner]).filter(Boolean).map(formatJid);
const specialConfigJids = (Array.isArray(config.specialContact) ? config.specialContact : [config.specialContact]).filter(Boolean).map(formatJid);

// --- 3. IMPORT PLUGINS ---
const adminHandler = require('./plugins/admin.js'); 
const aiHandler = require('./plugins/ai_tools'); 
const funHandler = require('./plugins/fun');
const downloadHandler = require('./plugins/downloaded');
const privacyHandler = require('./plugins/privacy');
const broadcastHandler = require('./plugins/broadcast');
const { safeReply, isSpaming, isNightMode, safeJSON } = require('./lib/helper'); 
const statusHandler = require('./plugins/status');

module.exports = async (sock, m, startTime, stats) => {
    // Process all messages in the batch concurrently
    await Promise.all(m.messages.map(async (msg) => {
        try {
            if (!msg.message) return;

            // --- 4. EXTRACT CORE VARIABLES ---
            const from = msg.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const isMe = msg.key.fromMe;
            const pushName = msg.pushName || "Unknown";
            const sender = isGroup ? msg.key.participant : from;
            const typeMsg = Object.keys(msg.message)[0];

            if (['senderKeyDistributionMessage', 'protocolMessage'].includes(typeMsg)) return;
            if (from.endsWith('@newsletter')) return;

            // --- 5. CONTACT PROMOTION LOGIC (Owner to Private Chat) ---
            if (!isGroup) {
                if (isMe) {
                    // If YOU message them, upgrade to Special
                    promoteToSpecial(from, pushName);
                } else {
                    // Incoming private: Save as Ordinary
                    setImmediate(() => {
                        let db = safeJSON.read(contactsPath, { ordinary: [], special: [] });
                        const isAlreadySpecial = db.special.some(c => (typeof c === 'string' ? c === from : c.jid === from));
                        if (!db.ordinary.includes(from) && !isAlreadySpecial) {
                            db.ordinary.push(from);
                            fs.writeFileSync(contactsPath, JSON.stringify(db, null, 2));
                        }
                    });
                }
            }

            // If the bot sent the message, we stop here (after the promotion logic)
            if (isMe) return;

            // --- 6. STATUS HANDLER ---
            if (from === 'status@broadcast') {
                await statusHandler(sock, msg); 
                return; 
            }

            // --- 7. PRIVILEGE CHECKS ---
            const isOwner = ownerJids.includes(sender);
            let isSpecial = specialConfigJids.includes(sender);
            
            // Re-check DB for special status (for logging badges)
            const db = safeJSON.read(contactsPath, { ordinary: [], special: [] });
            if (db.special.some(c => (typeof c === 'string' ? c === sender : c.jid === sender))) {
                isSpecial = true;
            }

            // --- 8. CONTENT EXTRACTION ---
            const body = (
                msg.message.conversation || 
                msg.message.extendedTextMessage?.text || 
                msg.message.imageMessage?.caption || 
                msg.message.videoMessage?.caption || 
                msg.message.templateButtonReplyMessage?.selectedId || 
                msg.message.buttonsResponseMessage?.selectedButtonId || ""
            ).trim();

            // --- 9. DECORATED LOGGING & CHAT LOGS ---
            stats.messageCount++;
            console.log(`${w}┌──────────────────────────────────────────────────┐${x}`);
            if (isGroup) {
                let gName = groupCache.get(from) || (await sock.groupMetadata(from).then(mt => { groupCache.set(from, mt.subject); return mt.subject; }).catch(() => "Group"));
                console.log(`${y}│ GROUP: ${x}${w}${gName}${x}`);
                console.log(`${y}│ SENDER: ${x}${pushName} (${sender.split('@')[0]})`);
            } else {
                console.log(`${g}│ PRIVATE CHAT${x}\n${g}│ NAME:  ${x}${pushName}\n${g}│ PHONE: ${x}${from.split('@')[0]}`);
            }

            let badges = [];
            if (isOwner) badges.push(`${r}[OWNER]${x}`);
            if (isSpecial) badges.push(`${y}[⭐ SPECIAL]${x}`);
            if (badges.length > 0) console.log(`│ STATUS: ${badges.join(' ')}`);

            console.log(`│ MESSAGE: ${w}${body || "(Media)"}${x}`);
            console.log(`${w}└──────────────────────────────────────────────────┘${x}`);

            logger.logMessage({ isGroup, pushName, senderJid: sender, groupName: isGroup ? groupCache.get(from) : null, message: body, isSpecial });

            // --- 10. SECURITY & SPAM ---
            if (await isSpaming(from)) return;
            if (isNightMode() && isGroup && !isOwner) return; 

            // --- 11. COMMAND PARSING & ROUTING ---
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : "";
            const args = body.trim().split(/ +/).slice(1);

            if (isCmd) {
                await adminHandler(sock, from, command, args, isOwner, pushName, msg);
                await broadcastHandler(sock, from, command, args, msg);
                await downloadHandler(sock, from, command, args, msg);
                await aiHandler(sock, from, command, args, msg, body);
            }

            await funHandler(sock, from, msg, command, args, typeMsg);
            await privacyHandler(sock, msg);

        } catch (err) {
            console.error(`${r}[${getTime()}]${x} ‼️ ERROR:`, err.message);
        }
    }));
};
