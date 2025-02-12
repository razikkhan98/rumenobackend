const mongoose = require("mongoose");

const VaccineSchema = new mongoose.Schema({
  vaccineId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: null
  },
  date: {
    type: String,
    default: null
  },
});

module.exports = mongoose.model("Vaccine", VaccineSchema);
