const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "kiss2",
    aliases: ["k2", "بوسة2"],
    version: "2.0",
    author: "Amin", // اسمك يا بطل
    link: "https://www.facebook.com/profile.php?id=61578796876651", // رابط حسابك
    role: 0,
    category: "fun",
    cooldown: 8,
    guide: {
        en: "kiss2 [mention/reply/UID]"
    }
  },

  onStart: async function ({ api, event, args }) {
    // حماية الحقوق الخاصة بك (Amin)
    const obfuscatedAuthor = String.fromCharCode(65, 109, 105, 110); 
    if (module.exports.config.author.trim() !== obfuscatedAuthor) {
      return api.sendMessage("❌ | لا يمكنك تغيير حقوق المطور أمين.", event.threadID, event.messageID);
    }

    const { threadID, messageID, messageReply, mentions, senderID } = event;

    let id1 = senderID;
    let id2;

    // تحديد الشخص المستهدف (رد، منشن، أو آيدي)
    if (messageReply) {
      id2 = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      id2 = Object.keys(mentions)[0];
    } else if (args[0]) {
      id2 = args[0];
    } else {
      return api.sendMessage("💋 | يرجى الرد على رسالة الشخص أو عمل منشن له أو وضع الـ UID الخاص به!", threadID, messageID);
    }

    try {
      // إشعار المستخدم بالانتظار
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const base = await baseApiUrl();
      const url = `${base}/api/dig?type=kiss&user=${id1}&user2=${id2}`;

      const response = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `kiss2_${id2}.png`);
      fs.writeFileSync(filePath, response.data);

      api.sendMessage(
        {
          body: `[ 𝐘𝐮𝐚𝐧 𝐒𝐲𝐬𝐭𝐞𝐦 ]\n━━━━━━━━━━━━━\nتم تنفيذ القبلة بنجاح 💋\n👤 المطور: Amin\n🔗 حسابي: ${module.exports.config.link}`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        messageID
      );
      
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      api.sendMessage(`🥹 حدث خطأ أثناء جلب الصورة، حاول لاحقاً أو تواصل مع أمين.`, threadID, messageID);
    }
  }
};
