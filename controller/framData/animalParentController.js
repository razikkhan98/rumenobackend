// Animals Parent Controller
// POST /rumeno/user/animaldata/parent

const asyncHandler = require("express-async-handler");
// const generateParentCode = require("../../utils/parentCode");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const generateUniqueFarmId = require('../../utils/uniqueId');
const milkModall = require("../../model/framData/milkModall");
const postWeanModal = require("../../model/framData/postWeanModal");
const vaccineModal = require("../../model/framData/vaccineModal");
const estrusHeatModal = require("../../model/framData/estrusHeatModal");
const sanitationModal = require("../../model/framData/sanitationModal");
const dewormModal = require("../../model/framData/dewormModal");

// Add Uniquie entites Data
exports.animalDetail = asyncHandler(async (req, res) => {
  if (!req.body) {

    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const {
      uid,
      animalName,
      tagId,
      ageYear,
      ageMonth,
      height,
      weightKg,
      birthDate,
      motherTag,
      fatherTag,
      gender,
      birthType,
      birthWeight,
      mothersWeanDate,
      bodyScore,
      purchasDate,
      anyComment,
      dateMading,
      currentPregnancyMonth,
      failed,
      motherWeanDate,
      otherDisease,
      vaccineDate,
      farmHouseName,
      isPregnant
    } = req.body;

    // Validate required fields
    const requiredFields = { uid, animalName, farmHouseName, gender };
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


    //GEnerate unique Id 
    const uniqueId = generateUniqueFarmId(farmHouseName);

    // Check if Unique ID exists or not 
    const existID = await Animal.findOne({ uniqueId })
    if (existID) {
      return res.status(400).json({ message: "Unique ID already exists." })
    }

    // Check if gender is female and handle pregnancy-related fields
    if (gender === "Female" && isPregnant) {
      if (!dateMading || !currentPregnancyMonth || !failed || !motherWeanDate) {
        return res.status(400).json({
          message: "For paregnant females, required fields: datemading, currentpregnancymonth, and motherweandate."
        });
      }
    }


    // Initialize parents array
    const parents = [];

    // Check if mother exists and add to parents array
    if (motherTag) {
      const mother = await Animal.findOne({ tagId: motherTag, gender: "Female" });
      if (!mother) {
        return res.status(400).json({ message: "Mother with provided tag ID not found or not female." });
      }
      parents.push({
        parentUniqueId: mother.uniqueId,
        parentType: "mother"
      });
    }

    // Check if father exists and add to parents array
    if (fatherTag) {
      const father = await Animal.findOne({ tagId: fatherTag, gender: "Male" });
      if (!father) {
        return res.status(400).json({ message: "Father with provided tag ID not found or not male." });
      }
      parents.push({
        parentUniqueId: father.uniqueId,
        parentType: "father"
      });
    }


    //  Create new Parent Animal
    const newParent = new Animal({
      uid,
      uniqueId,
      tagId,
      animalName,
      ageYear,
      ageMonth,
      height,
      weightKg,
      birthDate,
      motherTag,
      fatherTag,
      gender,
      birthType,
      birthWeight,
      mothersWeanDate,
      bodyScore,
      purchasDate,
      anyComment,
      dateMading: gender === "Female" && isPregnant ? dateMading : null,
      currentPregnancyMonth: gender === "Female" && isPregnant ? currentPregnancyMonth : null,
      failed: gender === "Female" && isPregnant ? failed : null,
      motherWeanDate: gender === "Female" && isPregnant ? motherWeanDate : null,
      otherDisease,
      vaccineDate,
      farmHouseName,
      parents: parents, // Add parents array to the animal record
      children: [] // Initialize empty children array
    });
    console.log('newParent: ', newParent);
    
    // Save the new Parent to the database
    await newParent.save();


    // Update parent records to include this animal as a child
    if (parents.length > 0) {
      for (const parent of parents) {
        await Animal.findOneAndUpdate(
          { uniqueId: parent.parentUniqueId },
          { $push: { children: newParent.uniqueId } }
        );
      }
    }


    // Send a success response
    res.status(201).json({
      message: "success",
      data: newParent,
    })

  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add animal unique entity.",
      error: error.message
    });
  };

});

// exports.animalDetail = asyncHandler(async (req, res) => {
// // Validate request body

// if (!req.body) {
//   return res.status(400).json({ message: "No data provided" });
// }
// try {
//   const {
//     uid,
//     animalName,
//     uniqueName,
//     ageMonth,
//     ageYear,
//     height,
//     // heightDate,
//     purchasDate,
//     gender,
//     weightKg,
//     weightGm,
//     pregnancyDetail,
//     maleDetail,
//     bodyScore,
//     anyComment,
//   } = req.body;

//   // Validate required fields
//   const requiredFields = { uid, uniqueName, gender };
//   for (const [key, value] of Object.entries(requiredFields)) {
//     if (!value) {
//       return res.status(400).json({ message: `${key} is a required field.` });
//     }
//   }

//   // Check if UID exists in User model
//   const existingUser = await User.findOne({ uid });
//   if (!existingUser) {
//     return res.status(400).json({ message: "UID does not exist." });
//   }

//   // Check uniqueName exists in User model
//   const existingAnimal = await Animal.findOne({ uniqueName });
//   if (existingAnimal) {
//     return res.status(400).json({ message: "Unique Name already exists." });
//   }

//   // Generate Parent Code
//   const parentCode = generateParentCode(animalName);

//   // Ensure unique parentCode by checking existing records
//   let counter = 1;
//   while (await Animal.findOne({ uniqueId: parentCode })) {
//     parentCode = `${generateParentCode(animalName)}-${counter++}`;
//     counter++;
//   }

//   // Generate UniqueId
//   const uniqueId = generateUniqueldId(animalName);

//   // Create new Parent Animal
//   const newParent = new Animal({
//     uid,
//     parentId: parentCode,
//     uniqueId,
//     animalName,
//     uniqueName,
//     ageMonth,
//     ageYear,
//     height,
//     // heightDate,
//     purchasDate,
//     gender,
//     weightKg,
//     weightGm,
//     pregnancyDetail,
//     maleDetail,
//     bodyScore,
//     anyComment,
//     children: [], // No children initially
//     milk: [],
//   });


//     // Save the new Parent to the database

//     await newParent.save();
//     // Send a success response

//     res.status(201).json({
//       message: "success",
//       data: newParent,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server Error. Failed to add parent animal.",
//       error: error.message,
//     });
//   }
// });

// Get all animal Data

exports.getAllParents = asyncHandler(async (req, res) => {
  try {
    const parents = await Animal.find({ uid }); // Get all parents from the database

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

// Get animal Data by UniqueId
exports.animalAllDetail = asyncHandler(async (req, res) => {
  // Validate request body

  if (!req.query) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { animalName, uid } = req.query;

    // // First, find the animal by uniqueId
    const animal = await Animal.find({ animalName , uid });
   

    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }


    const animals = await Animal.aggregate([
      {
        $match: { uid: uid }, // Find the parent by uniqueId
      },
      {
        $lookup: {
          from: "animals", // Collection name of ChildAnimal (check lowercase plural)
          localField: "children", // The _id field of Animal (parent)
          foreignField: "uid", // The parent field in ChildAnimal referencing Animal
          as: "childrenDetails",
        },
      },
    ]);

    // if (!animals || animals.length === 0) {
    //   return res.status(404).json({ message: "No parent found" });
    // }

    // Formatting response with full details
    const parentsData = animals.map((parent) => ({
      uniqueId: parent.uniqueId,
      tagId: parent.tagId,
      animalName: parent.animalName,
      ageYear: parent.ageYear,
      ageMonth: parent.ageMonth,
      height: parent.height,
      weightKg: parent.weightKg,
      birthDate: parent.birthDate,
      motherTag: parent.motherTag,
      fatherTag: parent.fatherTag,
      gender: parent.gender,
      birthType: parent.birthType,
      birthWeight: parent.birthWeight,
      mothersWeanDate: parent.mothersWeanDate,
      bodyScore: parent.bodyScore,
      purchasDate: parent.purchasDate,
      anyComment: parent.anyComment,
      dateMading: parent.dateMading,
      currentPregnancyMonth: parent.currentPregnancyMonth,
      failed: parent.failed,
      motherWeanDate: parent.motherWeanDate,
      otherDisease: parent.otherDisease,
      vaccineDate: parent.vaccineDate,
      farmName: parent.farmName,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      // Children
      children: (parent.childrenDetails || []).map((child) => ({
        uniqueId: child.uniqueId,
        tagId: child.tagId,
        animalName: child.animalName,
        ageYear: child.ageYear,
        ageMonth: child.ageMonth,
        height: child.height,
        weightKg: child.weightKg,
        birthDate: child.birthDate,
        motherTag: child.motherTag,
        fatherTag: child.fatherTag,
        gender: child.gender,
        birthType: child.birthType,
        birthWeight: child.birthWeight,
        mothersWeanDate: child.mothersWeanDate,
        bodyScore: child.bodyScore,
        purchasDate: child.purchasDate,
        anyComment: child.anyComment,
        dateMading: child.dateMading,
        currentPregnancyMonth: child.currentPregnancyMonth,
        failed: child.failed,
        motherWeanDate: child.motherWeanDate,
        otherDisease: child.otherDisease,
        vaccineDate: child.vaccineDate,
        farmName: child.farmName,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      })),

      // Post Wean
      postWean: (parent.postWean || []).map((postWean) => ({
        postWeanId: postWean._id,
        weightKg: postWean.weightKg,
        weightGm: postWean.weightGm,
        bodyScore: postWean.bodyScore,
        weanDate: postWean.weanDate,
        weanComment: postWean.weanComment,
      })),
      // milk
      milk: (parent.milk || []).map((milk) => ({
        milkId: milk._id,
        name: milk.name,
        milkVolume: milk.milkVolume,
        milkDate: milk.milkDate,
        createdAt: milk.createdAt,
        updatedAt: milk.updatedAt,
      })),
      // Vaccine
      vaccine: (parent.vaccine || []).map((vaccine) => ({
        vaccineId: vaccine._id,
        name: vaccine.name,
        date: vaccine.date,
        createdAt: vaccine.createdAt,
        updatedAt: vaccine.updatedAt,
      })),
      // Deworm
      deworm: (parent.deworm || []).map((deworm) => ({
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
    }
    ));


    res.status(200).json({
      animals: parentsData,
    });
  } catch (error) {
    console.error("Error fetching parent and child data:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Update animal
exports.updateAnimalParentDetail = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "No data provided" });
  }

  try {
    const { uniqueId } = req.params; // Extract uniqueId from URL params
    if (!uniqueId) {
      return res.status(400).json({ message: "UniqueId is required" });
    }

    const {
      ageMonth,
      ageYear,
      height,
      // heightDate,
      purchasDate,
      gender,
      weightKg,
      pregnancyDetail,
      // weightGm,
      // maleDetail,
      bodyScore,
      anyComment,
    } = req.body;

    const updatedFields = {
      ageMonth,
      ageYear,
      height,
      // heightDate,
      purchasDate,
      gender,
      weightKg,
      pregnancyDetail,
      // weightGm,
      // maleDetail,
      bodyScore,
      anyComment,
    };

    const updated = await Animal.findOneAndUpdate(
      { uniqueId: uniqueId }, // Ensure you pass uniqueId properly
      { $set: updatedFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "No parent found" });
    }

    res.status(200).json({
      message: "success",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete parent (if no children)

exports.deleteAnimalParent = asyncHandler(async (req, res) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({ message: "UniqueId is required" });
    }

    // Find the parent by uniqueId
    const parent = await Animal.findOne({ uniqueId });

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Check if the parent has children
    if (parent.children && parent.children.length > 0) {
      return res.status(400).json({
        message: "Cannot delete parent. It has child records associated.",
      });
    }


    // If no children exist, delete the parent
    await Animal.deleteOne({ uniqueId });

    res.status(200).json({ message: "Parent deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

const removeRelatedRecords = async (parent, model, fieldName) => {
  try {
    const uniqueId = parent?.uniqueId;

    if (parent[fieldName]) {
      parent[fieldName] = parent[fieldName].filter(
        (item) => item[fieldName] !== uniqueId
      );
      await parent.save();
    }
    await model.deleteMany({ [fieldName]: uniqueId });
  } catch (error) {
    console.error(`Error removing ${fieldName} records:`, error);
  }
};
