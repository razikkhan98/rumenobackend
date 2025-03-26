// const mongoose = require("mongoose");

// const animalSchema = new mongoose.Schema(
//   {
//     uid: { type: String, required: true },
//     parentId: { type: String, required: true },
//     uniqueId: { type: String, required: true, unique: true },
//     uniqueName: { type: String},
//     animalName: { type: String },
//     ageMonth: Number, 
//     ageYear: Number, 
//     height: Number, 
//     heightDate: Date,
//     purchasDate: Date,
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"], // Ensure these values are lowercase
//       required: true,
//     },
//     weightKg: Number,
//     weightGm: Number, 
//     pregnancyDetail: String,
//     maleDetail: String, 
//     bodyScore: Number, 
//     anyComment: String, 

//     children: [{ type: String, ref: "ChildAnimal" }], // References Child,
//     milk: [{ type: Object, ref: "Milk" }], // References Milk,
//     postWean: [{ type: Object, ref: "PostWean" }], // References Post Wean
//     vaccine: [{ type: Object, ref: "Vaccine" }], // References Vaccine
//     deworm: [{ type: Object, ref: "Deworm" }], // References deworm
//     estrusHeat: [{ type: Object, ref: "EstrusHeat" }], // References EstrusHeat
//     farmSanition: [{ type: Object, ref: "FarmSanition" }], // References farmSanition
    
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Animal", animalSchema);



const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    uid: { type: String, 
      // required: true
     },
    parentId: { type: String, 
      // required: true
     },
    uniqueId: { type: String,
      //  required: true, 
      //  unique: true
       },
    uniqueName: { type: String, default: null },
    animalName: { type: String, default: null },

    ageMonth: { type: Number, default: null }, 
    ageYear: { type: Number, default: null }, 
    height: { type: Number, default: null }, 
    heightDate: { type: Date, default: null },
    purchasDate: { type: Date, default: null },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"], // Ensure only these values are accepted
      // required: true,
    },

    weightKg: { type: Number, default: null },
    weightGm: { type: Number, default: null }, 
    pregnancyDetail: { type: String, default: null },
    maleDetail: { type: String, default: null }, 
    bodyScore: { type: Number, default: null }, 
    anyComment: { type: String, default: null },

    children: [{ type: String, ref: "ChildAnimal", default: [] }], // References Child
    milk: [{ type: Object, ref: "Milk", default: [] }], // References Milk
    postWean: [{ type: Object, ref: "PostWean", default: [] }], // References Post Wean
    vaccine: [{ type: Object, ref: "Vaccine", default: [] }], // References Vaccine
    deworm: [{ type: Object, ref: "Deworm", default: [] }], // References Deworm
    estrusHeat: [{ type: Object, ref: "EstrusHeat", default: [] }], // References EstrusHeat
    farmSanition: [{ type: Object, ref: "FarmSanition", default: [] }], // References FarmSanition
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
