const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalPostWean = require("../../model/framData/postWeanModal");
const ChildAnimal = require("../../model/framData/childFromModal");

exports.addPostWean = asyncHandler(async (req, res) => {
  // Validate request body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentUniqueId,
      childUniqueId,
      weightKg,
      weightGm,
      bodyScore,
      weanDate,
      weanComment,
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
    const AnimalPostWeanData = await AnimalPostWean.create({
      parentUniqueId,
      childUniqueId,
      weightKg,
      weightGm,
      bodyScore,
      weanDate,
      weanComment,
    });

    // Push Milk Data into Parent Record
    const updatedParent = await Animal.findOneAndUpdate(
      { uniqueId: parentUniqueId },
      { $push: { postWean: AnimalPostWeanData } }, // Assuming 'Post WEAN' stores ObjectId references
      { new: true }
    );

    // Push Child Data into Parent Record
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId: childUniqueId },
      { $push: { postWean: AnimalPostWeanData } }, // Assuming 'Post WEAN' stores ObjectId references
      { new: true }
    );

    res.status(201).json({
      message: "Post WEAN added successfully",
      data: AnimalPostWeanData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});
