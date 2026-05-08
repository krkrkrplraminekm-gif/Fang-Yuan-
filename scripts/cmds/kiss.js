const axios = require("axios");
const fs = require("fs");
const path = require("path");

// دالة جلب الرابط الأساسي (تركتها لكي يستمر الأي بي آي في العمل)
const getBase = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "kiss",
    version: "2.0",
    author: "Amin", // اسمك هنا يا بطل
    link: "https://www.facebook.com/profile.php?id=61578796876651", // رابط حسابك
    countDown: 5,
    role: 0,
    longDescription: "توليد صورة قبلة (رد على الشخص أو منشن)",
    category: "love",
    guide: {
        en: "{pn} @mention or reply to a message"
    }
  },

  onStart: async function ({ message, event, api }) {
    try {
      // حماية الحقوق الخاصة بك (Amin)
      const obfuscatedAuthor = String.fromCharCode(65, 109, 105, 110); 
      if (module.exports.config.author.trim() !== obfuscatedAuthor) {
        return api.sendMessage(
          "❌ | لا يمكنك تغيير حقوق المطور أمين.",
          event.threadID,
          event.messageID
        );
      }

      let targetID;
      
      // 1. التحقق إذا كنت رديت على رسالة شخص (Reply)
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } 
      // 2. التحقق إذا عملت منشن (Mention)
      else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } 
      // 3. إذا لم تفعل أي منهما
      else {
        return message.reply("💋 | يرجى الرد على رسالة الشخص أو عمل منشن له!");
      }

      const senderID = event.senderID;
      const base = await getBase();
      const apiURL = `${base}/api/kiss`;

      // إرسال طلب للأي بي آي
      const response = await axios.post(
        apiURL,
        { senderID, targetID },
        { responseType: "arraybuffer" }
      );

      const imgPath = path.join(__dirname, `kiss_${senderID}_${targetID}.png`);
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      // إرسال الصورة مع رسالة مميزة
      message.reply({
        body: `💋 | هاهي قبلتك!\n━━━━━━━━━━━━\n👤 صاحب الأمر: Amin\n🔗 حسابي: ${module.exports.config.link}`,
        attachment: fs.createReadStream(imgPath)
      });

      // حذف الصورة المؤقتة بعد 10 ثوانٍ
      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 10000);

    } catch (err) {
      console.error("Error in kiss command:", err.message || err);
      message.reply("🥹 حدث خطأ أثناء الاتصال بالسيرفر، حاول لاحقاً.");
    }
  }
};
