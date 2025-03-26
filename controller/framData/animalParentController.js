// Animals Parent Controller
// POST /rumeno/user/animaldata/parent

const asyncHandler = require("express-async-handler");
const generateParentCode = require("../../utils/parentCode");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const generateUniqueldId = require("../../utils/uniqueId");

// Add Parent Data

exports.animalDetail = asyncHandler(async (req, res) => {
  // Validate request body

  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const {
      uid,
      animalName,
      uniqueName,
      ageMonth,
      ageYear,
      height,
      // heightDate,
      purchasDate,
      gender,
      weightKg,
      weightGm,
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

    // Check uniqueName exists in User model
    const existingAnimal = await Animal.findOne({ uniqueName });
    if (existingAnimal) {
      return res.status(400).json({ message: "Unique Name already exists." });
    }

    // Generate Parent Code
    const parentCode = generateParentCode(animalName);

    // Ensure unique parentCode by checking existing records
    let counter = 1;
    while (await Animal.findOne({ uniqueId: parentCode })) {
      parentCode = `${generateParentCode(animalName)}-${counter++}`;
      counter++;
    }

    // Generate UniqueId
    const uniqueId = generateUniqueldId(animalName);

    // Create new Parent Animal
    const newParent = new Animal({
      uid,
      parentId: parentCode,
      uniqueId,
      animalName,
      uniqueName,
      ageMonth,
      ageYear,
      height,
      // heightDate,
      purchasDate,
      gender,
      weightKg,
      weightGm,
      pregnancyDetail,
      maleDetail,
      bodyScore,
      anyComment,
      children: [], // No children initially
      milk: [],
    });
    

    // Save the new Parent to the database

    await newParent.save();
    // Send a success response

    res.status(201).json({
      message: "success",
      data: newParent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add parent animal.",
      error: error.message,
    });
  }
});

// Get all Parent Data

exports.getAllParents = asyncHandler(async (req, res) => {
  try {
    const parents = await Animal.find({}); // Get all parents from the database

    res.json({
      message: "All parent animals fetched successfully",
      data: parents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to fetch parent animals.",
      error: error.message,
    });
  }
});

// Get Parent Data by UniqueId
exports.animalAllDetail = asyncHandler(async (req, res) => {
  // Validate request body

  if (!req.params) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const { uniqueId } = req.params;

    const parents = await Animal.aggregate([
      {
        $match: { uniqueId: uniqueId }, // Find the parent by uniqueId
      },
      {
        $lookup: {
          from: "childanimals", // Collection name of ChildAnimal (check lowercase plural)
          localField: "parentId", // The _id field of Animal (parent)
          foreignField: "parentId", // The parent field in ChildAnimal referencing Animal
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
      // Children
      children: parent.children.map((child) => ({
        uniqueId: child.uniqueId,
        kidId: child.kidId,
        uniqueName: child.uniqueName,
        age: child.age,
        DOB: child.DOB,
        gender: child.gender,
        kidCode: child.kidCode,
        bodyScore: child.bodyScore,
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
        anyComment: child.anyComment,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      })),
      // Post Wean
      postWean: parent.postWean.map((postWean) => ({
        postWeanId: postWean._id,
        weightKg: postWean.weightKg,
        weightGm: postWean.weightGm,
        bodyScore: postWean.bodyScore,
        weanDate: postWean.weanDate,
        weanComment: postWean.weanComment,
      })),
      // milk
      milk: parent.milk.map((milk) => ({
        milkId: milk._id,
        name: milk.name,
        milkVolume: milk.milkVolume,
        milkDate: milk.milkDate,
        createdAt: milk.createdAt,
        updatedAt: milk.updatedAt,
      })),
      // Vaccine
      vaccine: parent.vaccine.map((vaccine) => ({
        vaccineId: vaccine._id,
        name: vaccine.name,
        date: vaccine.date,
        createdAt: vaccine.createdAt,
        updatedAt: vaccine.updatedAt,
      })),
      // Deworm
      deworm: parent.deworm.map((deworm) => ({
        dewormId: deworm._id,
        report: deworm.report, // Assuming 'report' is the name of the deworming record
        endoName: deworm.endoName, // Endoparasitic treatment name
        ectoName: deworm.ectoName, // Ectoparasitic treatment name
        endoDate: deworm.endoDate,
        ectoDate: deworm.ectoDate,
        endotype: deworm.endotype,
        ectotype: deworm.ectotype,
        date: deworm.date,
        animalDate: deworm.animalDetail,
        createdAt: deworm.createdAt,
        updatedAt: deworm.updatedAt,
      })),
    }));

    // const formatChildData = (child) => ({
    //   uniqueId: child.uniqueId || null,
    //   childId: child._id || null,
    //   kiduniqueId: child.kiduniqueId || null,
    //   kiduniqueName: child.kiduniqueName || null,
    //   age: child.age || null,
    //   DOB: child.DOB || null,
    //   gender: child.gender || null,
    //   kidCode: child.kidCode || null,
    //   kidScore: child.kidScore || null,
    //   BODType: child.BODType || null,
    //   kidWeight: child.kidWeight || null,
    //   weanDate: child.weanDate || null,
    //   weanWeight: child.weanWeight || null,
    //   motherWeanWeight: child.motherWeanWeight || null,
    //   motherWeanDate: child.motherWeanDate || null,
    //   castration: child.castration || null,
    //   birthWeight: child.birthWeight || null,
    //   breed: child.breed || null,
    //   motherAge: child.motherAge || null,
    //   comment: child.comment || null,
    //   createdAt: child.createdAt || null,
    //   updatedAt: child.updatedAt || null,
    // });

    // const parentsData = parents.map((parent) => ({
    //   parentId: parent._id || null,
    //   uniqueId: parent.uniqueId || null,
    //   uniqueName: parent.uniqueName || null,
    //   ageMonth: parent.ageMonth || null,
    //   ageYear: parent.ageYear || null,
    //   height: parent.height || null,
    //   purchasDate: parent.purchasDate || null,
    //   gender: parent.gender || null,
    //   weightMonth: parent.weightMonth || null,
    //   weightYear: parent.weightYear || null,
    //   pregnancyDetail: parent.pregnancyDetail || null,
    //   maleDetail: parent.maleDetail || null,
    //   bodyScore: parent.bodyScore || null,
    //   anyComment: parent.anyComment || null,
    //   createdAt: parent.createdAt || null,
    //   updatedAt: parent.updatedAt || null,
    //   children: (parent.children || []).map(formatChildData),
    // }));

    res.status(200).json({
      parents: parentsData,
    });
  } catch (error) {
    console.error("Error fetching parent and child data:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
