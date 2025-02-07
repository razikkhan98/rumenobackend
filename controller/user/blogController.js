//  Blog From
// POST /user/blog

const expressAsyncHandler = require("express-async-handler");
const blogModel = require("../../model/user/blogModal");

exports.blogComment = expressAsyncHandler(async (req, res) => {
    
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }

    try {
        const { blogId, name, email, comment } = req.body;

        // Validate required fields
        if (!blogId || !name || !email || !comment) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        
        // New user
        const newBlog = new blogModel({
            blogId,
            name,
            email,
            comment
        })

        // Save user to the database
        await newBlog.save();
        res.status(201).json({ message: "Blog added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});