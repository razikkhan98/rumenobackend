const mongoose = require("mongoose");

const transactionIssueSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true
      },

      mobile: {
        type: Number,
        required: true
      },

      transactionID: {
        type: String,
        required: true
      },
        
      transactionIssue: {
        type: String,
        required:true
      }
     
    },
    {
      timestamps:true,
    }
);

module.exports = mongoose.model("TransactionIssue", transactionIssueSchema);
