const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "fuck2",
    aliases: ["fck2", "نيك2"],
    version: "3.5",
    author: "Amin", // اسمك يا بطل
    link: "https://www.facebook.com/profile.php?id=61578796876651", // رابط حسابك
    countDown: 5,
    role: 0,
    description: "تركيب صورة مضحكة (إصدار 2) - رد على الشخص أو منشن",
    category: "fun",
  },

  onStart: async function ({ message, event, api }) {
    try {
      // حماية الحقوق الخاصة بك (Amin)
      const obfuscatedAuthor = String.fromCharCode(65, 109, 105, 110); 
      if (module.exports.config.author.trim() !== obfuscatedAuthor) {
        return api.sendMessage("❌ | لا يمكنك تغيير حقوق المطور أمين.", event.threadID, event.messageID);
      }

      let targetID;
      
      // 1. التحقق من الرد (Reply)
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } 
      // 2. التحقق من المنشن (Mention)
      else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } 
      else {
        return message.reply("⚠️ | يا **𝐀𝐦𝐢𝐧**، لازم ترد على رسالة الشخص أو تدير ليه منشن!");
      }

      const one = event.senderID;
      const two = targetID;

      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const bgPath = path.join(dir, "fuckv3_template.png");

      // تحميل الخلفية إذا لم تكن موجودة
      if (!fs.existsSync(bgPath)) {
        const img = await axios.get(
          "https://i.ibb.co/TW9Kbwr/images-2022-08-14-T183542-356.jpg",
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(bgPath, Buffer.from(img.data));
      }

      const avatar1 = path.join(dir, `${one}.png`);
      const avatar2 = path.join(dir, `${two}.png`);

      // دالة جلب الأفاتار
      const getAvatar = async (id, savePath) => {
        const avatarUrl = `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(avatarUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(savePath, Buffer.from(res.data));
      };

      await getAvatar(one, avatar1);
      await getAvatar(two, avatar2);

      // رسم الصور باستخدام Canvas
      const bg = await loadImage(bgPath);
      const av1 = await loadImage(avatar1);
      const av2 = await loadImage(avatar2);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, bg.width, bg.height);

      // رسم الأفاتار الأول (أسفل اليسار)
      ctx.save();
      ctx.beginPath();
      ctx.arc(70, 350, 50, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.drawImage(av1, 20, 300, 100, 100);
      ctx.restore();

      // رسم الأفاتار الثاني (أعلى اليمين)
      ctx.save();
      ctx.beginPath();
      ctx.arc(175, 95, 75, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.drawImage(av2, 100, 20, 150, 150);
      ctx.restore();

      const outPath = path.join(dir, `fuck2_${one}_${two}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      await message.reply({
        body: `[ 𝐘𝐮𝐚𝐧 𝐒𝐲𝐬𝐭𝐞𝐦 ]\n━━━━━━━━━━━━━\n💥 تم التنفيذ (الإصدار 2)!\n👤 المطور: Amin\n🔗 حسابي: ${module.exports.config.link}`,
        attachment: fs.createReadStream(outPath),
      });

      // تنظيف الملفات المؤقتة
      fs.unlinkSync(avatar1);
      fs.unlinkSync(avatar2);
      fs.unlinkSync(outPath);

    } catch (err) {
      console.error(err);
      return message.reply(`❌ حدث خطأ أثناء معالجة الصورة.`);
    }
  },
};
