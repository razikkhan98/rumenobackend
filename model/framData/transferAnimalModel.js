
const mongoose = require("mongoose");

const transferAnimalSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    tagId: {
      type: String,
      required: true
    },
    // uniqueId: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Animal",
      // type: String,
      // required: true
    // },
    animalStatus: {
      type: String,
      trim: true,
      enum: [
        "Death",
        "Sale out"
      ]
    },date: {
       type : Date,
       required: true
    },

    uniqueId:String,
    animalName: String,
    ageYear: Number,
    ageMonth: Number,
    height: Number,
    weightKg: Number,
    birthDate: Date,
    motherTag: String, 
    fatherTag: String,
    gender: String,
    birthType: String,
    birthWeight: String,
    mothersWeanDate: String,
    bodyScore: Number,
    purchasDate: Date,
    anyComment: String,
    otherDisease: String,
    vaccineDate: Date,
    farmName: String,
    dateDate: Date,
    currentPregnancyMonth: Number,
    failed: String,
    mothersWeanDate: String,

    parents: [
      {
        parentUniqueId: String,
        parentType: { type: String, enum: ["mother", "father"] }
      }
    ],
    children: [{ type: String }]

  },

  { timeseries: true }
);
module.exports = mongoose.model("TransferAnimal", transferAnimalSchema);





