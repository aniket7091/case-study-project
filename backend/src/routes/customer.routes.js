const express = require("express");

const router = express.Router();

const customerController =
    require("../controllers/customer.controller");

const { protect } =
    require("../middleware/auth.middleware");

const { authorizeRoles } = 
    require("../middleware/role.middleware");


// All customer APIs require authentication
router.use(protect);


// Create customer (ADMIN + SALES)
router.post(
    "/",
    authorizeRoles("ADMIN", "SALES"),
    customerController.createCustomer
);


// Get all customers (ADMIN + SALES + ACCOUNTS)
router.get(
    "/",
    authorizeRoles("ADMIN", "SALES", "ACCOUNTS"),
    customerController.getCustomers
);


// Get single customer (ADMIN + SALES + ACCOUNTS)
router.get(
    "/:id",
    authorizeRoles("ADMIN", "SALES", "ACCOUNTS"),
    customerController.getCustomerById
);


// Update customer (ADMIN + SALES)
router.put(
    "/:id",
    authorizeRoles("ADMIN", "SALES"),
    customerController.updateCustomer
);


// Add follow-up (ADMIN + SALES)
router.post(
    "/:id/followups",
    authorizeRoles("ADMIN", "SALES"),
    customerController.addFollowUp
);


module.exports = router;