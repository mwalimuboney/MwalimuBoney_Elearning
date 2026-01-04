const fs = require('fs');
const path = require('path');

const contactsPath = './database/contacts.json';
const configPath = '../config.js';

/**
 * Checks if current time is "Daytime" (6 AM - 6 PM)
 * and verifies hourly/daily limits.
 */
const canSaveContact = () => {
    const now = new Date().toLocaleString("en-GB", { timeZone: "Africa/Nairobi" });
    const hour = new Date(now).getHours();
    const dateStr = new Date(now).toDateString();

    // 1. Only during the day (6 AM to 6 PM)
    if (hour < 6 || hour >= 18) return false;

    let stats = { date: dateStr, dailyCount: 0, hourlyStats: {} };
    if (fs.existsSync('./database/save_stats.json')) {
        stats = JSON.parse(fs.readFileSync('./database/save_stats.json'));
    }

    // Reset stats if it's a new day
    if (stats.date !== dateStr) {
        stats = { date: dateStr, dailyCount: 0, hourlyStats: {} };
    }

    const currentHourStr = hour.toString();
    stats.hourlyStats[currentHourStr] = stats.hourlyStats[currentHourStr] || 0;

    // 2. Limit: 60 per day, 10 per hour
    if (stats.dailyCount >= 60 || stats.hourlyStats[currentHourStr] >= 10) return false;

    // Increment and save stats
    stats.dailyCount++;
    stats.hourlyStats[currentHourStr]++;
    fs.writeFileSync('./database/save_stats.json', JSON.stringify(stats, null, 2));
    
    return true;
};

const updateConfigJS = (newSpecialJid) => {
    let configContent = fs.readFileSync(configPath, 'utf8');
    const numberOnly = newSpecialJid.split('@')[0];
    
    // Simple regex to find the specialContact array and add the number if not present
    if (!configContent.includes(numberOnly)) {
        configContent = configContent.replace(
            /(specialContact:\s*\[)([\s\S]*?)(\])/,
            `$1$2"${numberOnly}", $3`
        );
        fs.writeFileSync(configPath, configContent);
    }
};

const promoteToSpecial = (jid, pushName) => {
    if (!canSaveContact()) return console.log("⚠️ Limit reached or outside daytime hours.");

    let db = { ordinary: [], special: [] };
    if (fs.existsSync(contactsPath)) {
        db = JSON.parse(fs.readFileSync(contactsPath));
    }

    const name = pushName || "Unknown";
    const contactObj = { jid, name };

    // Move from ordinary to special if exists, or just add to special
    db.ordinary = db.ordinary.filter(c => (typeof c === 'string' ? c : c.jid) !== jid);
    
    const alreadySpecial = db.special.some(c => c.jid === jid);
    if (!alreadySpecial) {
        db.special.push(contactObj);
        fs.writeFileSync(contactsPath, JSON.stringify(db, null, 2));
        updateConfigJS(jid);
        console.log(`✅ ${name} (${jid}) promoted to Special.`);
    }
};

module.exports = { promoteToSpecial };
