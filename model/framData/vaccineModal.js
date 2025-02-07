const mongoose = require("mongoose");

const VaccineSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  date: {
    type: String,
  },
});

module.exports = mongoose.model("Vaccine", VaccineSchema);
