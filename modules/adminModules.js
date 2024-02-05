const { Composer, Keyboard, session} = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");

const bot = new Composer();

const {
    createConversation,
} = require("@grammyjs/conversations");

const movieController = require("../controllers/movieController")
const channelController = require("../controllers/channelController")
const {set_user_lang, get_active_user_list, remove_user} = require("../controllers/userController");

const pm = bot.chatType("private");





bot.use(createConversation(base_menu))
bot.use(createConversation(upload_movie))
bot.use(createConversation(send_msg_conversation))

async function base_menu(conversation, ctx){
    const admin_buttons = new Keyboard()
        .text("♻️ Kino yuklash")
        .row()
        .text("🔗 Admin kanallar")
        .text("✍️ Xabar yozish")
        .row()
        .text("🎥 Kinolar")
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
        // await ctx.reply(` <b>✍️ ${i + 1} - kino nomini yozing</b>\n\n <i>Masalan: <b>Kapitan America</b></i> `, {
        //     parse_mode: "HTML",
        // });
        //
        // ctx = await conversation.wait();
        // if (!ctx.message?.text) {
        //     do {
        //         await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot yuborildi</b>\n\n <i>Kino nomini yozing!</i> ", {
        //             parse_mode: "HTML",
        //         });
        //         ctx = await conversation.wait();
        //     } while (!ctx.message?.text);
        // }
        // movie.name = ctx.message?.text

        await ctx.reply(`<b>${i + 1} - kino faylini forward qiling</b>`, {
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
        movie.name = ctx.message.caption
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

async function send_msg_conversation(conversation, ctx) {
    await ctx.reply(`
    <b>⚠️ Barcha foydalanuvchilarga xabar jo'natish</b> 
    
    <i>‼️ Xabar matnini yozing yoki xabarni botga forward qiling ↗️</i>
        `, {
        parse_mode: "HTML",
    })
    const message_text = await conversation.wait();
    let keyborad = new Keyboard()
        .text("❌ Bekor qilish xabarni")
        .text("✅ Tasdiqlash xabarni")
        .resized();
    await ctx.reply(`
    <i>Xabarni barcha foydalanuvchilarga yuborish uchun <b>✅ Tasdiqlash xabarni</b> tugmasini bosing!</i> 
       
        `, {
        reply_markup: keyborad,
        parse_mode: "HTML",
    });
    const msg = await conversation.wait();

    if (msg.message?.text == '✅ Tasdiqlash xabarni') {
        await ctx.reply("Barchaga xabar yuborish tugallanishini kuting...⏳")
        let user_list = await get_active_user_list();
        for (let i = 0; i < user_list.length; i++) {
            let user = user_list[i];
            try {
                let status = await msg_sender(message_text, user.user_id);
            } catch (error) {
                await remove_user(user.user_id)
            }
        }

        await ctx.reply("Yakunlandi...✅")
        await base_menu(conversation, ctx)


    } else {
        await base_menu(conversation, ctx)
    }
}

async function msg_sender(message, id) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                let status = await message.copyMessage(id)
                resolve(status);
            } catch (error) {
                reject(error)
            }

        }, 100)
    })
}






bot.command("start", async (ctx)=>{
    await ctx.conversation.enter("base_menu");
})




































const admin_channels = new Menu("admin_channels")
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.admin_channels;
        list.forEach((item) => {
            range
                .text(`${item.ad? '🟢 ': '🟡 ' } ${item.title}` , async (ctx) => {
                    await ctx.deleteMessage();
                    let status = await channelController.ad_channels(item.telegram_id);
                    if(status){
                        await  ctx.reply("✅ Muvovaqiyatli bajarildi")
                    }else{
                        await  ctx.reply("⚠️ Xatolik yuz berdi")
                    }


                })
                .row();
        })
    })
bot.use(admin_channels)








bot.hears("♻️ Kino yuklash", async (ctx)=>{
    await ctx.conversation.enter("upload_movie");
})


bot.hears("🔗 Admin kanallar", async (ctx)=>{
    let allActiveChannels = await channelController.all_active_item()
    if(allActiveChannels.channels.length>0){
        ctx.session.session_db.admin_channels = allActiveChannels.channels;
        await ctx.reply(`
<b>Bot admin bo'lgan kanallar </b>

<i>🟢 - Reklama yoqilgan</i>        
<i>🟡 - Reklama o'chirilgan</i>   

<i>🫵 Ustiga bosish orqali reklama yoqing yoki o'chiring!</i>     
        `,{
            parse_mode: "HTML",
            reply_markup: admin_channels,
        })

    }else{
        await ctx.reply('Bot admin etib tayinlangan kanllar yoq')
    }
})
bot.hears("✍️ Xabar yozish", async (ctx)=>{
    await ctx.conversation.enter("send_msg_conversation");
})

bot.hears("📈 Umumiy statistika", async (ctx)=>{
    let statistic = await channelController.general_statistic();
    if(statistic.status){
        await ctx.reply(`
<b>📈 STATISTIKA</b>  

👥 Foydalanuvchilar: <b>${statistic.user_count}</b>      
🎬 Kinolar soni: <b>${statistic.movie_count}</b>      
        `,{
            parse_mode: "HTML"
        })

    }
})


bot.hears("🔴 Bekor qilish", async (ctx)=>{
    await ctx.conversation.enter("base_menu");
})







const movies_menu = new Menu("movies_menu", { onMenuOutdated: false} )
    .dynamic(async (ctx, range) => {
        let list = ctx.session.session_db.movie_list;
        list.forEach((item) => {
            range
                .text(item.code, async (ctx) => {
                    // await ctx.deleteMessage();
                    let status = await movieController.remove_movie(item._id);
                    if(status){
                        await  ctx.reply("✅ Kino muvovaqiyatli o'chirildi")
                    }else{
                        await  ctx.reply("⚠️ Xatolik yuz berdi")
                    }


                })
                .row()

        })
    })
    .dynamic(async (ctx, range) => {
        let currentPage = ctx.session.session_db.currentPage;
        let list = ["<<",`${currentPage}` ,">>"];
        list.forEach((item) => {
            range
                .text(item, async (ctx) => {
                    // await ctx.deleteMessage();
                    // let status = await movieController.remove_movie(item._id);
                    // if(status){
                    //     await  ctx.reply("✅ Muvovaqiyatli bajarildi")
                    // }else{
                    //     await  ctx.reply("⚠️ Xatolik yuz berdi")
                    // }
                    // ctx.session.session_db.movie_list = [{
                    //     code:'343',
                    //     _id:2324,
                    // }]
                    let current_page = ctx.session.session_db.currentPage;
                    let max_page =  ctx.session.session_db.max_page_count;
                    if(item===">>"){

                        if(current_page<max_page){
                            current_page++;
                            ctx.session.session_db.currentPage =current_page;

                            let res_data = await movieController.pagination_movie_list(current_page);
                            ctx.session.session_db.movie_list = res_data.data;
                            await ctx.menu.update({ immediate: true });
                        }else{
                            await ctx.answerCallbackQuery( {
                                callback_query_id:ctx.callbackQuery.id,
                                text:"⚠️ Siz oxirgi sahifadasiz!",
                                show_alert:true
                            })
                        }



                    }else if(item==="<<"){
                        if(current_page >1){
                            current_page--;
                            ctx.session.session_db.currentPage =current_page;
                            let res_data = await movieController.pagination_movie_list(current_page);
                            ctx.session.session_db.movie_list = res_data.data;
                            await ctx.menu.update({ immediate: true });
                        }else{
                            await ctx.answerCallbackQuery( {
                                callback_query_id:ctx.callbackQuery.id,
                                text:"⚠️ Siz birinchi sahifadasiz!",
                                show_alert:true
                            })
                        }


                    }else{
                        await ctx.answerCallbackQuery( {
                            callback_query_id:ctx.callbackQuery.id,
                            text:"⚠️ Siz joriy sahifa raqamini bosdingiz!",
                            show_alert:true
                        })
                    }

                    // ctx.menu.update()


                })

        })
    })

    // .text('1')
    // .text("2")
    // .text("3")
    // .text("4")
    // .row();
bot.use(movies_menu)




bot.hears("🎥 Kinolar", async (ctx)=>{
     ctx.session.session_db.currentPage = 1;
    let res_data =await movieController.pagination_movie_list(ctx.session.session_db.currentPag);
    ctx.session.session_db.max_page_count = res_data.max_page;
    let movie_count = res_data.total_count;

    if(res_data.data.length>0){
        ctx.session.session_db.movie_list = res_data.data;
        await ctx.reply(`
<b>Kinolar ro'yxati</b>
<i>🎥 Kinolar soni: <b>${movie_count}</b></i>
<i>🫵 Ustiga bosish orqali kinoni o'chiring!</i>
 
        `,{
            parse_mode: "HTML",
            reply_markup: movies_menu,
        })

    }else{
        await ctx.reply("Kinolar yo'q")
    }
})










































module.exports = bot