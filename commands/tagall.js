// commands/tagall.js
module.exports = async (sock, from, args, msg, pushName) => {
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) return sock.sendMessage(from, { text: "❌ This command only works in groups!" });

    try {
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const message = args.slice(1).join(' ') || "Attention everyone! 📢";
        
        let tagText = `🌟 *TAG ALL* 🌟\n\n📢 *Message:* ${message}\n\n`;
        let mentions = [];

        for (let mem of participants) {
            tagText += `👥 @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        }

        await sock.sendMessage(from, { text: tagText, mentions: mentions });
    } catch (e) {
        console.log("Error in tagall:", e);
        await sock.sendMessage(from, { text: "❌ Error fetching group members." });
    }
};
