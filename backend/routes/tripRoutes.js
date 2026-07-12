const express = require("express");
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require("../controllers/tripController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const manageTrips = authorize("FLEET_MANAGER", "DISPATCHER");

router.use(protect);
router.route("/").get(manageTrips, getTrips).post(manageTrips, createTrip);
router.get("/:id", manageTrips, getTripById);
router.patch("/:id", manageTrips, updateTrip);
router.patch("/:id/dispatch", manageTrips, dispatchTrip);
router.patch("/:id/complete", manageTrips, completeTrip);
router.patch("/:id/cancel", manageTrips, cancelTrip);

module.exports = router;
