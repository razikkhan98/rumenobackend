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

    // Check if Parent exists
    if (parentUniqueId) {
      const parentExists = await Animal.findOne({ uniqueId: parentUniqueId });
      if (!parentExists) {
        return res.status(404).json({ message: "Parent not found." });
      }
    }

    // Check if Child exists
    if (childUniqueId) {
      const childExists = await ChildAnimal.findOne({
        uniqueId: childUniqueId,
      });
      if (!childExists) {
        return res.status(404).json({ message: "Child not found." });
      }
    }
    console.log(childUniqueId);

    // Create new Post WEAN data
    const AnimalSanitationData = await AnimalSanitation.create({
      parentUniqueId,
      childUniqueId,
      soilDate,
      limesprinkleDate,
      insecticideDate,
      insecticide,
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { farmSanition: AnimalSanitationData } }, // Assuming 'Post WEAN' stores ObjectId references
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { farmSanition: AnimalSanitationData } }, // Assuming 'Post WEAN' stores ObjectId references
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
