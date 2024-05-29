const Conversation = require("../models/Conversation");
const UserConversation = require("../models/UserConversation");
const UserService = require("./UserService");
const { v4: uuidv4 } = require("uuid");
const redisDb = require("../services/RedisService");
class UserConversationService {
    // create an userConversation
    async create(userId) {
        try {
            const newUserConversation = new UserConversation({
                _id:userId,
                userId,
                conversations: [],
            });
            const savedUserConversation = await newUserConversation.save();
            return savedUserConversation;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    // get userConversations by userId
    async get(userId) {
        try {
            let userConversation = await redisDb.get(`userConversation:${userId}`);
            if(!userConversation) {
                userConversation = await UserConversation.findOne({ userId: userId });
                userConversation.conversations = await Promise.all(
                    userConversation.conversations
                        .map(async (item) => {
                            const conversationId = item.conversationId;
                            const conversation = await Conversation.findById(conversationId);
                            if(!conversation) return null;
                            const members = await Promise.all(
                                conversation && conversation.members
                                    // .filter((item) => item._id !== userId)
                                    .map(async (item) => {
                                        const member = await UserService.getShortInfoUser(item._id);
                                    
                                        return {
                                            _id: member?._id,
                                            name: member.name,
                                            avatar: member.avatar,
                                            number: member.number,
                                        };
                                    })
                            );
    
                            let lastMess = conversation.lastMess;
                            const deleled = conversation?.deletedList && conversation.deletedList.some(member => member._id === userId);
                            if(deleled)  {
                                lastMess = {
                                    _id: uuidv4(),
                                    conversationId,
                                    senderId: userId,
                                    type: "system",
                                    content: {text: "You have been removed from this conversation!"}, 
                                    createdAt: new Date(0)
                                }
                            }
    
                            // console.log("lastMess: ")
                            // console.log(lastMess)
    
                            return {
                                ...item,
                                lastMess,
                                ...(conversation.type==='group' && {
                                    name: conversation.name,
                                    image: conversation.image,
                                    deputyList: conversation.deputyList,
                                    messageSendPermission: conversation.messageSendPermission,
                                    messagePinPermission: conversation.messagePinPermission,
                                    infoEditPermission: conversation.infoEditPermission,
                                    memberModeration: conversation.memberModeration,
                                    waitingList: conversation.waitingList,
                                    members, 
                                    adminId: conversation.adminId,
                                }),
                                ...(conversation.type==='couple' && 
                                    {user: members.find((item) => item._id !== userId)}
                                ),
                                type: conversation.type,
                                ...(conversation.state && {state: conversation.state}),
                                ...(deleled && {deleted: true, state: "deleted"}),
                            };
                        })
                );
                userConversation.conversations = await Promise.all(
                    userConversation.conversations
                        .filter((item) => item && item?.lastMess)
                );
                await redisDb.set(`userConversation:${userId}`, userConversation);
            }
            return userConversation
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    // add a conversations to a user
    async addConversation(userId, conversation, io, users) {
        try {
            const updatedUserConversation =
                await UserConversation.findOneAndUpdate(
                    { userId },
                    { $push: { conversations: conversation } },
                    { new: true }
                );
            const conv = await Conversation.findById(conversation.conversationId);
            let user = null; 
            let members = null; 
            let lastMess = conv.lastMess;
            if(conv.type === 'couple') {
                const userData = await UserService.getUserById(conv.members.find((item) => item._id !== userId)._id);
                user = {
                    _id: userData._id,
                    name: userData.name,
                    avatar: userData.avatar,
                }
            } else if( conv.type === 'group') {
                members = await Promise.all(
                    conv.members
                        .map(async (item) => {
                            let member = await UserService.getShortInfoUser(item._id);
                            return {
                                _id: member?._id,
                                name: member.name,
                                avatar: member.avatar,
                            };
                        })
                );
            }
            if(!lastMess) { 
                lastMess = {
                    _id: uuidv4(),
                    conversationId: conversation.conversationId,
                    senderId: userId,
                    type: "system",
                    content: {text: "You have been added to this conversation!"}, 
                    createdAt: new Date()
                }
            }

            const dataSocketNewConv =  {
                ...conv._doc, 
                lastMess,
                ...(conv.type==='group' && {members}), 
                ...(conv.type==='couple' && {user}),
            }

            if(users.get(userId) instanceof Set) {
                users.get(userId).forEach(socketId => {
                    io.to(socketId).emit("newConversation", dataSocketNewConv); 
                })
            }
            await redisDb.del(`userConversation:${userId}`);
            await this.get(userId);
            return updatedUserConversation;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async deleteConversation(userId, conversationId) {
        try {
            const updatedUserConversation =
                await UserConversation.findOneAndUpdate(
                    { _id: userId },
                    { $pull: { conversations: { conversationId } } },
                    { new: true }
                );
            await redisDb.del(`userConversation:${userId}`);
            await this.get(userId);
            return updatedUserConversation;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async updateWatchedConversation(_id, conversationId) {
        try {
            const updatedUserConversation =
                await UserConversation.findOneAndUpdate(
                    { _id, "conversations.conversationId": conversationId },
                    { $set: { "conversations.$.watched": true }},
                    { new: true }
                );  
            return updatedUserConversation;
        } catch (err) {
            console.log(err)
            return err;
        }
    }
}

module.exports = new UserConversationService();
