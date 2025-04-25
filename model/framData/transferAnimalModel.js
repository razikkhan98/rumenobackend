
const mongoose = require("mongoose");

const transferAnimalSchema = new mongoose.Schema(
{
    uid: { type: String, required: true },
   tagId: {
     type : String,
     required: true
   },
     uniqueId:{
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "Animal",
        type: String,
        required: true
     },
       animalStatus: {
         type: String,
         trim: true,
          enum: [
           "Death",
           "Sale out"
         ]
       }
    },

   {timeseries: true}
);
module.exports = mongoose.model("TransferAnimal", transferAnimalSchema);





