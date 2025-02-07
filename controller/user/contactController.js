// Contact Us 
// POST /rumeno/contactus


const expressAsyncHandler = require("express-async-handler");
const contactModel = require("../../model/user/contactModal");

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

        // new contact
        const newContact = new contactModel({
            name,
            email,
            message
        })

        // Save user to the database
        await newContact.save();
        res.status(201).json({ message: "Contact added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});