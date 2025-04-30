const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const AnimalDeworm = require("../../model/framData/dewormModal");
// const ChildAnimal = require("../../model/framData/childFromModal");

exports.addDeworm = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      tagId,
      uid,
      uniqueId,
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

    if (!uid && !tagId && !uniqueId) {
      return res.status(400).json({
        message: "Uid and tagid, uniqueId is required.",
      });
    }

    // let parentExists = null;
    // let childExists = null;

    // // Check if Parent exists
    // if (parentUniqueId) {
    //   animalExists = await Animal.findOne({ uniqueId: parentUniqueId });
    //   if (!animalExists) {
    //     return res.status(404).json({ message: "Animal not found." });
    //   }
    // }

    // // Check if Child exists
    // if (childUniqueId) {
    //   childExists = await ChildAnimal.findOne({ uniqueId: childUniqueId });
    //   if (!childExists) {
    //     return res.status(404).json({ message: "Child not found." });
    //   }
    // }

    // const dewormId = parentUniqueId || childUniqueId;

    // Create new Post WEAN data
    const AnimalDewornData = await AnimalDeworm.create({
      tagId,
      uid,
      uniqueId,
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
    const saveDeworm = await AnimalDewornData.save();

    // // Push Milk Data into Parent Record
    // const updatedParent = await Animal.findOneAndUpdate(
    //   { uniqueId: parentUniqueId },
    //   { $push: { deworm: AnimalDewornData } }, 
    //   { new: true }
    // );

    // // Push Child Data into Parent Record
    // const updatedChild = await ChildAnimal.findOneAndUpdate(
    //   { uniqueId: childUniqueId },
    //   { $push: { deworm: AnimalDewornData } }, 
    //   { new: true }
    // );

    res.status(201).json({
      message: "Deworn added successfully",
      data: saveDeworm,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add Post Wean data.",
      error: error.message,
    });
  }
});



exports.getAllDeworm = async (req, res) => {
    try {
      const deworm = await AnimalDeworm.find({uid: req?.query.uid}).sort({ createdAt: -1 }); // Sort by newest first

      res.status(200).json({ success: true, data: deworm });
    } catch (error) {
      console.error("Error fetching deworm records:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch deworm records",
        error: error.message,
      });
    }
  };



// Update Deworn Parent and Child

exports.updateDeworm = asyncHandler(async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "No data provided" });
    }

  const { uniqueId } = req.params;
  console.log("id", uniqueId);
 if (!uniqueId){
    return res. status(400).json({message: "UniqueId is required"})
 }
  
    const { 
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

    const deworm = {
        report,
        date,
        endoName,
        ectoName,
        endoDate,
        ectoDate,
        endoType,
        ectoType,
        animalDate
       };
      
    const updatedDeworm = await AnimalDeworm.findOneAndUpdate(
          { uniqueId: uniqueId }, // Ensure you pass uniqueId properly
          { $set: deworm },
          { new: true }
        );

    if (!updatedDeworm) {
      return res.status(404).json({ message: "Deworn not found." });
    }

    res.json({ message: "Deworn updated successfully", data: updatedDeworm });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update Deworn data.",
      error: error.message,
    });
  }
});



// Delete Deworm data
exports.deleteDeworm = asyncHandler(async (req ,res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }
console.log(id)
  try {
    // Find Deworm Entry
    const deworm = await AnimalDeworm.findByIdAndDelete(id);
    if (!deworm) {
      return res.status(404).json({ message: "Deworn not found" });
    }
    
    res.status(200).json({success: true, message: "deworm deleted successfully" });
  } catch (error) {
    console.error("Error deleting deworm record" ,error);
    res.status(500).json({status:false ,message: "Server error", error: error.message });
  }
});


    // // Remove references from Parent & Child
    // await Animal.updateMany(
    //   { uniqueId: dewormId },
    //   { $pull: { dewormId: dewormId } }
    // );
    // await ChildAnimal.updateMany(
    //   { uniqueId: dewormId },
    //   { $pull: { dewormId: dewormId } }
    // );

    // // Delete Post Wean Entry
    // await AnimalDeworn.deleteOne({ dewormId: dewormId });