const mongoose = require("mongoose");

const EstrusHeatSchema = new mongoose.Schema({
  heatId: {
    type: String,
    required: true
  },
  heat: {
    type: String,
    default: null
  },
  heatDate: {
    type: Date,
  },
  heatResult: {
    type: String,
    default: null
  },
  breederName: {
    type: String,
    default: null
  },
  breedDate: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
});

module.exports = mongoose.model("Heat", EstrusHeatSchema);
