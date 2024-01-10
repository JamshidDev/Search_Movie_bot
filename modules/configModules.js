const { Composer, MemorySessionStorage, session } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const { chatMembers } = require("@grammyjs/chat-members");
const {
    conversations,
} = require("@grammyjs/conversations");
const { check_user, register_user, remove_user, set_user_lang } = require("../controllers/userController");
const adapter = new MemorySessionStorage();

const bot = new Composer();

const i18n = new I18n({
    defaultLocale: "uz",
    useSession: true,
    directory: "locales",
    globalTranslationContext(ctx) {
        return { first_name: ctx.from?.first_name ?? "" };
    },
});
bot.use(i18n);

bot.use(session({
    type: "multi",
    session_db: {
        initial: () => {
            return {
                client: {
                    phone: null,
                    full_name: null,
                },
                movie:{
                    code:null,
                    movie_list:[],
                }
            }
        },
        storage: new MemorySessionStorage(),
    },
    conversation: {},
    __language_code: {},
}));

bot.use(chatMembers(adapter));
bot.use(conversations());

bot.on("my_chat_member", async (ctx) => {
    const status = ctx.update.my_chat_member.new_chat_member.status
    if (status === "kicked") {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
        await remove_user(ctx.from.id)
    }else if(status === "administrator"){
        let data = {
            telegram_id: ctx.update.my_chat_member.chat.id,
            user_id: ctx.update.my_chat_member.from.id,
            title: ctx.update.my_chat_member.chat.title,
            username: ctx.update.my_chat_member.chat.username,
            type: ctx.update.my_chat_member.chat.type,
            new_chat: ctx.update.my_chat_member.new_chat_member, // object
        }

        console.log(data)
    }else if(status === "left" || status=== "member"){
        let telegram_id = ctx.update.my_chat_member.chat.id;

    }

});

bot.use(async (ctx, next) => {
    const super_admin_list = [1038293334,1690587519];
    const command_list = ['🔴 Bekor qilish']
    if (command_list.includes(ctx.message?.text)) {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }
    ctx.config = {
        super_admin: super_admin_list.includes(ctx.from?.id)
    }

    let lang = await ctx.i18n.getLocale();
    if (!i18n.locales.includes(lang)) {
        await ctx.i18n.setLocale("uz");
        ctx.config.lang ='uz';
    }else{
        ctx.config.lang =lang;
    }


    // check user join to channel


    await next()
})


// bot.chatType("private").use(async (ctx, next)=>{
//     let channel_id =  -1001704079922;
//     const chatMembers = await ctx.chatMembers.getChatMember(channel_id, ctx.from.id)
//     console.log(chatMembers.status)
//
//     await ctx.reply("Please join channel!")
//     // await next()
// })

























module.exports = bot