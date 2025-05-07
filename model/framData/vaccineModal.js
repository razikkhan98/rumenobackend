// const mongoose = require("mongoose");

// const VaccineSchema = new mongoose.Schema(
//   {
//     vaccineName: { type: String,  },
//     vaccineDate: { type: String,  },
//     uid: { type: String, required: true }, // User ID
//     tagId: { type: String, required: true }, // Animal tag ID
//     dueDate: { type: String },
//     alertDate: { type: String },
//     boosterDate: { type: String },
//     repeatDate: { type: String },
//     isCompleted: { type: Boolean, default: false },
//     pauseUntil: { type: String }, // Pause reminders until this date
//     nextReminderDate: { type: String }, // Date when next reminder should be sent
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Vaccine", VaccineSchema);

const mongoose = require("mongoose");

const VaccineSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    animalUniqueId: { type: String, require: true },
    dateOfBirth: { type: String },
    purchase: { type: String },
    vaccineId: { type: String },
    vaccineData: { type: Array },
    boosterData: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vaccine", VaccineSchema);
