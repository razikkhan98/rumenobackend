const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  bestTime: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  landSize: {
    type: Number,   
    required: true,
  },
  category: {
    type: String,
    default: null
  },
  other: {
    type: String,
    default: null
  },
  need: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ServiceForm", UserSchema);
