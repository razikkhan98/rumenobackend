const asyncHandler = require("express-async-handler");
const adminBlogModel = require("../../model/admin/adminBlogModel");

exports.adminBlog = asyncHandler(async (req, res) => {
  try {
    const {
      uid,
      content,
      keywords,
      image,
      heading,
      description,
      metadescription,
      script
    } = req.body;

    if (
      !uid ||
      !content ||
      !keywords ||
      !image ||
      !heading ||
      !description ||
      !metadescription ||
      !script
    ) {
      return res
        .status(404)
        .json({ success: false, message: "All fields are required" });
    }

    const blog = await adminBlogModel.create(req?.body);

    if (!blog) {
      return res.status(400).json({ message: "Blog not created" });
    }
    console.log(blog)
    res.status(200).json({
      success: true,
      message: "Blog created successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Admin Blog
exports.getAdminBlog = asyncHandler(async (req, res) => {
  try {
    const userBlog = await adminBlogModel.find();
    res.status(200).json(userBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get Blog By Id
exports.getBlogById = asyncHandler(async (req, res, next) => {
  try {
    const blog = await adminBlogModel.findById(req?.params?.id);
    if (!blog) res.status(404).json("Blog not found!");

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Update Blog
exports.updateBlog = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { uid, content, keywords, image, heading, description, metadescription, script } = req.body;
    // Validate required fields
    if (!uid || !content || !keywords || !image || !heading)
      return res.status(400).json({ message: "Please fill in all fields" });

    // Check if item exists in cart
    const existingBlog = await adminBlogModel.findOne({ uid });
    if (!existingBlog) {
      return res.status(400).json({ message: "Blog does not exist" });
    }
    console.log(existingBlog);

    // Update item in cart
    await adminBlogModel.updateMany({ uid, content, keywords, image, heading, description, metadescription, script });
    res.status(200).json({ message: "Blog updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Delete Blog
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  try {
    const blog = await adminBlogModel.findByIdAndDelete(req?.params?.id);
    if (!blog) res.status(404).json("Blog not found!");

    res.status(200).json({
      success: true,
      message: "Blog delete successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

