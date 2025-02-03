// routes/ussersRoutes.js

const express = require("express");
const router = express.Router();

// Token for routes
const { validateToken } = require("../../middlewares/validateTokenHandler");

// Controllers
const framDetailController = require("../../controller/user/framDetailController");
const animalParentController = require("../../controller/framData/animalParentController");
const animalchildController = require("../../controller/framData/animalchildController");

// Farm Detail
router.post("/user/farmdata/", validateToken, framDetailController.farmDetail);

// ================
// Animal Details
// ================

// Parent Routes
router.post("/user/animaldata/parent", animalParentController.animalDetail);

router.get(
  "/user/animaldata/parent/getAll/:uniqueId",
  animalParentController.animalAllDetail
);

router.post("/user/animaldata/child", animalchildController.animalchildDetail);
router.post("/user/animaldata/promote/child/parent/:id", animalchildController.promoteChildToParent);

module.exports = router;
