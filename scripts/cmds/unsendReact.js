module.exports = {
  config: {
    name: "unsendReact",
    version: "1.0.0",
    author: "Amin",
    role: 0, // يعمل بالخلفية
    shortDescription: "حذف الرسائل عبر التفاعل بـ 👍",
    category: "system"
  },

  onEvent: async function ({ api, event }) {
    // الآيدي الخاص بك لضمان أنك الوحيد المتحكم
    const myUID = "61578796876651";

    // التحقق من أن التفاعل هو "لايك" 👍 ومن طرفك أنت فقط
    if (event.type === "message_reaction" && event.reaction === "👍" && event.userID === myUID) {
      return api.unsendMessage(event.messageID, (err) => {
        if (err) console.error("فشل حذف الرسالة:", err);
      });
    }
  }
};
