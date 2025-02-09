const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    parentId: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    uniqueName: { type: String, required: true },
    ageMonth: Number,
    ageYear: Number,
    height: Number,
    heightDate: Date,
    purchasDate: Date,
    gender: {
      type: String,
      enum: ["male", "female", "wether"],
      required: true,
    },
    weightMonth: Number,
    weightYear: Number,
    pregnancyDetail: String,
    maleDetail: String,
    bodyScore: Number,
    anyComment: String,

    children: [{ type: String, ref: "ChildAnimal" }], // References Child,
    milk: [{ type: Object, ref: "Milk" }], // References Milk,
    postWean: [{ type: Object, ref: "PostWean" }], // References Post Wean
    vaccine: [{ type: Object, ref: "Vaccine" }], // References Vaccine
    deworm: [{ type: Object, ref: "Deworm" }], // References deworm
    estrusHeat: [{ type: Object, ref: "EstrusHeat" }], // References EstrusHeat
    farmSanition: [{ type: Object, ref: "FarmSanition" }], // References farmSanition
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
