const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    type: {
        type: String, 
        enum: ['couple', 'group'],
    }, 
    name: {
        type: String
    }, 
    image: { 
        type: String,
        default: 'https://firebasestorage.googleapis.com/v0/b/zalo-78227.appspot.com/o/imageGroupDefault.jpg?alt=media&token=25aa9497-5b59-47bf-bc73-614471198c70'
    }, 
    members: {
        type: Array
    },
    lastMess : {
        type: Object
    }, 
    adminId: {
        type: String
    }, 
    deputyList: {
        type: Array
    }, 
    messageSendPermission: {
        type: String, 
        enum: ['all', 'admin'],
        default: 'all'
    }, 
    messagePinPermission: {
        type: String, 
        enum: ['all', 'admin'],
        default: 'all'
    },
    infoEditPermission: {
        type: String, 
        enum: ['all', 'admin'],
        default: 'all'
    },
    memberModeration : { 
        type: Boolean, 
        default: false
    }, 
    waitingList: {
        type: Array, 
    },
    deletedList: {
        type: Array
    },
    state: {
        type: String, 
        enum: ['active', 'deleted'],
        default: 'active'
    }
    
}, { timestamps: true })

module.exports = mongoose.model('Conversation', conversationSchema)