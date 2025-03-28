// Children Data structure
// POST rumeno/user/animaldata/child

const asyncHandler = require("express-async-handler");
const Animal = require("../../model/framData/parentFromModal");
const User = require("../../model/user/registerModel");
const ChildAnimal = require("../../model/framData/childFromModal");
const mongoose = require("mongoose");
const generateUniqueId = require("../../utils/uniqueId");
const generateParentCode = require("../../utils/parentCode");
const moment = require("moment");
const vaccineModal = require("../../model/framData/vaccineModal");
const postWeanModal = require("../../model/framData/postWeanModal");
const milkModall = require("../../model/framData/milkModall");
const dewormModal = require("../../model/framData/dewormModal");
const estrusHeatModal = require("../../model/framData/estrusHeatModal");
const sanitationModal = require("../../model/framData/sanitationModal");

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
      anyComment,
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

    // // Generate Parent Code
    // const parentCode = generateParentCode(animalName);

    // // Ensure unique parentCode by checking existing records
    // let counter = 1;
    // while (await ChildAnimal.findOne({ parentId: parentCode })) {
    //   parentCode = `${generateParentCode(animalName)}-${counter++}`;
    //   counter++;
    // }

    // Create the Child
    const newChild = await ChildAnimal.create({
      kidId,
      uniqueId,
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
      dobtype,
      dobweight,
      weanweight,
      castration,
      motherweandate,
      motherweandateweight,
      parent: parentExists._id,
      anyComment,
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
      anyComment,
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
          anyComment,
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

// Delete Child

// exports.deleteAnimalChildDetail = asyncHandler(async (req, res) => {

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
      sanitation: child.sanitation,
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

    // Create a helper function to filter records based on current month and ID
    const filterCurrentMonthRecords = (records, idField, dateField) => {
      const currentMonth = moment().format("YYYY-MM");
      return records.filter(
        (record) =>
          record[dateField] &&
          typeof record[dateField] === "string" &&
          record[dateField].startsWith(currentMonth)
      );
    };

    const categorizeAnimals = (details, records, idField, dateField) => {
      const currentMonth = moment().format("YYYY-MM");

      const vaccinated = details
        .filter((detail) =>
          records.some(
            (record) =>
              record[idField] === detail.uniqueId &&
              record[dateField] &&
              typeof record[dateField] === "string" &&
              record[dateField].startsWith(currentMonth)
          )
        )
        .map((item) => ({ ...item, status: "completed" }));

      const unvaccinated = details
        .filter(
          (detail) =>
            !records.some(
              (record) =>
                record[idField] === detail.uniqueId &&
                record[dateField] &&
                typeof record[dateField] === "string" &&
                record[dateField].startsWith(currentMonth)
            )
        )
        .map((item) => ({ ...item, status: "pending" }));

      return {
        vaccinated: {
          count: vaccinated.length,
          data: vaccinated,
        },
        unvaccinated: {
          count: unvaccinated.length,
          data: unvaccinated,
        },
      };
    };

    const parentFilter = { uid };
    if (animalName) parentFilter.animalName = animalName;

    const parentDetails = await Animal.find(
      parentFilter,
      "uid uniqueId parentId animalName"
    ).lean();

    const parentIds = parentDetails.map((parent) => parent.parentId);

    const childDetails = await ChildAnimal.find(
      { parentId: { $in: parentIds } },
      "uniqueId kidId parentId kidCode"
    ).lean();

    // Fetch all records with additional error handling
    const fetchRecordsWithSafety = async (modal, projection) => {
      try {
        return await modal.find({}, projection).lean();
      } catch (error) {
        console.error(`Error fetching records: ${error.message}`);
        return [];
      }
    };

    const allVaccines = await fetchRecordsWithSafety(
      vaccineModal,
      "vaccineId vaccineName vaccineDate uniqueId"
    );

    const allPostWean = await fetchRecordsWithSafety(
      postWeanModal,
      "postWeanId weanDate weightKg weightGm bodyScore weanComment"
    );

    const allMilk = await fetchRecordsWithSafety(
      milkModall,
      "milkId milkvolume numberKids milkDate uId"
    );

    const allDeworm = await fetchRecordsWithSafety(
      dewormModal,
      "dewormId report date endoName ectoName endoDate ectoDate endoType ectoType animalDate"
    );

    const allHeat = await fetchRecordsWithSafety(
      estrusHeatModal,
      "heatId heat heatDate heatResult breederName breedDate dueDate"
    );

    const allSanitation = await fetchRecordsWithSafety(
      sanitationModal,
      "sanitationId soilDate limesprinkleDate insecticideDate insecticide"
    );

    // Categorize animals for different records with additional safety checks
    const createSafeCategorization = (details, records, idField, dateField) => {
      try {
        return categorizeAnimals(details, records, idField, dateField);
      } catch (error) {
        console.error(`Error categorizing ${idField}: ${error.message}`);
        return {
          vaccinated: { count: 0, data: [] },
          unvaccinated: { count: details.length, data: details },
        };
      }
    };

    const vaccines = {
      parents: createSafeCategorization(
        parentDetails,
        allVaccines,
        "vaccineId",
        "vaccineDate"
      ),
      children: createSafeCategorization(
        childDetails,
        allVaccines,
        "vaccineId",
        "vaccineDate"
      ),
    };

    const postWean = {
      parents: createSafeCategorization(
        parentDetails,
        allPostWean,
        "postWeanId",
        "weanDate"
      ),
      children: createSafeCategorization(
        childDetails,
        allPostWean,
        "postWeanId",
        "weanDate"
      ),
    };

    const milk = {
      parents: createSafeCategorization(
        parentDetails,
        allMilk,
        "milkId",
        "milkDate"
      ),
      children: createSafeCategorization(
        childDetails,
        allMilk,
        "milkId",
        "milkDate"
      ),
    };

    const deworm = {
      parents: createSafeCategorization(
        parentDetails,
        allDeworm,
        "dewormId",
        "date"
      ),
      children: createSafeCategorization(
        childDetails,
        allDeworm,
        "dewormId",
        "date"
      ),
    };

    const heat = {
      parents: createSafeCategorization(
        parentDetails,
        allHeat,
        "heatId",
        "heatDate"
      ),
      children: createSafeCategorization(
        childDetails,
        allHeat,
        "heatId",
        "heatDate"
      ),
    };

    const sanitation = {
      parents: createSafeCategorization(
        parentDetails,
        allSanitation,
        "sanitationId",
        "soilDate"
      ),
      children: createSafeCategorization(
        childDetails,
        allSanitation,
        "sanitationId",
        "soilDate"
      ),
    };

    res.json({
      TotalAnimals: parentDetails.length + childDetails.length,
      TotalParents: parentDetails.length,
      TotalChildren: childDetails.length,

      VaccineCount:
        vaccines.parents.unvaccinated.count +
        vaccines.children.unvaccinated.count,
      VaccineData: [
        ...vaccines.parents.unvaccinated.data,
        ...vaccines.children.unvaccinated.data,
      ],

      PostWeanCount:
        postWean.parents.unvaccinated.count +
        postWean.children.unvaccinated.count,
      PostWeanData: [
        ...postWean.parents.unvaccinated.data,
        ...postWean.children.unvaccinated.data,
      ],

      MilkCount:
        milk.parents.unvaccinated.count + milk.children.unvaccinated.count,
      MilkData: [
        ...milk.parents.unvaccinated.data,
        ...milk.children.unvaccinated.data,
      ],

      HeatCount:
        heat.parents.unvaccinated.count + heat.children.unvaccinated.count,
      HeatData: [
        ...heat.parents.unvaccinated.data,
        ...heat.children.unvaccinated.data,
      ],

      DewormCount:
        deworm.parents.unvaccinated.count + deworm.children.unvaccinated.count,
      DewormData: [
        ...deworm.parents.unvaccinated.data,
        ...deworm.children.unvaccinated.data,
      ],

      SanitationCount:
        sanitation.parents.unvaccinated.count +
        sanitation.children.unvaccinated.count,
      SanitationData: [
        ...sanitation.parents.unvaccinated.data,
        ...sanitation.children.unvaccinated.data,
      ],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.deleteChildAnimal = asyncHandler(async (req, res) => {
  try {
    const { uniqueId } = req.params;
    if (!uniqueId) {
      return res.status(400).json({ message: "UniqueId is required" });
    }

    const child = await ChildAnimal.findOne({ uniqueId });
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    await removeChildFromParent(child.parentId, child.kidId);

    const relatedRecords = [
      { model: milkModall, field: "milkId" },
      { model: postWeanModal, field: "postWeanId" },
      { model: vaccineModal, field: "vaccineId" },
      { model: estrusHeatModal, field: "heatId" },
      { model: sanitationModal, field: "sanitationId" },
      { model: dewormModal, field: "dewormId" },
    ];

    await Promise.all(
      relatedRecords.map(({ model, field }) =>
        removeRelatedRecords(child, model, field)
      )
    );

    await ChildAnimal.deleteOne({ uniqueId });

    res.status(200).json({
      message: "Child deleted successfully along with related records",
    });
  } catch (error) {
    console.error("Error deleting child animal:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

const removeRelatedRecords = async (child, model, fieldName) => {
  try {
    const uniqueId = child.uniqueId;

    if (child[fieldName]) {
      child[fieldName] = child[fieldName].filter(
        (item) => item[fieldName] !== uniqueId
      );
      await child.save();
    }
    await model.deleteMany({ [fieldName]: uniqueId });
  } catch (error) {
    console.error(`Error removing ${fieldName} records:`, error);
  }
};

const removeChildFromParent = async (parentId, kidId) => {
  try {
    if (!parentId) return;

    const parent = await Animal.findOne({ parentId });
    if (parent) {
      parent.children = parent.children.filter((id) => id !== kidId);
      await parent.save();
    }
  } catch (error) {
    console.error("Error removing child from parent:", error);
  }
};
