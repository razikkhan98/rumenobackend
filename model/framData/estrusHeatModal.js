const mongoose = require("mongoose");

const EstrusHeatSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
    },
    estrusHeatDate: {
      type: String,
      default: null,
    },
    estrusHeatNextDate: {
      type: String,
      default: null,
    },
    uId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Heat", EstrusHeatSchema);
