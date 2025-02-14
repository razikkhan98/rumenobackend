const mongoose = require("mongoose");

const adminProductSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    priceText: {
        type: String,
        default: null

    },
    img: {
        type: Array,
        default: []
    },
    metaDescription: {
        type: String,
        default: null
    },
    veg: {
        type: String,
        default: null
    },
    offer: {
        type: String,
        default: null
    },
    delivery: {
        type: String,
        default: null
    },
    refundable: {
        type: String,
        default: null
    },
    weight: {
        type: String,
        default: null
    },
    shortDescription: {
        type: String,
        default: null
    },
    instruction: {
        type: String,
        default: null
    },
    category: {
        type: Array,
        default: []
    },
    type: {
        type: String,
        default: null
    },
    imgText: {
        type: String,
        default: null
    },
    script: {
        type: Array,
        default: null
    },
    video: {
        type: String,
        default: null
    },
    stock: {
        type: Number,
        default: null
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("AdminProduct", adminProductSchema);

