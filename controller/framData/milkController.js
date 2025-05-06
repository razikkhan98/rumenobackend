const asyncHandler = require("express-async-handler");
const AnimalMilk = require("../../model/framData/milkModall");
const Animal = require("../../model/framData/parentFromModal");

// --------------------------------- latest code  ---------------------------------------------------
/**
  CREATE operation - Add new milk record
  POST /api/milk
  @param {Object} req - Express request object with milk data in body
  @param {Object} res - Express response object
  @returns {Object} - JSON response with created milk record or error
 */

(exports.createMilkRecord = async (req, res) => {
  try {
    const {
      tagId,
      milkvolume,
      numberOfKidsSuckingMilk,
      kiddingDeliveryDate,
      uid,
    } = req.body;

    if (!tagId) {
      return res
        .status(400)
        .json({ success: false, message: "tagId is required" });
    }

    const newMilk = new AnimalMilk({
      tagId,
      milkvolume,
      numberOfKidsSuckingMilk,
      kiddingDeliveryDate,
      uid,
    });

    const savedMilk = await newMilk.save();

    res.status(201).json({ success: true, data: savedMilk });
  } catch (error) {
    console.error("Error creating milk record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create milk record",
      error: error.message,
    });
  }
}),
  /** 
  READ operation (all) - Get all milk records
  GET /api/milk
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with all milk records or error
 */
  (exports.getAllMilkRecord = async (req, res) => {
    try {
      const { uid, tagId } = req.query;
      if (!uid || !tagId)
        return res.status(400).json({
          success: false,
          message: "uid and tagId are required",
        });
      const milk = await AnimalMilk.find({ uid, tagId }).sort({
        createdAt: -1,
      }); // Sort by newest first
      res.status(200).json({ success: true, count: milk.length, data: milk });
    } catch (error) {
      console.error("Error fetching milk records:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch milk records",
        error: error.message,
      });
    }
  });

/**
 * READ operation (single) - Get a specific milk record by ID
 * GET /api/milk/:id
 * @param {Object} req - Express request object with ID parameter
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the specified milk record or error
 */
exports.getMilkRecordById = async (req, res) => {
  try {
    const { uid } = req.params;
    console.log("req.params:", req.params);

    const milk = await AnimalMilk.find({ uid });
    console.log("milk:", milk);

    if (!milk) {
      return res
        .status(404)
        .json({ success: false, message: "Milk record not found" });
    }

    res.status(200).json({ success: true, data: milk });
  } catch (error) {
    console.error("Error fetching milk record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch milk record",
      error: error.message,
    });
  }
};

/**
 * READ operation (by tagId) - Get milk records by tagId
 * GET /api/milk/tag/:tagId
 * @param {Object} req - Express request object with tagId parameter
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the matching milk records or error
 */
exports.getMilkRecordByTagId = async (req, res) => {
  try {
    const { tagId } = req.params;

    const milk = await AnimalMilk.find({ tagId }).sort({ createdAt: -1 });

    if (milk.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No milk records found for this tag",
      });
    }

    res.status(200).json({ success: true, count: milk.length, data: milk });
  } catch (error) {
    console.error("Error fetching milk records by tag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch milk records",
      error: error.message,
    });
  }
};

/**
 * UPDATE operation - Update a milk record
 * PUT /api/milk/:id
 * @param {Object} req - Express request object with ID parameter and updated data in body
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the updated milk record or error
 */
exports.updateMilkRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    const updatedMilk = await AnimalMilk.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMilk) {
      return res
        .status(404)
        .json({ success: false, message: "Milk record not found" });
    }

    res.status(200).json({ success: true, data: updatedMilk });
  } catch (error) {
    console.error("Error updating milk record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update milk record",
      error: error.message,
    });
  }
};

/**
 * DELETE operation - Delete a milk record
 * DELETE /api/milk/:id
 * @param {Object} req - Express request object with ID parameter
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with success message or error
 */
exports.deleteMilkRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMilk = await AnimalMilk.findByIdAndDelete(id);

    if (!deletedMilk) {
      return res
        .status(404)
        .json({ success: false, message: "Milk record not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Milk record deleted successfully" });
  } catch (error) {
    console.error("Error deleting milk record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete milk record",
      error: error.message,
    });
  }
};
