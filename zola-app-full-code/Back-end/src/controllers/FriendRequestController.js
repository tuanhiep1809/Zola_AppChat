const FriendRequestService = require("../services/FriendRequestService");
class FriendRequestController { 
    constructor(io, users) {
        this.io = io;
        this.users = users;
    }
    sendFriendRequest = async (req, res) => { 
        try {
            const { senderUserId, receiverUserId } = req.body;
            const friendRequest = await FriendRequestService.sendFriendRequest(senderUserId, receiverUserId, this.io, this.users);
            
            res.json(friendRequest);
        } catch (err) {
            console.log(err)
            res.status(400).json(err);
        }
    }

    acceptFriendRequest = async (req, res) => {
        try {
            const { friendRequestId } = req.body;
            const friendRequest = await FriendRequestService.acceptFriendRequest(friendRequestId, this.io, this.users);
            res.json(friendRequest);
        } catch (err) {
            console.log(err)
            res.status(400).json(err);
        }
    }

    declineFriendRequest = async (req, res) => {
        try {
            const { friendRequestId } = req.body;
            const friendRequest = await FriendRequestService.declineFriendRequest(friendRequestId);
            res.json(friendRequest);
        } catch (err) {
            console.log(err)
            res.status(400).json(err);
        }
    }

    cancelFriendRequest = async (req, res) => {
        try {
            const { friendRequestId } = req.body;
            const friendRequest = await FriendRequestService.cancelFriendRequest(friendRequestId, this.io, this.users);
            res.json(friendRequest);
        } catch (err) {
            console.log(err)
            res.status(400).json(err);
        }
    }

    getSentFriendRequests = async (req, res) => {
        try {
            const { userId } = req.params;
            const friendRequests = await FriendRequestService.getSentFriendRequests(userId);
            res.json(friendRequests);
        } catch (err) {
            console.log(err)
            res.status(400).json(err);
        }
    }

    getReceivedFriendRequests = async (req, res) => {
        try {
            const { userId } = req.params;
            const friendRequests = await FriendRequestService.getReceivedFriendRequests(userId);
            res.json(friendRequests);
        } catch (err) {
            console.log(err)
            res.status(400).json(err);
        }
    }

    getStateOfTwoUsers = async (req, res) => {
        try {
            const { userId1, userId2 } = req.query;
            const state = await FriendRequestService.getStateOfTwoUsers(userId1, userId2);
            res.json(state);
        } catch (err) {
            console.log(err)
            res.status(400).json(err);
        }
    }
}

module.exports = FriendRequestController;