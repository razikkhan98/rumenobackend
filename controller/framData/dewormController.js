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
    const { parentUniqueId,
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

    // Create new Post WEAN data
    const AnimalDewornData = await AnimalDeworn.create({
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
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { deworm: AnimalDewornData } }, // Assuming 'Post WEAN' stores ObjectId references
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { deworm: AnimalDewornData } }, // Assuming 'Post WEAN' stores ObjectId references
      { new: true }
    );

    res.status(201).json({
      message: "Vaccine added successfully",
      data: AnimalDewornData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});
