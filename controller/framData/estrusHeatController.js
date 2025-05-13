const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalEstrusHea = require("../../model/framData/estrusHeatModal");
const ChildAnimal = require("../../model/framData/childFromModal");
const { calculateDateToDays } = require("../../utils/helper");

// ----------------------------------------------- Latest Code ------------------------------------------------------

/**
 * Create a new estrus heat record
 * @param {Object} req - Request object with estrus heat data
 * @param {Object} res - Response object
 */
exports.createEstrusHeat = async (req, res) => {
  try {
    const { tagId, heatDate, uid } = req.body;
    if (!tagId)
      return res
        .status(400)
        .json({ success: false, message: "tagId is required" });

    if (!heatDate)
      return res
        .status(400)
        .json({ success: false, message: "Heat date is required" });

    const nextDate = await calculateDateToDays(heatDate, 18);
    const newEstrusHeat = new AnimalEstrusHea({
      tagId,
      heatDate,
      heatNextDate: nextDate,
      uid,
    });

    const savedEstrusHeat = await newEstrusHeat.save();

    res.status(201).json({ success: true, data: savedEstrusHeat });
  } catch (error) {
    console.error("Error creating estrus heat record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create estrus heat record",
      error: error.message,
    });
  }
};

/**
 * Get all estrus heat records
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllEstrusHeats = async (req, res) => {
  try {
      const { uid, tagId } = req.query;
    if (!uid || !tagId)
      return res.status(400).json({
        success: false,
        message: "uid and tagId are required",
      });

    const estrusHeats = await AnimalEstrusHea.find({ uid , tagId}).sort({ createdAt: -1,});

    res.status(200).json({ success: true, count: estrusHeats.length, data: estrusHeats });
  } catch (error) {
    console.error("Error fetching estrus heat records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch estrus heat records",
      error: error.message,
    });
  }
};

/**
 * Get an estrus heat record by ID
 * @param {Object} req - Request object with ID parameter
 * @param {Object} res - Response object
 */
exports.getEstrusHeatById = async (req, res) => {
  try {
    const { id } = req.params;

    const estrusHeat = await AnimalEstrusHea.findById(id);

    if (!estrusHeat)
      return res
        .status(404)
        .json({ success: false, message: "Estrus heat record not found" });

    res.status(200).json({ success: true, data: estrusHeat });
  } catch (error) {
    console.error("Error fetching estrus heat record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch estrus heat record",
      error: error.message,
    });
  }
};

/**
 * Get estrus heat records by tag ID
 * @param {Object} req - Request object with tag ID parameter
 * @param {Object} res - Response object
 */
exports.getEstrusHeatsByTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const estrusHeats = await AnimalEstrusHea.find({ tagId }).sort({
      createdAt: -1,
    });

    if (estrusHeats.length === 0)
      return res.status(404).json({
        success: false,
        message: "No estrus heat records found for this tag",
      });

    res
      .status(200)
      .json({ success: true, count: estrusHeats.length, data: estrusHeats });
  } catch (error) {
    console.error("Error fetching estrus heat records by tag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch estrus heat records",
      error: error.message,
    });
  }
};

/**
 * Update an estrus heat record by ID
 * @param {Object} req - Request object with ID parameter and updated data
 * @param {Object} res - Response object
 */
exports.updateEstrusHeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { heatDate } = req.body;

    const heatNextDate = await calculateDateToDays(heatDate, 18);
    const updatedEstrusHeat = await AnimalEstrusHea.findByIdAndUpdate(
      id,
      heatDate,
      heatNextDate,
      { new: true, runValidators: true }
    );

    if (!updatedEstrusHeat)
      return res
        .status(404)
        .json({ success: false, message: "Estrus heat record not found" });

    res.status(200).json({ success: true, data: updatedEstrusHeat });
  } catch (error) {
    console.error("Error updating estrus heat record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update estrus heat record",
      error: error.message,
    });
  }
};

/**
 * Delete an estrus heat record by ID
 * @param {Object} req - Request object with ID parameter
 * @param {Object} res - Response object
 */
exports.deleteEstrusHeat = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEstrusHeat = await AnimalEstrusHea.findByIdAndDelete(id);

    if (!deletedEstrusHeat)
      return res
        .status(404)
        .json({ success: false, message: "Estrus heat record not found" });

    res.status(200).json({
      success: true,
      message: "Estrus heat record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting estrus heat record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete estrus heat record",
      error: error.message,
    });
  }
};
