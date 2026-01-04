// --- 1. DEFINE COLORS & LIVE TIME HELPERS ---
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

const getTime = () => {
    return new Date().toLocaleTimeString('en-GB', { 
        hour12: false, 
        timeZone: 'Africa/Nairobi' 
    });
};

console.log(`${r}[${getTime()}]${x} ${g}♦️♦️♦️♦️ Connection script is running 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

// Imports
const { handleAuth, displayQR } = require('./qrHandler');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const AdmZip = require('adm-zip');

/**
 * Main Connection Function
 */
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'fatal' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        shouldSyncHistoryMessage: () => false, 
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
    });

    // --- AUTHENTICATION HANDLER ---
    if (!sock.authState.creds.registered) {
        console.log(`${r}[${getTime()}] No session found. Launching Auth Menu...${x}`);
        // This triggers your interactive QR/Pairing selection
        await handleAuth(sock);
    }

    // --- CREDENTIALS SAVING ---
    sock.ev.on('creds.update', async () => {
        await saveCreds();
    });

    // --- CONNECTION WATCHDOG & BACKUP ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Auto-refresh QR if user chose QR method
        if (qr) displayQR(qr);

        if (connection === 'open') {
            console.clear();
            console.log(`${g}[${getTime()}] ✅ CONNECTION OPEN: Bot is now online!${x}`);
            await saveCreds();
            
            // Trigger auto-backup to your own WhatsApp after 5 seconds
            setTimeout(() => backupSession(sock), 5000);
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(`${r}[${getTime()}] 🚨 WATCHDOG: Connection lost (Reason: ${statusCode})${x}`);

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                console.log(`${r}⚠️ ALERT: Session expired/logged out. Wiping session files...${x}`);
                if (fs.existsSync('./auth_info')) fs.rmSync('./auth_info', { recursive: true, force: true });
            }

            if (shouldReconnect) {
                console.log(`${g}[${getTime()}] 🔄 Watchdog triggering auto-reboot in 5s...${x}`);
                await delay(5000);
                connectToWhatsApp(); // Recursive restart
            }
        }
    });

    return { sock, saveCreds };
}

/**
 * AUTO-BACKUP SYSTEM
 * Sends a zip of your session keys to your own WhatsApp
 */
async function backupSession(sock) {
    try {
        if (!fs.existsSync('./auth_info/creds.json')) return;

        const zip = new AdmZip(); 
        zip.addLocalFolder('./auth_info');
        const zipBuffer = zip.toBuffer();

        const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        console.log(`${g}[${getTime()}] 🛡️ LOG: Sending session backup to ${myNumber}...${x}`);

        await sock.sendMessage(myNumber, { 
            document: zipBuffer, 
            mimetype: 'application/zip', 
            fileName: `zbot_session_backup.zip`, 
            caption: `🛡️ *Z-BOT SESSION BACKUP*\n\n*Time:* ${getTime()}\n*Status:* Secure\n\nKeep this to bypass QR next time.` 
        });

        console.log(`${g}[${getTime()}] ✅ LOG: Backup successfully sent.${x}`);
    } catch (e) {
        console.log(`${r}[${getTime()}] ❌ Backup Failed: ${e.message}${x}`);
    }
}

module.exports = { connectToWhatsApp };
