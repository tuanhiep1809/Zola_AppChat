const CheckServiceController = require("../controllers/CheckController");
const router = require("express").Router();

router.get("/number/:number", CheckServiceController.CheckNumberExists);

module.exports = router;