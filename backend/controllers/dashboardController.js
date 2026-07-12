const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

const VEHICLE_STATUSES = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];

const getDashboard = async (req, res, next) => {
  try {
    const { type, status, region } = req.query;
    const vehicleFilter = {};

    if (type) vehicleFilter.type = String(type).trim().toUpperCase();
    if (region) vehicleFilter.region = new RegExp(`^${String(region).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    if (status) {
      const normalized = String(status).trim().toUpperCase();
      if (!VEHICLE_STATUSES.includes(normalized)) {
        return res.status(400).json({ message: `status must be one of: ${VEHICLE_STATUSES.join(", ")}.` });
      }
      vehicleFilter.status = normalized;
    }

    const vehicleIds = await Vehicle.find(vehicleFilter).distinct("_id");
    const tripVehicleFilter = { vehicle: { $in: vehicleIds } };
    const [vehicleStatuses, activeTrips, pendingTrips, driversOnDuty, recentTrips] = await Promise.all([
      Vehicle.aggregate([
        { $match: vehicleFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Trip.countDocuments({ ...tripVehicleFilter, status: "DISPATCHED" }),
      Trip.countDocuments({ ...tripVehicleFilter, status: "DRAFT" }),
      Driver.countDocuments({ status: "ON_TRIP" }),
      Trip.find(tripVehicleFilter)
        .populate("vehicle", "registrationNumber nameOrModel")
        .populate("driver", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const statusCounts = Object.fromEntries(vehicleStatuses.map((item) => [item._id, item.count]));
    const availableVehicles = statusCounts.AVAILABLE || 0;
    const onTripVehicles = statusCounts.ON_TRIP || 0;
    const inShopVehicles = statusCounts.IN_SHOP || 0;
    const retiredVehicles = statusCounts.RETIRED || 0;
    const activeVehicles = availableVehicles + onTripVehicles + inShopVehicles;
    const fleetUtilization = activeVehicles ? Number(((onTripVehicles / activeVehicles) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      filters: { type: type || null, status: status || null, region: region || null },
      kpis: {
        activeVehicles,
        availableVehicles,
        vehiclesInMaintenance: inShopVehicles,
        retiredVehicles,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization,
      },
      vehicleStatus: {
        AVAILABLE: availableVehicles,
        ON_TRIP: onTripVehicles,
        IN_SHOP: inShopVehicles,
        RETIRED: retiredVehicles,
      },
      recentTrips,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboard };
