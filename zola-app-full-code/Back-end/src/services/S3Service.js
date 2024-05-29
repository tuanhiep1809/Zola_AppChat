const {S3, PutObjectCommand} = require('../configs/S3Config')
const fs = require('fs');

const S3Service = {
    uploadFile: async (file) => {
        try {
            // const fileStream = fs.readFileSync(file.path);
            const Key = `zola-${Date.now()}-${file.originalname}`
            const command = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key,
                Body: file.buffer,
                ContentType: file.mimetype
            })
            await S3.send(command)
            const fileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${Key}`
            // const fileUrl = `https://${process.env.CLOUDFRONT_KEY}.cloudfront.net/${Key}`;
            return fileUrl
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = S3Service;