// Children Data structure
// POST rumeno/user/animaldata/child

const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const ChildAnimal = require("../../model/framData/childFromModal");
const mongoose = require("mongoose");

exports.animalchildDetail = asyncHandler(async (req, res) => {
  // Validate request body

  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      uniqueId,
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
    const requiredFields = { uid, kiduniqueName, gender, uniqueId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `${key} is a required field.` });
      }
    }

    // const parentObjectId = new mongoose.Types.ObjectId(parentId);
    // console.log('parentObjectId: ', parentObjectId);

    // Check if UID exists in User model
    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      return res.status(400).json({ message: "UID does not exist." });
    }

    // Check if Parent exists
    const parentExists = await Animal.findOne(uniqueId);
    console.log("parentExists: ", parentExists);
    if (!parentExists) {
      return res.status(404).json({ message: "Parent not found." });
    }

    // Count existing children for unique kid number
    const childCount = await ChildAnimal.countDocuments({ uniqueId });
    const kidNumber = childCount + 1; // Next Kid Number

    // Generate Child Code
    const kiduniqueId = `${uniqueId}-K${kidNumber}`;

    // Check if Child Unique ID already exists
    const existingChild = await ChildAnimal.findOne({
      "children.kiduniqueId": kiduniqueId,
    });
    if (existingChild) {
      return res
        .status(400)
        .json({ message: "Child Unique ID already exists. Try again." });
    }

    // Create the Child
    const newChild = {
      kiduniqueId,
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
      uniqueId,
      uid,
    };

    // Upsert Child Record in Parent
    const updatedParent = await ChildAnimal.findOneAndUpdate(
      { uniqueId },
      { $push: { children: newChild } },
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: "Child added successfully",
      data: updatedParent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add child animal.",
      error: error.message,
    });
  }
});
