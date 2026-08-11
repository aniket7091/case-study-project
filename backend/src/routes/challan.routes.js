const express = require("express");

const router = express.Router();

const challanController =
    require("../controllers/challan.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");



// Authentication required for all challan APIs
// ADMIN and SALES can access all challan routes

router.use(protect);
router.use(authorizeRoles("ADMIN", "SALES"));



// CREATE


router.post(
    "/",
    challanController.createChallan
);



// GET ALL


router.get(
    "/",
    challanController.getChallans
);



// GET SINGLE


router.get(
    "/:id",
    challanController.getChallanById
);



// CONFIRM


router.patch(
    "/:id/confirm",
    challanController.confirmChallan
);



// CANCEL


router.patch(
    "/:id/cancel",
    challanController.cancelChallan
);


module.exports = router;