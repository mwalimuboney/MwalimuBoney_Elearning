// --- 1. DEFINE COLORS & LIVE TIME HELPERS ---
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset
const y = "\x1b[33m";   // Yellow

const qrcode = require('qrcode-terminal');
const readline = require('readline');

// Helper to get current time for every log (Kenya Timezone)
const getTime = () => {
    return new Date().toLocaleTimeString('en-GB', { 
        hour12: false, 
        timeZone: 'Africa/Nairobi' 
    });
};

console.log(`${r}[${getTime()}]${x} ${g}♦️♦️♦️♦️ QR/Pairing Handler Initialized 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

/**
 * Main function to handle the authentication UI and logic
 */
const handleAuth = async (sock) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));

    let isConnected = false;

    while (!isConnected) {
        console.clear();
        console.log(`${w}╔════════════════════════════════════╗${x}`);
        console.log(`${w}║      ${g}WHATSAPP LINKING MANAGER${x}      ${w}║${x}`);
        console.log(`${w}╠════════════════════════════════════╣${x}`);
        console.log(`${w}║ [1] QR Code (Scan with Phone)      ║${x}`);
        console.log(`${w}║ [2] Pairing Code (Enter Number)    ║${x}`);
        console.log(`${w}╚════════════════════════════════════╝${x}\n`);

        const choice = await question(`${g}[${getTime()}] Select Option (1 or 2): ${x}`);

        if (choice === '1') {
            console.log(`${y}[${getTime()}] Waiting for WhatsApp to generate QR...${x}`);
            // Logic handled via the 'connection.update' listener in index.js
            rl.close();
            break; 
        } 
        
        else if (choice === '2') {
            let phoneNumber = await question(`${g}[${getTime()}] Enter Phone (e.g. 254...): ${x}`);
            
            if (phoneNumber.toLowerCase() === 'back') continue;

            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            if (phoneNumber.length < 10) {
                console.log(`${r}[${getTime()}] Invalid Number! Retrying...${x}`);
                await new Promise(res => setTimeout(res, 2000));
                continue;
            }

            rl.close(); // Close interface before entering async loop
            
            // Self-handling Pairing Code Generator
            const getPairingCode = async () => {
                try {
                    console.clear();
                    console.log(`${y}[${getTime()}] Requesting Pairing Code from WhatsApp...${x}`);
                    
                    // Small delay to ensure socket is ready
                    await new Promise(res => setTimeout(res, 3000));
                    
                    const code = await sock.requestPairingCode(phoneNumber);
                    
                    console.clear();
                    console.log(`${w}╔════════════════════════════════════╗${x}`);
                    console.log(`${w}║ YOUR CODE:        ${r}${code}${x}         ${w}║${x}`);
                    console.log(`${w}╚════════════════════════════════════╝${x}\n`);
                    console.log(`${g}[${getTime()}] SUCCESS: Code generated for ${phoneNumber}${x}`);
                    console.log(`${y}Tip: If this code expires, I will auto-generate a new one.${x}`);
                } catch (err) {
                    console.log(`${r}[${getTime()}] ERROR: ${err.message}. Retrying in 10s...${x}`);
                    setTimeout(getPairingCode, 10000); // Auto-retry on failure
                }
            };
            
            await getPairingCode();
            break;
        } 
        
        else {
            console.log(`${r}[${getTime()}] Invalid Choice. Select 1 or 2.${x}`);
            await new Promise(res => setTimeout(res, 2000));
        }
    }
};

/**
 * Exportable QR Display function (Called by connection.update)
 */
const displayQR = (qr) => {
    if (qr) {
        console.clear();
        console.log(`${g}[${getTime()}] ✨ NEW QR CODE GENERATED ✨${x}`);
        qrcode.generate(qr, { small: true });
        console.log(`${y}Tip: Linking expires in 60 seconds. Scan now!${x}`);
    }
};

module.exports = { handleAuth, displayQR, getTime };


//module.exports = { displayQR };
