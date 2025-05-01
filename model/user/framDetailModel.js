const mongoose = require("mongoose");

const framDetailSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    farmerName: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    farmHouseName: {
        type: String,
        required: true,
    },
    farmHouseType: {
        type: String,
        required: true,
    },
    farmAddress: {
        type: String,
        required: true,
    },
    animalsNumber: {
        type: Number,
        required: true,
    },
    });

module.exports = mongoose.model("FramDetail", framDetailSchema);