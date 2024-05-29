const UserService = require("../services/UserService");

class UserController { 
    async getUsers(req, res) {
        try { 
            const users = await UserService.getUsers();
            res.status(200).json(users);
        } catch (err) {
            console.log(err)
            return err;
        }
    } 

    async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            res.status(200).json(user);
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async getShortInfoUser(req, res) { 
        try {
            const user = await UserService.getShortInfoUser(req.params.id);
            res.status(200).json(user);
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async getUserByNumber(req, res) {
        try {
            const user = await UserService.getUserByNumber(req.params.number);
            res.status(200).json(user);
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async updateUser(req, res) {
        try {
            const updatedUser = await UserService.updateUser(req.params.id, req.body);
            res.status(200).json(updatedUser);
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async updateAvatar(req, res) {
        try {
            const updatedUser = await UserService.updateAvatar(req.params.id, req.file);
            res.status(200).json(updatedUser);
        } catch (err) {
            res.status(400).json(err);
        }
    }

    async updateAvatarWithBase64(req, res) { 
        const { _id } = req.params.id;
        try {
            const avatar = await UserService.updateAvatarWithBase64(
                _id,
                req.body
            );
            return res.json({ avatar });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController()