const mongoose = require("mongoose");

const MilkSchema = new mongoose.Schema({
  milkId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: null,
  },
  milkKid: {
    type: String,
    default: null,
  },
  milkVolume: {
    type: String,
    default: null,
  },
  milkDate: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Milk", MilkSchema);
