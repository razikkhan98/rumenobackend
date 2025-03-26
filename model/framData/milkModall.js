const mongoose = require("mongoose");

const MilkSchema = new mongoose.Schema(
  {
    milkId: {
      type: String,
      required: true,
    },

    milkvolume: {
      type: String,
      default: null,
    },

    numberKids: {
      type: Number,
      default: null,
    },

    milkDate: {
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

module.exports = mongoose.model("Milk", MilkSchema);
