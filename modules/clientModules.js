const { Composer } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
const { check_user, register_user, remove_user, set_user_lang } = require("../controllers/userController");

const client_bot = new Composer();
const i18n = new I18n({
    defaultLocale: "uz",
    useSession: true,
    directory: "locales",
    globalTranslationContext(ctx) {
        return { first_name: ctx.from?.first_name ?? "" };
    },
});
client_bot.use(i18n);

const pm = client_bot.chatType("private")


const language_menu = new Menu("language_menu")
    .dynamic(async (ctx, range) => {
        let list = [{
            name: "language_uz",
            key: "uz"
        },
        {
            name: "language_ru",
            key: "ru"
        }
        ]
        list.forEach((item) => {
            range
                .text(ctx.t(item.name), async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.i18n.setLocale(item.key);
                    data = {
                        user_id: ctx.from.id,
                        lang: item.key
                    }
                    await set_user_lang(data);
                    await ctx.deleteMessage();

                })
                .row();
        })
    })
pm.use(language_menu)


pm.command("start", async (ctx) => {
    let lang = await ctx.i18n.getLocale();
    if (!i18n.locales.includes(lang)) {
        await ctx.i18n.setLocale("uz");
    }
    let user = await check_user(ctx.from.id);
    data = {
        user_id: ctx.from.id,
        full_name: ctx.from.first_name,
        username: ctx.from.username || null,
        active: true
    }
    if (user) {
        await ctx.i18n.setLocale(user.lang);
        data.lang = user.lang;
        await register_user(data);
    } else {
        lang = await ctx.i18n.getLocale()
        data.lang = lang;
        await register_user(data);
    }

    await  ctx.reply(`
<i>
<b> 🎥 Xush kelibsiz botimizga 🎥</b>

Assalomu alaykum <a href="tg://user?id=${ctx.from.id}"> ${ctx.from.first_name}.</a></i>
✍️ Kino kodini yozib yuboring!    
    `,{
        parse_mode:"HTML"
    })
})

pm.on("msg:text", async (ctx)=>{
    let movie_list = [
        {
            name:"Yengilmas [1-qism]",
            url:'AAMCAQADGQEAAhFoZZ_89jbZzs1YV9pyhm7T6mw2LQYAAs8CAAKH1wlFLcy23P2ZTF8BAAdtAAM0BA'
        },
        {
            name:"Yengilmas [1-qism]",
            url:'AAMCAQADGQEAAhFoZZ_89jbZzs1YV9pyhm7T6mw2LQYAAs8CAAKH1wlFLcy23P2ZTF8BAAdtAAM0BA'
        },
    ]
    let movie_code = ctx.msg?.text;
    let user_id = ctx.from.id;
    if(movie_code){

        let count_movies = movie_list.length;
        for(let i=0; i<count_movies; i++){
            await ctx.replyWithVideo('AAMCAQADGQEAAhFoZZ_89jbZzs1YV9pyhm7T6mw2LQYAAs8CAAKH1wlFLcy23P2ZTF8BAAdtAAM0BA',{
                caption:movie_list[i].name,
                parse_mode:"HTML"
            })
        }
    }

    await ctx.reply("Kino topilmadi")
})
















































module.exports = { client_bot }