// Children Data structure
// POST rumeno/user/animaldata/child

const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const ChildAnimal = require("../../model/framData/childFromModal");
const mongoose = require("mongoose");
const generateUniqueId = require("../../utils/uniqueId");
const generateParentCode = require("../../utils/parentCode");


// POST: Add Child Animal Data
exports.animalChildDetail = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      parentId,
      uniqueName,
      kidage,
      ageMonth,
      ageYear,
      height,
      purchasDate,
      weightKg,
      weightGm,
      pregnancyDetail,
      maleDetail,
      motherage,
      breed,
      dob,
      gender,
      kidcode,
      bodyScore,
      dobtype,
      dobweight,
      weanweight,
      castration,
      motherweandate,
      motherweandateweight,
      anyComment
    } = req.body;

    // Validate required fields
    const requiredFields = { gender, parentId };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `${key} is a required field.` });
      }
    }

    // Check if UID exists in User model
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

// Generate Parent Code
const parentCode = generateParentCode(animalName);

// Ensure unique parentCode by checking existing records
let counter = 1;
while (await ChildAnimal.findOne({ parentId: parentCode })) {
  parentCode = `${generateParentCode(animalName)}-${counter++}`;
  counter++;
}



    // Create the Child
    const newChild = await ChildAnimal.create({
      kidId,
      uniqueId,
      parentId:parentCode,
      uniqueName,
      animalName,
      kidage,
      ageMonth,
      ageYear,
      height,
      purchasDate,
      weightKg,
      weightGm,
      pregnancyDetail,
      maleDetail,
      motherage,
      breed,
      dob,
      gender,
      kidcode,
      bodyScore,
      dobtype,
      dobweight,
      weanweight,
      castration,
      motherweandate,
      motherweandateweight,
      parent: parentExists._id,
      anyComment
    });

    console.log(newChild);

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
      uniqueName,
      animalName,
      kidage,
      ageMonth,
      ageYear,
      height,
      purchasDate,
      weightKg,
      weightGm,
      pregnancyDetail,
      maleDetail,
      motherage,
      breed,
      dob,
      gender,
      kidcode,
      bodyScore,
      dobType,
      dobweight,
      weanWeight,
      castration,
      motherweandate,
      motherweandateweight,
      anyComment
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
          uniqueName,
          uniqueId,
          kidId,
          parentId,
          uniqueName,
          animalName,
          kidage,
          ageMonth,
          ageYear,
          height,
          purchasDate,
          weightKg,
          weightGm,
          pregnancyDetail,
          maleDetail,
          motherage,
          breed,
          dob,
          gender,
          kidcode,
          bodyScore,
          dobType,
          dobweight,
          weanWeight,
          castration,
          motherweandate,
          motherweandateweight,
          anyComment
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
    const child = await ChildAnimal.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Check if child is already promoted

    const existingParent = await Animal.findOne({
      uniqueId: child.uniqueId,
    });
    if (existingParent) {
      return res
        .status(400)
        .json({ message: "Child is already promoted to parent." });
    }



    // Step 2: Remove the child from its current parent's `children` array
    // if (child.parentId) {
    //   await Animal.findByIdAndUpdate(
    //     child.parentId,
    //     { $pull: { children: child._id } },
    //     { new: true }
    //   );
    // }


    // Generate Parent Code
    // const parentCode = generateParentCode(animalName);

    // // Ensure unique parentCode by checking existing records
    // let counter = 1;
    // while (await Animal.findOne({ uniqueId: parentCode })) {
    //   parentCode = `${generateParentCode(animalName)}-${counter++}`;
    //   counter++;
    // }


    // Step 3: Create a new `Animal` entry (promoting child to parent)
    const newParent = new Animal({
      uid: child.uid, // Generate new unique ID
      uniqueId: child.uniqueId,
      uniqueName: child.uniqueName,
      parentId: child.parentId,
      animalName: child.animalName,
      ageMonth: child.ageMonth,
      ageYear: child.ageYear,
      height: child.height,
      // heightDate: null,
      purchasDate: child.purchasDate,
      weightKg: child.weightKg,
      weightGm: child.weightGm,
      pregnancyDetail: child.pregnancyDetail,
      maleDetail: child.maleDetail,
      bodyScore: child.bodyScore,
      anyComment: child.anyComment,
      children: child.children,
      milk: child.milk,
      postWean: child.postWean,
      vaccine: child.vaccine,
      deworm: child.deworm,
      estrusHeat: child.estrusHeat,
      sanitation: child.sanitation
      // ageMonth: child.age % 12,
      // ageYear: Math.floor(child.age / 12),
      // gender: child.gender.toLowerCase(),
      // children: [], // Empty initially, will be updated in Step 4
      // `NEW-${child.uniqueId}`
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
    const { animalName, uid } = req.query;

    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    const parentFilter = { uid };
    if (animalName) parentFilter.animalName = animalName;

    const parentDetails = await Animal.find(
      parentFilter,
      "uniqueId parentId animalName"
    ).lean();

    const parentIds = parentDetails.map((parent) => parent.parentId);

    const childDetails = await ChildAnimal.find(
      { parentId: { $in: parentIds } },
      "kidId parentId kidCode"
    ).lean();

    const allVaccines = await vaccineModal
      .find({}, "vaccineId vaccineName vaccineDate uniqueId")
      .lean();

    // Get current month in "YYYY-MM" format
    const currentMonth = moment().format("YYYY-MM");

    // Parent vaccinated animals (data)
    const parentVaccinated = parentDetails.filter((parent) =>
      allVaccines.some(
        (v) =>
          v.vaccineId === parent.uniqueId &&
          v.vaccineDate.startsWith(currentMonth)
      )
    );

    // Child vaccinated animals (data)
    const childVaccinated = childDetails.filter((child) =>
      allVaccines.some(
        (v) =>
          v.vaccineId === child.kidId && v.vaccineDate.startsWith(currentMonth)
      )
    );

    // Parent unvaccinated animals (data)
    const parentUnvaccinated = parentDetails.filter((parent) =>
      allVaccines.some(
        (v) =>
          v.vaccineId === parent.uniqueId &&
          v.vaccineDate.startsWith(currentMonth)
      )
    );

    // Child unvaccinated animals (data)
    const childUnvaccinated = childDetails.filter((child) =>
      allVaccines.some(
        (v) =>
          v.vaccineId === child.kidId && v.vaccineDate.startsWith(currentMonth)
      )
    );

    res.json({
      totalAnimals: parentDetails.length + childDetails.length,
      totalParents: parentDetails.length,
      totalChildren: childDetails.length,
      totalVaccines: allVaccines.length,
      vaccinatedParents: {
        count: parentVaccinated.length,
        data: parentVaccinated,
      },
      vaccinatedChildren: {
        count: childVaccinated.length,
        data: childVaccinated,
      },
      unvaccinatedParents: {
        count: parentUnvaccinated.length,
        data: parentUnvaccinated,
      },
      unvaccinatedChildren: {
        count: childUnvaccinated.length,
        data: childUnvaccinated,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
