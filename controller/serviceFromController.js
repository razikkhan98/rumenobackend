//  servic Pages Data

const expressAsyncHandler = require("express-async-handler");
const serviceFormModel  = require("../model/serviceFormModel");

exports.service = expressAsyncHandler(async (req, res) => {
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        const { name, address, bestTime,experience,budget,landSize,category,other,need } = req.body;
    
        // Validate required fields
        if (!name || !address || !bestTime || !experience || !budget || !landSize || !need) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
    
        // Save user to the database
        await serviceFormModel.save();
        res.status(201).json({ message: "Form submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});