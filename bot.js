const { Bot} = require("grammy");

require('dotenv').config()
const Database = require("./db");
const customLogger = require("./config/customLogger");


// modules

const {client_bot} = require("./modules/clientModules");
const config_bot = require("./modules/configModules")
const admin_bot = require("./modules/adminModules")

const bot_token = process.env.BOT_TOKEN;







const bot = new Bot(bot_token);

bot.use(config_bot)

bot.filter(async(ctx)=> ctx.config.super_admin).use(admin_bot)
bot.filter(async(ctx)=> !ctx.config.super_admin).use(client_bot)






bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const message = err.error;
    customLogger.log({
        level: 'error',
        message: message
    });
});



bot.start({
    allowed_updates: ["my_chat_member", "chat_member", "message", "callback_query", "inline_query"],
});