// Feedback
// POST /rumeno/feedback

const expressAsyncHandler = require("express-async-handler");

exports.feedback = expressAsyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { product_id, feedback, uid } = req.body;

    // Validate required fields
    if (!product_id || !feedback || !uid) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save user to the database
    await feedbackModel.save();
    res.status(201).json({ message: "Feedback added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
