

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
    const { parentUniqueId, childUniqueId, name, milkKid, milkVolume, milkDate } = req.body;
    // Check if Parent exists
    if(parentUniqueId){
      const parentExists = await Animal.findOne({ uniqueId: parentUniqueId });
      if (!parentExists) {
        return res.status(404).json({ message: "Parent not found." });
      }
    }
    
    
    // Check if Child exists
    if(childUniqueId){
      const childExists = await ChildAnimal.findOne({ uniqueId: childUniqueId });
      if (!childExists) {
        return res.status(404).json({ message: "Child not found." });
      }
    }
    
    
    // Create new Milk data
    const AnimalMilkData = await AnimalMilk.create({
      parentUniqueId,
      childUniqueId,
      name,
      milkKid,
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
