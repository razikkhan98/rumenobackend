const mongoose = require("mongoose");

const DewormSchema = new mongoose.Schema({
  // uniqueId: {
  //   type: String,
  // },
  report: {
    type: String,
  },
  date: {
    type: Date,
  },
  endoName: {
    type: String,
  },
  ectoName: {
    type: String,
  },
  endoDate: {
    type: Date,
  },
  ectoDate: {
    type: Date,
  },
  ectoType: {
    type: String,
  },
  ectoType:{
    type: String,
  },
  animalDate: {
   type: Date,
  },
});

module.exports = mongoose.model("Deworm", DewormSchema);
