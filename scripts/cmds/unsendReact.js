module.exports = {
  config: {
    name: "unsendReact",
    version: "1.1.0",
    author: "Amin",
    role: 0,
    shortDescription: "حذف الرسائل عبر التفاعل بـ 👍",
    category: "system"
  },

  onEvent: async function ({ api, event }) {
    // الآيدي ديالك يا أمين (تأكد منه مرة أخرى)
    const myUID = "61578796876651";

    // 1. كنتأكدوا بلي الحدث هو تفاعل (Reaction)
    if (event.type === "message_reaction") {
      
      // 2. كنتأكدوا بلي أنت اللي تفاعلتي وبلي التفاعل هو "لايك"
      if (event.userID === myUID && event.reaction === "👍") {
        
        // 3. كنمحيو الرسالة اللي وقع عليها التفاعل
        return api.unsendMessage(event.messageID, (err) => {
          if (err) {
            // إلا فشل المسح غالباً حيت البوت ماشي أدمن
            console.error("❌ فشل حذف الرسالة: تأكد أن البوت مسؤول (Admin)");
          }
        });
      }
    }
  }
};
