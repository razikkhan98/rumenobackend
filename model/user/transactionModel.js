const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
      uid: {
        type: String,
        required: true
      },

      name: {
        type: String,
        required: true
      },

      mobile: {
        type: Number,
        required: true
      },

      email: {
        type: String,
        required: true
      },

      address: {
        type: String,
        required: true
      },

      amount: {
        type: Number,
        required: true
        
      },
      transactionID: {
        type: String,
        required: true
      },

      paymode: {
        type: String,
        required: true
      
      },
      cod_payment: {
        type: String,
        required: true
      },

      image:{
        type: String,
        default: null
        // required: true
      },

      cart:{
        type: Array,
        default: null
        // required: true
    }
     
    },
    {
      timestamps:true,
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);
