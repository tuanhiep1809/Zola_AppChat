const AuthService = require("../services/AuthService");

class AuthController {
    async register(req, res) {
        try {
            // if(req.userCredential.uid === req.body._id) { 
                const savedUser = await AuthService.register(req.body); 
                res.status(200).json(savedUser);
            // } else {
            //     res.status(403).send("Forbidden");
            // }
        } catch (err) {
            res.status(500).json(err);
        }
    }
}

module.exports = new AuthController();
