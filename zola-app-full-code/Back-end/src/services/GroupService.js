const Conversation = require("../models/Conversation");
const ConversationService = require("./ConversationService");
const { v4: uuidv4 } = require("uuid");
const UserService = require("./UserService");
const ChatService = require("../services/ChatService");
const redisDb = require("../services/RedisService")
class GroupService {
    newGroup = async (name, adminId, members, io, users) => {
        try {
            const newGroup = {
                _id: uuidv4(),
                type: "group",
                name,
                members,
                adminId,
            };
            const savedGroup = await ConversationService.newConversation(newGroup, io, users);
            return savedGroup;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    dissolutionGroup = async (groupId, adminId, io, users) => {
        try {
            const group = await ConversationService.getConversation(groupId,adminId);
            if( adminId !== group.adminId) 
                return false;
            console.log("dissolutionGroup")
            await ChatService.sendChat({ 
                conversationId: groupId,
                senderId: adminId,
                content: {
                    text: `The group was dissolved by the admin`
                },
                type: 'system'
            }, io, users)

            await redisDb.set(`conversation:${groupId}`, {
                ...group,
                state: 'deleted'
            });

            io.to(groupId).emit("deleteConversation", groupId);

            group.state = 'deleted';
            const groupSaved = await ConversationService.update(group);
            return groupSaved; 
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    updateInfoGroup = async(groupId, newInfo) => { 
        try {
            // find and update the group 
            const updateGroup = await Conversation.findOneAndUpdate(
                { _id: groupId },
                newInfo,
                { new: true }
            );
            await redisDb.set(`conversation:${groupId}`, updateGroup);
            return updateGroup;
        } catch (err) {
            console.log(err);
            return err
        }
    }

    getMembers = async(groupId) => {
        try {
            const group = await ConversationService.getConversation(groupId);
            let {members, adminId, deputyList} = group;
            members = members.map(async (member) => {
                const user = await UserService.getShortInfoUser(member._id);
                const role = member._id === adminId ? "admin" : deputyList.some((item)=>item._id===member._id) ? "deputy" : "member";
                return { 
                    _id: user._id,
                    name: user.name,
                    avatar: user.avatar, 
                    role
                }
            });
            members = await Promise.all(members);
            return members;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    addMember = async (groupId, userId, place, userAdded) => {
        try {
            const group = await ConversationService.getConversation(groupId, userId);
            if (!group) return null;
            if(place === 'member') {
                group.members.push({_id: userId, userAdded});
                group.waitingList = group.waitingList.filter((item) => item._id !== userId);
            }
            else if(place === 'deputy') 
                group.deputyList.push({_id: userId, userAdded});
            else if(place === 'waiting') 
                group.waitingList.push({_id: userId, userAdded});
            else return null;

            await redisDb.set(`conversation:${groupId}`, group);
            const groupSaved = await ConversationService.update(group);
            return groupSaved;
        } catch (err) {
            console.log(err);
            return err;
        }
    };

    transferAdmin = async (groupId, newAdminId) => {
        try {
            const group = await ConversationService.getConversation(groupId, newAdminId);
            if (!group) return null;
            group.adminId = newAdminId;
            //delete in deputyList 
            group.deputyList = group.deputyList.filter((item) => item._id !== newAdminId);
            await redisDb.set(`conversation:${groupId}`, group);
            const groupSaved = await ConversationService.update(group);
            return groupSaved;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    addDeputy = async (groupId, userId) => {
        try {
            const group = await ConversationService.getConversation(groupId, userId);
            if (!group) return null;
            group.deputyList.push({_id: userId});
            await redisDb.set(`conversation:${groupId}`, group);
            const groupSaved = await ConversationService.update(group);
            return groupSaved;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    removeMember = async (groupId, userId) => {
        try {
            const group = await ConversationService.getConversation(groupId, userId);
            if (!group) return null;
            group.members = group.members.filter((item) => item._id !== userId);
            group.deputyList = group.deputyList.filter((item) => item._id !== userId);
            group.waitingList = group.waitingList.filter((item) => item._id !== userId);
            group.deletedList.push({_id: userId});
            await redisDb.set(`conversation:${groupId}`, group);
            const groupSaved = await ConversationService.update(group);
            return groupSaved;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    getGroup = async (groupId) => { 
        try {
            let group = await ConversationService.getConversation(groupId);
            if (!group) return null;
            group.members = await this.getMembers(groupId);
            let {waitingList} = group; 
            group.waitingList = waitingList.map(async (member) => {
                const userAdded = await UserService.getShortInfoUser(member.userAdded);
                const user = await UserService.getShortInfoUser(member._id);
                return {
                    ...user, 
                    userAdded
                }
            });
            group.waitingList = await Promise.all(group.waitingList);
            return group;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    checkMember = async (groupId, userId) => {
        try {
            const group = await ConversationService.getConversation(groupId, userId);
            if (!group) return null;
            return group.members.some((item) => item._id === userId);
        } catch (err) {
            console.log(err);
            return err;
        }
    }
}

module.exports = new GroupService();
