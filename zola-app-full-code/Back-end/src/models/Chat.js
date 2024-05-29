const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        _id : { 
            type: String,
            required: true,
        },
        conversationId: {
            type: String,
            required: true,
        },
        senderId: {
            type: String,
            required: true,
        },
        content: {
            text: {type: String},
            image: {type: String},
            video: {type: String},
            file: {
                url: {type: String},
                name: {type: String},
                size: {type: Number},
            },
            images: {type: Array},
        },
        type: {
            type: String, //notify, deleted, normal
            default: "normal",
        },
        deletedFor : {
            type: Array,
            default: [],
        },
        createdAt: Date
    },
    { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
