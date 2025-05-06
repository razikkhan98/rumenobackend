const mongoose = require("mongoose");

const EstrusHeatSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
    },
    heatDate: {
      type: String,
      default: null,
    },
    heatNextDate: {
      type: String,
      default: null,
    },
    uid: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Heat", EstrusHeatSchema);
