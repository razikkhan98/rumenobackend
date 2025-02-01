// Forgot password
// Post /rumeno/forgotpassword

const expressAsyncHandler = require("express-async-handler");
const registerModel = require("../../model/user/registerModel");

exports.forgotPassword = expressAsyncHandler(async (req, res) => {
// Validate request body
if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    // Validate mobile number
    if (!req.body.mobile) {
      return res.status(400).json({ message: "Please enter your mobile number" });
    }

    // Check if mobile exists
    const user = await registerModel.findOne({ mobile: req.body.mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
    
  }
    

});
