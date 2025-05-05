
const mongoose = require("mongoose");

const DewormSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
    },
    uid:{
       type: String,
       required: true,
    },
    // uniqueId: {
    //  type: String,
    //  required: true,
    // },
    report: {
      type: String,
      default: null,
    },
    date: {
      type: String,
      default: null
    },
    endoName: {
      type: String,
      default: null,
    },
    ectoName: {
      type: String,
      default: null,
    },
    endoDate: {
      type: Date,
      default: null,
    },
    ectoDate: {
      type: Date,
      default: null,
    },
    endoType: {
      type: String,
      default: null,
    },
    ectoType: {
      type: String,
      default: null,
    },
    animalDate: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Deworm", DewormSchema);
