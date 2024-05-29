const GroupController = require("../controllers/GroupController");
const router = require("express").Router();

const GroupRouter = (io, users) => {

    const groupController = new GroupController(io, users);
    router.post("/", groupController.newGroup); 
    router.delete("/dissolution/:groupId", groupController.dissolutionGroup); 
    router.patch("/updateInfo/:groupId", groupController.updateInfoGroup); 
    router.get("/getMembers/:groupId", groupController.getMembers); 
    router.post("/addMember/:groupId", groupController.addMember); 
    router.patch("/transferAdmin/:groupId", groupController.transferAdmin); 
    router.patch("/addDeputy/:groupId", groupController.addDeputy); 
    router.patch("/outGroup/:groupId", groupController.outGroup);
    router.delete("/removeMember/:groupId", groupController.removeMember);
    router.get("/:groupId", groupController.getGroup);
    return router;
}


module.exports = GroupRouter;