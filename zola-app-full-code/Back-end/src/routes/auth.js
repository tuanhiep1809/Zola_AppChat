const admin = require("firebase-admin");
const router = require("express").Router();
const AuthController = require("../controllers/AuthController");

router.post("/register", AuthController.register); 
module.exports = router;
