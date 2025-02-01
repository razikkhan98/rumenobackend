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
    parentId: { type: String, ref: "Animal", default: null },
    children: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
