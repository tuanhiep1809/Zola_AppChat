const User = require("../models/User");
const UserConversationService = require("./UserConversationService");
const FriendsService = require("./FriendsService");
class AuthService {
    async register(user) {
        const newUser = await new User(user);
        const saveUser = await newUser.save();
        await UserConversationService.create(saveUser._id); 
        await FriendsService.create(saveUser._id);
        return  saveUser;
    }
}

module.exports = new AuthService(); 