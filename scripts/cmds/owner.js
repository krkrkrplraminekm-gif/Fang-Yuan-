const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.3.0",
    author: "Amin",
    role: 0,
    shortDescription: "معلومات مطور البوت",
    category: "Information",
    guide: {
      en: "owner"
    }
  },

  onStart: async function ({ api, event }) {
    // نص المعلومات مزخرف وبالعربية
    const ownerText = 
`╭─ 👑 مـعـلـومـات الـمـطـور 👑 ─╮
│ 👤 الاسـم       : 𝐀𝐦𝐢𝐧
│ 🤖 الـبـوت       : 𝐘𝐮𝐚𝐧 𝐁𝐨𝐭
│ 🎂 الـعـمـر       : 18+
│ 🏠 الـسـكـن     : الخاص
│ 🎓 الـمـهـنـة     : مـطـور سـكـريـبـتـات
│ 💘 الـحـالـة      : سـنـجـل 😉
├─ 🔗 روابـط الـتـواصـل ─╮
│ 📘 فـيـسـبـوك   : fb.com/profile.php?id=61578796876651 
│ 💬 مـاسـنـجـر   : m.me/61578796876651 
╰────────────────╯`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "owner_photo.jpg");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // يمكنك تغيير الرابط أدناه برابط صورتك الشخصية (ارفعها على Imgur وضع الرابط هنا)
    const imgLink = "https://i.imgur.com/v8tT9D9.jpeg"; 

    const send = () => {
      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        },
        event.messageID
      );
    };

    // تحميل الصورة وإرسالها مع النص
    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send)
      .on("error", (err) => {
        // في حال فشل تحميل الصورة يرسل النص فقط
        api.sendMessage(ownerText, event.threadID, event.messageID);
      });
  }
};
