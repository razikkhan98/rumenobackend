// // Register Controller
const expressAsyncHandler = require("express-async-handler");
const registerModel = require("../../model/user/registerModel");
const bcrypt = require("bcrypt");

exports.userRegister = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const { firstName, lastName, email, password, mobile } = req.body;

    // Validate required fields
    if (!firstName || !email || !password || !mobile) {
      return res.status(400).json({ message: "Please fill in all fields" });
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

    // Check if user with email or mobile already exists
    const existingUser = await registerModel.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? "User with this email already exists"
          : "Mobile number already exists",
      });
    }

    // Generate UID: First 3 letters of firstName + last 4 digits of mobile
    const code = firstName.substring(0, 3).toUpperCase() + mobile.slice(-4);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new registerModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
      uid: code,
    });

    // Save user to the database
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in user registration:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

