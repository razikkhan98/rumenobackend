const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
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
    // -----------------

    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
