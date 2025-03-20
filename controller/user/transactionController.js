const expressAsyncHandler = require("express-async-handler");
const transactionModel = require("../../model/user/transactionModel");
const generateOrderId = require("../../utils/generateOrderId");
// const deleteCartItem = require("../../controller/user/addToCartController");


// 🔹 Create Transaction
exports.userTransaction = expressAsyncHandler (async (req, res) => {
  try {
    const orderId = await generateOrderId(); // Generate Order ID
    const newTransaction = new transactionModel({ ...req.body, order: orderId });

    const savedTransaction = await newTransaction.save();
    res.status(201).json({ success: true, message: "Transaction created successfully", transaction: savedTransaction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating transaction", error: error.message });
  }
});

// 🔹 Get All Transactions
exports.getTransaction = expressAsyncHandler (async (req, res) => {
  try {
    const transactions = await transactionModel.find();
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transactions", error: error.message });
  }
});

// 🔹 Get Single Transaction from

exports.getSingleTransaction = expressAsyncHandler (async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ success: false, message: "UID is required" });
    }

    const transactions = await Transaction.find({ uid }).sort({ createdAt: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: "No transactions found for this UID" });
    }

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }

});