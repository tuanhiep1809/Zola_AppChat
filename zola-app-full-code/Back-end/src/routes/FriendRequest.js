const router = require("express").Router();
const FriendRequestController = require("../controllers/FriendRequestController");

const FriendRequestRouter = (io, users) => {
    const friendRequestController = new FriendRequestController(io, users);
    router.post("/send", friendRequestController.sendFriendRequest);
    router.post("/accept", friendRequestController.acceptFriendRequest);
    router.post("/decline", friendRequestController.declineFriendRequest);
    router.post("/cancel", friendRequestController.cancelFriendRequest);
    router.get("/sent/:userId", friendRequestController.getSentFriendRequests);
    router.get("/received/:userId", friendRequestController.getReceivedFriendRequests);
    router.get("/state", friendRequestController.getStateOfTwoUsers);
    return router; 
}
module.exports = FriendRequestRouter;