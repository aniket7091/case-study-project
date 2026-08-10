const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Require authentication and ADMIN role for all user management routes
router.use(protect);
router.use(authorizeRoles("ADMIN"));

// User Management Endpoints
router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id/role", userController.updateUserRole);
router.patch("/:id/status", userController.updateUserStatus);

module.exports = router;
