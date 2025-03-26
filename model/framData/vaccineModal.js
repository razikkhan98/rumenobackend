// const mongoose = require("mongoose");

// const VaccineSchema = new mongoose.Schema({
//   vaccineId: {
//     type: String,
//     required: true
//   },
//   vaccineName: {
//     type: String,
//     default: null
//   },
//   vaccineDate: {
//     type: String,
//     default: null
//   },
// });

// module.exports = mongoose.model("Vaccine", VaccineSchema);

const mongoose = require("mongoose");

const VaccineSchema = new mongoose.Schema(
  {
    vaccineId: {
      type: String,
      required: true,
    },
    vaccineName: {
      type: String,
      default: null,
    },
    vaccineDate: {
      type: String,
      default: null,
    },
    uId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vaccine", VaccineSchema);
