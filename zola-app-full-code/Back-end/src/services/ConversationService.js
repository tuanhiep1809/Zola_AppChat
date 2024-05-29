const Conversation = require("../models/Conversation");
const UserConversationService = require("./UserConversationService");
const redisDb = require("../services/RedisService")
class ConversationService {
    newConversation = async (conversation, io, users) => {
        try {
            
            const newConversation = new Conversation(conversation);
            const savedConversation = await newConversation.save();
            //redis
            await redisDb.set(`conversation:${conversation._id}`, savedConversation);
            // Add conversation to each member's list of conversations 
            conversation.members.forEach(member => {
                console.log("to member: ", member._id)
                UserConversationService.addConversation(member._id, {
                    conversationId: savedConversation._id,
                    watched: false,
                    type: conversation.type,
                    ...(conversation.type === 'group' 
                        ? {name: conversation.name}  
                        : {userId: conversation.members.find(item => item._id !== member._id)._id}
                    )
                }, io, users);
            });

            return savedConversation;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    getConversation = async (conversationId, userId=null) => {
        try {
            let  conversation = await redisDb.get(`conversation:${conversationId}`);
            if(!conversation) {
                conversation = await Conversation.findById(conversationId);
                await redisDb.set(`conversation:${conversationId}`, conversation);
            }
            let deleted = false; 
            if(conversation.type === 'group') {
                if(conversation.deletedList.length > 0 && conversation.deletedList.some(item => item._id === userId)) {
                    deleted = true; 
                } 
            } 
            if(conversation._doc)
                conversation = conversation._doc;
            return {
                ...conversation,
                deleted
            };
        } catch (err) {
            
            return err;
        }
    }

    addMember = async (conversationId, members, io, users) => {
        try {
            const conv = await Conversation.findById(conversationId);
            //redis
            await redisDb.set(`conversation:${conversationId}`, {
                ...conv._doc,
                members: conv.members.concat(members)
            });

            conv.members = conv.members.concat(members);
            conv.save();
            members.forEach(member => {
                UserConversationService.addConversation(member._id, {
                    conversationId,
                    watched: false,
                }, io, users);
            }); 
            return conv;
        } catch (err) {
            
            return err;
        }
    }

    deleteMember = async (conversationId, memberId) => {
        try {
            const conv = await Conversation.findByIdAndUpdate(
                conversationId,
                { $pull: { members: memberId } },
                { new: true },
            ) 

            //redis
            await redisDb.set(`conversation:${conversationId}`, {
                ...conv._doc,
                members: conv.members.filter(item => item._id !== memberId)
            });


            return conv;
        } catch (err) {
            
            return err;
        }
    } 

    deleteConversation = async (conversationId) => {
        try {
            const deletedConversation = await Conversation.findByIdAndDelete(conversationId);
            return deletedConversation;
        } catch (err) {
            
            return err;
        }
    }

    updateLastMessage = async (chat) => {
        try {
            const conversation = await this.getConversation(chat.conversationId);

            //redis 
            await redisDb.set(`conversation:${chat.conversationId}`, {
                ...conversation,
                lastMess: chat
            });

            const updatedConversation = await Conversation.findByIdAndUpdate(chat.conversationId, { $set: { lastMess: chat } }, { new: true });
            return updatedConversation
        
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    getLastMessage = async (conversationId) => {
        try {
            const conversation = await this.getConversation(conversationId);
            return conversation.lastMess;
        } catch (err) {
            
            return err;
        }
    }

    update = async(conversation) => {
        try {
            const updatedConversation = await Conversation.findByIdAndUpdate(conversation._id, { $set: conversation }, { new: true });
            return updatedConversation
        } catch (err) {
            console.log(err)
            return err;
        }
    }
}

module.exports = new ConversationService()