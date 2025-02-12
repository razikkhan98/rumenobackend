const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z]+$/,
    minlength: 2,
    maxlength: 20,
  },
  lastName: {
    type: String,
    unique: true,
    trim: true,
    match: /^[a-zA-Z]+$/,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    minlength: 10,
    maxlength: 10,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  uid:{
    type: String,
    required: true,
    unique: true
  }
  
});

module.exports = mongoose.model("User", registerSchema);
