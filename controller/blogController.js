//  Blog From
// POST /user/blog

const expressAsyncHandler = require("express-async-handler");
const blogModel = require("../model/blogModal");

exports.blogComment = expressAsyncHandler(async (req, res) => {
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        const {blog_id, name, email, comment } = req.body;
    
        // Validate required fields
        if (!blog_id || !name || !email || !comment) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Save user to the database
        await blogModel.save();
        res.status(201).json({ message: "From added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});