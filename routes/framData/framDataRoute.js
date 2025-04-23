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

// Farm Detail
router.post("/user/farmdata", validateToken, framDetailController.farmDetail);

// ================
// Animal Details
// ================

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
  "/user/animaldata/newEntity/getAll/:uniqueId",
  animalParentController.animalAllDetail
);

// Get all new Entity
router.get(
  "/user/animaldata/newEntity/getAll",
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

// Add Child
router.post("/user/animaldata/child", animalchildController.animalChildDetail);

// Update Child
router.put(
  "/user/animaldata/child/update/:uniqueId",
  animalchildController.updateAnimalChildDetail
);

// Delete Child

router.delete(
  "/user/animaldata/child/delete/:uniqueId",
  animalchildController.deleteChildAnimal
);

// ===============

// Get only single Child

router.get(
  "/user/animaldata/child/getAll/:uniqueId",
  animalchildController.getAnimalChildDetail
);

// Get all Child
router.get(
  "/user/animaldata/child/getAll",
  animalchildController.getAllChildren
);

// Promote Child to Parent
router.post(
  "/user/animaldata/child/:childId",
  animalchildController.promoteChildToParent
);

// ============
// Post Wean
// ============

// Add Post Wean Parent and Child
router.post("/user/animal/postweandata/add", postweanController.addPostWean);

// Update Post Wean Parent and Child
router.put(
  "/user/animal/postweandata/update/:postWeanId",
  postweanController.updatePostWean
);

// Delete Post Wean Parent and Child
router.delete(
  "/user/animal/postweandata/delete/:postWeanId",
  postweanController.deletePostWean
);

// =============
//  Milk Routes
// =============

// Add Milk Parent and Child
router.post("/user/animal/milkdata/add", milkController.addMilk);

// Update Milk Parent and Child
router.put("/user/animal/milkdata/update/:milkId", milkController.updateMilk);

// Delete Milk Parent and Child
router.delete(
  "/user/animal/milkdata/delete/:milkId",
  milkController.deleteMilk
);

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

// Update Vaccine Parent and Child
router.put(
  "/user/animal/vaccinedata/update/:vaccine",
  vaccineController.updateVaccine
);

// Delete Vaccine Parent and Child
router.delete(
  "/user/animal/vaccinedata/delete/:vaccineId",
  vaccineController.deleteVaccine
);

// ===========
// Deworm Routes
// ===========

// Add Deworm Parent and Child
router.post("/user/animal/dewormdata/add", dewormController.addDeworm);

// Update Deworm Parent and Child
router.put(
  "/user/animal/dewormdata/update/:dewormId",
  dewormController.updateDeworm
);

// Delete Deworm Parent and Child
router.delete(
  "/user/animal/dewormdata/delete/:dewormId",
  dewormController.deleteDeworm
);

// =============
// Estrus Heat
// =============

// Add Estrus Heat Parent and Child
router.post("/user/animal/estrusdata/add", estrusHeatController.addEstrusHeat);

// Update Estrus Heat Parent and Child
router.put(
  "/user/animal/estrusdata/update/:heatId",
  estrusHeatController.updateEstrusHeat
);

// Delete Estrus Heat Parent and Child
router.delete(
  "/user/animal/estrusdata/delete/:heatId",
  estrusHeatController.deleteEstrusHeat
);

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

/**
 * @route GET /api/vaccines/animal/:tagId
 * @desc Get all vaccine records for a specific animal
 * @access Private
 */
// router.get("/animal/:tagId", vaccineController.getAnimalVaccines);

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

module.exports = router;
