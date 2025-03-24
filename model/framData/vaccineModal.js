const mongoose = require("mongoose");

const VaccineSchema = new mongoose.Schema({
  vaccineId: {
    type: String,
    required: true
  },
  vaccineName: {
    type: String,
    default: null
  },
  vaccineDate: {
    type: String,
    default: null
  },
});

module.exports = mongoose.model("Vaccine", VaccineSchema);
