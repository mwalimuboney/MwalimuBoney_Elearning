// --- 1. DEFINE COLORS & LIVE TIME HELPERS ---
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const y = "\x1b[33m";   // Yellow
const x = "\x1b[0m";    // Reset

const fs = require('fs');
const path = require('path');

/**
 * Helper to get current Kenya Time for logs
 */
const getTime = () => {
    return new Date().toLocaleTimeString('en-GB', { 
        hour12: false, 
        timeZone: 'Africa/Nairobi' 
    });
};

console.log(`${r}[${getTime()}]${x} ${g}♦️♦️♦️♦️ Helper system is active 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

/**
 * SELF-HEALING ATOMIC STORAGE HANDLER
 */
const safeJSON = {
    /**
     * Reads JSON with a hard-repair fallback.
     */
    read: (filePath, defaultValue = {}) => {
        try {
            if (!fs.existsSync(filePath)) {
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
                return defaultValue;
            }
            const content = fs.readFileSync(filePath, 'utf8').trim();
            if (!content) return defaultValue;
            
            return JSON.parse(content);
        } catch (e) {
            // SELF-HEALING: If position 8 error occurs, wipe and fix immediately
            console.log(`${r}[${getTime()}] 🚨 REPAIR: ${filePath} was corrupted. Hard-resetting file...${x}`);
            fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        }
    },

    /**
     * ATOMIC WRITE: Writes to a temp file then renames it.
     * This prevents "Unexpected non-whitespace" errors caused by partial writes.
     */
    save: (filePath, data) => {
        const tempPath = `${filePath}.tmp`;
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            const stringified = JSON.stringify(data, null, 2);
            fs.writeFileSync(tempPath, stringified);
            fs.renameSync(tempPath, filePath); // Atomic swap
        } catch (e) {
            console.error(`${r}[${getTime()}] ❌ Write Failure on ${filePath}:${x}`, e.message);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
    },

    updateSettings: (newData) => {
        const filePath = './database/settings.json';
        const current = safeJSON.read(filePath, {});
        const merged = { ...current, ...newData };
        safeJSON.save(filePath, merged);
    }
};



/**
 * --- 1. STORAGE MANAGEMENT ---
 */
async function autoCleanLogs() {
    const logPath = './database/chat_logs.json';
    const settingsPath = './database/settings.json';

    try {
        const settings = safeJSON.read(settingsPath, { autoclean: true });
        if (settings.autoclean === false) return; 

        let logs = safeJSON.read(logPath, []);
        if (!Array.isArray(logs) || logs.length === 0) return;

        const initialCount = logs.length;
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);

        const filteredLogs = logs.filter(log => {
            const isGroup = log.from?.endsWith('@g.us');
            return !isGroup || log.timestamp > twoHoursAgo; 
        });

        if (initialCount !== filteredLogs.length) {
            safeJSON.save(logPath, filteredLogs);
            console.log(`${y}[${getTime()}] 🧹 CLEANER: Purged ${initialCount - filteredLogs.length} old logs.${x}`);
        }
    } catch (e) {
        console.error(`${r}[${getTime()}] AutoClean internal failure:${x}`, e.message);
    }
}

// Background interval (15 mins)
setInterval(autoCleanLogs, 15 * 60 * 1000);

/**
 * --- 2. AUTOMATION & PRIVACY ---
 */
function isNightMode() {
    try {
        const settings = safeJSON.read('./database/settings.json', { nightmode: { active: false } });
        if (!settings.nightmode || !settings.nightmode.active) return false;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-GB', { 
            hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' 
        });
        
        const { start, end } = settings.nightmode;

        const isNight = start > end 
            ? (currentTime >= start || currentTime <= end) 
            : (currentTime >= start && currentTime <= end);

        if (isNight) console.log(`${w}[${getTime()}] 🌙 NIGHTMODE: Active.${x}`);
        return isNight;
    } catch (e) {
        return false;
    }
}

/**
 * --- 3. COMMUNICATION HELPERS ---
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function safeReply(sock, from, text) {
    try {
        console.log(`${g}[${getTime()}] 📨 REPLY: Sending to ${from}${x}`);
        await sock.sendPresenceUpdate('composing', from);
        await delay(1000 + Math.random() * 2000); 
        return sock.sendMessage(from, { text });
    } catch (e) {
        console.error(`${r}[${getTime()}] SafeReply Error:${x}`, e.message);
    }
}

/**
 * --- 4. DATA COLLECTION ---
 */
async function autoSaveContact(msg) {
    const contactPath = './database/contacts.json';
    try {
        let contacts = safeJSON.read(contactPath, []);
        const jid = msg.key.remoteJid;
        const name = msg.pushName || 'Unknown';

        if (jid.endsWith('@s.whatsapp.net') && !contacts.find(c => c.jid === jid)) {
            contacts.push({
                jid,
                name,
                date: getTime()
            });
            safeJSON.save(contactPath, contacts);
            console.log(`${g}[${getTime()}] 💾 DB: Saved contact ${name}${x}`);
        }
    } catch (e) {
        console.error(`${r}[${getTime()}] AutoSave Error:${x}`, e.message);
    }
}

/**
 * --- 5. SECURITY ---
 */
const spamCheck = {};
async function isSpaming(jid) {
    const now = Date.now();
    if (!spamCheck[jid]) spamCheck[jid] = [];
    spamCheck[jid] = spamCheck[jid].filter(t => now - t < 60000);
    
    if (spamCheck[jid].length >= 10) {
        console.log(`${r}[${getTime()}] 🛡️ SECURITY: Blocked ${jid}${x}`);
        return true; 
    }
    spamCheck[jid].push(now);
    return false;
}

module.exports = { 
    safeJSON,
    autoCleanLogs, 
    isNightMode, 
    delay, 
    safeReply, 
    autoSaveContact, 
    isSpaming,
    getTime 
};
