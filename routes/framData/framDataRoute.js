// routes/ussersRoutes.js

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

// Farm Detail
router.post("/user/farmdata", validateToken, framDetailController.farmDetail);

// ================
// Animal Details
// ================


// Parent
router.post("/user/animaldata/parent", animalParentController.animalDetail);

// Get only single Parent 
router.get("/user/animaldata/parent/getAll/:uniqueId",animalParentController.animalAllDetail);

// Get all Parents
router.get("/user/animaldata/parent/getAll",animalParentController.getAllParents);


// Child
router.post("/user/animaldata/child", animalchildController.animalchildDetail);

// Get only single Child

// router.get("/user/animaldata/child/getAll/:uniqueId", animalchildController.getAnimalChildDetail);



// router.post("/user/animaldata/promote/child/parent/:id",validateToken,animalchildController.promoteChildToParent);



// Post Wean
router.post("/user/animal/postweandata/add", postweanController.addPostWean);

//  Milk Routes
router.post("/user/animal/milkdata/add", milkController.addMilk);

// Vaccine Routes
router.post("/user/animal/vaccinedata/add", vaccineController.addVaccine);

// Deworn Routes
router.post("/user/animal/dewormdata/add", dewormController.addDeworm);





module.exports = router;
