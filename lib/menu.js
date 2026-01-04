// 1. Define Colors First
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

// 2. Create the Time variable (Kenya Time)
const getTime = () => new Date().toLocaleTimeString('en-GB', { 
    hour12: false, 
    timeZone: 'Africa/Nairobi' 
});

console.log(`${r}[${getTime()}]${x} ${g}♦️♦️♦️♦️ Menu script is running 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

module.exports = (pushName, settings) => {
    return `
🚀 *Z-BOT MULTI-DEVICE V2.0* 🚀
Hi *${pushName}*! System is active.

*👑 OWNER & ADMIN (Strictly Owner)*
• .kick / .promote — Manage members
• .tagall / .everyone — Mention all
• .bc [msg] — Global broadcast
• .backup — Export database files
• .clear [groups/private] — Wipe logs
• .anticall [on/off] — Block calls
• .autoclean [on/off] — Auto-wipe logs
• .nightmode [on/off/set] — Group lock

*⭐ SPECIAL LIST MANAGEMENT*
• .special @user — Add to special list
• .removespecial @user — Remove user
• .listsp — View special contacts
• .testbroadcast — Manual test run

*🤖 ARTIFICIAL INTELLIGENCE*
• .ai [query] — GPT-4o with Memory
• .draw [prompt] — DALL-E 3 Images

*📥 DOWNLOADERS & TOOLS*
• .play [song] — YouTube MP3
• .video [link] — YouTube MP4
• .sticker — Convert Media to Sticker
• .ping — Check bot response time
• .stats — System & Uptime info
• .system — Server RAM & OS info

*🛡️ SYSTEM STATUS*
• Anti-Delete: ✅ Active
• Anti-ViewOnce: ✅ Bypassed
• Anti-Call: ${settings.anticall ? '✅' : '❌'}
• Auto-Status: ${settings.autostatus ? '✅' : '❌'}
• Night Mode: ${settings.nightmode?.active ? '🌙 ON' : '☀️ OFF'}

_Use the prefix "${settings.prefix || '.'}" before commands._
    `.trim();
};
