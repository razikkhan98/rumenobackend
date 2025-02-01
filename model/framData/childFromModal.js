const mongoose = require("mongoose");

const childSchemanimal = new mongoose.Schema({
  kiduniqueId: { type: String, required: true },
  kiduniqueName: { type: String, required: true },
  age: { type: Number, required: true },
  DOB: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  kidCode: { type: String, required: true },
  kidScore: { type: Number, required: true },
  BODType: { type: String, required: true },
  kidWeight: { type: Number, required: true },
  weanDate: { type: Date },
  weanWeight: { type: Number },
  motherWeanWeight: { type: Number },
  motherWeanDate: { type: Date },
  castration: { type: Boolean, default: false },
  birthWeight: { type: Number, required: true },
  breed: { type: String, required: true },
  motherAge: { type: Number, required: true },
  comment: { type: String },
});

const childSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  children: [childSchemanimal], // Embed child details within the parent document
});

module.exports = mongoose.model("ChildAnimal", childSchema);
