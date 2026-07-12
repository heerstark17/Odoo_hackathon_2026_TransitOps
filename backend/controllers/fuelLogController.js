const mongoose = require("mongoose");
const FuelLog = require("../models/FuelLog");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");

const EDITABLE_FIELDS = ["vehicle", "trip", "date", "liters", "cost", "odometerKm", "fuelStation"];
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPayload = (body) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const validatePayload = (log, { creating = false } = {}) => {
  if (creating && (!log.vehicle || log.liters === undefined || log.liters === null || log.cost === undefined || log.cost === null)) {
    return "vehicle, liters, and cost are required.";
  }
  if (log.vehicle !== undefined && !isValidId(log.vehicle)) return "vehicle must be a valid id.";
  if (log.trip !== undefined && log.trip !== null && !isValidId(log.trip)) return "trip must be a valid id.";
  if (log.liters !== undefined && (!Number.isFinite(Number(log.liters)) || Number(log.liters) <= 0)) return "liters must be greater than 0.";
  for (const field of ["cost", "odometerKm"]) {
    if (log[field] !== undefined && log[field] !== null && (!Number.isFinite(Number(log[field])) || Number(log[field]) < 0)) {
      return `${field} must be a non-negative number.`;
    }
  }
  if (log.date !== undefined && Number.isNaN(new Date(log.date).getTime())) return "date must be a valid date.";
  return null;
};

const verifyReferences = async ({ vehicle, trip }) => {
  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) return { statusCode: 404, message: "Vehicle not found." };
  if (trip) {
    const tripDoc = await Trip.findById(trip);
    if (!tripDoc) return { statusCode: 404, message: "Trip not found." };
    if (tripDoc.vehicle.toString() !== vehicleDoc._id.toString()) return { statusCode: 400, message: "The trip does not belong to the selected vehicle." };
  }
  return null;
};

const getFuelLogs = async (req, res, next) => {
  try {
    const { vehicle, trip, page = 1, limit = 20 } = req.query;
    const query = {};
    for (const [field, value] of Object.entries({ vehicle, trip })) {
      if (value) {
        if (!isValidId(value)) return res.status(400).json({ message: `${field} must be a valid id.` });
        query[field] = value;
      }
    }
    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const [fuelLogs, total] = await Promise.all([
      FuelLog.find(query).populate("vehicle", "registrationNumber nameOrModel").populate("trip", "tripNumber status").sort({ date: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
      FuelLog.countDocuments(query),
    ]);
    return res.status(200).json({ fuelLogs, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return next(error);
  }
};

const getFuelLogById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid fuel log id." });
    const fuelLog = await FuelLog.findById(req.params.id).populate("vehicle", "registrationNumber nameOrModel").populate("trip", "tripNumber status");
    if (!fuelLog) return res.status(404).json({ message: "Fuel log not found." });
    return res.status(200).json({ fuelLog });
  } catch (error) {
    return next(error);
  }
};

const createFuelLog = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = validatePayload(payload, { creating: true });
    if (validationError) return res.status(400).json({ message: validationError });
    const referenceError = await verifyReferences(payload);
    if (referenceError) return res.status(referenceError.statusCode).json({ message: referenceError.message });

    const fuelLog = await FuelLog.create({ ...payload, recordedBy: req.user._id });
    return res.status(201).json({ message: "Fuel log created successfully.", fuelLog });
  } catch (error) {
    return next(error);
  }
};

const updateFuelLog = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid fuel log id." });
    const payload = buildPayload(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ message: "No editable fuel-log fields were provided." });
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const fuelLog = await FuelLog.findById(req.params.id);
    if (!fuelLog) return res.status(404).json({ message: "Fuel log not found." });
    const candidate = { ...fuelLog.toObject(), ...payload };
    const referenceError = await verifyReferences(candidate);
    if (referenceError) return res.status(referenceError.statusCode).json({ message: referenceError.message });

    Object.assign(fuelLog, payload);
    await fuelLog.save();
    return res.status(200).json({ message: "Fuel log updated successfully.", fuelLog });
  } catch (error) {
    return next(error);
  }
};

const deleteFuelLog = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid fuel log id." });
    const fuelLog = await FuelLog.findByIdAndDelete(req.params.id);
    if (!fuelLog) return res.status(404).json({ message: "Fuel log not found." });
    return res.status(200).json({ message: "Fuel log deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createFuelLog, getFuelLogs, getFuelLogById, updateFuelLog, deleteFuelLog };
