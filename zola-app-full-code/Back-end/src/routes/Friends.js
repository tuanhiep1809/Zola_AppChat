const router = require("express").Router();
const FriendsController = require("../controllers/FriendsController");


const FriendsRouter = (io, users) => {
    const friendsController = new FriendsController(io, users);
    router.get("/:userId", friendsController.getFriends);
    router.patch("/update-phonebook/:userId", friendsController.updatePhoneBook);
    router.delete("/delete/:userId", friendsController.deleteFriend);
    router.get("/phoneBook/:userId", friendsController.getPhoneBook);
    return router; 
}


module.exports = FriendsRouter;