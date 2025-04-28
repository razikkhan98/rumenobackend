const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalMilk = require("../../model/framData/milkModall");
const ChildAnimal = require("../../model/framData/childFromModal");

exports.addMilk = asyncHandler(async (req, res) => {
  // Validate request body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const { parentUniqueId, childUniqueId, milkVolume, numberKids, milkDate } =
      req.body;

    if (!parentUniqueId && !childUniqueId) {
      return res.status(400).json({
        message: "Either parentUniqueId or childUniqueId is required.",
      });
    }

    let parentExists = null;
    let childExists = null;

    // Check if Parent exists
    if (parentUniqueId) {
      parentExists = await Animal.findOne({ uniqueId: parentUniqueId });
      if (!parentExists) {
        return res.status(404).json({ message: "Parent not found." });
      }
    }

    // Check if Child exists
    if (childUniqueId) {
      childExists = await ChildAnimal.findOne({ uniqueId: childUniqueId });
      if (!childExists) {
        return res.status(404).json({ message: "Child not found." });
      }
    }

    const milkId = parentUniqueId || childUniqueId;

    // Create new Milk data
    const AnimalMilkData = await AnimalMilk.create({
      milkId,
      numberKids,
      milkVolume,
      milkDate,
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { milk: AnimalMilkData } }, // Assuming 'milk' stores ObjectId references
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { milk: AnimalMilkData } }, // Assuming 'milk' stores ObjectId references
      { new: true }
    );

    res.status(201).json({
      message: "Milk added successfully",
      data: AnimalMilkData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add milk data.",
      error: error.message,
    });
  }
});

// Update Milk Parent and Child

exports.updateMilk = asyncHandler(async (req, res) => {
  let { milkId } = req.params;

  // If milkId is numeric or a custom string, skip ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(milkId) && !isNaN(milkId)) {
    return res.status(400).json({ message: "Invalid milkId format" });
  }

  try {
    const { numberKids, milkVolume, milkDate } = req.body;

    const updatedPostWean = await AnimalPostWean.findOneAndUpdate(
      { milkId }, // ✅ Match `milkId` directly
      { numberKids, milkVolume, milkDate },
      { new: true }
    );

    if (!updatedPostWean) {
      return res.status(404).json({ message: "Milk not found." });
    }

    res.json({
      message: "Milk updated successfully",
      data: updatedPostWean,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update Milk data.",
      error: error.message,
    });
  }
});

// Delete Milk Parent and Child

exports.deleteMilk = asyncHandler(async (req, res) => {
  const { milkId } = req.params;

  if (!milkId) {
    return res.status(400).json({ message: "No milkId provided" });
  }

  try {
    // Find Post Wean Entry
    const milk = await AnimalMilk.findOne({ milkId: milkId });
    if (!milk) {
      return res.status(404).json({ message: "Milk not found" });
    }
    // Remove references from Parent & Child
    await Animal.updateMany({ milk: milkId }, { $pull: { milk: milkId } });
    await ChildAnimal.updateMany({ milk: milkId }, { $pull: { milk: milkId } });
    console.log({ Milk: milkId }, { $pull: { milk: milkId } });

    // Delete Post Wean Entry
    await AnimalMilk.deleteOne({ milkId: milkId });

    res.json({ message: "Milk deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

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
      uId,
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
      uId,
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
      const milk = await AnimalMilk.find().sort({ createdAt: -1 }); // Sort by newest first

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
    const { id } = req.params;

    const milk = await AnimalMilk.findById(id);

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
