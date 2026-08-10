const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Require authentication and ADMIN role
router.use(protect);
router.use(authorizeRoles("ADMIN"));

// Admin Dashboard Endpoints
router.get("/dashboard", adminController.getDashboardStats);

module.exports = router;
