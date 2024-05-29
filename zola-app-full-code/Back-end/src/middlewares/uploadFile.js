const util = require("util");
const multer = require("multer");
const FILE_SIZE = 20 * 1024 * 1024;

// let storage = multer.diskStorage({
//     filename: (req, file, cb) => {
//         let filename = `${Date.now()}-zola-${file.originalname}`;
//         cb(null, filename);
//     },
// });

let storage = multer.memoryStorage(); 
let uploadManyFiles = multer({
    storage,
    limits: { fileSize: FILE_SIZE },
}).array("files", 10);

let uploadFile = multer({ 
    storage, 
    limits: { fileSize: FILE_SIZE } 
}).single("file");

let multipleUploadMiddleware = util.promisify(uploadManyFiles);
let singleUploadMiddleware = util.promisify(uploadFile);

module.exports = {
    multipleUploadMiddleware,
    singleUploadMiddleware,
};
