
// 1. Define Colors First
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

// 2. Create the Time variable
const time = new Date().toLocaleTimeString('en-GB', { hour12: false });

// Syntax: Color + Text + Reset
console.log(`${r}[${time}]${x} ${g}♦️♦️♦️♦️ Privacy script is running 🪁🪁🪁 ♦️♦️♦️♦️${x}`);


const config = require('../config');

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid;
    const typeMsg = Object.keys(msg.message || {})[0];
    
    // Ensure owner JID is formatted correctly
    const ownerJid = config.owner.endsWith('@s.whatsapp.net') ? config.owner : `${config.owner}@s.whatsapp.net`;

    // --- 1. ALWAYS ONLINE ---
    // This tells WhatsApp you are available
    await sock.sendPresenceUpdate('available');

    // --- 2. ANTI-VIEW ONCE ---
    if (typeMsg === 'viewOnceMessageV2' || typeMsg === 'viewOnceMessage') {
        try {
            // Forward the view-once media to your private chat
            // true = readViewOnce: allows the owner to see it normally
            await sock.copyNForward(ownerJid, msg, true);
            
            await sock.sendMessage(ownerJid, { 
                text: `🕵️ *View-Once Bypassed*\n👤 *From:* ${msg.pushName || from}\n📍 *Chat:* ${from}` 
            });
            
            console.log(`[PRIVACY] View-Once bypassed for ${ownerJid}`);
        } catch (e) {
            console.error("Anti-ViewOnce Error:", e);
        }
    }

    // --- 3. AUTO-READ ---
    // Optional: Mark all messages as read automatically
    // await sock.readMessages([msg.key]);
};
