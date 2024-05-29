const GroupService = require("../services/GroupService");
const ChatService = require("../services/ChatService");
const UserService = require("../services/UserService");
const { v4: uuidv4 } = require("uuid");
const ConversationService = require("../services/ConversationService");
const UserConversationService = require("../services/UserConversationService");

class GroupController { 
    constructor(io, users) {
        this.io = io;
        this.users = users;
    }
    newGroup = async (req, res) => {
        try {
            const {name, members} = req.body;
            const adminId = req.userCredential.uid;
            if(members.length < 2) 
                return res.status(400).json({message: "Group must have at least 3 members"})
            members.push({_id: adminId}); 
            const newGroup = await GroupService.newGroup(name, adminId, members, this.io, this.users);
            const chatId = uuidv4();
            await ChatService.sendChat({
                _id: chatId,
                conversationId: newGroup._id,
                senderId: adminId,
                content: {
                    text: `group ${name} has been created`
                },
                type: 'system'
            }, this.io, this.users);
            
            res.json(newGroup);
        } catch (error) {
            console.log(error)
            res.status(500).json(error);            
        }
    }; 

    dissolutionGroup = async (req, res) => {
        try {
            const {groupId} = req.params;
            const adminId = req.userCredential.uid;
            const result = await GroupService.dissolutionGroup(groupId, adminId, this.io, this.users);
            if(result) 
                res.json({message: "Group has been dissolved"});
            else 
                res.status(403).json({message: "You are not the admin of this group"})
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    }; 

    updateInfoGroup = async (req, res) => {
        try {
            const {groupId} = req.params;
            const newInfo = req.body;
            const updateGroup = await GroupService.updateInfoGroup(groupId, newInfo);
            if(newInfo.name) {
                const chatId = uuidv4();
                await ChatService.sendChat({
                    _id: chatId,
                    conversationId: groupId,
                    senderId: req.userCredential.uid,
                    content: {
                        text: `The group was renamed ${newInfo.name}`
                    },
                    type: 'system'
                }, this.io, this.users)
            }
            if(newInfo.messageSendPermission) { 
                const chatId = uuidv4();
                await ChatService.sendChat({
                    _id: chatId,
                    conversationId: groupId,
                    senderId: req.userCredential.uid,
                    content: {
                        text: `The group's message send permission was changed to ${newInfo.messageSendPermission}`
                    },
                    type: 'system'
                }, this.io, this.users)
            } 
            if(newInfo.messagePinPermission) { 
                const chatId = uuidv4();
                await ChatService.sendChat({
                    _id: chatId,
                    conversationId: groupId,
                    senderId: req.userCredential.uid,
                    content: {
                        text: `The group's message pin permission was changed to ${newInfo.messagePinPermission}`
                    },
                    type: 'system'
                }, this.io, this.users)
            }
            if(newInfo.infoEditPermission) { 
                const chatId = uuidv4();
                await ChatService.sendChat({
                    _id: chatId,
                    conversationId: groupId,
                    senderId: req.userCredential.uid,
                    content: {
                        text: `The group's info edit permission was changed to ${newInfo.infoEditPermission}`
                    },
                    type: 'system'
                }, this.io, this.users)
            }
            if(newInfo.memberModeration !== undefined) { 
                const chatId = uuidv4();
                await ChatService.sendChat({
                    _id: chatId,
                    conversationId: groupId,
                    senderId: req.userCredential.uid,
                    content: {
                        text: `The group's member moderation was changed to ${newInfo.memberModeration}`
                    },
                    type: 'system'
                }, this.io, this.users)
            }
            res.json(updateGroup);
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    };

    getMembers = async (req, res) => {
        try {
            const {groupId} = req.params;
            let members= await GroupService.getMembers(groupId);
            res.json(members);
            
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    }

    addMember = async (req, res) => {
        try {
            const userActiveId = req.userCredential.uid;
            const {userId} = req.body;
            const {groupId} = req.params;
            const group = await ConversationService.getConversation(groupId, userActiveId);
            const user = await UserService.getShortInfoUser(userId);
            const userActive = await UserService.getShortInfoUser(userActiveId);
            const {members, deputyList, memberModeration, adminId, waitingList} = group;
            let result = null; 
            // check if the user is already in the group 
            if (!members.find(member => member._id === userActiveId)) 
                return res.status(400).json({message: "You are not in the group"});
            if (members.find(member => member._id === userId)) 
                return res.status(400).json({message: "User is already in the group"});

            const isDeputyOrAdmin = deputyList.some(deputy => deputy._id === userActiveId) || adminId === userActiveId;

            if (memberModeration && !isDeputyOrAdmin) {
                // push to waiting list
                if(waitingList.find(member => member._id === userId)) 
                    return res.status(400).json({message: "User is already in the waiting list"});
                result = await GroupService.addMember(groupId, userId, "waiting", userActiveId);
                await ChatService.sendChat({
                    conversationId: groupId,
                    senderId: userActiveId,
                    content: {
                        text: `member ${user.name} has been added to the watting list by ${userActive.name}`
                    },
                    type: 'system'
                }, this.io, this.users)
            } 
            
            else {
                // push to member list
                result = await GroupService.addMember(groupId, userId, "member");
                await UserConversationService.addConversation(userId, {
                    conversationId: groupId,
                    type: "group", 
                    name: group.name,
                }, this.io, this.users);
                await ChatService.sendChat({
                    conversationId: groupId,
                    senderId: userActiveId,
                    content: {
                        text: `member ${user.name} has been added to the group by ${userActive.name}`
                    },
                    type: 'system'
                }, this.io, this.users)
            }
            return res.json(result);

        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    }

    transferAdmin = async(req, res) => { 
        try {
            const {groupId} = req.params;
            const {userId} = req.body;
            const userActiveId = req.userCredential.uid;
            const group = await ConversationService.getConversation(groupId, userActiveId);
            if(userId === userActiveId) 
                return res.status(400).json({message: "You are already the admin of this group"});
            if(userActiveId !== group.adminId)
                return res.status(403).json({message: "You are not the admin of this group"});
            if(!group.members.find(member => member._id === userId))
                return res.status(400).json({message: "User is not in the group"});

            const result = await GroupService.transferAdmin(groupId, userId);
            const user = await UserService.getShortInfoUser(userId);
            await ChatService.sendChat({
                conversationId: groupId,
                senderId: userActiveId,
                content: {
                    text: `admin has been transferred to ${user.name}`
                },
                type: 'system'
            }, this.io, this.users)

            if(result) {
                res.json({message: "Admin has been transferred"});
            }
            else 
                res.status(403).json({message: "You are not the admin of this group"})
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    }

    addDeputy = async(req, res) => { 
        try {
            const {groupId} = req.params;
            const {userId} = req.body;
            const userActiveId = req.userCredential.uid;
            const group = await ConversationService.getConversation(groupId, userActiveId);
            if(userId === userActiveId) 
                return res.status(400).json({message: "You are already the admin of this group"});
            if(userActiveId !== group.adminId)
                return res.status(403).json({message: "You are not the admin of this group"});
            if(!group.members.find(member => member._id === userId))
                return res.status(400).json({message: "User is not in the group"});
            if(group.deputyList.find(deputy => deputy._id === userId))
                return res.status(400).json({message: "User is already a deputy"});

            const result = await GroupService.addDeputy(groupId, userId);
            const user = await UserService.getShortInfoUser(userId);
            await ChatService.sendChat({
                conversationId: groupId,
                senderId: userActiveId,
                content: {
                    text: `${user.name} has been appointed as group deputy`
                },
                type: 'system'
            }, this.io, this.users)

            if(result) {
                // return the result 
                res.json(result);
            }
            else 
                res.status(403).json({message: "You are not the admin of this group"})
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    }

    outGroup = async(req, res) => {
        const userActiveId = req.userCredential.uid;
        const {groupId} = req.params;
        const group = await ConversationService.getConversation(groupId, userActiveId);
        if(userActiveId === group.adminId) 
            return res.status(400).json({message: "Admin can't leave the group"});
        if(!group.members.find(member => member._id === userActiveId))
            return res.status(400).json({message: "You are not in the group"});
        
        const user = await UserService.getShortInfoUser(userActiveId);
        await ChatService.sendChat({
            conversationId: groupId,
            senderId: userActiveId,
            content: {
                text: `${user.name} has left the group`
            },
            type: 'system'
        }, this.io, this.users)
        const result = await GroupService.removeMember(groupId, userActiveId);
        if(result) {
            if( this.users.get(userActiveId) instanceof Set) {
                this.users.get(userActiveId).forEach(socketId => {
                    this.io.to(socketId).emit("deleteConversation", groupId);
                })
            }
            res.json({message: "You have left the group"});
        }
        else 
            res.status(403).json({message: "You are not in the group"});
    }

    removeMember = async(req, res) => {
        try {
            const userActiveId = req.userCredential.uid;
            const {groupId} = req.params;
            const {userId} = req.query;
            const group = await ConversationService.getConversation(groupId, userActiveId);
            if(userId === group.adminId) 
                return res.status(400).json({message: "Admin can't be removed"});
            if(userActiveId !== group.adminId)
                return res.status(403).json({message: "You are not the admin of this group"});
            if(!group.members.find(member => member._id === userId))
                return res.status(400).json({message: "User is not in the group"});
            const result = await GroupService.removeMember(groupId, userId);
            if(result) {
                const user = await UserService.getShortInfoUser(userId);
                await ChatService.sendChat({
                    conversationId: groupId,
                    senderId: userActiveId,
                    content: {
                        text: `${user.name} has been removed from the group`
                    },
                    type: 'system'
                }, this.io, this.users)
                if(this.users.get(userId) instanceof Set) {
                    this.users.get(userId).forEach(socketId => {
                        this.io.to(socketId).emit("deleteConversation", groupId);
                    })
                }
                res.json({message: "User has been removed"});
            }
            else 
                res.status(403).json({message: "You are not the admin of this group"})
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    }

    getGroup = async(req, res) => {
        try {
            const {groupId} = req.params;
            const group = await GroupService.getGroup(groupId);
            if(!group) 
                return res.status(404).json({message: "Group not found"});
            res.json(group);
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    }
}

module.exports = GroupController;