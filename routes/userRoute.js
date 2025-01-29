// routes/ussersRoutes.js

const express = require("express");
const router = express.Router();

// Token for routes
const { validateToken } = require("../middlewares/validateTokenHandler");

// Controllers
const loginController = require("../controller/loginContoller");
const registerController = require("../controller/registerController");
const forgotController = require("../controller/forgotController");
const addToCartController = require("../controller/addToCartController");
const feedbackController = require("../controller/feedbackController");


// ========
// Routes
// ========

// register
router.post("/register", validateToken, registerController.userRegister);

// login
router.post("/login", loginController.userLogin);

// forgot Password
router.post("/forgotpassword", forgotController.forgotPassword);

// Feedback
router.post("/feedback", feedbackController.feedback);

// ========
// Add to Cart
// ========

// add to cart
router.post("/addtocart", validateToken, addToCartController.addToCart);

// get cart items
router.get("/getcartitems", validateToken, addToCartController.getCartItems);

// remove item from cart

// router.delete("/removefromcart/:itemId", addToCartController.removeFromCart);

module.exports = router;
