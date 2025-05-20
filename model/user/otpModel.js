const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    ref: "register"
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // 1 hour
  }
});

module.exports = mongoose.model("OTP", otpSchema);
