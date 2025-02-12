const expressAsyncHandler = require("express-async-handler");
const transactionIssueModel = require("../../model/user/transactionIssueModel");

// Transaction a new user
exports.userTransactionIssue = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { name, mobile, transactionID, transactionIssue } = req.body;

    // Validation
    if (!name || !mobile || !transactionID || !transactionIssue) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new transaction issue
    const newTransactionIssue = new transactionIssueModel({
      name,
      mobile,
      transactionID,
      transactionIssue,
    });

    await newTransactionIssue.save();
    res.status(201).json({ message: "Transaction issue submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
