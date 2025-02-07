const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
 
  kidId: { type: String, required: true,  },
  kiduniqueName: { type: String, required: true },
  age: { type: Number, required: true },
  DOB: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  kidCode: { type: String, required: true },
  kidScore: { type: Number, required: true },
  BODType: { type: String, required: true },
  kidWeight: { type: Number, required: true },
  weanDate: { type: Date },
  weanWeight: { type: Number, default: 0, },
  motherWeanWeight: { type: Number },
  motherWeanDate: { type: Date },
  castration: { type: String, default: false },
  birthWeight: { type: Number, required: true },
  breed: { type: String },
  motherAge: { type: Number, required: true },
  comment: { type: String },

  uniqueId: { type: String, required: true },
  parentId: { type: String, ref: "Animal" }, // References Parent
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChildAnimal" }], // References other Children (Recursive)
  milk: [{ type: Object, ref: "Milk" }], // References Milk,


});

module.exports = mongoose.model("ChildAnimal", childSchema);
