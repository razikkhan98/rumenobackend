// // Forgot password
// // Post /rumeno/forgotpassword

// const expressAsyncHandler = require("express-async-handler");
// const registerModel = require("../../model/user/registerModel");

// exports.forgotPassword = expressAsyncHandler(async (req, res) => {
// // Validate request body
// if (!req.body) {
//     return res.status(400).json({ message: "No data provided" });
//   }

//   try {
//     // Validate mobile number
//     if (!req.body.mobile) {
//       return res.status(400).json({ message: "Please enter your mobile number" });
//     }
//     // Check if mobile exists
//     const user = await registerModel.findOne({ mobile: req.body.mobile });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     console.log(user)

//   } catch (error) {
//     res.status(500).json({ message:"Server error" , error:error.message });

//   }


// });




  //----forget Password------//

  const expressAsyncHandler = require("express-async-handler");
const registerModel = require("../../model/user/registerModel");
const { sendOTPviaBhashSMS } = require("../../utils/sendOtp")
const OTP = require("../../model/user/otpModel");
const generateOTP = require("../../utils/generateOtp")
const bcrypt = require("bcryptjs");

exports.forgotPassword = expressAsyncHandler(async (req, res) => {
  try {
    const { mobile } = req.body;

    const user = await registerModel.findOne({ mobile });
    if (!user) {
      return res.json({ message: "User not found" });
    }

    const otp = generateOTP();
    console.log("Generate otp", otp)

    // Delete old OTPs for the user
    await OTP.deleteMany({ mobile });

      // Save new OTP in DB
    await OTP.create({ mobile, otp });

    await sendOTPviaBhashSMS(mobile, otp);

    res.status(200).json({ message: "OTP sent WhatsApp successfully." });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
});


//----Reset Password------//


exports.resetPassword = expressAsyncHandler(async (req, res) => {
  const { mobile, otp, newPassword, confirmPassword } = req.body;

  // 1. Check all fields
  if (!mobile || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 2. Match passwords
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // 3. Check OTP
  const otpRecord = await OTP.findOne({ mobile, otp });
  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // 4. Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 5. Update password
  const user = await registerModel.findOneAndUpdate(
    { mobile },
    { password: hashedPassword },
    { new: true }
  );
console.log(user)
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 6. Remove OTP
  // await OTP.deleteOne({ _id: otpRecord._id });

  return res.status(200).json({ message: "Password updated successfully" });
});



