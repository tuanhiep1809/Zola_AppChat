const Chat = require("../models/Chat");
const CombineUserId = require("../utils/CombineUserId");
const ConversationService = require("./ConversationService");
const FriendsService = require("./FriendsService");
const S3Service = require("./S3Service");
const UserService = require("./UserService");
const { v4: uuidv4 } = require("uuid");
const redisDb = require("../services/RedisService")


class ChatService {
    async getChats (conversationId, userId, offset=0) {
        try {
            // console.log("offset:", offset); 
            const LIMIT = 20; 
            let len = await redisDb.lLen("chats:" + conversationId);
            let chats = [];
            let start=0, end=0; 
            if(len>0) { 
                end = len-1-offset*LIMIT;
                if(end<0) 
                    return []; 
                start = Math.max(0, end-LIMIT+1);
                console.log("len:", len)
                console.log("start:", start, "end:", end)
                chats = await redisDb.lRange("chats:" + conversationId, start, end);
            }
            else {
                let UserInfo = new Map();
                chats = await Chat.find({ conversationId });
                len = chats.length;
                end = len-offset*LIMIT;
                if(end+1<0) 
                    return []; 
                start = Math.max(0, end-LIMIT+1);
                chats =  await Promise.all(
                    chats.map(async (chat) => {
                        let senderInfo = UserInfo.get(chat.senderId);
                        if(!senderInfo) {
                            senderInfo = await UserService.getShortInfoUser(chat.senderId);
                            UserInfo.set(chat.senderId, senderInfo);
                        }
                        const data = {
                            ...chat._doc,
                            senderInfo
                        }
                        await redisDb.rPush("chats:" + conversationId, data);
                        return data
                    }).slice( start, end)
                )
            } 
            
            //check if user is removed from conversation
            const conv = await ConversationService.getConversation(conversationId);
            if(conv?.deletedList && conv.deletedList.some(member => member._id === userId)) { 
                return [{
                    _id: uuidv4(),
                    conversationId,
                    senderId: userId,
                    type: "system",
                    content: {text: "You have been removed from this conversation!"}, 
                    createdAt: new Date(0)
                }];
            }
            if(conv?.state === "deleted") {
                // return the last chat of chats 
                return [chats[chats.length - 1]];
            }

            let customChats = [];
            for (let chat of chats) {
                if(chat?.deletedFor && chat.deletedFor.includes(userId)) {
                    continue;
                }
                customChats.push({
                    ...(chat._doc || chat),
                    ...(chat.type === "deleted" && { content: { text: "The message has been recalled!" } }),
                });
            }
            return customChats;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    async sendChat (chat, io, users) {
        try {
            chat._id = chat._id || uuidv4();
            chat.createdAt = new Date(); 
            const conv = await ConversationService.getConversation(chat.conversationId, chat.senderId);
            let isFriend = true; 
            const typeChat = chat.type; 
            //block if not friend
            if(conv.state === "deleted") {
                return new Error("This conversation has been deleted!");
            }

            if(conv.type === "couple") {
                const receiverId = conv.members.find(member => member._id !== chat.senderId)._id;
                isFriend = await FriendsService.checkIsFriend(chat.senderId, receiverId);
                if(!isFriend && typeChat!== "notify") {
                    Object.assign(chat, { 
                        content: {text: "Make friends before chatting!"},
                        type: "notify", 
                        deletedFor: [receiverId]
                    }); 
                }
            }

            if(conv.type === "group") {
                const member = conv.members.find(member => member._id === chat.senderId);
                if(!member || member.role === "blocked") 
                    return new Error("You are not allowed to send message in this group!");
            }

            if(conv.deletedList.some(member => member._id === chat.senderId)) {
                return new Error("You have been removed from this conversation!");
            }

            const sender = await UserService.getShortInfoUser(chat.senderId);
            const dataSocket = {
                ...chat,
                senderInfo: {
                    _id: sender._id,
                    name: sender.name,
                    avatar: sender.avatar,
                },
            };
            
            const accepted = isFriend || typeChat==='notify';

             //socket 
             if(accepted) {
                io.to(chat.conversationId).emit("getMessage", dataSocket)
            } else {
                if(users.get(chat.senderId) instanceof Set) {
                    users.get(chat.senderId).forEach(socketId => {
                        io.to(socketId).emit("getMessage", dataSocket);
                    });
                }
            }
            
            //redis
            await redisDb.rPush("chats:" + chat.conversationId, dataSocket);
            
            // save to db
            const newChat = new Chat(chat);
            const savedChat = await newChat.save();
            console.log("savedChat:")
            console.log(savedChat)
            await ConversationService.updateLastMessage(savedChat);

            return {
                chat: savedChat,
                accepted, 
                dataSocket
            };
        } catch (err) {
            console.log(err)
            return err;
        }
    };

    async deleteYourSide (chatId, userId) {
        try {
            const chatResponse = await Chat.findById(chatId);
            //redis
            const keyId = "chats:" + chatResponse.conversationId;  
            const redisChats = await redisDb.lRange(keyId, 0, -1);
            for (let [index, chat] of redisChats.entries()) {
                if(chat._id === chatId) {
                    let deletedFor = chat?.deletedFor || [];
                    await redisDb.lSet(keyId, index,
                        { 
                            ...chat, 
                            deletedFor: [...deletedFor, userId]
                        }
                    );
                    break;
                }
            }

            const chat = await Chat.findByIdAndUpdate(chatId, { $push: { deletedFor: userId } }, { new: true });
            return chat;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    async delete (chatId, userId, io) {
        try {
            const chat = await Chat.findById(chatId);
            //socket delete message
            io.to(chat.conversationId).emit("deleteMessage", chatId);
            
            //redis
            const keyId = "chats:" + chat.conversationId;  
            const redisChats = await redisDb.lRange(keyId, 0, -1);
            let indexChat = 0; 
            for (let [index, chat] of redisChats.entries()) {
                let chatObj = chat;
                if(chatObj._id === chatId) {
                    indexChat = index;
                    await redisDb.lSet(keyId, index,
                        { 
                            ...chatObj, 
                            type: "deleted",
                        }
                    );
                    break;
                }
            }

            if(indexChat === redisChats.length - 1) {
                ConversationService.updateLastMessage({
                    ...chat._doc,
                    type: "deleted", 
                    content: { text: "The message has been recalled!" }
                });
            }

            if(chat.senderId !== userId) 
                return new Error("Do not have permission to delete this message!");
            chat.type = "deleted";
            console.log("chat: ", chat);
            const savedChat = await chat.save();
            return savedChat;
        } catch (err) {
            return err;
        }
    };

    async sendFirstChat (senderId, receiverId, content, type='normal', io, users) {
        try {
            // create new conversation
            const conversationId = CombineUserId(senderId, receiverId);
            const conv = await ConversationService.getConversation(
                conversationId
            );
            if (!conv?._id) {
                await ConversationService.newConversation({
                    _id: conversationId,
                    members: [{ _id: senderId }, { _id: receiverId }],
                    type: "couple",
                    lastMess: {},
                }, io, users);
                const receiverUser = await UserService.getShortInfoUser(receiverId);
                const senderUser = await UserService.getShortInfoUser(senderId);
                
                if(users.get(senderUser) instanceof Set) {
                    users.get(senderUser).forEach(socketId => {
                        io.to(socketId).emit("newConversation", {
                            conversationId, 
                            user: receiverUser, 
                        });
                    })
                }
                
                if(users.get(receiverId) instanceof Set) {
                    users.get(receiverId).forEach(socketId => {
                        io.to(socketId).emit("newConversation", {
                            conversationId, 
                            user: senderUser, 
                        });
                    })
                }
            }

            await this.sendChat({
                conversationId,
                senderId,
                content,
                type,
            }, io, users);
        } catch (err) {
            console.log(err)
            return err;
        }
    };

    async sendFile(file, type, conversationId, senderId, io, users) {
        // upload ảnh
        try {
            const linkFile = await S3Service.uploadFile(file);
            const newChatTempt = {
                senderId,
                content: {
                    [type]: linkFile,
                    ...(type==='file' && {
                        [type]: { 
                            url: linkFile,
                            name: file.originalname,
                            size: file.size
                        }
                    })
                },
                conversationId,
            };
            return this.sendChat(newChatTempt, io, users);
        } catch (err) {
            console.log(err)
        }
    }

    async sendMultiFiles(files, type, conversationId, senderId, io, users) {
        try {
            const linksFile = await Promise.all(
                files.map(async (file) => {
                    const linkFile = await S3Service.uploadFile(file);
                    return {
                        url: linkFile,
                        name: file.originalname,
                        size: file.size,
                    };
                })
            );

            const newChatTempt = {
                senderId,
                content: {
                    [type]: linksFile,
                },
                conversationId,
            };

            return this.sendChat(newChatTempt, io, users);
        } catch (err) {
            console.log(err)
        }
    }
    // send file base64
}

module.exports = new ChatService();
