const mongoose = require("mongoose");

const PostWeanSchema = new mongoose.Schema({
  weightKg: {
    type: String,
  },
  weightGm: {
    type: String,
  },
  bodyScore: {
    type: String,
  },
  weanDate: {
    type: String,
  },
  weanComment: {
    type: String,
  },
});

module.exports = mongoose.model("PostWean", PostWeanSchema);
