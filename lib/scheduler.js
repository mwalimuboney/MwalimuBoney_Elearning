// --- 1. COLORS & HELPERS ---
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

const cron = require('node-cron');
const fs = require('fs');
const { safeJSON, getTime } = require('./helper');

console.log(`${r}[${getTime()}]${x} ${g}♦️♦️♦️♦️ Scheduler is live (Jan 1-5 Campaign Active) 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

const startScheduler = (sock) => {

    // --- 2. DAILY MORNING/NIGHT GREETINGS ---
    // Good Morning at 07:00 AM
    cron.schedule('0 7 * * *', async () => {
        await runBroadcast(sock, "Good morning 🙏", false);
    });

    // Good Night at 10:00 PM
    cron.schedule('0 22 * * *', async () => {
        await runBroadcast(sock, "Good night 😴", false);
    });

    // --- 3. NEW YEAR SPECIAL CAMPAIGN (JAN 1 - JAN 5) ---
    // Runs at 08:00 AM, 02:00 PM, and 08:00 PM
    cron.schedule('0 7,14,20 * * *', async () => {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth(); // 0 = January

        // Only run from January 1st to January 5th
        if (month === 0 && day <= 5) {
            const hour = now.getHours();
            let timeGreeting = "Good morning";
            if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
            if (hour >= 17) timeGreeting = "Good evening";

            const nyMessage = `Happy new year 🎉 ✨️\n\n${timeGreeting}! Wishing you a blessed 2026.`;
            await runBroadcast(sock, nyMessage, true);
        }
    });
};

/**
 * CORE BROADCAST ENGINE
 * @param {Object} sock - WhatsApp connection
 * @param {String} message - Text to send
 * @param {Boolean} isSpecialOnly - If true, only sends to .special tagged users
 */
async function runBroadcast(sock, message, isSpecialOnly) {
    try {
        console.log(`${g}[${getTime()}] 🚀 Starting Broadcast: "${message.split('\n')[0]}..."${x}`);
        
        const contacts = safeJSON.read('./database/contacts.json', []);
        
        // Filtering logic
        const targets = contacts.filter(p => {
            if (isSpecialOnly) return p.isSpecial === true;
            return p.receiveGreetings === true;
        });

        if (targets.length === 0) {
            console.log(`${r}[${getTime()}] ⚠️ No targets found for this broadcast.${x}`);
            return;
        }

        for (const person of targets) {
            try {
                await sock.sendMessage(person.jid, { text: message });
                console.log(`${w}✅ Sent to: ${person.name || person.jid}${x}`);
                
                // --- 10-SECOND ANTI-BAN INTERVAL ---
                await new Promise(resolve => setTimeout(resolve, 10000)); 
            } catch (err) {
                console.log(`${r}❌ Failed to send to ${person.jid}: ${err.message}${x}`);
            }
        }
        
        console.log(`${g}[${getTime()}] 🏁 Broadcast completed successfully.${x}`);
    } catch (e) {
        console.error("‼️ Broadcast Engine Error:", e);
    }
}

// At the very bottom
module.exports = { startScheduler, runBroadcast };
