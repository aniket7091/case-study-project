const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  changePassword,
  logout,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

// ── Public routes
router.post("/register", register);
router.post("/login", login);

// ── Protected routes (JWT required)
router.get("/me", protect, getProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

module.exports = router;
