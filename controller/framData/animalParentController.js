// Animals Parent Controller
// POST /rumeno/user/animaldata/parent

const asyncHandler = require("express-async-handler");
const generateParentCode = require("../../utils/parentCode");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");

// Add Parent Data

exports.animalDetail = asyncHandler(async (req, res) => {
  // Validate request body

  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      uid,
      uniqueName,
      ageMonth,
      ageYear,
      height,
      heightDate,
      purchasDate,
      gender,
      weightMonth,
      weightYear,
      pregnancyDetail,
      maleDetail,
      bodyScore,
      anyComment,
    } = req.body;

    // Validate required fields
    const requiredFields = { uid, uniqueName, gender };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `${key} is a required field.` });
      }
    }

    // Check if UID exists in User model
    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      return res.status(400).json({ message: "UID does not exist." });
    }

    // Generate Parent Code
    const parentCode = generateParentCode(uniqueName);

    // Ensure unique parentCode by checking existing records
    // Ensure unique parentCode by checking existing records
    let counter = 1;
    while (await Animal.findOne({ uniqueId: parentCode })) {
      parentCode = `${generateParentCode(uniqueName)}-${counter}`;
      counter++;
    }

    // Create new Parent Animal
    const newParent = new Animal({
      uid,
      uniqueId: parentCode,
      uniqueName,
      ageMonth,
      ageYear,
      height,
      heightDate,
      purchasDate,
      gender,
      weightMonth,
      weightYear,
      pregnancyDetail,
      maleDetail,
      bodyScore,
      anyComment,
      children: [], // No children initially
    });

    // Save the new Parent to the database

    await newParent.save();

    // Send a success response

    res.status(201).json({
      message: "Parent animal added successfully",
      data: newParent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add parent animal.",
      error: error.message,
    });
  }
});

exports.animalAllDetail = asyncHandler(async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const parents = await Animal.aggregate([
      {
        $match: { uniqueId: uniqueId }, // Find the parent by uniqueId
      },
      {
        $lookup: {
          from: "childanimals", // Collection name of ChildAnimal (check lowercase plural)
          localField: "uniqueId", // The _id field of Animal (parent)
          foreignField: "uniqueId", // The parent field in ChildAnimal referencing Animal
          as: "children",
        },
      },
    ]);

    if (!parents || parents.length === 0) {
      return res.status(404).json({ message: "No parent found" });
    }

    // Formatting response with full details
    const parentsData = parents.map((parent) => ({
      parentId: parent._id,
      uniqueId: parent.uniqueId,
      uniqueName: parent.uniqueName,
      ageMonth: parent.ageMonth,
      ageYear: parent.ageYear,
      height: parent.height,
      purchasDate: parent.purchasDate,
      gender: parent.gender,
      weightMonth: parent.weightMonth,
      weightYear: parent.weightYear,
      pregnancyDetail: parent.pregnancyDetail,
      maleDetail: parent.maleDetail,
      bodyScore: parent.bodyScore,
      anyComment: parent.anyComment,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      children: parent.children.map((child) => ({
        uniqueId: child.uniqueId,

        childId: child._id,
        kiduniqueId: child.kiduniqueId,
        kiduniqueName: child.kiduniqueName,
        age: child.age,
        DOB: child.DOB,
        gender: child.gender,
        kidCode: child.kidCode,
        kidScore: child.kidScore,
        BODType: child.BODType,
        kidWeight: child.kidWeight,
        weanDate: child.weanDate,
        weanWeight: child.weanWeight,
        motherWeanWeight: child.motherWeanWeight,
        motherWeanDate: child.motherWeanDate,
        castration: child.castration,
        birthWeight: child.birthWeight,
        breed: child.breed,
        motherAge: child.motherAge,
        comment: child.comment,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      })),
    }));

    res.status(200).json({
      parents: parentsData,
    });
  } catch (error) {
    console.error("Error fetching parent and child data:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
