const asyncHandler = require("express-async-handler");
const loginModel = require("../model/loginModel");;
// const jwt = require("jsonwebtoken");

exports.userLogin =asyncHandler(async(req ,res)=> {
 const { 
    email, 
    mobileNumber,       
    password
 } = req.body;

 // Check if email and password are provided
 if (!email && !mobileNumber && !password ) {
   return res
     .status(400)
     .json({ message: "Please provide either email , mobile number and password" });
 }

 // Check if user exists  by email or phone
 const existEmail = await loginModel.findOne({email});
if(!existEmail){
  return res.status(400).json({message: "Email does not exist"})
}
//check phone number exist or not
const existNumber = await registerModel.findOne({mobileNumber});
if(existNumber){
    return res.status(400).json({message: "Phone number already exist"})
}


// // Generate and send JWT token
// const token = jwt.sign(
//     { user: { email: user.email } },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" }
//   );

  // If the user is found, login is successful
  res.status(200).json({
    success: true,
    message: "Login successful.",
    // accessToken: token,
  });

});


