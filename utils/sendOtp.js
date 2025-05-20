 //utils/sendOtp

const axios = require("axios");

const sendOTPviaBhashSMS = async (mobile, otp) => {
  try {
    // Prepare API params
    const user = "Rumeno";       // your API username
    const pass = "123456";       // your API password
    const sender = "BUZWAP";     // sender ID
    const phone = mobile;        // recipient phone
    const text = `rumeno_otp2`;  // message text including OTP
    const priority = "wa";
    const stype = "auth";
    const Params = otp;          

    const url = `https://bhashsms.com/api/sendmsg.php?user=${user}&pass=${pass}&sender=${sender}&phone=${phone}&text=${text}&priority=${priority}&stype=${stype}&Params=${Params}`;
    console.log("url:", url)
   
    const response = await axios.get(url,  { timeout: 10000 });

    console.log("BhashSMS response:", response.data);
  } catch (error) {
    console.error("Error sending OTP via BhashSMS:", error);
    throw error; 
  }
};

module.exports = { sendOTPviaBhashSMS };
