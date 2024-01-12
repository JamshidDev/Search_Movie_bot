const { Composer, Keyboard} = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");

const bot = new Composer();

const {
    createConversation,
} = require("@grammyjs/conversations");

const movieController = require("../controllers/movieController")


const pm = bot.chatType("private");





bot.use(createConversation(base_menu))
bot.use(createConversation(upload_movie))

async function base_menu(conversation, ctx){
    const admin_buttons = new Keyboard()
        .text("♻️ Kino yuklash")
        .row()
        .text("🔗 Admin kanallar")
        .text("✍️ Xabar yozish")
        .row()
        .text("📊 Kunlik statistika")
        .text("📈 Umumiy statistika")
        .resized()

    await ctx.reply(`⚡️ Asosy menyu ⚡️`,{
        reply_markup:admin_buttons
    })
}

async function upload_movie(conversation, ctx){
    const cancel_btn = new Keyboard()
        .text("🔴 Bekor qilish")
        .resized();
    await ctx.reply(" <b>✍️ Kino kodini kiriting</b>\n\n <i>Masalan: <b>123; 2453;</b></i> ", {
        parse_mode: "HTML",
        reply_markup:cancel_btn
    });

    ctx = await conversation.wait();
    if (!(ctx.message?.text && !isNaN(ctx.message.text))) {
        do {
            await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot kiritildi</b>\n\n <i>Kino kodini kiriting!</i> ", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!(ctx.message?.text && !isNaN(ctx.message.text)));
    }

    ctx.session.session_db.movie.code = ctx.message.text

    await ctx.reply(" <b>✍️ Kino sonini yozing</b>\n\n <i>Masalan: <b>1; 2; 3</b></i> ", {
        parse_mode: "HTML",
    });
    ctx = await conversation.wait();

    if(!(ctx.message?.text && !isNaN(ctx.message.text) && ctx.message.text != '0')){
        do {
            await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot kiritildi</b>\n\n <i>Kino sonini kiriting!</i> ", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!(ctx.message?.text && !isNaN(ctx.message.text) && ctx.message.text != '0'));
    }

    const movieCount = +ctx.message.text

    for(let i=0; i<movieCount; i++){
        let movie = {
            name:null,
            url:null,
        }
        await ctx.reply(` <b>✍️ ${i + 1} - kino nomini yozing</b>\n\n <i>Masalan: <b>Kapitan America</b></i> `, {
            parse_mode: "HTML",
        });

        ctx = await conversation.wait();
        if (!ctx.message?.text) {
            do {
                await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot yuborildi</b>\n\n <i>Kino nomini yozing!</i> ", {
                    parse_mode: "HTML",
                });
                ctx = await conversation.wait();
            } while (!ctx.message?.text);
        }
        movie.name = ctx.message?.text

        await ctx.reply(" <b>✍️ Kino faylini forward qiling</b>", {
            parse_mode: "HTML",
        });
        ctx = await conversation.wait();
        if (!ctx.message?.video) {
            do {
                await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot kiritildi</b>\n\n <i>Kino faylini forward qiling!</i> ", {
                    parse_mode: "HTML",
                });
                ctx = await conversation.wait();
            } while (!ctx.message?.video);
        }
        movie.url = ctx.message.video.file_id;
        ctx.session.session_db.movie.movie_list.push(movie)

    }
    let data = {
        code:ctx.session.session_db.movie.code,
        movies:ctx.session.session_db.movie.movie_list,
    }
    console.log(data)
    ctx.reply("⏰ Yuklanmoqda...")
    const status = await movieController.store(data);
    if(status){
        await ctx.reply("✅ Muvofaqiyatli yuklandi...");
        await base_menu(conversation, ctx)
    }else{
        await ctx.reply("⚠️ Server xatosi")
        await base_menu(conversation, ctx)
    }
}

bot.command("start", async (ctx)=>{
    await ctx.conversation.enter("base_menu");
})













































bot.hears("♻️ Kino yuklash", async (ctx)=>{
    await ctx.conversation.enter("upload_movie");
})


bot.hears("🔗 Admin kanallar", async (ctx)=>{
    ctx.reply("🧑‍💻 Bu amal hozirda dasturlash jarayonida...")
})
bot.hears("✍️ Xabar yozish", async (ctx)=>{
    ctx.reply("🧑‍💻 Bu amal hozirda dasturlash jarayonida...")
})
bot.hears("📊 Kunlik statistika", async (ctx)=>{
    ctx.reply("🧑‍💻 Bu amal hozirda dasturlash jarayonida...")
})
bot.hears("📈 Umumiy statistika", async (ctx)=>{
    ctx.reply("🧑‍💻 Bu amal hozirda dasturlash jarayonida...")
})


bot.hears("🔴 Bekor qilish", async (ctx)=>{
    await ctx.conversation.enter("base_menu");
})

















































module.exports = bot