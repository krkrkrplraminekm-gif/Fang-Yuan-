const axios = require("axios");
if (!global.yuanSuper) global.yuanSuper = {};

module.exports = {
  config: {
    name: "s",
    version: "2.1.0",
    author: "Amin",
    role: 2, 
    shortDescription: "تثبيت وحماية اسم وصورة المجموعة",
    category: "SYSTEM",
    guide: { en: "!s on [الاسم] | !s off" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    if (senderID !== "61578796876651") return; // حماية إضافية لك

    if (args[0] === "off") {
        delete global.yuanSuper[threadID];
        return api.setMessageReaction("🔓", messageID, () => {}, true);
    }

    if (args[0] === "on") {
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const newName = args.slice(1).join(" ").trim() || threadInfo.threadName;
            global.yuanSuper[threadID] = { name: newName, image: threadInfo.imageSrc };
            if (newName !== threadInfo.threadName) await api.setTitle(newName, threadID);
            api.setMessageReaction("🛡️", messageID, () => {}, true);
        } catch (e) { api.sendMessage("⚠️ تأكد أنني أدمن.", threadID); }
    }
  },

  onEvent: async function ({ event, api }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    if (!global.yuanSuper[threadID] || author === botID) return;
    const settings = global.yuanSuper[threadID];

    if (logMessageType === "log:thread-name" && logMessageData.name !== settings.name) {
        api.setTitle(settings.name, threadID).catch(() => {});
    }
    if (logMessageType === "log:thread-icon" && settings.image) {
        try {
            const img = (await axios.get(settings.image, { responseType: 'stream' })).data;
            api.changeGroupImage(img, threadID).catch(() => {});
        } catch (e) {}
    }
  }
};
