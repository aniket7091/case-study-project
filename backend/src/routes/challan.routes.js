const express = require("express");

const router = express.Router();

const challanController =
    require("../controllers/challan.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");



// Authentication required for all challan APIs
router.use(protect);


// CREATE (ADMIN + SALES)
router.post(
    "/",
    authorizeRoles("ADMIN", "SALES"),
    challanController.createChallan
);


// GET ALL (ADMIN + SALES + ACCOUNTS)
router.get(
    "/",
    authorizeRoles("ADMIN", "SALES", "ACCOUNTS"),
    challanController.getChallans
);


// GET SINGLE (ADMIN + SALES + ACCOUNTS)
router.get(
    "/:id",
    authorizeRoles("ADMIN", "SALES", "ACCOUNTS"),
    challanController.getChallanById
);


// CONFIRM (ADMIN + SALES)
router.patch(
    "/:id/confirm",
    authorizeRoles("ADMIN", "SALES"),
    challanController.confirmChallan
);


// CANCEL (ADMIN + SALES)
router.patch(
    "/:id/cancel",
    authorizeRoles("ADMIN", "SALES"),
    challanController.cancelChallan
);


module.exports = router;