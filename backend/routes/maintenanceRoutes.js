const express = require("express");
const {
  createMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceLogById,
  updateMaintenanceLog,
  closeMaintenanceLog,
} = require("../controllers/maintenanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const manageMaintenance = authorize("FLEET_MANAGER");

router.use(protect);
router.route("/").get(getMaintenanceLogs).post(manageMaintenance, createMaintenanceLog);
router.get("/:id", getMaintenanceLogById);
router.patch("/:id", manageMaintenance, updateMaintenanceLog);
router.patch("/:id/close", manageMaintenance, closeMaintenanceLog);

module.exports = router;
