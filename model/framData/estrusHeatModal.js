const mongoose = require("mongoose");

const EstrusHeatSchema = new mongoose.Schema({
  heat: {
    type: String,
  },
  heatDate: {
    type: Date,
  },
  heatResult: {
    type: String,
  },
  breederName: {
    type: String,
  },
  breedDate: {
    type: String,
  },
  dueDate: {
    type: String,
  },
});

module.exports = mongoose.model("Heat", EstrusHeatSchema);
