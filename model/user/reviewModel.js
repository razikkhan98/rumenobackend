const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  uid: {
    type: String,
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

  review: {
    type: String,
    required: true,
  },
  
  productid: {
    type: String,
    required: true,
  },    
});

module.exports = mongoose.model("Review", reviewSchema);
