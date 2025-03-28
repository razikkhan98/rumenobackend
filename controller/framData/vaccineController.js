const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalVaccine = require("../../model/framData/vaccineModal");
const ChildAnimal = require("../../model/framData/childFromModal");

exports.addVaccine = asyncHandler(async (req, res) => {
  // Validate request body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const { parentUniqueId, childUniqueId, vaccineName, vaccineDate, uId,  } =
      req.body;
    if (!parentUniqueId && !childUniqueId) {
      return res.status(400).json({
        message: "Either parentUniqueId or childUniqueId is required.",
      });
    }

    // Check if Uid
    if (!uId) {
      return res.status(400).json({ message: "Uid is required." });
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

    const vaccineId = parentUniqueId || childUniqueId;

    // Create new Post WEAN data
    const AnimalVaccineData = await AnimalVaccine.create({
      vaccineId,
      vaccineName,
      vaccineDate,
      uId
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { vaccine: AnimalVaccineData } },
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { vaccine: AnimalVaccineData } },
      { new: true }
    );

    res.status(201).json({
      message: "Vaccine added successfully",
      data: AnimalVaccineData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});

// Update Vaccine Parent and Child

exports.updateVaccine = asyncHandler(async (req, res) => {
  let { vaccineId } = req.params;

  // If vaccineId is numeric or a custom string, skip ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(vaccineId) && !isNaN(vaccineId)) {
    return res.status(400).json({ message: "Invalid vaccineId format" });
  }

  try {
    const { vaccineName, vaccineDate } = req.body;

    const updatedPostWean = await AnimalPostWean.findOneAndUpdate(
      { vaccineId }, // ✅ Match `vaccineId` directly
      { vaccineName, vaccineDate },
      { new: true }
    );

    if (!updatedPostWean) {
      return res.status(404).json({ message: "Vaccine not found." });
    }

    res.json({
      message: "Vaccine updated successfully",
      data: updatedPostWean,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update Vaccine data.",
      error: error.message,
    });
  }
});

// Delete Post Wean Parent and Child
exports.deleteVaccine = asyncHandler(async (req, res) => {
  const { vaccineId } = req.params;

  if (!vaccineId) {
    return res.status(400).json({ message: "No vaccineId provided" });
  }

  try {
    // Find Post Wean Entry
    const vaccineId = await AnimalVaccine.findOne({ vaccineId: vaccineId });
    if (!vaccineId) {
      return res.status(404).json({ message: "Post Wean not found" });
    }

    // Remove references from Parent & Child
    await Animal.updateMany(
      { uniqueId: vaccineId },
      { $pull: { vaccine: vaccineId } }
    );
    await ChildAnimal.updateMany(
      { uniqueId: vaccineId },
      { $pull: { vaccine: vaccineId } }
    );

    // Delete Post Wean Entry
    await AnimalVaccine.deleteOne({ vaccineId: vaccineId });

    res.json({ message: "vaccineId deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});
