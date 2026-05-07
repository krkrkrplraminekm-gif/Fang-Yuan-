const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "6.2",
    author: "Amin",
    shortDescription: "Show all commands",
    longDescription: "Show all commands in clean UI with Arabic translations",
    category: "system",
    guide: "{pn}help [command name/page number]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;

    // خطوط الزخرفة
    const fancyFont = (str) =>
      str.replace(/[A-Za-z]/g, (c) => {
        const map = {
          A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
          I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
          Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",
          Y:"𝐘",Z:"𝐙",
          a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",
          i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",
          q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",
          y:"𝐲",z:"𝐳"
        };
        return map[c] || c;
      });

    const categoryFont = (str) =>
      str.split("").map(c => {
        const map = {
          A:"𝙰",B:"𝙱",C:"𝙲",D:"𝙳",E:"𝙴",F:"𝙵",G:"𝙶",H:"𝙷",
          I:"𝙸",J:"𝙹",K:"𝙺",L:"𝙻",M:"𝙼",N:"𝙽",O:"𝙾",P:"𝙿",
          Q:"𝚀",R:"𝚁",S:"𝚂",T:"𝚃",U:"𝚄",V:"𝚅",W:"𝚆",X:"𝚇",
          Y:"𝚈",Z:"𝚉"
        };
        return map[c] || c;
      }).join("");

    // إذا كان المستخدم يبحث عن أمر معين (ليس رقماً)
    if (args[0] && isNaN(parseInt(args[0]))) {
      const cmdName = args[0].toLowerCase();
      const cmd =
        allCommands.get(cmdName) ||
        [...allCommands.values()].find(c => c.config.aliases?.includes(cmdName));

      if (!cmd)
        return message.reply(`❌ الأمر '${cmdName}' غير موجود!`);

      const usage = typeof cmd.config.guide === "string"
        ? cmd.config.guide.replace("{pn}", cmd.config.name)
        : cmd.config.name;

      const infoMsg =
`╭─ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎
│ 🧩 ${fancyFont(cmd.config.name)}
│ 🔗 ${cmd.config.aliases?.join(", ") || "لا يوجد"}
│ 📁 ${categoryFont((cmd.config.category || "Others").toUpperCase())}
│ ⚙️ v${cmd.config.version || "1.0"}
│ 👑 ${cmd.config.author || "Unknown"}
│ 📝 ${(cmd.config.longDescription || cmd.config.shortDescription || "بدون وصف").slice(0, 40)}
│ 🚀 ${prefix}${usage}
╰────────────`;

      return message.reply(infoMsg);
    }

    // قاموس الترجمة العربية للأوامر
    const cmdDescriptions = {
      "4k": "تحسين الصورة إلى جودة 4K.",
      "age": "معرفة عمر شخص من الصورة.",
      "liner": "تحسين أو تعديل الصور بأسلوب Liner.",
      "prompt": "إنشاء أو تحسين برومبت لتوليد الصور.",
      "remini": "تحسين جودة الصور وتكبيرها.",
      "weather": "عرض حالة الطقس.",
      "webinfo": "معلومات عن موقع ويب أو رابط.",
      "youai": "التحدث مع الذكاء الاصطناعي.",
      "accept": "قبول طلب صداقة أو عضوية.",
      "fbcover": "تحميل صورة غلاف فيسبوك.",
      "pastebin": "رفع النص إلى Pastebin.",
      "qrgen": "إنشاء رمز QR.",
      "translate": "ترجمة النصوص.",
      "uid": "إظهار User ID.",
      "webss": "لقطة شاشة لموقع ويب.",
      "activemember": "عرض الأعضاء النشيطين.",
      "adduser": "إضافة عضو.",
      "admin": "تعيين/إزالة أدمن.",
      "all": "منشن للكل.",
      "allbox": "عرض كل البوكسات.",
      "antichangeinfobox": "منع تغيير معلومات المجموعة.",
      "autosetname": "تغيير الاسم تلقائياً.",
      "baby": "أمر مرح أو لعبة.",
      "badwords": "فلترة الكلمات السيئة.",
      "ban": "حظر عضو.",
      "boxinfo": "معلومات عن البوكس/المجموعة.",
      "busy": "وضع مشغول.",
      "count": "عد الرسائل أو الأعضاء.",
      "emoji": "تغيير إيموجي المجموعة.",
      "filteruser": "فلترة مستخدمين.",
      "lock": "قفل المجموعة.",
      "onlyadminbox": "السماح للأدمن فقط بالكتابة.",
      "refresh": "تحديث البيانات.",
      "rules": "عرض أو تعيين قوانين المجموعة.",
      "sendnoti": "إرسال إشعار.",
      "setname": "تغيير اسم المجموعة.",
      "tid": "عرض Thread ID.",
      "unsend": "حذف رسالة للجميع.",
      "warn": "تحذير عضو.",
      "adminmention": "منشن للأدمن فقط.",
      "anti_isis_leave": "منع أو كشف حسابات معينة.",
      "autoreact": "رد تلقائي بالإيموجي.",
      "autoseen": "تشغيل Seen تلقائي.",
      "delete": "حذف رسائل.",
      "fork": "نسخ أو fork للبوت.",
      "help": "عرض قائمة الأوامر.",
      "join": "الانضمام إلى مجموعة.",
      "text_voice": "تحويل نص إلى صوت.",
      "up": "تحديث البوت.",
      "adminonly": "تفعيل وضع الأدمن فقط.",
      "backupdata": "عمل نسخة احتياطية.",
      "clear": "تنظيف.",
      "eval": "تنفيذ كود.",
      "event": "إدارة الأحداث.",
      "filecmd": "إدارة ملفات الأوامر.",
      "getfbstate": "حالة فيسبوك.",
      "ignoreonlyad": "تجاهل أدمن فقط.",
      "install": "تثبيت أمر جديد.",
      "kick": "طرد عضو.",
      "kickall": "طرد الجميع.",
      "restart": "إعادة تشغيل البوت.",
      "setavt": "تغيير الصورة الشخصية للبوت.",
      "setlang": "تغيير اللغة.",
      "update": "تحديث البوت.",
      "aniinfo": "معلومات عن أنمي.",
      "manga": "معلومات عن مانجا.",
      "anisearch": "بحث عن أنمي.",
      "autolink": "تشغيل روابط تلقائي.",
      "catbox": "رفع ملفات إلى Catbox.",
      "convertmp3": "تحويل فيديو إلى MP3.",
      "download": "تحميل ملف/فيديو.",
      "gan": "توليد صور.",
      "pp": "صورة بروفايل.",
      "sad": "صور حزينة.",
      "say": "تحويل نص إلى صوت.",
      "sing": "أمر غناء.",
      "tempmail": "بريد مؤقت.",
      "tiktok": "تحميل فيديو تيك توك.",
      "creart": "توليد صورة بالذكاء الاصطناعي.",
      "imgen": "توليد صورة بالذكاء الاصطناعي.",
      "i": "توليد صورة بالذكاء الاصطناعي.",
      "flux": "نموذج Flux لتوليد الصور.",
      "gcimg": "توليد صورة جماعية.",
      "imagen3": "Image Generation 3.",
      "poli": "نموذج Pollinations.",
      "sdxl": "Stable Diffusion XL.",
      "weigen": "نموذج Weigen.",
      "butslap": "صفع على المؤخرة (مرح).",
      "kiss": "قبلة.",
      "kiss2": "قبلة.",
      "jail": "وضع في السجن (ميم).",
      "jail2": "وضع في السجن (ميم).",
      "nigga": "أمر مرح/ميم.",
      "pair": "تزويج عشوائي.",
      "wanted": "صورة مطلوب.",
      "balance": "رصيدك.",
      "daily": "مكافأة يومية.",
      "leaderboard": "لوحة المتصدرين.",
      "bet": "مقامرة.",
      "slot": "مقامرة.",
      "quiz": "أسئلة وأجوبة.",
      "rank": "نظام الرتب والتفاعل.",
      "rankup": "نظام الرتب والتفاعل.",
      "setwelcome": "رسالة ترحيب.",
      "setleave": "رسالة وداع.",
      "groupname": "تغيير اسم المجموعة.",
      "groupimage": "تغيير صورة المجموعة.",
      "video": "بحث أو تشغيل فيديو موسيقي.",
      "sexvid": "محتوى +18 (فيديوهات).",
      "fuck": "أوامر مرحة +18.",
      "fuck2": "أوامر مرحة +18."
    };

    // قائمة الأوامر الممنوعة لضمان وضعها في النهاية
    const nsfwList = ["sexvid", "fuck", "fuck2"];
    let cmdList = [];

    // استخراج وتصنيف جميع الأوامر
    for (const [name, cmd] of allCommands) {
      let cat = (cmd.config.category || "OTHERS").toUpperCase();
      
      if (nsfwList.includes(name.toLowerCase())) {
        cat = "🔞 18+"; // عزل أوامر 18+ في فئة خاصة
      }

      const desc = cmdDescriptions[name.toLowerCase()] || cmd.config.shortDescription || "بدون وصف";
      cmdList.push({ name, cat, desc });
    }

    // ترتيب الأوامر: الفئات أولاً (مع وضع 18+ في النهاية) ثم الحروف الأبجدية
    cmdList.sort((a, b) => {
      if (a.cat === "🔞 18+" && b.cat !== "🔞 18+") return 1;
      if (a.cat !== "🔞 18+" && b.cat === "🔞 18+") return -1;
      if (a.cat < b.cat) return -1;
      if (a.cat > b.cat) return 1;
      return a.name.localeCompare(b.name);
    });

    const totalCmds = cmdList.length;

    // حساب إجمالي الصفحات ديناميكياً
    let totalPages;
    if (totalCmds <= 21) totalPages = 1;
    else if (totalCmds <= 42) totalPages = 2;
    else totalPages = 2 + Math.ceil((totalCmds - 42) / 20);

    // تحديد الصفحة الحالية
    let page = parseInt(args[0]);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    // منطق التقسيم (أول صفحتين 21، الباقي 20)
    let start = 0;
    let end = 0;

    if (page === 1) {
      start = 0;
      end = 21;
    } else if (page === 2) {
      start = 21;
      end = 42;
    } else {
      start = 42 + (page - 3) * 20;
      end = start + 20;
    }

    const currentCmds = cmdList.slice(start, end);

    // بناء رسالة البوت
    let msg = `╭─ 𝐘𝐮𝐚𝐧 𝐁𝐨𝐭\n`;
    msg += `│ 👑 𝐎𝐰𝐧𝐞𝐫: 𝐀𝐦𝐢𝐧\n`;
    msg += `│ 🔗 𝐅𝐁: facebook.com/profile.php?id=61578796876651\n`;
    msg += `│ 📊 الأوامر: ${totalCmds}\n`;
    msg += `│ 📄 صفحة: ${page}/${totalPages}\n`;
    msg += `╰────────────\n`;

    let currentCat = "";
    for (const cmd of currentCmds) {
      // طباعة الفئة فقط إذا تغيرت
      if (currentCat !== cmd.cat) {
        msg += `\n[ ${categoryFont(cmd.cat)} ]\n`;
        currentCat = cmd.cat;
      }
      msg += `• ${fancyFont(cmd.name)} → ${cmd.desc}\n`;
    }

    msg += `\nUse: ${prefix}help <رقم الصفحة>`;

    // تحميل وارسال الـ GIF
    const gifURLs = [
      "https://i.imgur.com/Xw6JTfn.gif",
      "https://i.imgur.com/mW0yjZb.gif",
      "https://i.imgur.com/KQBcxOV.gif"
    ];

    const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
    const gifFolder = path.join(__dirname, "cache");

    if (!fs.existsSync(gifFolder))
      fs.mkdirSync(gifFolder, { recursive: true });

    const gifName = path.basename(randomGifURL);
    const gifPath = path.join(gifFolder, gifName);

    if (!fs.existsSync(gifPath))
      await downloadGif(randomGifURL, gifPath);

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(gifPath)
    });
  }
};

// وظيفة تحميل الصور المتحركة
function downloadGif(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject();
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}
