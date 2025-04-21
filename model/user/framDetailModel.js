const mongoose = require("mongoose");

const framDetailSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    framerName: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    framHouseName: {
        type: String,
        required: true,
    },
    framHouseType: {
        type: String,
        required: true,
    },
    framAddress: {
        type: String,
        required: true,
    },
    animalsNumber: {
        type: Number,
        required: true,
    },
    });

module.exports = mongoose.model("FramDetail", framDetailSchema);