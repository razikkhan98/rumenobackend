const express = require("express");
const router = express.Router();

// Token for routes
const { validateToken } = require("../../middlewares/validateTokenHandler");

// Controllers
const framDetailController = require("../../controller/user/framDetailController");
const animalParentController = require("../../controller/framData/animalParentController");
const animalchildController = require("../../controller/framData/animalchildController");
const milkController = require("../../controller/framData/milkController");
const postweanController = require("../../controller/framData/postweanControlle");
const vaccineController = require("../../controller/framData/vaccineController");
const dewormController = require("../../controller/framData/dewormController");
const estrusHeatController = require("../../controller/framData/estrusHeatController");
const sanitationController = require("../../controller/framData/sanitationController");
const transferAnimalController = require("../../controller/framData/transferAnimalController");

// Farm Detail
router.post("/user/farmdata", framDetailController.farmDetail);

// ===============
// New Entity
// ===============

// Add unique Entity
router.post("/user/animaldata/newEntity", animalParentController.animalDetail);
// router.get(
//   "/user/animaldata/newEntity/getAll",
//   animalParentController.getAllParents
// );

// Get only single Entity
router.get(
  "/user/animaldata/newEntity/getAllById",
  animalParentController.animalAllDetail
);

// Get all new Entity
router.get(
  "/user/animaldata/newEntity/getAllAnimal",
  animalParentController.getAllParents
);

// // Get only single
// router.get(
//   "/user/animaldata/newEntity/getAll/:uniqueId",
//   animalParentController.animalAllDetail
// );

// Update new entity
router.put(
  "/user/animaldata/newEntity/update/:uniqueId",
  animalParentController.updateAnimalParentDetail
);

// Delete parent (if no children)
router.delete(
  "/user/animaldata/newEntity/delete/:uniqueId",
  animalParentController.deleteAnimalParent
);

// transfer Animals
router.post(
  "/user/animaldata/transferAnimal",
  transferAnimalController.transferAnimal
);

router.get(
  "/user/animaldata/getAllTransferAnimal",
  transferAnimalController.getAllTransferAnimal
);

router.get(
  "/user/animaldata/getAllTransferAnimal/:uid",
  transferAnimalController.getTransferAnimalByUniqueId
);

// // Add Child
// router.post("/user/animaldata/child", animalchildController.animalChildDetail);

// // Update Child
// router.put(
//   "/user/animaldata/child/update/:uniqueId",
//   animalchildController.updateAnimalChildDetail
// );

// // Delete Child

// router.delete(
//   "/user/animaldata/child/delete/:uniqueId",
//   animalchildController.deleteChildAnimal
// );

// // ===============

// // Get only single Child

// router.get(
//   "/user/animaldata/child/getAll/:uniqueId",
//   animalchildController.getAnimalChildDetail
// );

// // Get all Child
// router.get(
//   "/user/animaldata/child/getAll",
//   animalchildController.getAllChildren
// );

// // Promote Child to Parent
// router.post(
//   "/user/animaldata/child/:childId",
//   animalchildController.promoteChildToParent
// );



// Post Wean
// ============

// // Add Post Wean Parent and Child
// router.post("/user/animal/postweandata/add", postweanController.createPostWean);

// // Update Post Wean Parent and Child
// router.put(
//   "/user/animal/postweandata/update/:postWeanId",
//   postweanController.updatePostWean
// );

// // Delete Post Wean Parent and Child
// router.delete(
//   "/user/animal/postweandata/delete/:postWeanId",
//   postweanController.deletePostWean
// );

// =============
//  Milk Routes
// =============

// // Add Milk Parent and Child
// router.post("/user/animal/milkdata/add", milkController.addMilk);

// // Update Milk Parent and Child
// router.put("/user/animal/milkdata/update/:milkId", milkController.updateMilk);

// // Delete Milk Parent and Child
// router.delete(
//   "/user/animal/milkdata/delete/:milkId",
//   milkController.deleteMilk
// );

// ===========
// Vaccine Routes
// ===========
// -----------------------------------------------------------------------------------------------
// Add Vaccine Parent and Child
router.post("/user/animal/vaccinedata/add", vaccineController.addVaccine);

// Check Reminders Vaccine
router.get(
  "/user/animal/check-reminders/:userId",
  vaccineController.checkReminders
);
// -----------------------------------------------------------------------------------------------

// // Update Vaccine Parent and Child
// router.put(
//   "/user/animal/vaccinedata/update/:vaccine",
//   vaccineController.updateVaccine
// );

// // Delete Vaccine Parent and Child
// router.delete(
//   "/user/animal/vaccinedata/delete/:vaccineId",
//   vaccineController.deleteVaccine
// );



// =============
// Estrus Heat
// =============

// // Add Estrus Heat Parent and Child
// router.post("/user/animal/estrusdata/add", estrusHeatController.addEstrusHeat);

// // Update Estrus Heat Parent and Child
// router.put(
//   "/user/animal/estrusdata/update/:heatId",
//   estrusHeatController.updateEstrusHeat
// );

// // Delete Estrus Heat Parent and Child
// router.delete(
//   "/user/animal/estrusdata/delete/:heatId",
//   estrusHeatController.deleteEstrusHeat
// );

// =============
// Sanitation Routes
// =============

// Add Sanitation Parent and Child
router.post(
  "/user/animal/sanitationdata/add",
  sanitationController.addSanitation
);

// Update Sanitation Parent and Child

router.put(
  "/user/animal/sanitationdata/update/:sanitationId",
  sanitationController.updateSanitation
);

// Delete Sanitation Parent and Child
router.delete(
  "/user/animal/sanitationdata/delete/:sanitationId",
  sanitationController.deleteSanitation
);

//  getTotalCount
// router.get(
//   "/user/animaldata/parentchild/getAllCount",
//   animalchildController.getTotalCount
// );

router.get(
  "/user/animaldata/parentchild/getAllCount",
  animalchildController.getTotalCount
);

// ------------------------------------------------------------------------------------------
/**
 * @route POST /api/vaccines/register-animal
 * @desc Register a new animal and set up its vaccination schedule
 * @access Private
 */
router.post(
  "/vaccine/register-animal-vaccine",
  vaccineController.registerAnimal
);

/**
 * @route POST /api/vaccines
 * @desc Add a new vaccine record
 * @access Private
 */
router.post("/vaccine/add-vaccine", vaccineController.addVaccine);

/**
 * @route PUT /vaccines/:vaccineId/complete
 * @desc Mark a vaccine as completed (administered)
 * @access Private
 */
router.put("/vaccine/:vaccineId/complete", vaccineController.completeVaccine);

/**
 * @route PUT /api/vaccines/:vaccineId/pause
 * @desc Pause reminders for a specific vaccine
 * @access Private
 */
router.put("/vaccine/:vaccineId/pause", vaccineController.pauseReminders);

/**
 * @route GET /api/vaccines/reminders/:userId
 * @desc Check and process vaccine reminders for a user
 * @access Private
 */
router.get("/vaccine/reminders/:userId", vaccineController.checkReminders);

// /**
//  * @route GET /api/vaccines/animal/:tagId
//  * @desc Get all vaccine records for a specific animal
//  * @access Private
//  */
// router.get("/animal/:tagId", vaccineController.getAnimalVaccines);

/**
 * @route GET  /api/vaccines/animal/:uid
 * @desc Get all vaccine records
 * @access Private
 */
router.get("/vaccine/get-all-vaccine", vaccineController.getAllVaccine);


/**
 * @route GET /api/vaccines/due/:userId
 * @desc Get all due vaccines for a user
 * @access Private
 */
// router.get("/due/:userId", vaccineController.getDueVaccines);

/**
 * @route GET /api/vaccines/overdue/:userId
 * @desc Get all overdue vaccines for a user
 * @access Private
 */
// router.get("/overdue/:userId", vaccineController.getOverdueVaccines);

// ------------------------------- Postwean route start -------------------------------------

/**
 * @route POST /postweans
 * @desc Create a new PostWean record
 * @access Private
 */
router.post("/post-wean/post-wean-add", postweanController.createPostWean);

/**
 * @route GET /postweans
 * @desc Get all PostWean records
 * @access Private
 */
router.get("/post-wean/get-all-post-wean", postweanController.getAllPostWeans);

/**
 * @route GET /postweans/:id
 * @desc Get a single PostWean record by ID
 * @access Private
 */
router.get(
  "/post-wean/get-post-wean-by-id/:id",
  postweanController.getPostWeanById
);

/**
 * @route PUT /postweans/:id
 * @desc Update a PostWean record by ID
 * @access Private
 */
router.put(
  "/post-wean/update-post-wean-by-id/:id",
  postweanController.updatePostWean
);

/**
 * @route DELETE /postweans/:id
 * @desc Delete a PostWean record by ID
 * @access Private
 */
router.delete(
  "/post-wean/delete-post-wean-by-id/:id",
  postweanController.deletePostWean
);

// ------------------------------- Postwean route end ---------------------------------------

// ------------------------------- Milk route start -------------------------------------

/**
 * @route POST /milk-record/create-milk-record
 * @desc Create a new milk record
 * @access Private
 */
router.post("/milk-record/create-milk-record", milkController.createMilkRecord);

/**
 * @route GET /milk-record/get-all-milk-records
 * @desc Get all milk records
 * @access Private
 */
router.get(
  "/milk-record/get-all-milk-records",
  milkController.getAllMilkRecord
);

/**
 * @route GET /milk-record/get-milk-record-by-id/:id
 * @desc Get a milk record by ID
 * @access Private
 */
router.get(
  "/milk-record/get-milk-record-by-id/:uid",
  milkController.getMilkRecordById
);

/**
 * @route GET /milk-record/get-milk-records-by-tag/:tagId
 * @desc Get milk records by tag ID
 * @access Private
 */
router.get(
  "/milk-record/get-milk-records-by-tag/:tagId",
  milkController.getMilkRecordByTagId
);

/**
 * @route PUT /milk-record/update-milk-record/:id
 * @desc Update a milk record by ID
 * @access Private
 */
router.put(
  "/milk-record/update-milk-record/:id",
  milkController.updateMilkRecord
);

/**
 * @route DELETE /milk-record/delete-milk-record-by-id/:id
 * @desc Delete a milk record by ID
 * @access Private
 */
router.delete(
  "/milk-record/delete-milk-record-by-id/:id",
  milkController.deleteMilkRecord
);

// ------------------------------- Milk route end ---------------------------------------

// ----------------------------- Estrus heat start -----------------------------------------

/**
 * @route POST /estrus-heat/create-heat-record
 * @desc Create a new estrus heat record
 * @access Private
 */
router.post(
  "/estrus-heat/create-heat-record",
  estrusHeatController.createEstrusHeat
);

/**
 * @route GET /estrus-heat/get-all-heat-records
 * @desc Get all estrus heat records
 * @access Private
 */
router.get(
  "/estrus-heat/get-all-heat-records",
  estrusHeatController.getAllEstrusHeats
);

/**
 * @route GET /estrus-heat/get-heat-record-by-id/:id
 * @desc Get an estrus heat record by ID
 * @access Private
 */
router.get(
  "/estrus-heat/get-heat-record-by-id/:id",
  estrusHeatController.getEstrusHeatById
);

/**
 * @route GET /estrus-heat/get-heat-records-by-tag/:tagId
 * @desc Get estrus heat records by tag ID
 * @access Private
 */
router.get(
  "/estrus-heat/get-heat-records-by-tag/:tagId",
  estrusHeatController.getEstrusHeatsByTag
);

/**
 * @route PUT /estrus-heat/update-heat-record/:id
 * @desc Update an estrus heat record by ID
 * @access Private
 */
router.put(
  "/estrus-heat/update-heat-record/:id",
  estrusHeatController.updateEstrusHeat
);

/**
 * @route DELETE /estrus-heat/delete-heat-record/:id
 * @desc Delete an estrus heat record by ID
 * @access Private
 */
router.delete(
  "/estrus-heat/delete-heat-record-by-id/:id",
  estrusHeatController.deleteEstrusHeat
);

// ----------------------------- Estrus heat end -----------------------------------------



//--------------------------------------------------------------------------------------------
                         


// Add Deworm Animal
router.post("/dewormdata/addDeworm", dewormController.addDeworm);

// Get All Deworm Data
router.get("/dewormdata/getAllDeworm", dewormController.getAllDeworm);

// Update Deworm Animal
router.put("/dewormdata/update/:id", dewormController.updateDeworm);

// Delete Deworm Animal
router.delete("/dewormdata/delete/:id", dewormController.deleteDeworm);







module.exports = router;
