const router = require("express").Router();
const UserConversationController = require("../controllers/UserConversationController");

const userConversationRouter = (io, users) => {
    const userConversationController = new UserConversationController(io, users);
    router.get('/:userId', userConversationController.get); // get userConversations by userId
    router.patch('/add-conversation/:userId', userConversationController.addConversation); // add a conversations to a user
    router.patch('/watched/:userId/:conversationId', userConversationController.updateWatchedConversation); // update watched conversation
    return router
}


module.exports = userConversationRouter;