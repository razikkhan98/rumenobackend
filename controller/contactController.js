// Contact Us 
// POST /rumeno/contactus


const expressAsyncHandler = require("express-async-handler");
const contactModel = require("../model/contactModal");

exports.contactUs = expressAsyncHandler(async (req, res) => {
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        const { name, email, message } = req.body;
    
        // Validate required fields
        if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
        }
    
        // Save user to the database
        await contactModel.save();
        res.status(201).json({ message: "Feedback added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});