const User = require("../models/User");
const S3Service = require("./S3Service");
const redisDb = require("../services/RedisService");

class UserService {
    async getUsers() {
        try {
            const users = await User.find();
            return users;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findById(id);
            return user;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async getShortInfoUser(id) {
        try {
            // return just name, avatar and _id, handle in mongodb
            let user = await redisDb.get("user:" + id);
            if (user) return user;
            else {
                user = await User.findById(id, {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    number: 1,
                });
                await redisDb.set("user:" + id, user);
            }
            if(user?._doc)
                user = user._doc
            return user;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async getUserByNumber(number) {
        try {
            const user = await User.findOne({ number });
            return user;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async updateUser(id, user) {
        try {
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { $set: user },
                { new: true }
            );

            //redis
            await redisDb.set("user:" + id, {
                _id: updatedUser._id,
                name:updatedUser.name,
                avatar:updatedUser.avatar,
                number:updatedUser.number,
            });
            return updatedUser;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async updateAvatar(userId, file) {
        try {
            const linkFile = await S3Service.uploadFile(file);
            const user = await this.updateUser(userId, { avatar: linkFile });
            return user;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

}

module.exports = new UserService();
