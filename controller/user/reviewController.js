const expressAsyncHandler = require("express-async-handler");
const reviewModel = require("../../model/user/reviewModel");

// Register a new user
exports.userReview = expressAsyncHandler(async (req, res) => {
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        const {
            uid,
            name,
            email,
            review,
            productid
        } = req.body;

        //Validation
        if (!uid || !name || !email || !review || !productid) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Check if user exists
        const existingUser = await reviewModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        //Cereate a new user review
        const newReview = new reviewModel({
            uid,
            name,
            email,
            review,
            productid
        });

        await newReview.save();
        res.status(201).json({ message: "Review add successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Review Api 
exports.getReview = expressAsyncHandler(async (req, res) => {
  try {
    const user = await reviewModel.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

