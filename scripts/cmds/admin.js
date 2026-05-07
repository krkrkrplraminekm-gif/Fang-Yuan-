const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.6",
		author: "Amin", // اسمك هنا كصاحب التعديل
		countDown: 5,
		role: 2, // للمطورين فقط
		description: {
			vi: "Thêm, xóa, sửa quyền admin",
			en: "إضافة أو إزالة أو عرض مسؤولي البوت (المطورين)"
		},
		category: "system",
		guide: {
			en: '   {pn} [add | -a] <ID | @tag>: لإضافة مطور جديد'
				+ '\n	  {pn} [remove | -r] <ID | @tag>: لإزالة مطور'
				+ '\n	  {pn} [list | -l]: لعرض قائمة المطورين الحاليين'
		}
	},

	langs: {
		en: {
			added: "✅ | تم بنجاح منح صلاحيات المطور لـ %1 مستخدم:\n%2",
			alreadyAdmin: "\n⚠️ | هؤلاء الـ %1 لديهم صلاحيات بالفعل:\n%2",
			missingIdAdd: "⚠️ | يرجى إدخال الآيدي (UID) أو عمل تاق للشخص المراد رفعه مطوراً",
			removed: "🗑️ | تم بنجاح سحب صلاحيات المطور من %1 مستخدم:\n%2",
			notAdmin: "⚠️ | هؤلاء الـ %1 ليس لديهم صلاحيات مطور أصلاً:\n%2",
			missingIdRemove: "⚠️ | يرجى إدخال الآيدي أو عمل تاق للشخص المراد تنزيله من المطورين",
			listAdmin: "╭─ 𝐘𝐮𝐚𝐧 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬\n│ 👑 صاحب البوت: 𝐀𝐦𝐢𝐧\n│ 🔗 FB: fb.com/profile.php?id=61578796876651\n╰────────────\n\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const prefix = global.GoatBot.config.prefix;
		
		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1] || event.messageReply) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
						
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.adminBot.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(u => notAdminIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "-r": {
				if (args[1] || event.messageReply) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));

					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					
					for (const uid of adminIds)
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);
						
					const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					
					return message.reply(
						(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}
			default:
				return message.reply(`⚠️ استخدام خاطئ! استخدم:\n${prefix}admin [add | remove | list]`);
		}
	}
};
