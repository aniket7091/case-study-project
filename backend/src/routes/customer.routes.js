const express = require("express");

const router = express.Router();

const customerController =
    require("../controllers/customer.controller");

const { protect } =
    require("../middleware/auth.middleware");

const { authorizeRoles } = 
    require("../middleware/role.middleware");


// All customer APIs require authentication and ADMIN role
router.use(protect);
router.use(authorizeRoles("ADMIN"));


// Create customer
router.post(
    "/",
    customerController.createCustomer
);


// Get all customers
router.get(
    "/",
    customerController.getCustomers
);


// Get single customer
router.get(
    "/:id",
    customerController.getCustomerById
);


// Update customer
router.put(
    "/:id",
    customerController.updateCustomer
);


// Add follow-up
router.post(
    "/:id/followups",
    customerController.addFollowUp
);


module.exports = router;