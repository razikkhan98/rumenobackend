const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalDeworn = require("../../model/framData/dewormModal");
const ChildAnimal = require("../../model/framData/childFromModal");

exports.addDeworm = asyncHandler(async (req, res) => {
  // Validate request body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentUniqueId,
      childUniqueId,
      report,
      date,
      endoName,
      ectoName,
      endoDate,
      ectoDate,
      endoType,
      ectoType,
      animalDate,
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

    const dewormId = parentUniqueId || childUniqueId;

    // Create new Post WEAN data
    const AnimalDewornData = await AnimalDeworn.create({
      dewormId,
      report,
      date,
      endoName,
      ectoName,
      endoDate,
      ectoDate,
      endoType,
      ectoType,
      animalDate,
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { deworm: AnimalDewornData } }, 
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { deworm: AnimalDewornData } }, 
      { new: true }
    );

    res.status(201).json({
      message: "Deworn added successfully",
      data: AnimalDewornData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});

// Delete Vaccine Parent and Child

exports.deleteDeworm = asyncHandler(async (req, res) => {
  const { dewormId } = req.params;

  if (!dewormId) {
    return res.status(400).json({ message: "No dewormId provided" });
  }

  try {
    // Find Post Wean Entry
    const dewormId = await AnimalVaccine.findOne({ dewormId: dewormId });
    if (!dewormId) {
      return res.status(404).json({ message: "Post Wean not found" });
    }

    // Remove references from Parent & Child
    await Animal.updateMany(
      { uniqueId: dewormId },
      { $pull: { dewormId: dewormId } }
    );
    await ChildAnimal.updateMany(
      { uniqueId: dewormId },
      { $pull: { dewormId: dewormId } }
    );

    // Delete Post Wean Entry
    await AnimalDeworn.deleteOne({ dewormId: dewormId });

    res.json({ message: "dewormId deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});
