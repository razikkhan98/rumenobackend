//  servic Pages Data

const expressAsyncHandler = require("express-async-handler");
const serviceFormModel  = require("../../model/user/serviceFormModel");

exports.service = expressAsyncHandler(async (req, res) => {
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        const { name,phone, address, bestTime,experience,budget,landSize,category,other,need } = req.body;
    
        // Validate required fields
        if (!name || !address || !bestTime || !experience || !budget || !landSize || !need) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
    
        //new use
        const newService = new serviceFormModel({
            name,
            phone,
            address,
           bestTime,
           experience,
           budget,
           landSize,
           category,
           other,
           need 
        })
console.log(newService)
        // Save user to the database
        await newService.save();
        res.status(201).json({ message: "Form submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});