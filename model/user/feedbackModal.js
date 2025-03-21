const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    productId: {
        type: Number,
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Feedback", feedbackSchema);