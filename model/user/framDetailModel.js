const mongoose = require("mongoose");

const framDetailSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    framName: {
        type: String,
        required: true,
    },
    framNumber: {
        type: Number,
        required: true,
    },
    framHouse: {
        type: String,
        required: true,
    },
    framType: {
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