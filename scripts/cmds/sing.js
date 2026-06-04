const play = require("play-dl");
const B = require("fs-extra");
const C = require("path");
const fs = require("fs"); 

const p = C.join(__dirname, "cache", `${Date.now()}.mp3`);

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music", "play"],
    version: "0.0.2",
    author: "ArYAN",
    countDown: 10,
    role: 0,
    category: "media"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID: t, messageID: m } = event;
    const q = args.join(" ");
    if (!q) return api.sendMessage("❌ Please provide a song name or link.", t, m);

    api.setMessageReaction("⏳", m, () => {}, true);

    try {
      let videoUrl = q;

      // 🔍 إذا لم يكن المدخل رابطاً، نبحث عنه في يوتيوب
      if (!q.startsWith("http")) {
        const searchResults = await play.search(q, { limit: 1 });
        if (!searchResults || searchResults.length === 0) throw new Error("لم يتم العثور على الأغنية 🧘");
        videoUrl = searchResults[0].url;
      }

      // 🎧 جلب بيانات الفيديو ورابط البث المباشر للصوت فقط
      const videoInfo = await play.video_info(videoUrl);
      const title = videoInfo.video_details.title || "Song";
      const stream = await play.stream(videoUrl, { filter: "audioonly" });

      // 📂 حفظ ملف الصوت في التخزين المؤقت (Cache) تدريجياً
      const writeStream = fs.createWriteStream(p);
      stream.stream.pipe(writeStream);

      // ⏳ الانتظار حتى يكتمل تحميل الملف بالكامل قبل إرساله
      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      api.setMessageReaction("✅", m, () => {}, true);

      return api.sendMessage({
        body: `🎵 Title: ${title}`,
        attachment: B.createReadStream(p)
      }, t, () => {
        if (B.existsSync(p)) B.unlinkSync(p);
      }, m);

    } catch (e) {
      api.setMessageReaction("❌", m, () => {}, true);
      if (B.existsSync(p)) B.unlinkSync(p); // تنظيف الملف لو حدث خطأ أثناء التحميل
      return api.sendMessage(`❌ Error: ${e.message}`, t, m);
    }
  }
};
