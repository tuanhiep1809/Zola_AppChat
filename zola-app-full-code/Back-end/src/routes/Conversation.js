const router = require("express").Router();
const ConversationController = require("../controllers/ConversationController");

const ConversationRouter = (io, users) => { 
    const conversationController = new ConversationController(io, users);
    router.post("/", conversationController.newConversation); // new conversation
    router.get("/:conversationId", conversationController.getConversation); // get conversation by Id  
    router.patch("/add-member/:conversationId", conversationController.addMember); // add a member to a conversation
    router.patch("/delete-member/:conversationId", conversationController.deleteMember); // delete a member from a conversation
    router.delete("/:conversationId", conversationController.deleteConversation); // delete a conversation by Id    
    return router; 

}

module.exports = ConversationRouter;
