const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  blogId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  comment: {
    type: String,
    required: true,
  },
});


module.exports = mongoose.model("Blog", UserSchema);

