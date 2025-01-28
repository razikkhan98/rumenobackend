// routes/ussersRoutes.js

const express = require("express");
const router = express.Router();
const loginController = require("../controller/loginContoller");
// const registerController = require("../controller/registerController");

//registration 
// router.post("/register", registerController.userRegister);

//routes
router.post("/login", loginController.userLogin);

module.exports = router;