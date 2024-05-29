const FriendRequest = require("../models/FriendRequest");
const ChatService = require("../services/ChatService");
const FriendsService = require("./FriendsService");
const UserService = require("./UserService");
const { io, users } = require("../app/socket");

class FriendRequestService {
    async cancelFriendRequest(friendRequestId, io, users) {
        try {
            const friendRequest = await FriendRequest.findByIdAndDelete(friendRequestId);
            const receiverUserId = friendRequestId.split("-")[1];

            if(friendRequest && users.get(receiverUserId) instanceof Set) {
                users.get(receiverUserId).forEach((socketId) => {
                    io.to(socketId).emit("cancelFriendRequest", {
                        _id: friendRequest._id, 
                    });
                })
            }
            return friendRequest;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async sendFriendRequest(senderUserId, receiverUserId, io, users) {
        try {
            const content = {text: "Hello, I want to be your friend!"};
            const type = 'notify'; 
            //socket here
            await ChatService.sendFirstChat(
                senderUserId,
                receiverUserId,
                content, 
                type
                , io, users
            );
            const friendRequest = new FriendRequest({
                _id: `${senderUserId}-${receiverUserId}`,
                senderUserId,
                receiverUserId,
                state: "pending",
            });
            await this.cancelFriendRequest(`${receiverUserId}-${senderUserId}`, io, users);
            await friendRequest.save();
            // send first chat

            // socket 
            const senderInfo = await UserService.getShortInfoUser(senderUserId);
            if(users.get(receiverUserId) instanceof Set) {
                users.get(receiverUserId).forEach((socketId) => {
                    io.to(socketId).emit("receiveFriendRequest", {
                        _id: friendRequest._id, 
                        userId: senderInfo._id, 
                        name : senderInfo.name,
                        avatar: senderInfo.avatar,
                        createdAt: friendRequest.createdAt
                    });
                })
            }

            return friendRequest;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async acceptFriendRequest(friendRequestId, io, users) {
        try {
            const content = {text: "You are friends now! Let's chat!" };
            const type = 'notify'
            const friendRequest = await FriendRequest.findByIdAndUpdate(
                friendRequestId,
                { $set: { state: "accepted" } },
                { new: true }
            );
            // add friend
            const senderUserId = friendRequest.senderUserId;
            const receiverUserId = friendRequest.receiverUserId;

            this.cancelFriendRequest(`${receiverUserId}-${senderUserId}`);

            //socket to senderUser 
            const receiverInfo = await UserService.getShortInfoUser(receiverUserId);
            if(users.get(senderUserId) instanceof Set) {
                users.get(senderUserId).forEach((socketId) => {
                    io.to(socketId).emit("acceptFriendRequest", {
                        _id: friendRequest._id, 
                        userId: receiverInfo._id, 
                        name : receiverInfo.name,
                        avatar: receiverInfo.avatar,
                        createdAt: friendRequest.createdAt
                    });
                })
            }

            await FriendsService.addFriend(senderUserId, receiverUserId);
            await ChatService.sendFirstChat(
                senderUserId,
                receiverUserId,
                content, 
                type,
                io, users
            );
            return friendRequest;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async declineFriendRequest(friendRequestId) {
        try {
            const friendRequest = await FriendRequest.findByIdAndUpdate(
                friendRequestId,
                { $set: { state: "declined" } },
                { new: true }
            );
            return friendRequest;
        } catch (err) {
            console.log(err)
            return err;
        }
    }
    
    // lấy danh sách lời mời đã gửi;
    async getSentFriendRequests(senderUserId) {
        try {
            const friendRequests = await FriendRequest.find({ senderUserId });
            const userReceivers = [];
            await Promise.all(
                friendRequests.map(async (request) => {
                    const user = await UserService.getShortInfoUser(
                        request.receiverUserId
                    );
                    const result = {
                        ...request._doc,
                        avatar: user.avatar,
                        name: user.name,
                    };
                    if (result.state !== "accepted") userReceivers.push(result);
                })
            );
            return userReceivers;
        } catch (err) {
            console.log(err)
            return err;
        }
    }
    // lấy danh sách lời mời đã nhận;
    async getReceivedFriendRequests(receiverUserId) {
        try {
            const friendRequests = await FriendRequest.find({ receiverUserId });
            const userSents = [];
            await Promise.all(
                friendRequests.map(async (request) => {
                    const user = await UserService.getShortInfoUser(
                        request.senderUserId
                    );
                    const result = {
                        ...request._doc,
                        avatar: user.avatar,
                        name: user.name,
                    };
                    if (result.state === "pending") userSents.push(result);
                })
            );
            return userSents;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async getStateOfTwoUsers(userId1, userId2) {
        // pending1: userId1 đã gửi lời mời cho userId2 => nếu 2 từ chối => declined1
        // pending2: userId2 đã gửi lời mời cho userId1 => nếu 1 từ chối => declined2
        // accepted: userId1 và userId2 đã là bạn
        // nofriend: userId1 và userId2 chưa là bạn
        const friendRequest1 = await FriendRequest.findOne({
            senderUserId: userId1,
            receiverUserId: userId2,
        });
        if (friendRequest1) {
            return friendRequest1.state === "accepted"
                ? "accepted"
                : friendRequest1.state + "1";
        }

        const friendRequest2 = await FriendRequest.findOne({
            senderUserId: userId2,
            receiverUserId: userId1,
        });
        if (friendRequest2) {
            return friendRequest2.state === "accepted"
                ? "accepted"
                : friendRequest2.state + "2";
        }
        return "nofriend";
    }
}

module.exports = new FriendRequestService();
