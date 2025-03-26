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
      kidage,
      heightft,
      kidweight,
      motherage,
      breed,
      dob,
      gender,
      kidcode,
      kidscore,
      dobtype,
      dobweight,
      weanweight,
      castration,
      motherweandate,
      motherweandateweight,
      comment,
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
    // Create the Child
    const newChild = await ChildAnimal.create({
      kidId,
      uniqueId,
      parentId,
      kidage,
      heightft,
      kidweight,
      motherage,
      breed,
      dob,
      gender,
      kidcode,
      kidscore,
      dobtype,
      dobweight,
      weanweight,
      castration,
      motherweandate,
      motherweandateweight,
      parent: parentExists._id,
    });

    console.log(newChild);

    console.log("Hello world");
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
      kidage,
      kidweight,
      motherage,
      breed,
      dob,
      gender,
      kidcode,
      kidscore,
      dobType,
      dobweight,
      weanWeight,
      castration,
      motherweandate,
      motherweandateweight,
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
          kidId,
          parentId,
          kiduniqueName,
          kidage,
          kidweight,
          motherage,
          breed,
          dob,
          gender,
          kidcode,
          kidscore,
          dobType,
          dobweight,
          weanWeight,
          castration,
          motherweandate,
          motherweandateweight,
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
      uniqueName: child.kiduniqueName,
      parentId: `P${child.uniqueId}`,
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

    // Create a helper function to categorize animals
    const categorizeAnimals = (details, records, idField, dateField) => {
      const currentMonth = moment().format("YYYY-MM");

      const vaccinated = details.filter((detail) =>
        records.some(
          (record) =>
            record[idField] === detail.uniqueId &&
            record[dateField] &&
            typeof record[dateField] === "string" &&
            record[dateField].startsWith(currentMonth)
        )
      );

      const unvaccinated = details.filter(
        (detail) =>
          !records.some(
            (record) =>
              record[idField] === detail.uniqueId &&
              record[dateField] &&
              typeof record[dateField] === "string" &&
              record[dateField].startsWith(currentMonth)
          )
      );

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
      "uniqueId parentId animalName"
    ).lean();

    const parentIds = parentDetails.map((parent) => parent.parentId);

    const childDetails = await ChildAnimal.find(
      { parentId: { $in: parentIds } },
      "kidId parentId kidCode"
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
      totalAnimals: parentDetails.length + childDetails.length,
      totalParents: parentDetails.length,
      totalChildren: childDetails.length,
      totalVaccines: allVaccines.length,
      totalPostWeans: allPostWean.length,

      vaccinatedParents: vaccines.parents.vaccinated,
      vaccinatedChildren: vaccines.children.vaccinated,
      unvaccinatedParents: vaccines.parents.unvaccinated,
      unvaccinatedChildren: vaccines.children.unvaccinated,

      weanedParents: postWean.parents.vaccinated,
      weanedChildren: postWean.children.vaccinated,
      unweanedParents: postWean.parents.unvaccinated,
      unweanedChildren: postWean.children.unvaccinated,

      milkParents: milk.parents.vaccinated,
      milkChildren: milk.children.vaccinated,
      unMilkParents: milk.parents.unvaccinated,
      unMilkChildren: milk.children.unvaccinated,

      heatParents: heat.parents.vaccinated,
      heatChildren: heat.children.vaccinated,
      unHeatParents: heat.parents.unvaccinated,
      unHeatChildren: heat.children.unvaccinated,

      dewormParents: deworm.parents.vaccinated,
      dewormChildren: deworm.children.vaccinated,
      unDewormParents: deworm.parents.unvaccinated,
      unDewormChildren: deworm.children.unvaccinated,

      sanitationParents: sanitation.parents.vaccinated,
      sanitationChildren: sanitation.children.vaccinated,
      unSanitationParents: sanitation.parents.unvaccinated,
      unSanitationChildren: sanitation.children.unvaccinated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// exports.getTotalCount = asyncHandler(async (req, res) => {
//   try {
//     const { animalName, uid } = req.query;

//     if (!uid) {
//       return res.status(400).json({ error: "UID is required" });
//     }

//     const parentFilter = { uid };
//     if (animalName) parentFilter.animalName = animalName;

//     const parentDetails = await Animal.find(
//       parentFilter,
//       "uniqueId parentId animalName"
//     ).lean();

//     const parentIds = parentDetails.map((parent) => parent.parentId);

//     const childDetails = await ChildAnimal.find(
//       { parentId: { $in: parentIds } },
//       "kidId parentId kidCode"
//     ).lean();

//     const allVaccines = await vaccineModal
//       .find({}, "vaccineId vaccineName vaccineDate uniqueId")
//       .lean();

//     // Get current month in "YYYY-MM" format
//     const currentMonth = moment().format("YYYY-MM");

//     // Parent vaccinated animals (data)
//     const parentVaccinated = parentDetails.filter((parent) =>
//       allVaccines.some(
//         (v) =>
//           v.vaccineId === parent.uniqueId &&
//           v.vaccineDate.startsWith(currentMonth)
//       )
//     );

//     // Child vaccinated animals (data)
//     const childVaccinated = childDetails.filter((child) =>
//       allVaccines.some(
//         (v) =>
//           v.vaccineId === child.kidId && v.vaccineDate.startsWith(currentMonth)
//       )
//     );

//     // Parent unvaccinated animals (data)
//     const parentUnvaccinated = parentDetails.filter((parent) =>
//       allVaccines.some(
//         (v) =>
//           v.vaccineId === parent.uniqueId &&
//           v.vaccineDate.startsWith(currentMonth)
//       )
//     );

//     // Child unvaccinated animals (data)
//     const childUnvaccinated = childDetails.filter((child) =>
//       allVaccines.some(
//         (v) =>
//           v.vaccineId === child.kidId && v.vaccineDate.startsWith(currentMonth)
//       )
//     );

//     // Postwean start

//     // Fetch all post-wean records
//     const allPostWean = await postWeanModal
//       .find({}, "postWeanId weanDate weightKg weightGm bodyScore weanComment")
//       .lean();

//     // Parent weaned animals
//     const parentWeaned = parentDetails.filter((parent) =>
//       allPostWean.some(
//         (w) =>
//           w.postWeanId === parent.uniqueId &&
//           w.weanDate.startsWith(currentMonth)
//       )
//     );

//     // Child weaned animals
//     const childWeaned = childDetails.filter((child) =>
//       allPostWean.some(
//         (w) =>
//           w.postWeanId === child.kidId && w.weanDate.startsWith(currentMonth)
//       )
//     );

//     // Parent unweaned animals
//     const parentUnweaned = parentDetails.filter(
//       (parent) =>
//         !allPostWean.some(
//           (w) =>
//             w.postWeanId === parent.uniqueId &&
//             w.weanDate.startsWith(currentMonth)
//         )
//     );

//     // Child unweaned animals
//     const childUnweaned = childDetails.filter(
//       (child) =>
//         !allPostWean.some(
//           (w) =>
//             w.postWeanId === child.kidId && w.weanDate.startsWith(currentMonth)
//         )
//     );

//     // Postwean end

//     // milk start

//     // Fetch all milk records
//     const allMilk = await milkModall
//       .find({}, "milkId milkvolume numberKids milkDate uId")
//       .lean();

//     // Parent Milk animals
//     const parentMilk = parentDetails.filter((parent) =>
//       allMilk.some(
//         (m) =>
//           m.milkId === parent.uniqueId && m.milkDate.startsWith(currentMonth)
//       )
//     );

//     // Child Milk animals
//     const childMilk = childDetails.filter((child) =>
//       allMilk.some(
//         (m) => m.milkId === child.kidId && m.milkDate.startsWith(currentMonth)
//       )
//     );

//     // Parent unMilk animals
//     const parentUnMilk = parentDetails.filter(
//       (parent) =>
//         !allMilk.some(
//           (m) =>
//             m.milkId === parent.uniqueId && m.milkDate.startsWith(currentMonth)
//         )
//     );

//     // Child unMilk animals
//     const childUnMilk = childDetails.filter(
//       (child) =>
//         !allMilk.some(
//           (m) => m.milkId === child.kidId && m.milkDate.startsWith(currentMonth)
//         )
//     );

//     // milk end

//     // deworm start

//     // Fetch all deworm records
//     const alldDeworm = await dewormModal
//       .find(
//         {},
//         "dewormId report date endoName ectoName endoDate ectoDate endoType ectoType animalDate"
//       )
//       .lean();

//     // Parent deworm animals
//     const parentDeworm = parentDetails.filter((parent) =>
//       alldDeworm.some(
//         (d) => d.dewormId === parent.uniqueId && d.date.startsWith(currentMonth)
//       )
//     );

//     // Child deworm animals
//     const childDeworm = childDetails.filter((child) =>
//       alldDeworm.some(
//         (d) => d.dewormId === child.kidId && d.date.startsWith(currentMonth)
//       )
//     );

//     // Parent unDeworm animals
//     const parentUnDeworm = parentDetails.filter(
//       (parent) =>
//         !alldDeworm.some(
//           (d) =>
//             d.dewormId === parent.uniqueId && d.date.startsWith(currentMonth)
//         )
//     );

//     // Child unDeworm animals
//     const childUnDeworm = childDetails.filter(
//       (child) =>
//         !alldDeworm.some(
//           (d) => d.dewormId === child.kidId && d.date.startsWith(currentMonth)
//         )
//     );

//     // deworm end

//     // Heat start

//     // Fetch all Heat records
//     const alldHeat = await estrusHeatModal
//       .find({}, "heatId heat heatDate heatResult breederName breedDate dueDate")
//       .lean();

//     // Parent Heat animals
//     const parentHeat = parentDetails.filter((parent) =>
//       alldHeat.some(
//         (h) =>
//           h.heatId === parent.uniqueId && h.heatDate.startsWith(currentMonth)
//       )
//     );

//     // Child Heat animals
//     const childHeat = childDetails.filter((child) =>
//       alldHeat.some(
//         (h) => h.heatId === child.kidId && h.heatDate.startsWith(currentMonth)
//       )
//     );

//     // Parent unHeat animals
//     const parentUnHeat = parentDetails.filter(
//       (parent) =>
//         !alldHeat.some(
//           (h) =>
//             h.heatId === parent.uniqueId && h.heatDate.startsWith(currentMonth)
//         )
//     );

//     // Child unHeat animals
//     const childUnHeat = childDetails.filter(
//       (child) =>
//         !alldHeat.some(
//           (h) => h.heatId === child.kidId && h.heatDate.startsWith(currentMonth)
//         )
//     );

//     // Heat end

//     // Sanitation start

//     // Fetch all Sanitation records
//     const alldSanitation = await sanitationModal
//       .find(
//         {},
//         "sanitationId soilDate limesprinkleDate insecticideDate insecticide"
//       )
//       .lean();

//     // Parent Sanitation animals
//     const parentSanitation = parentDetails.filter((parent) =>
//       alldSanitation.some(
//         (s) =>
//           s.sanitationId === parent.uniqueId &&
//           s.soilDate.startsWith(currentMonth)
//       )
//     );

//     // Child Sanitation animals
//     const childSanitation = childDetails.filter((child) =>
//       alldSanitation.some(
//         (s) =>
//           s.sanitationId === child.kidId && s.soilDate.startsWith(currentMonth)
//       )
//     );

//     // Parent unSanitation animals
//     const parentUnSanitation = parentDetails.filter(
//       (parent) =>
//         !alldSanitation.some(
//           (s) =>
//             s.sanitationId === parent.uniqueId &&
//             s.soilDate.startsWith(currentMonth)
//         )
//     );

//     // Child unSanitation animals
//     const childUnSanitation = childDetails.filter(
//       (child) =>
//         !alldSanitation.some(
//           (s) =>
//             s.sanitationId === child.kidId &&
//             s.soilDate.startsWith(currentMonth)
//         )
//     );

//     // Heat end

//     res.json({
//       totalAnimals: parentDetails.length + childDetails.length,
//       totalParents: parentDetails.length,
//       totalChildren: childDetails.length,
//       totalVaccines: allVaccines.length,
//       totalPostWeans: allPostWean.length,

//       vaccinatedParents: {
//         count: parentVaccinated.length,
//         data: parentVaccinated,
//       },
//       vaccinatedChildren: {
//         count: childVaccinated.length,
//         data: childVaccinated,
//       },
//       unvaccinatedParents: {
//         count: parentUnvaccinated.length,
//         data: parentUnvaccinated,
//       },
//       unvaccinatedChildren: {
//         count: childUnvaccinated.length,
//         data: childUnvaccinated,
//       },
//       // ---
//       weanedParents: {
//         count: parentWeaned.length,
//         data: parentWeaned,
//       },
//       weanedChildren: {
//         count: childWeaned.length,
//         data: childWeaned,
//       },

//       unweanedParents: {
//         count: parentUnweaned.length,
//         data: parentUnweaned,
//       },
//       unweanedChildren: {
//         count: childUnweaned.length,
//         data: childUnweaned,
//       },
//       // ---
//       milkParents: {
//         count: parentMilk.length,
//         data: parentMilk,
//       },
//       milkChildren: {
//         count: childMilk.length,
//         data: childMilk,
//       },
//       unMilkParents: {
//         count: parentUnMilk.length,
//         data: parentUnMilk,
//       },
//       unMilkChildren: {
//         count: childUnMilk.length,
//         data: childUnMilk,
//       },
//       // ----
//       heatParents: {
//         count: parentHeat.length,
//         data: parentHeat,
//       },
//       heatChildren: {
//         count: childHeat.length,
//         data: childHeat,
//       },
//       unHeatParents: {
//         count: parentUnHeat.length,
//         data: parentUnHeat,
//       },
//       unHeatChildren: {
//         count: childUnHeat.length,
//         data: childUnHeat,
//       },
//       // -----
//       dewormParents: {
//         count: parentDeworm.length,
//         data: parentDeworm,
//       },
//       dewormChildren: {
//         count: childDeworm.length,
//         data: childDeworm,
//       },
//       unDewormParents: {
//         count: parentUnDeworm.length,
//         data: parentUnDeworm,
//       },
//       unDewormChildren: {
//         count: childUnDeworm.length,
//         data: childUnDeworm,
//       },

//       //------

//       sanitationParents: {
//         count: parentSanitation.length,
//         data: parentSanitation,
//       },
//       sanitationChildren: {
//         count: childSanitation.length,
//         data: childSanitation,
//       },
//       unSanitationParents: {
//         count: parentUnSanitation.length,
//         data: parentUnSanitation,
//       },
//       unSanitationChildren: {
//         count: childUnSanitation.length,
//         data: childUnSanitation,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
