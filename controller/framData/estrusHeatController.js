const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalEstrusHea = require("../../model/framData/estrusHeatModal");
const ChildAnimal = require("../../model/framData/childFromModal");

exports.addEstrusHeat = asyncHandler(async (req, res) => {
  // Validate request body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentUniqueId,
      childUniqueId,
      heat,
      heatDate,
      heatResult,
      breederName,
      breedDate,
      dueDate,
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

    const heatId = parentUniqueId || childUniqueId;

    // Create new Post WEAN data
    const AnimalEstrusHeat = await AnimalEstrusHea.create({
      heatId,
      heat,
      heatDate,
      heatResult,
      breederName,
      breedDate,
      dueDate,
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { estrusHeat: AnimalEstrusHeat } },
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { estrusHeat: AnimalEstrusHeat } },
      { new: true }
    );

    res.status(201).json({
      message: "EstrusHeat added successfully",
      data: AnimalEstrusHeat,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});

// Update Estrus Heat Parent and Child
exports.updateEstrusHeat = asyncHandler(async (req, res) => {
  let { heatId } = req.params;
  console.log("Received heatId:", heatId);

  // If heatId is numeric or a custom string, skip ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(heatId) && !isNaN(heatId)) {
    return res.status(400).json({ message: "Invalid heatId format" });
  }

  try {
    const { heat, heatDate, heatResult, breederName, breedDate, dueDate } =
      req.body;

    const updatedPostWean = await AnimalPostWean.findOneAndUpdate(
      { heatId }, // ✅ Match `heatId` directly
      { heat, heatDate, heatResult, breederName, breedDate, dueDate },
      { new: true }
    );

    if (!updatedPostWean) {
      return res.status(404).json({ message: "Estrus Heat not found." });
    }

    res.json({
      message: "Estrus Heat updated successfully",
      data: updatedPostWean,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update Estrus Heat data.",
      error: error.message,
    });
  }
});

// Delete Milk Parent and Child
exports.deleteEstrusHeat = asyncHandler(async (req, res) => {
  const { heatId } = req.params;

  if (!heatId) {
    return res.status(400).json({ message: "No heatId provided" });
  }

  try {
    // Find Post Wean Entry
    const heatId = await AnimalEstrusHea.findOne({ heatId: heatId });
    if (!heatId) {
      return res.status(404).json({ message: "EstrusHeat not found" });
    }

    // Remove references from Parent & Child
    await Animal.updateMany(
      { uniqueId: heatId },
      { $pull: { estrusHeat: heatId } }
    );
    await ChildAnimal.updateMany(
      { uniqueId: heatId },
      { $pull: { estrusHeat: heatId } }
    );

    // Delete Post Wean Entry
    await AnimalEstrusHea.deleteOne({ heatId: heatId });

    res.json({ message: "EstrusHeat deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});
