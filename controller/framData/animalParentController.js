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
      parentId: null, // Since it's a parent
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
