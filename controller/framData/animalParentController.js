// Animals Parent Controller
// POST /rumeno/user/animaldata/parent

const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const generateUniqueFarmId = require("../../utils/uniqueId");
// const milkModall = require("../../model/framData/milkModall");
// const postWeanModal = require("../../model/framData/postWeanModal");
const vaccineModal = require("../../model/framData/vaccineModal");
// const estrusHeatModal = require("../../model/framData/estrusHeatModal");
// const sanitationModal = require("../../model/framData/sanitationModal");
// const dewormModal = require("../../model/framData/dewormModal");

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
      purchaseDate,
      comments,
      dateMading,
      currentPregnancyMonth,
      failed,
      motherWeanDate,
      otherDisease,
      vaccineDate,
      vaccineName,
      farmHouseName,
      isPregnant,
      lastVaccineDate,
      lastVaccineName,
      isVaccine,
      animalValidation
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


    // Check if Tag ID exists or not
    const existID = await Animal.findOne({ tagId, uid });

    if (existID) {
      return res.status(400).json({ message: "Tag ID already exists" });
    }

    // Check if gender is female and handle pregnancy-related fields
    if (gender === "Female" && isPregnant) {
      if (!dateMading || !currentPregnancyMonth || !failed || !motherWeanDate) {
        return res.status(400).json({
          message:
            "For paregnant females, required fields: datemading, currentpregnancymonth, and motherweandate.",
        });
      }
    }

    // Initialize parents array
    const parents = [];

    // Check if mother exists and add to parents array
    if (motherTag) {
      const mother = await Animal.findOne({
        tagId: motherTag,
        gender: "Female",
      });
      if (!mother) {
        return res.status(400).json({
          message: "Mother with provided tag ID not found or not female.",
        });
      }
      parents.push({
        parentUniqueId: mother.uniqueId,
        parentType: "mother",
      });
    }

    // Check if father exists and add to parents array
    if (fatherTag) {
      const father = await Animal.findOne({ tagId: fatherTag, gender: "Male" });
      if (!father) {
        return res.status(400).json({
          message: "Father with provided tag ID not found or not male.",
        });
      }
      parents.push({
        parentUniqueId: father.uniqueId,
        parentType: "father",
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
      purchaseDate,
      comments,
      dateMading: gender === "Female" && isPregnant ? dateMading : null,
      currentPregnancyMonth: gender === "Female" && isPregnant ? currentPregnancyMonth : null,
      failed: gender === "Female" && isPregnant ? failed : null,
      motherWeanDate: gender === "Female" && isPregnant ? motherWeanDate : null,
      otherDisease,
      vaccineName,
      vaccineDate,
      farmHouseName,
      isPregnant: gender === "Female" ? isPregnant : false,
      lastVaccineDate,
      lastVaccineName,
      parents: parents, // Add parents array to the animal record
      children: [], // Initialize empty children array
      isVaccine,
      animalValidation
    });

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
    await createVaccineRecord("add", req.body,newParent);
    // Send a success response
    res.status(200).json({
      message: "Animal added successfully",
      data: newParent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to add animal .",
      error: error.message,
    });
  }
});



// Get all animal Data

exports.getAllParents = asyncHandler(async (req, res) => {
  try {
    const animals = await Animal.find({}); // Get all parents from the database

    res.json({
      message: "All animals fetched successfully",
      data: animals,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Failed to fetch animals.",
      error: error.message,
    });
  }
});

// Get animal Data by uId
exports.animalAllDetail = asyncHandler(async (req, res) => {
  // Validate request body

  if (!req.query) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    const { animalName, uid } = req.query;

    // // First, find the animal by uniqueId
    const animal = await Animal.find({ animalName, uid });

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
      purchaseDate: parent.purchaseDate,
      comments: parent.comments,
      dateMading: parent.dateMading,
      currentPregnancyMonth: parent.currentPregnancyMonth,
      failed: parent.failed,
      motherWeanDate: parent.motherWeanDate,
      otherDisease: parent.otherDisease,
      vaccineDate: parent.vaccineDate,
      vaccineName: parent.vaccineName,
      lastVaccineDate: parent.lastVaccineDate,
      lastVaccineName: parent.lastVaccineName,
      farmName: parent.farmName,
      animalValidation: parent.animalValidation,
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
        purchaseDate: child.purchaseDate,
        comments: child.comments,
        dateMading: child.dateMading,
        currentPregnancyMonth: child.currentPregnancyMonth,
        failed: child.failed,
        motherWeanDate: child.motherWeanDate,
        otherDisease: child.otherDisease,
        vaccineDate: child.vaccineDate,
        vaccineName: child.vaccineName,
        farmName: child.farmName,
        animalValidation: child.animalValidation,
        lastVaccineDate: child.lastVaccineDate,
        lastVaccineName: child.lastVaccineName,
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
    }));

    res.status(200).json({
      animals: parentsData,
    });
  } catch (error) {
    console.error("Error fetching animal data:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



// Get animal by gender
exports.getTagIdsByGender = async (req, res) => {
  try {
    const { animalName, uid } = req.query;
    const animals = await Animal.find({ animalName, uid }, "tagId gender");

    const maleTagIds = animals
      .filter((a) => a.gender?.toLowerCase() === "male")
      .map((a) => a.tagId);

    const femaleTagIds = animals
      .filter((a) => a.gender?.toLowerCase() === "female")
      .map((a) => a.tagId);

    res.status(200).json({
      maleTagIds,
      femaleTagIds,
    });
  } catch (error) {
    console.error("Error fetching tag IDs by gender:", error);
    res.status(500).json({ message: "Server error" });
  }
};




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
      purchaseDate,
      comments,
      dateMading,
      currentPregnancyMonth,
      failed,
      motherWeanDate,
      otherDisease,
      vaccineName,
      vaccineDate,
      lastVaccineDate,
      lastVaccineName,
      farmHouseName,
      isVaccine
    } = req.body;

    const updatedFields = {
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
      purchaseDate,
      comments,
      dateMading,
      currentPregnancyMonth,
      failed,
      motherWeanDate,
      otherDisease,
      vaccineDate,
      vaccineName,
      lastVaccineDate,
      lastVaccineName,
      farmHouseName,
      isVaccine
    };
    const updated = await Animal.findOneAndUpdate(
      { uniqueId: uniqueId }, // Ensure you pass uniqueId properly
      { $set: updatedFields },
      { new: true }
    );
    console.log(updated)

    if (!updated) {
      return res.status(404).json({ message: "No animal found" });
    }
    await createVaccineRecord("edit", req.body, updated);

    res.status(200).json({
      message: "success",
      data: updated,
    });
  } catch (error) {
    console.log("error: ", error);
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

const createVaccineRecord = async (type, data, update) => {
  console.log("data:--------------------- ", data);
  try {
    if (!data?.uid || !update?.uniqueId) {
      throw new Error("UID and unique ID are required");
    }

    const vaccineId = `VAC-${data.uid}-${data.birthDate || data.purchaseDate}`;

    if (type === "add") {
      await vaccineModal.create({
        uid: data.uid,
        animalUniqueId: update.uniqueId,
        dateOfBirth: data.birthDate,
        purchaseDate: data.purchaseDate,
        vaccineId,
      });
    } else if (type === "edit") {
      await vaccineModal.findOneAndUpdate(
        { animalUniqueId: update.uniqueId },
        {
          $set: {
            dateOfBirth: data.birthDate,
            purchaseDate: data.purchaseDate,
            vaccineId,
          },
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// const vaccineData = [];
// const boosterData = [];

// // Process each vaccine
// vaccines.forEach((vaccine) => {
//   if (vaccine.vaccineName && vaccine.vaccineDate) {
//     vaccineData.push([vaccine.vaccineName, vaccine.vaccineDate]);
//   }

//   if (vaccine.boosterName && vaccine.boosterDate) {
//     boosterData.push([vaccine.boosterName, vaccine.boosterDate]);
//   }
// });
