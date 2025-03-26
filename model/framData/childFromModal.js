// const mongoose = require("mongoose");

// const childSchema = new mongoose.Schema({

//   kidId: { type: Strin  },
//   kiduniqueName: { type: String, required: true },
//   age: { type: Number, required: true },
//   DOB: { type: Date, required: true },
//   gender: { type: String, enum: ["Male", "Female"], required: true },
//   kidCode: { type: String, required: true },
//   kidScore: { type: Number, required: true },
//   BODType: { type: String, required: true },
//   kidWeight: { type: Number, required: true },
//   weanDate: { type: Date },
//   weanWeight: { type: Number, default: 0, },
//   motherWeanWeight: { type: Number },
//   motherWeanDate: { type: Date },
//   castration: { type: String, default: false },
//   birthWeight: { type: Number, required: true },
//   breed: { type: String },
//   motherAge: { type: Number, required: true },
//   comment: { type: String },

//   uniqueId: { type: String, required: true },
//   parentId: { type: String, ref: "Animal" }, // References Parent
//   children: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChildAnimal" }], // References other Children (Recursive)
//   milk: [{ type: Object, ref: "Milk" }], // References Milk,

// });

// module.exports = mongoose.model("ChildAnimal", childSchema);

const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  parentId: { type: String, ref: "Animal" }, // References Parent
  kidId:{ type : String, required: true},
  kidage: {
    type: Number,
  },
  kidweight: {
    type: Number,
  },
  heightft:{
    type: Number,
   
  },
  motherage: {
    type: Number,
  },
  breed: {
    type: String,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["Male", "Female" , "Other"], // Restricts gender to these values
  },
  kidcode: {
    type: String,
    // unique: true, // Ensures kidcode is unique
  },
  kidscore: {
    type: Number,
  },
  dobtype: {
    type: String,
    enum: ["Natural", ""], // Add valid values
    required: true 

  },
  dobweight: {
    type: Number,
  },
  weanweight: {
    type: Number,
  },
  castration: {
    type: Date,
  },
  motherweandate: {
    type: Date,
    required: false,
  },
  motherweandateweight: {
    type: Number,
    required: false,
  },

  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChildAnimal" }], // References other Children (Recursive)
  milk: [{ type: Object, ref: "Milk" }], // References Milk,
  postWean: [{ type: Object, ref: "PostWean" }], // References Post Wean
  vaccine: [{ type: Object, ref: "Vaccine" }], // References Vaccine
  deworm: [{ type: Object, ref: "Deworm" }], // References deworm
  estrusHeat: [{ type: Object, ref: "EstrusHeat" }], // References EstrusHeat
  farmSanition: [{ type: Object, ref: "FarmSanition" }], // References farmSanition
});

module.exports = mongoose.model("ChildAnimal", childSchema);
