const mongoose = require("mongoose");

const PostWeanSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
    },
    kidWeight: {
      type: String,
      default: null,
    },
    bodyScore: {
      type: String,
      default: null,
    },
    weanDate: {
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

module.exports = mongoose.model("PostWean", PostWeanSchema);
