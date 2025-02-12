
 
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
// Parent
// ===============
 
 
// Add Parent
router.post("/user/animaldata/parent", animalParentController.animalDetail);
 
// Get only single Parent
router.get("/user/animaldata/parent/getAll/:uniqueId",animalParentController.animalAllDetail);
 
// Get all Parents
router.get("/user/animaldata/parent/getAll",animalParentController.getAllParents);
 
 
// Add Child
router.post("/user/animaldata/child", animalchildController.animalChildDetail);
 
// Update Child
router.put("/user/animaldata/child/update/:uniqueId", animalchildController.updateAnimalChildDetail);
 
// Get only single Child
 
router.get("/user/animaldata/child/getAll/:uniqueId", animalchildController.getAnimalChildDetail);
 
 
 
 
 
 
// ============
// Post Wean
// ============

// Add Post Wean Parent and Child
router.post("/user/animal/postweandata/add", postweanController.addPostWean);

// Delete Post Wean Parent and Child
router.delete("/user/animal/postweandata/delete/:postWeanId", postweanController.deletePostWean);


 
 
// =============
//  Milk Routes
// =============

// Add Milk Parent and Child
router.post("/user/animal/milkdata/add", milkController.addMilk);

// Delete Milk Parent and Child
router.delete("/user/animal/milkdata/delete/:milkId", milkController.deleteMilk);
 
// =========== 
// Vaccine Routes
// ===========

// Add Vaccine Parent and Child
router.post("/user/animal/vaccinedata/add", vaccineController.addVaccine);

// Delete Vaccine Parent and Child
router.delete("/user/animal/vaccinedata/delete/:vaccineId", vaccineController.deleteVaccine);


// ===========
// Deworm Routes
// ===========
 
// Add Deworm Parent and Child
router.post("/user/animal/dewormdata/add", dewormController.addDeworm);

// Delete Deworm Parent and Child
router.delete("/user/animal/dewormdata/delete/:dewormId", dewormController.deleteDeworm);


// =============
// Estrus Heat
// =============
 
 // Add Estrus Heat Parent and Child
router.post("/user/animal/estrusdata/add", estrusHeatController.addEstrusHeat);

// Delete Estrus Heat Parent and Child
router.delete("/user/animal/estrusdata/delete/:heatId", estrusHeatController.deleteEstrusHeat);

// =============
// Sanitation Routes
// =============
 
// Add Sanitation Parent and Child
router.post("/user/animal/sanitationdata/add", sanitationController.addSanitation);

// Delete Sanitation Parent and Child
router.delete("/user/animal/sanitationdata/delete/:sanitationId", sanitationController.deleteSanitation);
 
 
 
 
 
module.exports = router;