// const mongoose = require("mongoose");

// const DewormSchema = new mongoose.Schema({
//   // uniqueId: {
//   //   type: String,
//   // },
//   report: {
//     type: String,
//   },
//   date: {
//     type: Date,
//   },
//   endoName: {
//     type: String,
//   },
//   ectoName: {
//     type: String,
//   },
//   endoDate: {
//     type: Date,
//   },
//   ectoDate: {
//     type: Date,
//   },
//   ectoType: {
//     type: String,
//   },
//   ectoType:{
//     type: String,
//   },
//   animalDate: {
//    type: Date,
//   },
// });

// module.exports = mongoose.model("Deworm", DewormSchema);



const mongoose = require("mongoose");
 
const DewormSchema = new mongoose.Schema({
  dewormId: {
    type: String,
    required: true
  },
  report: {
    type: String,
    default: null
  },
  date: {
    type: Date,
  },
  endoName: {
    type: String,
    default: null
  },
  ectoName: {
    type: String,
    default: null
  },
  endoDate: {
    type: Date,
  },
  ectoDate: {
    type: Date,
  },
  endoType: {
    type: String,
    default: null
  },
  ectoType:{
    type: String,
    default: null
  },
  animalDate: {
   type: Date,
  },
});
 
module.exports = mongoose.model("Deworm", DewormSchema);