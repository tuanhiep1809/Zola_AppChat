const CheckService = require("../services/CheckService");
const {admin} = require("../middlewares/authenToken");
// const httpServer = createServer();
// httpServer.listen(8900);
// const io = new Server(httpServer);

const ChatService = require("../services/ChatService");
const socket = (io, users) => { 
    const addUser = (userId, socketId) => {
        if(!users.has(userId)) {
            users.set(userId, new Set([socketId]));
        } else {
            users.get(userId).add(socketId);
        }
        if (!users.has(socketId)) 
            users.set(socketId, userId);
        console.log("userId: ", userId);
        console.log("socketIds: ", users.get(userId));
    }
    const removeUser = (socketId) => {
        for (let [key, value] of users.entries()) {
            if (value instanceof Set && value.has(socketId)) {
                value.delete(socketId);
                if (value.size === 0) {
                    users.delete(key);
                }
            } else if (value === socketId) {
                users.delete(key);
            }
        }
        users.delete(socketId);
    }

    io.use(async (socket, next) => {
        if(socket.handshake.query && socket.handshake.query.token) {
            const token = socket.handshake.query.token;
            // console.log("token:")
            // console.log(token)
            try {
                const decodedClaims = await admin
                    .auth()
                    .verifyIdToken(token, true /** checkRevoked */);
                socket.userId = decodedClaims.uid;
                console.log("decodedClaims.uid:")
                console.log(decodedClaims.uid)
                next();
            } catch (error) {
                io.emit("tokenExpired")
                console.log(error);
                next(new Error("Authentication error"));
            }
        } else {
            next(new Error("Authentication error"));
        }
    })
    .on("connection", (socket) => {
        console.log("a user connected:", socket.userId);
        socket.on("disconnect", () => {
            console.log("user disconnected");
            removeUser(socket.id);
            io.emit("getUsers", users);
        })

        socket.on("addUser", (userId) => {
            addUser(userId, socket.id);
            console.log("userId: ", userId);
            io.emit("getUsers", users);
        })

        socket.on("joinRoom", async (conversationId) => {
            const isMember = await CheckService.checkMemberExists(conversationId, socket.userId);
            if (!isMember) return;
            console.log("joinRoom: ", conversationId);
            socket.join(conversationId);
        })

        socket.on("leaveRoom", (conversationId) => {
            console.log("leaveRoom: ", conversationId);
            socket.leave(conversationId);
        })
        //send message to a room 
        socket.on("sendMessage",async (chat) => {
            ChatService.sendChat(chat, io, users);
        })
        socket.on("video-call", ({channel, caller}) => { 
            console.log("video-call: ", channel, caller); 
            io.to(channel).emit("receive-call", {channel, caller});
        })
        socket.on("end-call", ({channel}) => { 
            console.log("end-call: ", channel); 
            io.to(channel).emit("end-call", {channel});
        })
        socket.on("decline-call", ({channel}) => { 
            console.log("decline-call: ", channel); 
            io.to(channel).emit("decline-call", {channel});
        })
    })
}

//export io and socket
module.exports = {socket};
