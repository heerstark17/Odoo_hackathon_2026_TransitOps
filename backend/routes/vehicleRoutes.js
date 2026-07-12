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

router.use(protect);

router.route("/").get(getVehicles).post(manageVehicles, createVehicle);
router.route("/:id").get(getVehicleById).patch(manageVehicles, updateVehicle).delete(manageVehicles, deleteVehicle);
router.patch("/:id/status", manageVehicles, updateVehicleStatus);

module.exports = router;
