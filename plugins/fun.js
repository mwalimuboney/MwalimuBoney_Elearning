
// 1. Define Colors First
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

// 2. Create the Time variable
const time = new Date().toLocaleTimeString('en-GB', { hour12: false });

// Syntax: Color + Text + Reset
console.log(`${r}[${time}]${x} ${g}♦️♦️♦️♦️ Stickers and fun script is running 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = async (sock, from, msg, command, args, typeMsg) => {
    
    // --- 1. STICKER COMMAND ---
    if (command === 'sticker' || command === 's') {
        
        // Check if the message is an image or if it's a quoted image
        const isImage = typeMsg === 'imageMessage';
        const isQuotedImage = typeMsg === 'extendedTextMessage' && msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

        if (isImage || isQuotedImage) {
            try {
                await sock.sendPresenceUpdate('composing', from);

                // Get the message object (either direct or quoted)
                const messageContent = isImage ? msg.message.imageMessage : msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
                
                // Download the media
                const stream = await downloadContentFromMessage(messageContent, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // Create Sticker
                const sticker = new Sticker(buffer, {
                    pack: 'Z-Bot Pack 🚀',
                    author: 'My System',
                    type: StickerTypes.FULL,
                    quality: 70,
                });

                const stickerBuffer = await sticker.toBuffer();
                await sock.sendMessage(from, { sticker: stickerBuffer });
                await sock.sendPresenceUpdate('paused', from);

            } catch (e) {
                console.error("Sticker Error:", e);
                await sock.sendMessage(from, { text: "❌ Failed to convert image to sticker." });
            }
        } else {
            await sock.sendMessage(from, { text: "❌ Please reply to an image or send an image with *.sticker*" });
        }
    }


    // --- 2. YOUTUBE MUSIC (.play) ---
    if (command === 'play' || command === 'music') {
        const query = args.join(' ');
        if (!query) return sock.sendMessage(from, { text: "❌ Please provide a song name! Example: *.play Blinding Lights*" });

        try {
            await sock.sendPresenceUpdate('composing', from);
            
            // Search for the video
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: "❌ No results found." });

            const infoText = `🎵 *Z-BOT MUSIC PLAYER* 🎵\n\n📌 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n🔗 *Link:* ${video.url}\n\n_Please wait, downloading audio..._`;
            await sock.sendMessage(from, { text: infoText });

            // Download audio stream
            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });

            // Send as Audio
            await sock.sendMessage(from, { 
                audio: { stream: stream }, 
                mimetype: 'audio/mp4',
                fileName: `${video.title}.mp3`
            }, { quoted: msg });

            await sock.sendPresenceUpdate('paused', from);

        } catch (e) {
            console.error("Music Error:", e);
            await sock.sendMessage(from, { text: "❌ Failed to play music. YouTube might be blocking the request." });
        }
    }


};
