const { Composer, MemorySessionStorage, session } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const { chatMembers } = require("@grammyjs/chat-members");
const {
    conversations,
} = require("@grammyjs/conversations");
const { check_user, register_user, remove_user, set_user_lang } = require("../controllers/userController");
const adapter = new MemorySessionStorage();
const channelController = require("../controllers/channelController")
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

                movie:{
                    code:null,
                    movie_list:[],
                },
                channel_list:[],
                all_channel_list:[],

                //     admin sessions
                admin_channels:[],
                selected_channel:null,
                movies_list:[],
                currentPage :1,
                max_page_count:1,
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
    }
    let data = {
        telegram_id: ctx.update.my_chat_member.chat.id,
        user_id: ctx.update.my_chat_member.from.id,
        title: ctx.update.my_chat_member.chat.title,
        username: ctx.update.my_chat_member.chat.username,
        type: ctx.update.my_chat_member.chat.type,
        new_chat: ctx.update.my_chat_member.new_chat_member, // object
    }

    if(status === "administrator"){
        await  channelController.store_item(data);
    }else if(status === "left" || status=== "member"){
        let telegram_id = ctx.update.my_chat_member.chat.id;
        await  channelController.remove_item(telegram_id)
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




const channel_menu = new Menu("language_menu")
    .dynamic(async (ctx, range) => {
        let list =ctx.session.session_db.channel_list

        list.forEach((item) => {
            range
                .url("➕ Obuna bo'lish", item.user_id === 0? item.username:`https://t.me/${item.username}`)
                .row()

        })
    }).text("✅ Tasdiqlash", async (ctx)=>{

        let list = ctx.session.session_db.all_channel_list;
        let is_all_channel_subscribe = true;


        for(let i=0; i<list.length; i++){
            let channel = list[i];
            if(channel.user_id === 0){
                is_all_channel_subscribe = true
                break;
            }else{
                const chatMembers = await ctx.chatMembers.getChatMember(channel.channel_id, ctx.from.id)
                if(chatMembers.status ==='left'){
                    is_all_channel_subscribe = false
                    break;
                }
            }

        }

        if(is_all_channel_subscribe){
            await ctx.deleteMessage()
            await ctx.reply(`
<b>🎉 Botdan foydalanishingiz mumkin!</b>

<i>Kino kodini yozib yuboring</i>            
            `,{
                parse_mode: "HTML",
            })

        }else{
            await ctx.answerCallbackQuery( {
                callback_query_id:ctx.callbackQuery.id,
                text:"⚠️ Siz barcha kanallarga obuna bo'lmagansiz!",
                show_alert:true
            })
        }
    })
bot.filter(async (ctx)=> !ctx.config.super_admin).use(channel_menu)


bot.chatType("private").filter(async (ctx)=> !ctx.config.super_admin).use(async (ctx, next)=>{
    let channel_list = await channelController.index_item({
        active:true,
        ad:true
    })
    const originalChannels = channel_list.filter(v=> v.user_id !== 0)

    if(originalChannels.length>0){
        let list = channel_list.map((item)=>{
            return {
                channel_id:item.telegram_id,
                _id:item._id,
                username:item.username,
                user_id:item.user_id
            }
        })

        ctx.session.session_db.channel_list = [];
        ctx.session.session_db.all_channel_list = list;
        for(let i=0; i<list.length; i++){
            let channel = list[i];

            if(channel.user_id === 0){
                ctx.session.session_db.channel_list.push(channel)
            }else{
                const chatMembers = await ctx.chatMembers.getChatMember(channel.channel_id, ctx.from.id)
                if(chatMembers.status ==='left'){
                    ctx.session.session_db.channel_list.push(channel)
                }
            }


        }
        const originChannelsList = ctx.session.session_db.channel_list.filter(v=>v.user_id !==0)

        if(originChannelsList.length>0){
            await ctx.reply("⚠️ Botdan foydalanish uchun quyidagi kanallarga obuna bo'lishingiz shart!",{
                parse_mode: "HTML",
                reply_markup: channel_menu,
            })
        }else {
            await next()
        }




    }else{
        await next()
    }





})

























module.exports = bot