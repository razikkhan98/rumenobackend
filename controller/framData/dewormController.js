// dewormController
const asyncHandler = require("express-async-handler");
const AnimalDeworm = require("../../model/framData/dewormModal");

exports.addDeworm = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      tagId,
      uid,
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

    if (!uid && !tagId) {
      return res.status(400).json({
        message: "Uid and tagId is required.",
      });
    }


    // Create new Post WEAN data
    const AnimalDewornData = await AnimalDeworm.create({
      tagId,
      uid,
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

    res.status(201).json({
      message: "Deworn added successfully",
      data: saveDeworm,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add deworm data.",
      error: error.message,
    });
  }
});



exports.getAllDeworm = async (req, res) => {
  try {
    const { uid, tagId } = req.query;
    if (!uid || !tagId)
      return res.status(400).json({
        success: false,
        message: "uid and tagId are required",
      });
     
    const deworm = await AnimalDeworm.find({ uid, tagId }).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ success: true, count: deworm.length, data: deworm });
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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Id is required" })
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

    const updatedDeworm = await AnimalDeworm.findByIdAndUpdate(id, // Ensure you pass Id properly
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
exports.deleteDeworm = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }
  try {
    // Find Deworm Entry
    const deworm = await AnimalDeworm.findByIdAndDelete(id);
    if (!deworm) {
      return res.status(400).json({ message: "Deworn not found" });
    }

    res.status(200).json({ success: true, message: "deworm deleted successfully" });
  } catch (error) {
    console.error("Error deleting deworm record", error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
});
