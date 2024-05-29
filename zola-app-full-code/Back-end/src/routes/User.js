const router = require("express").Router();
const UserController = require("../controllers/UserController");
const { singleUploadMiddleware } = require("../middlewares/uploadFile");

router.get("/", UserController.getUsers); // get user conversations by userId
router.get("/:id", UserController.getUserById); // get user byId 
router.patch("/:id", UserController.updateUser);
router.get("/number/:number", UserController.getUserByNumber); // get user by number
router.patch("/:id/updateAvatar",singleUploadMiddleware, UserController.updateAvatar);
router.patch('/:id/avatar/base64', UserController.updateAvatarWithBase64);
router.get("/short-info/:id", UserController.getShortInfoUser);
module.exports = router;
