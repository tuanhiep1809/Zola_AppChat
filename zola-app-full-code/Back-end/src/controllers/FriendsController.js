const FriendRequestService = require('../services/FriendRequestService');
const FriendsService = require('../services/FriendsService');
class FriendController {
    constructor(io, users) {
        this.io = io;
        this.users = users;
    }
    getFriends = async (req, res) => {
        const userId = req.params.userId;
        const friends = await FriendsService.getFriends(userId);
        res.json(friends);
    }
    updatePhoneBook = async (req, res) => {
        const userId = req.params.userId;
        const phoneBook = req.body.phoneBook;
        const friends = await FriendsService.updatePhoneBook(userId, phoneBook);
        res.json(friends);
    }
    getPhoneBook = async (req, res) => {
        const userId = req.params.userId;
        const phoneBook = await FriendsService.getPhoneBook(userId);
        res.json(phoneBook);
    }
    // not for use, just for testing
    addFriend = async (req, res) => {
        const {userId, friendId} = req.body;
        const friends = await FriendsService.addFriend(userId, friendId);
        res.json(friends);
    }

    deleteFriend = async (req, res) => {
        const {userId} = req.params;  
        const {friendId} = req.query;
        const friends = await FriendsService.deleteFriend(userId, friendId);
        await FriendRequestService.cancelFriendRequest(`${userId}-${friendId}`, this.io, this.users);
        await FriendRequestService.cancelFriendRequest(`${friendId}-${userId}`, this.io, this.users);
        res.json(friends);
    }
}

module.exports = FriendController