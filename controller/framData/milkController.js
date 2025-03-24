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
    const {
      parentUniqueId,
      childUniqueId,
      milkVolume,
      numberKids,
      milkDate,
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
    await Animal.updateMany({ "milk": milkId }, { $pull: { milk: milkId } });
    await ChildAnimal.updateMany({ "milk": milkId }, { $pull: { milk: milkId } });
    console.log({ "Milk": milkId }, { $pull: { milk: milkId }} )
    
    // Delete Post Wean Entry
    await AnimalMilk.deleteOne({ milkId: milkId });

    res.json({ message: "Milk deleted successfully" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});
