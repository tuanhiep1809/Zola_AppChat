const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')

const S3 = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
})

module.exports = {S3, PutObjectCommand}