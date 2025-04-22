const mongoose = require("mongoose");

const VaccineSchema = new mongoose.Schema(
  {
    vaccineName: { type: String,  },
    vaccineDate: { type: String,  },
    uId: { type: String, required: true }, // User ID
    tagId: { type: String, required: true }, // Animal tag ID
    dueDate: { type: String },
    alertDate: { type: String },
    boosterDate: { type: String },
    repeatDate: { type: String },
    isCompleted: { type: Boolean, default: false },
    pauseUntil: { type: String }, // Pause reminders until this date
    nextReminderDate: { type: String }, // Date when next reminder should be sent
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vaccine", VaccineSchema);
