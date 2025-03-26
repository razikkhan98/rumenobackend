const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalSanitation = require("../../model/framData/sanitationModal");
const ChildAnimal = require("../../model/framData/childFromModal");

exports.addSanitation = asyncHandler(async (req, res) => {
  // Validate request body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentUniqueId,
      childUniqueId,
      soilDate,
      limesprinkleDate,
      insecticideDate,
      insecticide,
    } = req.body;

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

    const sanitationId = parentUniqueId || childUniqueId;

    // Create new Post WEAN data
    const AnimalSanitationData = await AnimalSanitation.create({
      sanitationId,
      soilDate,
      limesprinkleDate,
      insecticideDate,
      insecticide,
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { farmSanition: AnimalSanitationData } },
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { farmSanition: AnimalSanitationData } },
      { new: true }
    );

    res.status(201).json({
      message: "Sanitation added successfully",
      data: AnimalSanitationData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});

// Update Sanitation Parent and Child
exports.updateSanitation = asyncHandler(async (req, res) => {
  let { sanitationId } = req.params;
  console.log("Received sanitationId:", sanitationId);

  // If sanitationId is numeric or a custom string, skip ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(sanitationId) && !isNaN(sanitationId)) {
    return res.status(400).json({ message: "Invalid sanitationId format" });
  }

  try {
    const { soilDate, limesprinkleDate, insecticideDate, insecticide } =
      req.body;

    const updatedPostWean = await AnimalPostWean.findOneAndUpdate(
      { sanitationId }, // ✅ Match `sanitationId` directly
      { soilDate, limesprinkleDate, insecticideDate, insecticide },
      { new: true }
    );

    if (!updatedPostWean) {
      return res.status(404).json({ message: "Sanitation not found." });
    }

    res.json({
      message: "Sanitation updated successfully",
      data: updatedPostWean,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update Sanitation data.",
      error: error.message,
    });
  }
});

// Delete Post Wean Parent and Child
exports.deleteSanitation = asyncHandler(async (req, res) => {
  const { sanitationId } = req.params;

  if (!sanitationId) {
    return res.status(400).json({ message: "No sanitationId provided" });
  }

  try {
    // Find Post Wean Entry
    const sanitationId = await AnimalSanitation.findOne({
      sanitationId: sanitationId,
    });
    if (!sanitationId) {
      return res.status(404).json({ message: "Post Wean not found" });
    }

    // Remove references from Parent & Child
    await Animal.updateMany(
      { uniqueId: sanitationId },
      { $pull: { farmSanition: sanitationId } }
    );
    await ChildAnimal.updateMany(
      { uniqueId: sanitationId },
      { $pull: { farmSanition: sanitationId } }
    );

    // Delete Post Wean Entry
    await AnimalSanitation.deleteOne({ sanitationId: sanitationId });

    res.json({ message: "sanitationId deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});
