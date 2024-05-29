const User = require("../models/User");
const Conversation = require("../models/Conversation");
class CheckService {
    async CheckNumberExists(number) {
        try {
            const user = await User.findOne({ number });
            return user;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async checkMemberExists(groupId, userId){
        try {
            const group = await Conversation.findById(groupId);
            if (!group) return null;
            return group.members.some((item) => item._id === userId);
        } catch (err) {
            console.log(err);
            return err;
        }
    }
}

module.exports = new CheckService();