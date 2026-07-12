const express = require("express");
const {
  createDriver,
  getDrivers,
  getAvailableDrivers,
  getDriverById,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
} = require("../controllers/driverController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const manageDrivers = authorize("FLEET_MANAGER", "SAFETY_OFFICER");

router.use(protect);
router.get("/available", getAvailableDrivers);
router.route("/").get(getDrivers).post(manageDrivers, createDriver);
router.route("/:id").get(getDriverById).patch(manageDrivers, updateDriver).delete(manageDrivers, deleteDriver);
router.patch("/:id/status", manageDrivers, updateDriverStatus);

module.exports = router;
