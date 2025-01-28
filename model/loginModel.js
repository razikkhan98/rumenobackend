const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  match: /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/
},
mobilNumber:{
    type: Number,
    required: true,
    unique: true,
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    minlength: 10,
    maxlength: 10,
},
password:{
    type: String,
    required: true,
    unique: true
}

  });

module.exports = mongoose.model("login", loginSchema);
