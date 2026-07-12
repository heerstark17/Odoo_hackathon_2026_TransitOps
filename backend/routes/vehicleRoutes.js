const express = require("express");
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
} = require("../controllers/vehicleController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const manageVehicles = authorize("FLEET_MANAGER");
const viewVehicles = authorize("FLEET_MANAGER", "DISPATCHER");

router.use(protect);

router.route("/").get(viewVehicles, getVehicles).post(manageVehicles, createVehicle);
router.route("/:id").get(viewVehicles, getVehicleById).patch(manageVehicles, updateVehicle).delete(manageVehicles, deleteVehicle);
router.patch("/:id/status", manageVehicles, updateVehicleStatus);

module.exports = router;
