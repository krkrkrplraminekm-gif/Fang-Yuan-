const fs = require("fs-extra");
const path = require("path");

// الذاكرة الخاصة ببوت Yuan للسيطرة على الكنيات (جماعية وفردية)
if (!global.yuanControl) global.yuanControl = {};

module.exports = {
  config: {
    name: "z",
    aliases: ["x", "zx", "xz"],
    version: "5.0.0",
    author: "Amin",
    role: 2, // متاح لك فقط
    shortDescription: "أوامر سريعة للسيطرة على الكنيات",
    category: "SYSTEM",
    guide: {
      en: "z [الاسم] | x | zx [الاسم] | xz | z me [الاسم] | x me"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, senderID, messageID, body } = event;
    const adminBot = global.GoatBot?.config?.adminBot || [];
    
    // التحقق من أن المستخدم من مطوري البوت
    if (!adminBot.includes(senderID.toString())) return;
    if (!event.isGroup) return;

    // تهيئة ذاكرة المجموعة إذا لم تكن موجودة
    if (!global.yuanControl[threadID]) {
        global.yuanControl[threadID] = { all: null, users: {} };
    }

    // إيقاف جميع الحمايات (للكل ولك أنت)
    if (args[0] && args[0].toLowerCase() === "off") {
        global.yuanControl[threadID] = { all: null, users: {} };
        return api.setMessageReaction("✅", messageID, () => {}, true);
    }

    // استخراج الأمر المستخدم بذكاء (سواء كان !z أو !xz إلخ...)
    const firstWord = body.trim().split(/\s+/)[0].toLowerCase();
    let cmdUsed = "z";
    if (firstWord.endsWith("zx")) cmdUsed = "zx";
    else if (firstWord.endsWith("xz")) cmdUsed = "xz";
    else if (firstWord.endsWith("x")) cmdUsed = "x";
    else if (firstWord.endsWith("z")) cmdUsed = "z";

    const isMe = (args[0] && args[0].toLowerCase() === "me");
    let targetName = "";
    let protect = false;
    let targetUsers = "all"; // إما "all" للجميع أو "me" لك أنت فقط

    // تحديد الوضع بناءً على الاختصار
    if (cmdUsed === "z") {
        if (isMe) {
            targetUsers = "me";
            targetName = args.slice(1).join(" ").trim();
            protect = true; // تثبيت كنيتك
        } else {
            targetUsers = "all";
            targetName = args.join(" ").trim();
            protect = false; // تغيير بدون تثبيت
        }
    } else if (cmdUsed === "x") {
        if (isMe) {
            targetUsers = "me";
            targetName = "";
            protect = true; // حذف كنيتك وتثبيتها (حمايتها من التغيير)
        } else {
            targetUsers = "all";
            targetName = "";
            protect = false; // حذف للكل بدون تثبيت
        }
    } else if (cmdUsed === "zx") {
        targetUsers = "all";
        targetName = args.join(" ").trim();
        protect = true; // تغيير وتثبيت للكل
    } else if (cmdUsed === "xz") {
        targetUsers = "all";
        targetName = "";
        protect = true; // حذف وتثبيت للكل
    }

    try {
        const botID = api.getCurrentUserID();

        // 1. التنفيذ الفردي (لك أنت فقط)
        if (targetUsers === "me") {
            if (protect) {
                global.yuanControl[threadID].users[senderID] = targetName;
            } else {
                delete global.yuanControl[threadID].users[senderID];
            }
            await api.changeNickname(targetName, threadID, senderID);
            api.setMessageReaction("🛡️", messageID, () => {}, true);
            return;
        }

        // 2. التنفيذ الجماعي (لكل المجموعة)
        if (targetUsers === "all") {
            if (protect) {
                global.yuanControl[threadID].all = targetName;
                api.setMessageReaction("🛡️", messageID, () => {}, true);
            } else {
                global.yuanControl[threadID].all = null;
                api.setMessageReaction(targetName === "" ? "🗑️" : "✅", messageID, () => {}, true);
            }

            const threadInfo = await api.getThreadInfo(threadID);
            const currentNicknames = threadInfo.nicknames || {};
            const participantIDs = threadInfo.participantIDs;

            const membersToChange = participantIDs.filter(id => {
                const isOwner = (id === senderID); // عدم تغيير كنيتك أثناء التغيير الجماعي
                const isBot = (id === botID);      // حماية البوت
                const current = currentNicknames[id] || "";
                return !isOwner && !isBot && current !== targetName;
            });

            if (membersToChange.length === 0) return;

            const BATCH_SIZE = 4; 
            const DELAY = 1000;   

            for (let i = 0; i < membersToChange.length; i += BATCH_SIZE) {
                const batch = membersToChange.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(userId => api.changeNickname(targetName, threadID, userId).catch(() => {})));
                if (i + BATCH_SIZE < membersToChange.length) await new Promise(res => setTimeout(res, DELAY));
            }
        }

    } catch (error) {
        console.error("❌ Error in z/x commands:", error);
    }
  },

  onEvent: async function ({ event, api }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    
    if (!global.yuanControl[threadID]) return;

    const controlData = global.yuanControl[threadID];

    // الرادار 1: إرجاع الكنية عند التغيير
    if (logMessageType === "log:user-nickname") {
        if (author === botID) return; 
        
        const { participant_id, nickname } = logMessageData;
        const newNick = nickname || "";

        // أولوية 1: فحص الحماية الفردية (كنيتك أنت)
        if (controlData.users && controlData.users[participant_id] !== undefined) {
            const protectedIndividualName = controlData.users[participant_id];
            if (newNick !== protectedIndividualName) {
                api.changeNickname(protectedIndividualName, threadID, participant_id).catch(() => {});
            }
            return; // التوقف هنا لمنع تداخل الأوامر
        }

        // أولوية 2: فحص الحماية الجماعية
        if (controlData.all !== null) {
            const protectedAllName = controlData.all;
            if (newNick !== protectedAllName) {
                api.changeNickname(protectedAllName, threadID, participant_id).catch(() => {});
            }
        }
    }

    // الرادار 2: فرض الكنية على الأعضاء الجدد فور دخولهم
    if (logMessageType === "log:subscribe" && controlData.all !== null) {
        const addedParticipants = logMessageData.addedParticipants;
        const protectedAllName = controlData.all;
        for (const user of addedParticipants) {
            api.changeNickname(protectedAllName, threadID, user.userFbId).catch(() => {});
        }
    }
  }
};
