const fs = require('fs');
const path = require('path');
const logPath = './database/chat_logs.json';
const backupDir = './database/backups/';

// Ensure directories exist
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

const logger = {
    /**
     * Appends a message to the logs with specific metadata
     */
    logMessage: (data) => {
        const { isGroup, pushName, senderJid, groupName, message, isSpecial } = data;
        
        const logEntry = isGroup ? {
            type: "Group",
            groupName: groupName || "Unknown Group",
            sender: pushName,
            phone: senderJid.split('@')[0],
            timestamp: Date.now(),
            message: message
        } : {
            type: "Private",
            sender: pushName,
            phone: senderJid.split('@')[0],
            status: isSpecial ? "Special" : "Ordinary",
            timestamp: Date.now(),
            message: message
        };

        // Append as a new line for high-speed processing
        fs.appendFile(logPath, JSON.stringify(logEntry) + '\n', (err) => {
            if (err) console.error("Log Error:", err);
        });
    },

    /**
     * Cleans Group messages older than 2 hours
     */
    cleanGroupLogs: () => {
        if (!fs.existsSync(logPath)) return;
        
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
        
        const filteredLines = lines.filter(line => {
            const log = JSON.parse(line);
            // Keep all Private messages, but only keep Group messages newer than 2 hours
            if (log.type === "Group") return log.timestamp > twoHoursAgo;
            return true; 
        });

        fs.writeFileSync(logPath, filteredLines.join('\n') + '\n');
        console.log(`[${new Date().toLocaleTimeString()}] 🧹 Auto-Clean: Group logs pruned.`);
    },

    /**
     * Backs up private messages only
     */
    backupPrivateLogs: () => {
        if (!fs.existsSync(logPath)) return;

        const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
        const privateLogs = lines
            .map(l => JSON.parse(l))
            .filter(log => log.type === "Private");

        const fileName = `private_backup_${Date.now()}.json`;
        fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(privateLogs, null, 2));
        console.log(`[${new Date().toLocaleTimeString()}] 📁 Backup: Private messages secured.`);
    }
};

module.exports = logger;
