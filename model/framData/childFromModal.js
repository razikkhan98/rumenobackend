

const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  parentId: { type: String, ref: "Animal" }, // References Parent
  kidId:{ type : String, required: true},
  uniqueName: {
    type: String
  },
  animalName: {
     type: String
  },
  kidage: {
    type: Number,
  },
  ageMonth: {
     type: Number,
  },
  ageYear: {
    type: Number,
 },
  kidweight: {
    type: Number,
  },
  height:{
    type: Number,
  },
  purchasDate: {
    type: Date,
  },
  weightKg:{
    type: String
  },
  weightGm:{
    type: String
  },
  pregnancyDetail:{
    type: String
  },
  maleDetail: {
    type: String  
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
  bodyScore: {
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
  anyComment:{
    type: String
  },

  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChildAnimal" }], // References other Children (Recursive)
  milk: [{ type: Object, ref: "Milk" }], // References Milk,
  postWean: [{ type: Object, ref: "PostWean" }], // References Post Wean
  vaccine: [{ type: Object, ref: "Vaccine" }], // References Vaccine
  deworm: [{ type: Object, ref: "Deworm" }], // References deworm
  estrusHeat: [{ type: Object, ref: "EstrusHeat" }], // References EstrusHeat
  sanitation: [{ type: Object, ref: "Sanitation" }], // References farmSanition
});

module.exports = mongoose.model("ChildAnimal", childSchema);
