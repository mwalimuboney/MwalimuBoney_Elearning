
// 1. Define Colors First
const r = "\x1b[1;31m"; // Red Bold
const g = "\x1b[32m";   // Green
const w = "\x1b[1m";    // White Bold
const x = "\x1b[0m";    // Reset

// 2. Create the Time variable
const time = new Date().toLocaleTimeString('en-GB', { hour12: false });

// Syntax: Color + Text + Reset
console.log(`${r}[${time}]${x} ${g}♦️♦️♦️♦️ Downloading script is running 🪁🪁🪁 ♦️♦️♦️♦️${x}`);

const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = async (sock, from, command, args, msg) => {
    
    // --- 1. YOUTUBE MP3 (.play) ---
    if (command === 'play' || command === 'song') {
        if (!args[0]) return sock.sendMessage(from, { text: "❌ Provide a song name!" });

        try {
            await sock.sendPresenceUpdate('composing', from);
            const search = await ytSearch(args.join(" "));
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: "❌ No results found." });

            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: `📥 *Downloading Audio:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}` 
            }, { quoted: msg });

            // Stream audio directly to WhatsApp
            let stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
            
            await sock.sendMessage(from, { 
                audio: { stream }, 
                mimetype: 'audio/mp4', 
                ptt: false 
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "❌ Error downloading audio." });
        }
    }

    // --- 2. YOUTUBE MP4 (.video) ---
    if (command === 'video' || command === 'dl') {
        if (!args[0]) return sock.sendMessage(from, { text: "❌ Provide a video name or link!" });

        try {
            await sock.sendPresenceUpdate('recording', from);
            const search = await ytSearch(args.join(" "));
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: "❌ No results found." });

            await sock.sendMessage(from, { text: `🚀 *Downloading Video:* ${video.title}\n_This may take a moment..._` });

            // Stream video (360p or 480p is best for WhatsApp stability)
            let videoStream = ytdl(video.url, { filter: 'itemobj', quality: 'highest' });

            // Send as Video (or use 'document' if the file is very large)
            await sock.sendMessage(from, { 
                video: { stream: videoStream }, 
                caption: `✅ *Finished:* ${video.title}`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "❌ Error downloading video." });
        }
    }
};
