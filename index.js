const { connectToWhatsApp } = require('./lib/connection');
const { startScheduler } = require('./lib/scheduler');
const messageHandler = require('./messageHandler');
const { DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');

const { owner, specialContact } = require('./config'); // Import from config
const contactsPath = './database/contacts.json';
const logger = require('./lib/logger');

// Helper to format JIDs correctly
const formatJid = (id) => id.includes('@') ? id : `${id}@s.whatsapp.net`;

const ownerJids = Array.isArray(owner) ? owner.map(formatJid) : [formatJid(owner)];
const specialConfigJids = Array.isArray(specialContact) ? specialContact.map(formatJid) : [formatJid(specialContact)];

// Group Metadata Cache (to prevent API lag)
const groupCache = new Map();
    
    
// --- 1. SETTINGS & COLORS ---
const g = "\x1b[32m";   // Green
const r = "\x1b[1;31m"; // Red Bold
const y = "\x1b[33m";   // Yellow
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

const startTime = Date.now();
let stats = { messageCount: 0 };

// Helper to get current Kenya time for logs
const getTime = () => {
    return new Date().toLocaleTimeString('en-GB', { 
        hour12: false, 
        timeZone: 'Africa/Nairobi' 
    });
};


/**
 * MAIN BOT START FUNCTION
 */
async function startBot() {
    console.log(`${g}[${getTime()}] 🚀 LOG: Starting futurelink bot Core System...${x}`);

    try {
        // 2. INITIALIZE CONNECTION
        // Note: Auth Menu and Backups are handled internally by connectToWhatsApp
        const { sock } = await connectToWhatsApp();

        // 3. MONITOR CONNECTION EVENTS
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log(`${g}[${getTime()}] ✅ SUCCESS: Session Validated - Bot is Online${x}`);
                
                // Initialize background tasks
                console.log(`${y}[${getTime()}] ⏳ LOG: Starting Scheduler & Auto-Clean...${x}`);
                startScheduler(sock);
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                console.log(`${r}[${getTime()}] 🚨 ALERT: Connection Closed (Reason: ${statusCode})${x}`);

                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    console.log(`${r}[${getTime()}] ❌ CRITICAL: Session Expired. Wiping auth_info...${x}`);
                    if (fs.existsSync('./auth_info')) {
                        fs.rmSync('./auth_info', { recursive: true, force: true });
                    }
                }

                if (shouldReconnect) {
                    console.log(`${y}[${getTime()}] 🔄 LOG: Auto-Rebooting system in 5s...${x}`);
                    setTimeout(() => startBot(), 5000);
                }
            }
        });

       // 4. MESSAGE INCOMING HANDLER


          sock.ev.on('messages.upsert', async (m) => {
              // Process all messages in parallel
              await Promise.all(m.messages.map(async (msg) => {
                  try {
                      if (!msg.message || msg.key.fromMe) return;
          
                      const senderJid = msg.key.remoteJid;
                      const isGroup = senderJid.endsWith('@g.us');
                      const participant = isGroup ? msg.key.participant : senderJid;
                      const pushName = msg.pushName || "Unknown";
                      const messageContent = msg.message?.conversation || 
                                           msg.message?.extendedTextMessage?.text || 
                                           "Media/Non-text";
          
                      stats.messageCount++;
          
                      // 1. CONTACTS.JSON LOGIC (Restructured)
                      if (!isGroup) {
                          setImmediate(() => {
                              let db = { ordinary: [], special: [] };
                              if (fs.existsSync(contactsPath)) {
                                  try { db = JSON.parse(fs.readFileSync(contactsPath)); } catch (e) { /* reset if corrupt */ }
                              }
          
                              // Check if user is in config's special list
                              const isConfigSpecial = specialConfigJids.includes(senderJid);
                              
                              if (isConfigSpecial) {
                                  if (!db.special.includes(senderJid)) {
                                      db.special.push(senderJid);
                                      // Remove from ordinary if they were moved to special
                                      db.ordinary = db.ordinary.filter(id => id !== senderJid);
                                  }
                              } else {
                                  if (!db.ordinary.includes(senderJid) && !db.special.includes(senderJid)) {
                                      db.ordinary.push(senderJid);
                                  }
                              }
                              fs.writeFileSync(contactsPath, JSON.stringify(db, null, 2));
                          });
                      }
          
                      // 2. PRIVILEGE CHECKS
                      const isOwner = ownerJids.includes(participant);
                      // Check both config.js and the json file for 'special' status
                      let dbSpecial = [];
                      try { 
                          const db = JSON.parse(fs.readFileSync(contactsPath));
                          dbSpecial = db.special || [];
                      } catch(e) {}
                      const isSpecial = specialConfigJids.includes(participant) || dbSpecial.includes(participant);
          
                      // 3. DECORATED LOGGING
                      console.log(`${w}┌──────────────────────────────────────────────────┐${x}`);
                      
                      if (isGroup) {
                          // Get group name from cache or fetch from WhatsApp
                          let groupName = groupCache.get(senderJid);
                          if (!groupName) {
                              const metadata = await sock.groupMetadata(senderJid).catch(() => ({ subject: 'Unknown Group' }));
                              groupName = metadata.subject;
                              groupCache.set(senderJid, groupName); // Cache it
                          }
                          console.log(`${y}│ GROUP: ${x}${w}${groupName}${x}`);
                          console.log(`${y}│ FROM:  ${x}${pushName} (${participant.split('@')[0]})`);
                      } else {
                          console.log(`${g}│ PRIVATE CHAT${x}`);
                          console.log(`${g}│ NAME:  ${x}${pushName}`);
                          console.log(`${g}│ PHONE: ${x}${senderJid.split('@')[0]}`);
                      }
          
                      // Status Row
                      let statusLine = isOwner ? `${r}[OWNER]${x} ` : "";
                      statusLine += isSpecial ? `${y}[⭐ SPECIAL]${x} ` : "";
                      if (statusLine) console.log(`│ STATUS: ${statusLine}`);
          
                      console.log(`│ MESSAGE: ${w}${messageContent}${x}`);
                      console.log(`${w}└──────────────────────────────────────────────────┘${x}`);
          
                      // 4. ROUTE TO HANDLER
                      await messageHandler(sock, { messages: [msg], type: m.type }, startTime, stats);
          
                  } catch (err) {
                      console.error(`${r}❌ Handler Error:${x}`, err.message);
                  }
              }));
          });

      
            // Run Group Cleanup every 30 minutes to check for 2-hour old logs
            setInterval(() => {
                logger.cleanGroupLogs();
            }, 30 * 60 * 1000);
            
            // Run Private Backup every 12 hours
            setInterval(() => {
                logger.backupPrivateLogs();
            }, 12 * 60 * 60 * 1000);


    } catch (err) {
        console.error(`${r}[${getTime()}] ☢️ CRITICAL STARTUP ERROR:${x}`, err.message);
        console.log(`${y}[${getTime()}] 🔄 LOG: Attempting hard restart in 10s...${x}`);
        setTimeout(() => startBot(), 10000);
    }
}

// 5. GLOBAL PROCESS PROTECTION
process.on('uncaughtException', (err) => {
    console.log(`${r}[${getTime()}] 🧨 PROCESS CRASHED:${x}`, err.message);
    // Trigger restart
    setTimeout(() => startBot(), 5000);
});

process.on('unhandledRejection', (err) => {
    console.log(`${r}[${getTime()}] ⚠️ UNHANDLED REJECTION:${x}`, err.message);
});

// RUN SYSTEM
startBot();
