
// 1. Define Colors First
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

// 2. Create the Time variable
const time = new Date().toLocaleTimeString('en-GB', { hour12: false });

// Syntax: Color + Text + Reset
console.log(`${r}[${time}]${x} ${g}♦️♦️♦️♦️ AI tools script is running 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

const { OpenAI } = require('openai');
const config = require('../config');

// Initialize OpenAI
const openai = new OpenAI({ apiKey: config.openAIKey });

module.exports = async (sock, from, command, args, msg, body) => {
    
    // 1. Detect if this message is a reply to one of your broadcasts
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isBroadcastReply = quotedMsg?.conversation?.includes("OFFICIAL BROADCAST") || 
                             quotedMsg?.imageMessage?.caption?.includes("OFFICIAL BROADCAST");

    // 2. Logic for AI Response (Triggered by .ai command OR a broadcast reply)
    if (command === 'ai' || command === 'gpt' || isBroadcastReply) {
        
        // If it's a broadcast reply, use the full message body as the prompt
        // If it's a command, use the arguments provided
        const prompt = isBroadcastReply ? body : args.join(" ");

        if (!prompt) {
            if (isBroadcastReply) return; // Silent if they reply with nothing
            return sock.sendMessage(from, { text: "❌ Please provide a question!" });
        }

        try {
            await sock.sendPresenceUpdate('composing', from);

            // --- FEATURE: SAVED RESPONSES (FAQ) ---
            const savedResponses = {
                "price": "💰 Our services start at $10. Visit our site for more details!",
                "who are you": "🤖 I am Z-Bot, your automated assistant powered by AI.",
                "help": "❓ How can I assist you today? You can ask me anything!",
            };

            const trigger = Object.keys(savedResponses).find(key => prompt.toLowerCase().includes(key));
            
            if (trigger) {
                await sock.sendPresenceUpdate('paused', from);
                return await sock.sendMessage(from, { text: savedResponses[trigger] }, { quoted: msg });
            }

            // --- FEATURE: OPENAI GPT ---
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            });

            await sock.sendPresenceUpdate('paused', from);
            const aiResponse = response.choices[0].message.content;
            
            await sock.sendMessage(from, { text: `🤖 *AI:* ${aiResponse}` }, { quoted: msg });

        } catch (e) {
            await sock.sendPresenceUpdate('paused', from);
            console.error("AI Error:", e);
            if (!isBroadcastReply) {
                await sock.sendMessage(from, { text: "❌ AI Error: Check API Key or credits." });
            }
        }
    }

    // --- 3. DALL-E IMAGE GENERATION ---
    if (command === 'draw' || command === 'img') {
        if (!args[0]) return sock.sendMessage(from, { text: "❌ Please provide a prompt!" });

        try {
            await sock.sendPresenceUpdate('recording', from);
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: args.join(" "),
                n: 1,
                size: "1024x1024",
            });

            await sock.sendPresenceUpdate('paused', from);
            await sock.sendMessage(from, { 
                image: { url: response.data[0].url }, 
                caption: `🎨 *AI Generated:* ${args.join(" ")}` 
            }, { quoted: msg });

        } catch (e) {
            await sock.sendPresenceUpdate('paused', from);
            await sock.sendMessage(from, { text: "❌ Image Error: Prompt blocked or API limit reached." });
        }
    }
};
