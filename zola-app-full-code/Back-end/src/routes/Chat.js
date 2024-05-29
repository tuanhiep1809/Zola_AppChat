const router = require("express").Router();
const { singleUploadMiddleware, multipleUploadMiddleware } = require("../middlewares/uploadFile");
const ChatController = require("../controllers/ChatController");

const chatRouter = (io, users) => {
    const chatController = new ChatController(io, users);
    router.get("/:conversationId", chatController.getChats);
    router.post("/", chatController.sendChat);
    router.post("/files", singleUploadMiddleware, chatController.sendFile);
    router.post("/MultiFiles", multipleUploadMiddleware, chatController.sendMultiFiles);
    router.post("/deleteYourSide/:chatId", chatController.deleteYourSide);
    router.post("/delete/:chatId", chatController.delete);
    return router; 
}

module.exports = chatRouter