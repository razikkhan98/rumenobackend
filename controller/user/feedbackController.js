// Feedback
// POST /rumeno/feedback

const expressAsyncHandler = require("express-async-handler");
const feedbackModel = require("../../model/user/feedbackModal");

exports.feedback = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { productId, feedback, uid } = req.body;

    // Validate required fields
    if (!productId || !feedback || !uid) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save user to the database
    await feedbackModel.save();
    res.status(201).json({ message: "Feedback added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
