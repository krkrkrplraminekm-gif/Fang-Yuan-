module.exports = {
  config: {
    name: "unsendReact",
    version: "1.2.0",
    author: "Amin",
    role: 0,
    shortDescription: "حذف رسائل البوت فقط عند التفاعل بـ 👍",
    category: "system"
  },

  onEvent: async function ({ api, event }) {
    // الآيدي الخاص بك يا أمين
    const myUID = "61578796876651";
    
    // الحصول على آيدي البوت الحالي
    const botID = api.getCurrentUserID();

    // 1. التحقق من أن الحدث هو تفاعل (Reaction)
    if (event.type === "message_reaction") {
      
      // 2. التحقق من أنك أنت من تفاعل ومن أن التفاعل هو "لايك" 👍
      if (event.userID === myUID && event.reaction === "👍") {
        
        // 3. جلب معلومات الرسالة التي تم التفاعل عليها للتأكد أنها تخص البوت
        api.getMessageInfo(event.messageID, (err, info) => {
          if (err) return; // في حال تعذر جلب المعلومات يتوقف

          // 4. إذا كان مرسل الرسالة هو البوت (botID)، يتم حذفها
          if (info.senderID === botID) {
            return api.unsendMessage(event.messageID, (err) => {
              if (err) console.error("❌ فشل حذف الرسالة");
            });
          }
        });
      }
    }
  }
};
