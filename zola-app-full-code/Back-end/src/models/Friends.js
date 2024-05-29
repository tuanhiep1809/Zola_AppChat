const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    friends : {
        type: Array
    }, 
    phoneBook: {
        type: Array
    }
}, { timestamps: true });

module.exports = mongoose.model("Friends", friendSchema);