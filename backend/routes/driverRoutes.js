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
const viewDrivers = authorize("FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER");
const viewAvailableDrivers = authorize("FLEET_MANAGER", "DISPATCHER");

router.use(protect);
router.get("/available", viewAvailableDrivers, getAvailableDrivers);
router.route("/").get(viewDrivers, getDrivers).post(manageDrivers, createDriver);
router.route("/:id").get(viewDrivers, getDriverById).patch(manageDrivers, updateDriver).delete(manageDrivers, deleteDriver);
router.patch("/:id/status", manageDrivers, updateDriverStatus);

module.exports = router;
