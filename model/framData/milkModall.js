const mongoose = require("mongoose");

const MilkSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
    },

    milkvolume: {
      type: String,
      default: null,
    },

    numberOfKidsSuckingMilk: {
      type: Number,
      default: null,
    },

    kiddingDeliveryDate: {
      type: String,
      default: null,
    },
    uid: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Milk", MilkSchema);
