const mongoose = require("mongoose");

const SanitationSchema = new mongoose.Schema({
 
  soilDate: {
    type: Date,
  },
  limesprinkleDate: {
    type: Date,
  },
  insecticideDate: {
    type: Date,
  },
  insecticide: {
    type: String,
  },
});

module.exports = mongoose.model("Sanitation", SanitationSchema);
