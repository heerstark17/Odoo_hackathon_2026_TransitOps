const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const MaintenanceLog = require("../models/MaintenanceLog");

const VEHICLE_STATUSES = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];
const EDITABLE_FIELDS = [
  "registrationNumber",
  "nameOrModel",
  "type",
  "maxLoadCapacityKg",
  "odometerKm",
  "acquisitionCost",
  "region",
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildVehiclePayload = (body) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const validateVehicle = (vehicle, { creating = false } = {}) => {
  const requiredFields = [
    "registrationNumber",
    "nameOrModel",
    "type",
    "maxLoadCapacityKg",
    "odometerKm",
    "acquisitionCost",
  ];

  if (creating) {
    const missing = requiredFields.filter((field) => {
      const value = vehicle[field];
      return value === undefined || value === null || value === "";
    });
    if (missing.length) return `Missing required fields: ${missing.join(", ")}.`;
  }

  for (const field of ["maxLoadCapacityKg", "odometerKm", "acquisitionCost"]) {
    if (vehicle[field] !== undefined && (!Number.isFinite(Number(vehicle[field])) || Number(vehicle[field]) < 0)) {
      return `${field} must be a non-negative number.`;
    }
  }

  if (vehicle.maxLoadCapacityKg !== undefined && Number(vehicle.maxLoadCapacityKg) < 1) {
    return "maxLoadCapacityKg must be at least 1.";
  }

  return null;
};

const getVehicles = async (req, res, next) => {
  try {
    const { type, status, region, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.type = String(type).trim().toUpperCase();
    if (status) {
      const normalisedStatus = String(status).trim().toUpperCase();
      if (!VEHICLE_STATUSES.includes(normalisedStatus)) {
        return res.status(400).json({ message: `status must be one of: ${VEHICLE_STATUSES.join(", ")}.` });
      }
      query.status = normalisedStatus;
    }
    if (region) query.region = new RegExp(`^${String(region).trim()}$`, "i");
    if (search) {
      const escapedSearch = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { registrationNumber: new RegExp(escapedSearch, "i") },
        { nameOrModel: new RegExp(escapedSearch, "i") },
      ];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Vehicle.countDocuments(query),
    ]);

    return res.status(200).json({
      vehicles,
      pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid vehicle id." });

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });

    return res.status(200).json({ vehicle });
  } catch (error) {
    return next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const payload = buildVehiclePayload(req.body);
    const validationError = validateVehicle(payload, { creating: true });
    if (validationError) return res.status(400).json({ message: validationError });

    const vehicle = await Vehicle.create({ ...payload, createdBy: req.user._id });
    return res.status(201).json({ message: "Vehicle created successfully.", vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A vehicle with this registration number already exists." });
    }
    return next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid vehicle id." });
    if (req.body.status !== undefined) {
      return res.status(400).json({ message: "Use PATCH /api/vehicles/:id/status to change vehicle status." });
    }

    const payload = buildVehiclePayload(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ message: "No editable vehicle fields were provided." });

    const validationError = validateVehicle(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });

    return res.status(200).json({ message: "Vehicle updated successfully.", vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A vehicle with this registration number already exists." });
    }
    return next(error);
  }
};

const updateVehicleStatus = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid vehicle id." });

    const status = String(req.body.status || "").trim().toUpperCase();
    if (!VEHICLE_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${VEHICLE_STATUSES.join(", ")}.` });
    }
    if (["ON_TRIP", "IN_SHOP"].includes(status)) {
      return res.status(400).json({
        message: "ON_TRIP is set by trip dispatch and IN_SHOP is set by active maintenance records.",
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });

    const hasActiveTrip = await Trip.exists({ vehicle: vehicle._id, status: "DISPATCHED" });
    const hasActiveMaintenance = await MaintenanceLog.exists({ vehicle: vehicle._id, status: "ACTIVE" });
    if (hasActiveTrip || hasActiveMaintenance) {
      return res.status(409).json({ message: "Vehicle status cannot change while it has an active trip or maintenance record." });
    }

    vehicle.status = status;
    await vehicle.save();
    return res.status(200).json({ message: "Vehicle status updated successfully.", vehicle });
  } catch (error) {
    return next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid vehicle id." });

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });

    const [hasTrips, hasMaintenance] = await Promise.all([
      Trip.exists({ vehicle: vehicle._id }),
      MaintenanceLog.exists({ vehicle: vehicle._id }),
    ]);
    if (hasTrips || hasMaintenance) {
      return res.status(409).json({ message: "Vehicle with trip or maintenance history cannot be deleted. Retire it instead." });
    }

    await vehicle.deleteOne();
    return res.status(200).json({ message: "Vehicle deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
};
