const {authenToken} = require("../middlewares/authenToken");
const userRouter = require("../routes/User");
const checkRouter = require("../routes/Check");
const auth = require("../routes/auth");
const s3 = require("../routes/s3");


const routes = (app, io, users) => { 
    const conversationRouter = require("../routes/Conversation")(io, users);
    const chatRouter = require("../routes/Chat")(io, users);
    const userConversationsRouter = require("../routes/UserConversation")(io, users);
    const groupRouter = require("../routes/Group")(io, users);
    const friendRequestRouter = require("../routes/FriendRequest")(io, users);  
    const friendsRouter = require("../routes/Friends")(io, users);  
    app.use("/api/user",authenToken, userRouter);
    app.use("/api/conversation",authenToken, conversationRouter);
    app.use("/api/chat",authenToken, chatRouter);
    app.use("/api/userConversations",authenToken, userConversationsRouter);
    app.use("/api/auth", authenToken, auth);
    app.use("/api/friends", authenToken,friendsRouter);
    app.use("/api/friendRequest", authenToken, friendRequestRouter);
    app.use("/api/group", authenToken, groupRouter);
    app.use("/api/check",checkRouter); 
    app.use("/api/s3", s3);
    // app.use("/api/user", userRouter);
    // app.use("/api/conversation", conversationRouter);
    // app.use("/api/chat", chatRouter);
    // app.use("/api/userConversations", userConversationsRouter);
    // app.use("/api/auth", auth);
    // app.use("/api/friends",friendsRouter);
    // app.use("/api/friendRequest", friendRequestRouter);
    // app.use("/api/check",checkRouter); 
}

module.exports = routes;