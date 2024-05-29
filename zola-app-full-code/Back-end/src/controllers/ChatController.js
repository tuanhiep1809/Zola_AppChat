const ChatService = require("../services/ChatService");

class ChatController { 

    constructor(io, users) {
        this.io = io;
        this.users = users;
    }

    getChats = async (req, res) => {
        try {
            const userId = req.userCredential.uid; 
            const {conversationId} = req.params; 
            const offset = parseInt(req.query.offset||0);
            const chats = await ChatService.getChats(conversationId, userId, offset);
            res.status(200).json(chats);
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    }
    sendChat = async (req, res) => {
        try {
            if(req.body?.conversationId) {
                const chat = await ChatService.sendChat(req.body, this.io, this.users);
                res.status(200).json(chat);
            } else if (req.body?.receiverId) { 
                const { senderId, receiverId, content } = req.body;
                const chat = await ChatService.sendFirstChat(
                    senderId,
                    receiverId,  
                    content, 
                    this.io, this.users
                );
                res.status(200).json(chat);
            } 
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    }

    sendFile = async (req, res) => {
        try {
            const { file } = req;
            const { conversationId, senderId, type } = req.query;
            const chat = await ChatService.sendFile(file, type, conversationId, senderId, this.io, this.users);
            res.status(200).json(chat);
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    }
    sendMultiFiles = async (req, res) => {
        try {
            const { files } = req;
            const { conversationId, senderId, type } = req.query;
            const chat = await ChatService.sendMultiFiles(files, type, conversationId, senderId, this.io, this.users);
            res.status(200).json(chat);
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    }


    deleteYourSide = async (req, res) => {
        try {
            const userId = req.userCredential.uid;
            const chatId = req.params.chatId;
            const chat = await ChatService.deleteYourSide(chatId, userId);
            res.status(200).json(chat);
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    }

    delete = async (req, res) => {
        try {
            const chatId = req.params.chatId;
            const userId  = req.userCredential.uid;
            const chat = await ChatService.delete(chatId, userId, this.io);
            res.status(200).json(chat);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

module.exports = ChatController