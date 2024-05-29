const mongoose = require('mongoose');

const UserConversationSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true
    }, 
    userId: {
        type: String, 
        required: true
    },
    conversations: {
        type: Array,
    }, 
})

module.exports = mongoose.model('UserConversation', UserConversationSchema)