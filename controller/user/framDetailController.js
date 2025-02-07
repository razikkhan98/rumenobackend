// Fram Deatil Controller
//  POST /rumeno/framDetail

const expressAsyncHandler = require("express-async-handler");

const framDetailModel = require("../../model/user/framDetailModel");

exports.farmDetail = expressAsyncHandler(async (req, res) => {
    
    // Validate request body
    if (!req.body) {
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        const {uid, framName, framNumber, framHouse,framType , framAddress, animalsNumber } = req.body;
        // Validate required fields
        if (!uid || !framName || !framNumber || !framHouse || !framType || !framAddress || !animalsNumber) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        console.log(req.body);

        //New user
        const newFarm = new framDetailModel({
          uid,
          framName,
          framNumber,
          framHouse,
          framType,
          framAddress,
          animalsNumber  
        })
    
        // Save user to the database
        await newFarm.save();
        res.status(201).json({ message: "Fram Detail added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});