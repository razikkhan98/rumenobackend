const mongoose = require("mongoose");

const PostWeanSchema = new mongoose.Schema({
  postWeanId: {
    type: String,
    required: true,
  },
  weightKg: {
    type: String,
    default: null,
  },
  weightGm: {
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
  weanComment: {
    type: String,
    default: null,
  },
  uId: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("PostWean", PostWeanSchema);
