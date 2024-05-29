const Friends = require("../models/Friends");
const UserService = require("./UserService");
const redisDb = require("../services/RedisService")
class FriendsService {
    create = async (userId) => {
        try {
            const newFriends = new Friends({
                _id: userId,
                userId,
                friends: [],
                phoneBook: [],
            });
            const savedFriends = await newFriends.save();
            return savedFriends;
        } catch (err) {
            console.log(err)
            return err;
        }
    };

    getFriends = async (userId) => {
        try {
            let friends = await redisDb.lRange("friends:" + userId, 0, -1);
            if(!friends || friends?.length === 0) {
                const friendsAndPhoneBook = await Friends.findById(userId);
                friends = friendsAndPhoneBook.friends;
                console.log(friends); 
                for (let friend of friends) 
                    redisDb.lPush("friends:" + userId, friend);
            }
            let result = [];
            let UserInfo = new Map();
            for (let friend of friends) {
                let user = UserInfo.get(friend.userId);
                if (!user) {
                    user = await UserService.getShortInfoUser(friend.userId);
                    UserInfo.set(friend.userId, user);
                }
                result.push({
                    userId: user._id,
                    name: user.name,
                    avatar: user.avatar,
                    number: user.number,
                });
            }
            // check result is array or not
            if (!Array.isArray(result)) {
                return [result];
            }
            return result;
        } catch (err) {
            console.log(err)
            return err;
        }
    };

    getPhoneBook = async (userId) => {
        try {
            const friends = await Friends.findById(userId);
            const result = await Promise.all(
                friends.phoneBook.map(
                    async ({ userId, nameDanhBa, number }) => {
                        const user = await UserService.getShortInfoUser(userId);
                        return {
                            userId,
                            number,
                            name: user.name,
                            nameDanhBa,
                            avatar: user.avatar,
                        };
                    }
                )
            );
            if (!Array.isArray(result)) {
                return [result];
            }
            return result;
        } catch (err){
            console.log(err)
            return err;
        }
    };

    updatePhoneBook = async (userId, phoneBook) => {
        try {
            console.log("phoneBook: ");
            console.log(phoneBook);

            const friends = await Friends.findById(userId);
            // merge phoneBook with existing phoneBook, don't duplicate phone number
            phoneBook.forEach((phone) => {
                const isExist = friends.phoneBook.some(
                    (item) => item.number === phone.number
                );
                if (!isExist) friends.phoneBook.push(phone);
            });

            friends.save();
            return friends.phoneBook;
        } catch (err) {
            console.log(err)
            return err;
        }
    };
    addFriend = async (userId, friendId) => {
        try {
            redisDb.lPush("friends:" + userId, {
                userId: friendId
            });
            redisDb.lPush("friends:" + friendId, {
                userId: userId
            });

            const friends = await Friends.findById(userId);
            friends.friends.push({ userId: friendId });
            friends.save();

            const friends1 = await Friends.findById(friendId);
            friends1.friends.push({ userId: userId });
            friends1.save();

            return friends;
        } catch (err) {
            console.log(err)
            return err;
        }
    };

    deleteFriend = async (userId, friendId) => {
        try {
            const friends = await Friends.findById({ _id: userId });
            redisDb.lRem("friends:" + userId, 1, {
                userId: friendId
            })
            friends.friends = friends.friends.filter(
                (friend) => friend.userId !== friendId
            );
            friends.save();
            const friends1 = await Friends.findById({ _id: friendId });
            friends1.friends = friends1.friends.filter(
                (friend) => friend.userId !== userId
            );
            friends1.save();
            return friends;
        } catch (err) {
            console.log(err)
            return err;
        }
    };

    checkIsFriend = async (userId, friendId) => {
        try {
            const friends = await Friends.findById(userId);
            const isFriend = friends.friends.some(
                (friend) => friend.userId === friendId
            );
            return !!isFriend;
        } catch (err) {
            console.log(err)
            return err;
        }
    };
}

module.exports = new FriendsService();
