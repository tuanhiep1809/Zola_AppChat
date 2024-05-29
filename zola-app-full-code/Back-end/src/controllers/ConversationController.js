const ConversationService = require("../services/ConversationService");

class ConversationController {

    constructor(io, users) {
        this.io = io;
        this.users = users;
    }

    newConversation = async (req, res) => {
        try {
            const savedConversation = await ConversationService.newConversation(req.body, this.io, this.users);
            res.status(200).json(savedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    getConversation = async (req, res) => {
        try {
            const userId = req.userCredential.uid;
            const conversation = await ConversationService.getConversation(req.params.conversationId, userId);
            res.status(200).json(conversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    addMember = async (req, res) => {
        try {
            const savedConversation = await ConversationService.addMember(req.params.conversationId, req.body, this.io, this.users);
            res.status(200).json(savedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    deleteMember = async (req, res) => {
        try {
            const savedConversation = await ConversationService.deleteMember(req.params.conversationId, req.body);
            res.status(200).json(savedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    deleteConversation = async (req, res) => {
        try {
            const deletedConversation = await ConversationService.deleteConversation(req.params.conversationId);
            res.status(200).json(deletedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    getLastMessage = async (req, res) => {
        try {
            const lastMessage = await ConversationService.getLastMessage(req.params.conversationId);
            res.status(200).json(lastMessage);
        } catch (err) {
            res.status(500).json(err);
        }
    }
}   


module.exports = ConversationController; 