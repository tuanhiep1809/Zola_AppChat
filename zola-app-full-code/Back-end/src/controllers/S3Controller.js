
const S3Service = require("../services/S3Service");
class S3Controller {

    async uploadS3(req, res) {
        try {
            const url = await S3Service.uploadFile(req.file);
            res.status(200).json({url});
        } catch (err) {
            res.status(500).json(err);
        }
    }
}

module.exports = new S3Controller();