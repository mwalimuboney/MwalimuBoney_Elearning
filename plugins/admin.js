// --- 1. DEFINE COLORS & LIVE TIME HELPERS ---
const r = "\x1b[1;31m"; const g = "\x1b[32m"; const w = "\x1b[1m"; const x = "\x1b[0m";

const fs = require('fs');
const os = require('os');
const path = require('path');
const { safeReply, safeJSON, getTime } = require('../lib/helper');

const historyPath = '../commands/commands.json';

// Ensure history directory exists
if (!fs.existsSync('../commands')) fs.mkdirSync('../commands');

/**
 * Saves every command execution to history
 */
const trackCommand = (sender, isOwner, command, type, from, groupMetadata) => {
    const isGroup = from.endsWith('@g.us');
    const historyEntry = {
        timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }),
        userType: isOwner ? "Owner" : "User",
        phoneNumber: sender.split('@')[0],
        command: command,
        type: type, // 'Admin' or 'User'
        location: isGroup ? "Group Chat" : "Private Chat",
        destination: isGroup ? (groupMetadata?.subject || from) : sender.split('@')[0]
    };

    let history = [];
    if (fs.existsSync(historyPath)) {
        try { history = JSON.parse(fs.readFileSync(historyPath)); } catch (e) { history = []; }
    }
    history.push(historyEntry);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
};

module.exports = async (sock, from, command, args, isOwner, pushName, msg) => {
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? msg.key.participant : from;
    let groupMetadata = isGroup ? await sock.groupMetadata(from).catch(() => null) : null;

    // Load latest settings
    let settings = safeJSON.read('../database/settings.json', {
        anticall: false,
        autostatus: false,
        autoclean: true,
        nightmode: { active: false, start: "22:00", end: "06:00" }
    });

    // -------------------------------------------------------------------
    // --- SECTION 1: USER COMMANDS (Available to Everyone) ---
    // -------------------------------------------------------------------
    const userCommands = ['menu', 'help', 'ping', 'system', 'listsp'];
    
    if (userCommands.includes(command)) {
        trackCommand(sender, isOwner, command, "User", from, groupMetadata);
        
        switch (command) {
            case 'menu':
            case 'help':
                const generateMenu = require('../lib/menu');
                await sock.sendMessage(from, { 
                    image: { url: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' },
                    caption: generateMenu(pushName, settings)
                }, { quoted: msg });
                break;

            case 'system':
                const usedMem = Math.round((os.totalmem() - os.freemem()) / 1024 / 1024);
                const sysText = `💻 *SYSTEM INFO*\n\n• *RAM:* ${usedMem}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB\n• *Platform:* ${os.platform()}`;
                await safeReply(sock, from, sysText);
                break;

            case 'listsp':
                const contactsList = safeJSON.read('./database/contacts.json', []);
                const specials = contactsList.filter(p => p.isSpecial === true);
                if (specials.length === 0) return await safeReply(sock, from, "ℹ️ Special List is empty.");
                let listMsg = `⭐ *SPECIAL LIST* ⭐\n\n`;
                specials.forEach((p, i) => { listMsg += `${i + 1}. @${p.jid.split('@')[0]}\n`; });
                await sock.sendMessage(from, { text: listMsg, mentions: specials.map(s => s.jid) });
                break;
        }
        return; // Exit after user command
    }

    // -------------------------------------------------------------------
    // --- SECTION 2: ADMIN COMMANDS (Owner Only) ---
    // -------------------------------------------------------------------
    if (!isOwner) return; // Block any other commands if not owner

    const adminCommands = ['kick', 'promote', 'tagall', 'everyone', 'anticall', 'autostatus', 'autoclean', 'nightmode', 'clear', 'backup', 'special', 'removespecial', 'testbroadcast'];

    if (adminCommands.includes(command)) {
        trackCommand(sender, isOwner, command, "Admin", from, groupMetadata);

        switch (command) {
            case 'kick':
                if (!isGroup) return safeReply(sock, from, "❌ Group only.");
                const userToKick = args[0]?.replace('@', '') + '@s.whatsapp.net';
                await sock.groupParticipantsUpdate(from, [userToKick], "remove").then(() => safeReply(sock, from, "✅ Removed.")).catch(() => safeReply(sock, from, "❌ Error. Am I Admin?"));
                break;

            case 'promote':
                if (!isGroup) return safeReply(sock, from, "❌ Group only.");
                const userToAdmin = args[0]?.replace('@', '') + '@s.whatsapp.net';
                await sock.groupParticipantsUpdate(from, [userToAdmin], "promote").then(() => safeReply(sock, from, "✅ Promoted."));
                break;

            case 'tagall':
            case 'everyone':
                if (!isGroup) return safeReply(sock, from, "❌ Group only.");
                const participants = groupMetadata.participants.map(i => i.id);
                await sock.sendMessage(from, { text: `📢 *ATTENTION:*\n\n${args.join(" ") || "Greetings!"}`, mentions: participants });
                break;

            case 'anticall':
                settings.anticall = (args[0] === 'on');
                await safeReply(sock, from, `☎️ Anti-Call: ${settings.anticall ? 'ON' : 'OFF'}`);
                break;

            case 'nightmode':
                if (!isGroup) return safeReply(sock, from, "❌ Group only.");
                if (args[0] === 'on') {
                    settings.nightmode.active = true;
                    await sock.groupSettingUpdate(from, 'announcement');
                    await safeReply(sock, from, "🌙 Group Closed.");
                } else if (args[0] === 'off') {
                    settings.nightmode.active = false;
                    await sock.groupSettingUpdate(from, 'not_announcement');
                    await safeReply(sock, from, "☀️ Group Opened.");
                }
                break;

            case 'backup':
                const files = ['./database/settings.json', './database/contacts.json', './database/chat_logs.json', historyPath];
                for (let file of files) {
                    if (fs.existsSync(file)) {
                        await sock.sendMessage(from, { document: fs.readFileSync(file), mimetype: 'application/json', fileName: file.split('/').pop() });
                    }
                }
                break;

            case 'special':
                const targetJid = args[0]?.replace('@', '') + '@s.whatsapp.net';
                let allContacts = safeJSON.read('./database/contacts.json', []);
                let cIdx = allContacts.findIndex(c => c.jid === targetJid);
                if (cIdx === -1) allContacts.push({ jid: targetJid, isSpecial: true });
                else allContacts[cIdx].isSpecial = true;
                fs.writeFileSync('./database/contacts.json', JSON.stringify(allContacts, null, 2));
                await safeReply(sock, from, `🌟 Added @${args[0].replace('@', '')} to special list.`);
                break;
                
            case 'testbroadcast':
                const { runBroadcast } = require('../scheduler'); 
                await runBroadcast(sock, "Manual Test Broadcast", true); 
                await safeReply(sock, from, "✅ Broadcast Completed.");
                break;
        }
        safeJSON.updateSettings(settings); // Sync settings
    }
};
