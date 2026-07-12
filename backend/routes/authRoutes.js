const express = require("express");
const { register, createManager, login, getMe, logout, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/create-manager", protect, authorize("FLEET_MANAGER"), createManager);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
