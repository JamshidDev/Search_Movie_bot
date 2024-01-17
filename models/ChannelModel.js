const mongoose = require('mongoose')


const ChannelSchema = mongoose.Schema({
    telegram_id: {
        type: Number,
        required: true,
    },
    user_id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
    },
    username: {
        type: String,
    },
    type: {
        type: String,
    },
    new_chat:{
        type: Object,
    },
    ad: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    }
})

const Channel = mongoose.model("ChannelSchema", ChannelSchema)

module.exports = Channel;

//
// telegram_id: ctx.update.my_chat_member.chat.id,
//     user_id: ctx.update.my_chat_member.from.id,
//     title: ctx.update.my_chat_member.chat.title,
//     username: ctx.update.my_chat_member.chat.username,
//     type: ctx.update.my_chat_member.chat.type,
//     new_chat: ctx.update.my_chat_member.new_chat_member, // object