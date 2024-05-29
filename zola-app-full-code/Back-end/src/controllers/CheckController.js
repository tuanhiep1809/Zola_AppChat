const CheckService = require("../services/CheckService");

class CheckServiceController {
    async CheckNumberExists(req, res) {
        try {
            const user = await CheckService.CheckNumberExists(req.params.number);
            return res.json({ 
                numberExists: !!user?._id, 
                userId: user?._id
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    }
}

module.exports = new CheckServiceController();