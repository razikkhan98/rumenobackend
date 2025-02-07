// Children Data structure
// POST rumeno/user/animaldata/child

const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const ChildAnimal = require("../../model/framData/childFromModal");
const mongoose = require("mongoose");
const generateUniqueldId = require("../../utils/uniqueId");

exports.animalchildDetail = asyncHandler(async (req, res) => {
  // Validate request body

  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentId,
      kiduniqueName,
      age,
      DOB,
      gender,
      kidCode,
      kidScore,
      BODType,
      kidWeight,
      weanDate,
      weanWeight,
      motherWeanWeight,
      motherWeanDate,
      castration,
      birthWeight,
      breed,
      motherAge,
      comment,
      uid,
    } = req.body;

    // Validate required fields
    const requiredFields = { uid, kiduniqueName, gender, parentId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `${key} is a required field.` });
      }
    }
    // Generate UniqueId
    const uniqueId = generateUniqueldId(kiduniqueName);
    
    // const parentObjectId = new mongoose.Types.ObjectId(parentId);
    // console.log('parentObjectId: ', parentObjectId);
    
    // Check if UID exists in User model
    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      return res.status(400).json({ message: "UID does not exist." });
    }
    
    // Check if Parent exists
    const parentExists = await Animal.findOne({ parentId });
    console.log('parentExists: ', parentExists);
    
    if (!parentExists) {
      return res.status(404).json({ message: "Parent not found." });
    }
    
    // Count existing children for unique kid number
    const childCount = await ChildAnimal.countDocuments({ parentId });
    const kidNumber = childCount + 1; // Next Kid Number
    
    // Generate Child Code
    const kidId = `${parentId}-K${kidNumber}`;

    // const KiduniqueId = chid.uniqueId + 1;
    // console.log('KiduniqueId: ', KiduniqueId);

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
    const newChild = {
      kidId,
      kiduniqueName,
      uniqueId,
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
      parentId: parentExists?.parentId,
      uid,
      parent: parentExists?._id,
    };

    const createChild = await ChildAnimal.create(newChild);

    // Upsert Child Record in Parent
    const updatedParent = await Animal.findOneAndUpdate(
      { parentId: parentExists?.parentId },
      { $push: { children: createChild?.kidId } },
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: "Child added successfully",
      data: newChild,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add child animal.",
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

    res
      .status(200)
      .json({
        message: "Child data retrieved successfully",
        data: childData[0],
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
