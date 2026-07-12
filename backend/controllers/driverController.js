const mongoose = require("mongoose");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

const DRIVER_STATUSES = ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"];
const EDITABLE_FIELDS = [
  "name",
  "licenseNumber",
  "licenseCategory",
  "licenseExpiryDate",
  "contactNumber",
  "safetyScore",
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isExpired = (date) => new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

const buildDriverPayload = (body) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const validateDriver = (driver, { creating = false } = {}) => {
  const required = ["name", "licenseNumber", "licenseCategory", "licenseExpiryDate", "contactNumber"];
  if (creating) {
    const missing = required.filter((field) => driver[field] === undefined || driver[field] === null || driver[field] === "");
    if (missing.length) return `Missing required fields: ${missing.join(", ")}.`;
  }

  if (driver.licenseExpiryDate !== undefined && Number.isNaN(new Date(driver.licenseExpiryDate).getTime())) {
    return "licenseExpiryDate must be a valid date.";
  }
  if (driver.safetyScore !== undefined && (!Number.isFinite(Number(driver.safetyScore)) || Number(driver.safetyScore) < 0 || Number(driver.safetyScore) > 100)) {
    return "safetyScore must be a number from 0 to 100.";
  }
  return null;
};

const getDrivers = async (req, res, next) => {
  try {
    const { status, licenseCategory, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      const normalized = String(status).trim().toUpperCase();
      if (!DRIVER_STATUSES.includes(normalized)) {
        return res.status(400).json({ message: `status must be one of: ${DRIVER_STATUSES.join(", ")}.` });
      }
      query.status = normalized;
    }
    if (licenseCategory) query.licenseCategory = String(licenseCategory).trim().toUpperCase();
    if (search) {
      const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [{ name: new RegExp(escaped, "i") }, { licenseNumber: new RegExp(escaped, "i") }];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const [drivers, total] = await Promise.all([
      Driver.find(query).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
      Driver.countDocuments(query),
    ]);

    return res.status(200).json({
      drivers,
      pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return next(error);
  }
};

const getAvailableDrivers = async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const drivers = await Driver.find({ status: "AVAILABLE", licenseExpiryDate: { $gte: today } }).sort({ name: 1 });
    return res.status(200).json({ drivers });
  } catch (error) {
    return next(error);
  }
};

const getDriverById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid driver id." });
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });
    return res.status(200).json({ driver });
  } catch (error) {
    return next(error);
  }
};

const createDriver = async (req, res, next) => {
  try {
    const payload = buildDriverPayload(req.body);
    const validationError = validateDriver(payload, { creating: true });
    if (validationError) return res.status(400).json({ message: validationError });

    const driver = await Driver.create({
      ...payload,
      status: isExpired(payload.licenseExpiryDate) ? "SUSPENDED" : "AVAILABLE",
      createdBy: req.user._id,
    });
    return res.status(201).json({ message: "Driver created successfully.", driver });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "A driver with this license number already exists." });
    return next(error);
  }
};

const updateDriver = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid driver id." });
    if (req.body.status !== undefined) return res.status(400).json({ message: "Use PATCH /api/drivers/:id/status to change driver status." });

    const payload = buildDriverPayload(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ message: "No editable driver fields were provided." });
    const validationError = validateDriver(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    Object.assign(driver, payload);
    if (isExpired(driver.licenseExpiryDate)) driver.status = "SUSPENDED";
    await driver.save();
    return res.status(200).json({ message: "Driver updated successfully.", driver });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "A driver with this license number already exists." });
    return next(error);
  }
};

const updateDriverStatus = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid driver id." });
    const status = String(req.body.status || "").trim().toUpperCase();
    if (!DRIVER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${DRIVER_STATUSES.join(", ")}.` });
    }
    if (status === "ON_TRIP") return res.status(400).json({ message: "ON_TRIP is set by trip dispatch." });

    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });
    if (status === "AVAILABLE" && isExpired(driver.licenseExpiryDate)) {
      return res.status(409).json({ message: "A driver with an expired license cannot be made available." });
    }
    if (driver.status === "ON_TRIP") {
      return res.status(409).json({ message: "Driver status cannot change while the driver is on an active trip." });
    }

    driver.status = status;
    await driver.save();
    return res.status(200).json({ message: "Driver status updated successfully.", driver });
  } catch (error) {
    return next(error);
  }
};

const deleteDriver = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid driver id." });
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    if (await Trip.exists({ driver: driver._id })) {
      return res.status(409).json({ message: "Driver with trip history cannot be deleted. Suspend the driver instead." });
    }
    await driver.deleteOne();
    return res.status(200).json({ message: "Driver deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createDriver, getDrivers, getAvailableDrivers, getDriverById, updateDriver, updateDriverStatus, deleteDriver };
