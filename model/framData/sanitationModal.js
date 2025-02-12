const mongoose = require("mongoose");

const SanitationSchema = new mongoose.Schema({
 
  sanitationId: {
    type: String,
    required: true
  },
  soilDate: {
    type: Date,
    default: null
  },
  limesprinkleDate: {
    type: Date,
  },
  insecticideDate: {
    type: Date,
  },
  insecticide: {
    type: String,
    default: null
  },
});

module.exports = mongoose.model("Sanitation", SanitationSchema);
