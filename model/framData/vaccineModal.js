const mongoose = require("mongoose");

const VaccineSchema = new mongoose.Schema(
  {
    vaccineId: { type: String },
    vaccineName: { type: String, default: null },
    vaccineDate: { type: String, required: true, default: null },
    uId: { type: String, default: null },
    tagId: { type: String, default: null },
    dueDate: { type: String },
    booster: { type: String },
    repeat: { type: String },
    isCompleted: { type: Boolean, default: false },
    pauseUntil: { type: String }, // pause reminder until this date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vaccine", VaccineSchema);
