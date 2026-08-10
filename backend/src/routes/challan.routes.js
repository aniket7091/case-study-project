const express = require("express");

const router = express.Router();

const challanController =
    require("../controllers/challan.controller");

const { protect } =
    require("../middleware/auth.middleware");



// Authentication required for all challan APIs


router.use(protect);



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