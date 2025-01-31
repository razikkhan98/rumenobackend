const expressAsyncHandler = require("express-async-handler");
const registerModel = require("../model/registerModel");
const bcrypt = require('bcryptjs');


exports.verifyOtp = expressAsyncHandler(async (req, res) => {
  const { newotp } = req.body;

  // Validation
  if (!newotp) {
    return res.status(400).json({ message: "OTP required" });
  }
  try {

    // Check OTP in database
    const user = await registerModel.findOne({ otp: newotp });

    if (!user) {
      return res.status(400).json({ message: "User not found" })
    }
    console.log(user)

    //Check user opt same or not 
    if (user.otp !== newotp) {
      return res.status(400).json({ message: "OTP does not match" })
    }

    res.status(200).json({ message: "OTP verified successfully." });

  } catch (error) {
    console.error("Error verify OTP ", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }

});



// Reset Password

exports.resetPassword = expressAsyncHandler(async (req, res) => {
  const { mobile, newPassword } = req.body;

  //Validation
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" })
  }
  console.log(newPassword)
  try {

    // Check Mobile number in database
    const user = await registerModel.findOne({ mobile });
    if (!mobile) {
      return res.status(400).json({ message: "mobile does not found" })
    }

   // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // save in database 
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }

});