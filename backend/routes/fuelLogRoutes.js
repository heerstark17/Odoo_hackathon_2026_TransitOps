const express = require("express");
const {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} = require("../controllers/fuelLogController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const manageFuelLogs = authorize("FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST");

router.use(protect);
router.route("/").get(getFuelLogs).post(manageFuelLogs, createFuelLog);
router.route("/:id").get(getFuelLogById).patch(manageFuelLogs, updateFuelLog).delete(manageFuelLogs, deleteFuelLog);

module.exports = router;
