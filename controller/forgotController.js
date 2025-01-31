// Forgot password

const expressAsyncHandler = require("express-async-handler");
const registerModel = require("../model/registerModel");
const twilio = require("twilio");

// Destructure environment variables
const {
    TWILIO_SERVICE_SID,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN
} = process.env;

//  Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// OTP Generation Function
const generateOtp = () => {
    let otp = '122330';
    // for (let i = 0; i < 6; i++) {
    //     otp += Math.floor(Math.random() * 10); // 6-digit OTP
    // }
    return otp;
};

//  Send OTP SMS using Twilio
const sendOtp = async (mobile, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP code is: ${otp}`,
            from: "7970543210",   //twilio
            to: mobile,   //user number
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error sending OTP');
    }
};


//   forgot  password

exports.forgotPassword = expressAsyncHandler(async (req, res) => {

    // Validation request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        
        // Validation mobile number
        if (!req.body.mobile) {
            return res.status(400).json({ message: "Please enter your mobile number" });
        }

        // Check if mobile exists
        const user = await registerModel.findOne({ mobile: req.body.mobile });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate otp
        const otp = generateOtp();
        console.log(otp)
        // const otpExpiration = new Date();
        // otpExpiration.setMinutes(otpExpiration.getMinutes() + 10); // OTP valid for 10 minutes

        // Store OTP the user 
        user.otp = otp;
        // user.otpExpiration = otpExpiration;

        await user.save();

        // Send otp
        await sendOtp(req.body.mobile, otp);
        return res.status(200).json({ message: 'OTP sent to your mobile number' });


    } catch (error) {
        console.log("Error send OTP", error)
        res.status(500).json({ message: "Server error", error: error.message });
    }

});

