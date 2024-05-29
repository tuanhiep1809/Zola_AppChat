const UserConversationService = require('../services/UserConversationService')
class UserConversationController { 
    // create an userConversation 
    constructor(io, users) {
        this.io = io;
        this.users = users;
    }

    create = async (req, res) => {
        // if (req.body.userId !== req.userCredential.uid) 
        //     return res.status(403);
        try { 
            const userConversation = await UserConversationService.create(req.body.userId);
            res.status(200).json(userConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }  

    // get userConversations by userId
    get = async (req, res) => {
        if (req.params.userId !== req.userCredential.uid)
            return res.status(403).json("You can only get your conversations!");
        try {
            const userConversation = await UserConversationService.get(req.params.userId);
            res.status(200).json(userConversation);
        } catch (err) {
            console.log(err); 
            res.status(500).json(err);
        }
    } 

    // add a conversations to a user
    addConversation = async (req, res) => {
        try { 
            console.log("user:")
            console.log(this.user)
            const updatedUserConversation = await UserConversationService.addConversation(
                req.params.userId,
                req.body, 
                this.io, this.users
            );
            res.status(200).json(updatedUserConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    updateWatchedConversation = async (req, res) => {
        try {
            const { userId, conversationId } = req.params;
            const updatedConversation = UserConversationService.updateWatchedConversation(userId, conversationId);
            res.status(200).json(updatedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    }
}   

module.exports = UserConversationController