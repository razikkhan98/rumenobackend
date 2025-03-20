const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    uid: {type: String,required: true,},
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    payment: { type: String, default: null },
    total: { type: Number, required: true },
    order: { type: String, unique: true }, // Unique Order ID
    items: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        inStock: { type: Boolean, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
