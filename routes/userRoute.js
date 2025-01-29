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
const contactController = require("../controller/contactController");
const serviceFromController = require("../controller/serviceFromController");
const blogController = require("../controller/blogController");
const framDetailController = require("../controller/framDetailController");



// ========
// Routes
// ========

// register
router.post("/user/register", registerController.userRegister);

// login
router.post("/user/login", loginController.userLogin);

// forgot Password
router.post("/user/forgotpassword", forgotController.forgotPassword);

// Feedback
router.post("/user/feedback", validateToken,feedbackController.feedback);

// Contact us
router.post("/user/contactus", contactController.contactUs);

// Service Page
router.post("/user/service", serviceFromController.service);

// Blog Comment
router.post("/user/blog", validateToken, blogController.blogComment);

// Farm Detail
router.post("/user/farmdetail", validateToken, framDetailController.farmDetail);


// ========
// Add to Cart
// ========

// add to cart
router.post("/addtocart", validateToken, addToCartController.addToCart);

// get cart items
router.get("/getcartitems", validateToken, addToCartController.getCartItems);

// update cart item
router.put("/updatecartitem/:itemId", addToCartController.updateCartItem);

// remove item from cart
router.delete("/removefromcart/:itemId", addToCartController.deleteCartItem);


module.exports = router;
