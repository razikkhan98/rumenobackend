// Register Controller
// Post /rumeno/register

const expressAsyncHandler = require("express-async-handler");
const registerModel = require("../model/registerModel");
const bcrypt = require("bcrypt");

// Register a new user
exports.userRegister = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      mobile,
      address,
      city,
      state,
      country,
    } = req.body;

    // Validate required fields
    if (!firstName || !email || !password || !mobile || !address) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    // Check if user exists
    const existingUser = await registerModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // check if mobile number exists
    const existingMobile = await registerModel.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    // Validate password format
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    // Validate address format
    const addressRegex = /^[a-zA-Z0-9\s,'-]*$/;
    if (!addressRegex.test(address)) {
      return res.status(400).json({ message: "Invalid address format" });
    }
    // Generate code based on , firstName(2) , mobile last 4 digit of mobile number
    const code = firstName.slice(0, 2) + mobile.slice(-4);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new registerModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
      address,
      city,
      state,
      country,
      uid: code,
    });

    
    // Save user to the database
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
