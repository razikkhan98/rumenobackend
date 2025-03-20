// routes/ussersRoutes.js

const express = require("express");
const router = express.Router();

// Token for routes
const { validateToken } = require("../../middlewares/validateTokenHandler");

// Controllers
const loginController = require("../../controller/user/loginContoller");
const registerController = require("../../controller/user/registerController");
const forgotController = require("../../controller/user/forgotController");
const addToCartController = require("../../controller/user/addToCartController");
const feedbackController = require("../../controller/user/feedbackController");
const contactController = require("../../controller/user/contactController");
const serviceFromController = require("../../controller/user/serviceFromController");
const blogController = require("../../controller/user/blogController");
const framDetailController = require("../../controller/user/framDetailController");
const reviewController = require("../../controller/user/reviewController");
const transactionController = require("../../controller/user/transactionController");
const transactionIssueController = require("../../controller/user/transactionIssueController");

// ========
// Routes
// ========

// register
router.post("/user/register", registerController.userRegister);

// login
router.post("/user/login", loginController.userLogin);

// Google Login
router.post("/user/googlelogin", loginController.googleLogin);

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


// Review 
router.post("/user/review", reviewController.userReview);

// Get Review
router.get("/user/getReview", reviewController.getReview);


// Transaction
router.post("/user/transaction", transactionController.userTransaction);

// get Transaction
router.get("/user/getTransaction", transactionController.getTransaction);

// get Single Transaction
router.get("/user/getSingleTransaction/:uid", transactionController.getSingleTransaction);

// Transaction Issue
router.post("/user/transactionIssue", transactionIssueController.userTransactionIssue);

// // Farm Detail
// router.post("/user/farmdetail", validateToken, framDetailController.farmDetail);


// ========
// Add to Cart
// ========

// // add to cart
// router.post("/addtocart", validateToken, addToCartController.addToCart);

// // get cart items
// router.get("/getcartitems", validateToken, addToCartController.getCartItems);

// // update cart item
// router.put("/updatecartitem/:itemId", addToCartController.updateCartItem);

// // remove item from cart
// router.delete("/removefromcart/:itemId", addToCartController.deleteCartItem);




//  Parent Routes
// router.post("/user/parent/from", validateToken, parentfromController.animalFarmData);




module.exports = router;
