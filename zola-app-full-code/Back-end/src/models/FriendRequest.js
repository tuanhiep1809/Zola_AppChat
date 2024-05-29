const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
    _id: {
        type: String, 
        required: true
    },
    senderUserId : {
        type: String,
        required: true
    },
    receiverUserId : {
        type: String,
        required: true
    },
    state : {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model("FriendRequest", friendRequestSchema);