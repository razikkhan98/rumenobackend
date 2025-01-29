const asyncHandler = require("express-async-handler");
const registerModel = require("../model/registerModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.userLogin = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { mobile, password } = req.body;

    // Validate required fields
    if (!mobile || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if user exists
    const user = await registerModel.findOne({ mobile });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret_key", {
      expiresIn: "1d",
    });

    // Return response
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.firstName,
        uID: user.uid,
      },
      date: new Date().toISOString(), // Current timestamp
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
});
