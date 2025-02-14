/// Routes admin
const express = require("express");
const router = express.Router();

// Token for routes
const { validateToken } = require("../../middlewares/validateTokenHandler");

// Contoller
const adminLoginController = require("../../controller/admin/adminLoginContoller");
const adminBlogController = require("../../controller/admin/adminBlogController");
const adminProductController = require("../../controller/admin/adminProductController");
const adminDashboardController = require("../../controller/admin/adminDashboardController");

//Admin Login
router.post("/admin/login", adminLoginController.loginAdmin);



// Admin Blog
router.post("/admin/blog", adminBlogController. adminBlog);

// Get Admin Blog
router.get("/admin/getAllBlog", adminBlogController. getAdminBlog);

//Get Blog by Id
router.get("/admin/getBlog/:id", adminBlogController.getBlogById);

// Update Blog
router.put("/admin/updateBlog", adminBlogController.updateBlog);

// Delete Blog
router.delete("/admin/deleteBlog/:id", adminBlogController.deleteBlog);



// Admin Product
router.post("/admin/createProduct", adminProductController.createProduct);

//Get All Product
router.get("/admin/getAllProduct", adminProductController.getAllProduct);

//Get Product By Id
router.get("/admin/getProduct/:id", adminProductController.getProductById);

// Update Product
router.put("/admin/updateProduct", adminProductController.updateProduct);


//Delete Product
router.delete("/admin/deleteProduct/:id", adminProductController.deleteProduct);



// Admin Dashboard
router.get("/admin/dashboard", adminDashboardController.getDashboardDetails)


module.exports = router;
