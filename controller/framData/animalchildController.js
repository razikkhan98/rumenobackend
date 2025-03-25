// Children Data structure
// POST rumeno/user/animaldata/child

const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const ChildAnimal = require("../../model/framData/childFromModal");
const mongoose = require("mongoose");
const generateUniqueId = require("../../utils/uniqueId");

// POST: Add Child Animal Data
exports.animalChildDetail = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentId,
      DOB,
      kidWeightkg,
      kidWeightgm,
      motherAgeyear,
      motherAgemother,
      selectoption,
      ageyear,
      agemonth,
      gender,
      kidScore,
      BODType,
      birthWeightkg,
      birthWeightgm,
      weanDate,
      weanWeightkg,
      weanWeightgm,
      motherWeanWeightkg,
      motherWeanWeightgm,
      motherWeanDatekg,
      motherWeanDategm,
      castration,
      comment,
    } = req.body;

    // // Validate required fields
    // if (!uid || !kiduniqueName || !gender || !parentId) {
    //   return res.status(400).json({ message: "Missing required fields." });
    // }

    // Validate required fields
    const requiredFields = { gender, parentId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `${key} is a required field.` });
      }
    }

    // // Check if UID exists in User model
    // const existingUser = await User.findOne({ uid });
    // if (!existingUser) {
    //   return res.status(400).json({ message: "UID does not exist." });
    // }

    // Check if Parent exists
    const parentExists = await Animal.findOne({ parentId });
    if (!parentExists) {
      return res.status(404).json({ message: "Parent not found." });
    }

    // Generate Unique ID
    const animalName = parentExists.animalName;

    const uniqueId = generateUniqueId(animalName);

    // Count existing children for unique kid number
    const childCount = await ChildAnimal.countDocuments({ parentId });
    const kidId = `${parentId}-K${childCount + 1}`;

    // Check if Child Unique ID already exists
    const existingChild = await ChildAnimal.findOne({
      "children.kidId": kidId,
    });
    if (existingChild) {
      return res
        .status(400)
        .json({ message: "Child Unique ID already exists. Try again." });
    }

    // Create the Child
    const newChild = await ChildAnimal.create({
      kidId,
      uniqueId,
      parentId,
      DOB,
      kidWeightkg,
      kidWeightgm,
      motherAgeyear,
      motherAgemother,
      selectoption,
      ageyear,
      agemonth,
      gender,
      kidScore,
      BODType,
      birthWeightkg,
      birthWeightgm,
      weanDate,
      weanWeightkg,
      weanWeightgm,
      motherWeanWeightkg,
      motherWeanWeightgm,
      motherWeanDatekg,
      motherWeanDategm,
      castration,
      comment,
      parent: parentExists._id,
    });

    // Update Parent Record
    await Animal.findOneAndUpdate(
      { parentId },
      { $push: { children: newChild.kidId } },
      { new: true, upsert: true }
    );

    res
      .status(201)
      .json({ message: "Child added successfully", data: newChild });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add child animal.",
      error: error.message,
    });
  }
});

// PUT: Update Child Animal Data
exports.updateAnimalChildDetail = asyncHandler(async (req, res) => {
  // Validate request params
  if (!req.params) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      uniqueId,
      kidId,
      parentId,
      kiduniqueName,
      age,
      gender,
      breed,
      DOB,
      kidWeight,
      birthWeight,
      kidCode,
      kidScore,
      BODType,
      weanDate,
      weanWeight,
      motherWeanWeight,
      motherWeanDate,
      castration,
      motherAge,
      comment,
    } = req.body;

    // Validate required fields
    const requiredFields = { uniqueId, kidId, parentId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `${key} is a required field.` });
      }
    }

    // Check if Child exists
    const existingChild = await ChildAnimal.findOne({ uniqueId });
    if (!existingChild) {
      return res.status(404).json({ message: "Child not found." });
    }

    // Update Child
    const updatedChild = await ChildAnimal.findOneAndUpdate(
      { uniqueId },
      {
        $set: {
          kiduniqueName,
          uniqueId,
          gender,
          age,
          breed,
          DOB,
          kidWeight,
          birthWeight,
          kidCode,
          kidScore,
          BODType,
          weanDate,
          weanWeight,
          motherWeanWeight,
          motherWeanDate,
          castration,
          motherAge,
          comment,
        },
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Child updated successfully", data: updatedChild });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to update child animal.",
      error: error.message,
    });
  }
});

// Get child Data by UniqueId
exports.getAnimalChildDetail = asyncHandler(async (req, res) => {
  // Validate request body

  const { uniqueId } = req.params;
  if (!uniqueId) {
    return res.status(400).json({ message: "Unique ID is required." });
  }

  try {
    const childData = await ChildAnimal.aggregate([
      { $match: { uniqueId } },
      {
        $lookup: {
          from: "animals", // Ensure this matches the collection name of the Animal model
          localField: "uniqueId",
          foreignField: "uniqueId",
          as: "parentDetails",
        },
      },
    ]);

    if (!childData.length) {
      return res.status(404).json({ message: "Child not found." });
    }

    res.status(200).json({
      message: "Child data retrieved successfully",
      data: childData[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all Child Data
exports.getAllChildren = asyncHandler(async (req, res) => {
  try {
    const childData = await ChildAnimal.find({});

    res.status(200).json({
      message: "All child data retrieved successfully",
      data: childData,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

//  Promote Child to Parent
exports.promoteChildToParent = asyncHandler(async (req, res) => {
  try {
    const { childId } = req.params; // ChildAnimal's `_id`

    // Step 1: Find the child in the `ChildAnimal` collection
    const child = await ChildAnimal.findById("67a0acab304d4ff860e19cf6");
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const existingParent = await Animal.findOne({
      uniqueId: child.uniqueId,
    });
    if (existingParent) {
      return res
        .status(400)
        .json({ message: "Child is already promoted to parent." });
    }

    // Step 2: Remove the child from its current parent's `children` array
    if (child.parentId) {
      await Animal.findByIdAndUpdate(
        child.parentId,
        { $pull: { children: child._id } },
        { new: true }
      );
    }

    // Step 3: Create a new `Animal` entry (promoting child to parent)
    const newParent = new Animal({
      uid: `NEW-${child.uniqueId}`, // Generate new unique ID
      uniqueId: child.uniqueId,
      uniqueName: child.kiduniqueName,
      ageMonth: child.age % 12,
      ageYear: Math.floor(child.age / 12),
      gender: child.gender.toLowerCase(),
      children: [], // Empty initially, will be updated in Step 4
    });

    await newParent.save();

    // Step 4: Update any existing children to point to the new parent
    await ChildAnimal.updateMany(
      { parent: child._id }, // Find children of this child
      { parent: newParent._id } // Assign new parent ID
    );

    // Step 5: Remove child from the `ChildAnimal` collection
    // await ChildAnimal.findByIdAndDelete(child._id);

    res
      .status(200)
      .json({ message: "Child promoted to parent successfully", newParent });
  } catch (error) {
    console.error("Error promoting child:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

exports.getTotalCount = asyncHandler(async (req, res) => {
  try {
    const { animalName, uid } = req.query; // Get animalName and uid from frontend query

    // Ensure UID is provided to prevent fetching all records
    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    // Filter parent animals based on uid and optionally by animalName
    const parentFilter = { uid };
    if (animalName) parentFilter.animalName = animalName;

    const parentDetails = await Animal.find(
      parentFilter,
      "uniqueId parentId animalName"
    ).lean();

    // Extract parentIds to find matching children
    const parentIds = parentDetails.map((parent) => parent.parentId);

    // Find child animals that belong to the filtered parents
    const childDetails = await ChildAnimal.find(
      { parentId: { $in: parentIds } },
      "kidId parentId kidCode"
    ).lean();

    res.json({
      parents: parentDetails,
      children: childDetails,
      totalAnimal: parentDetails.length + childDetails.length,
      totalParent: parentDetails.length,
      totalChild: childDetails.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
