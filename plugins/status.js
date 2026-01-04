
// 1. Define Colors First
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

// 2. Create the Time variable
const time = new Date().toLocaleTimeString('en-GB', { hour12: false });

// Syntax: Color + Text + Reset
console.log(`${r}[${time}]${x} ${g}♦️♦️♦️♦️ Status script is running 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid;
    if (from !== 'status@broadcast') return;

    const participant = msg.key.participant;
    const settings = JSON.parse(fs.readFileSync('./database/settings.json'));

    try {
        // --- 1. ALWAYS AUTO-VIEW ---
        await sock.readMessages([msg.key]);

        // --- 2. CONDITIONAL AUTO-DOWNLOAD ---
        if (settings.autostatus) {
            const type = Object.keys(msg.message)[0];
            
            // Filter to only download if it's an image or video
            if (type === 'imageMessage' || type === 'videoMessage') {
                const mediaContent = msg.message[type];
                const stream = await downloadContentFromMessage(mediaContent, type === 'imageMessage' ? 'image' : 'video');
                
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const filename = `./downloads/status/${participant.split('@')[0]}_${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`;
                
                if (!fs.existsSync('./downloads/status')) fs.mkdirSync('./downloads/status', { recursive: true });
                fs.writeFileSync(filename, buffer);
                
                console.log(`📥 Status downloaded: ${filename}`);
            }
        }
    } catch (e) {
        console.error("Status Error:", e);
    }
};
