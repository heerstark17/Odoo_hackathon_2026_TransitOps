const mongoose = require("mongoose");
const MaintenanceLog = require("../models/MaintenanceLog");
const Vehicle = require("../models/Vehicle");

const EDITABLE_FIELDS = ["maintenanceType", "description", "cost", "odometerKm", "openedAt"];
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPayload = (body) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const validatePayload = (log, { creating = false } = {}) => {
  if (creating && (!log.maintenanceType || log.cost === undefined || log.cost === null || !log.vehicle)) {
    return "vehicle, maintenanceType, and cost are required.";
  }
  if (creating && !isValidId(log.vehicle)) return "vehicle must be a valid id.";
  for (const field of ["cost", "odometerKm"]) {
    if (log[field] !== undefined && log[field] !== null && (!Number.isFinite(Number(log[field])) || Number(log[field]) < 0)) {
      return `${field} must be a non-negative number.`;
    }
  }
  if (log.openedAt !== undefined && Number.isNaN(new Date(log.openedAt).getTime())) return "openedAt must be a valid date.";
  return null;
};

const getMaintenanceLogs = async (req, res, next) => {
  try {
    const { vehicle, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (vehicle) {
      if (!isValidId(vehicle)) return res.status(400).json({ message: "vehicle must be a valid id." });
      query.vehicle = vehicle;
    }
    if (status) {
      const normalized = String(status).trim().toUpperCase();
      if (!["ACTIVE", "CLOSED"].includes(normalized)) return res.status(400).json({ message: "status must be ACTIVE or CLOSED." });
      query.status = normalized;
    }
    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const [maintenanceLogs, total] = await Promise.all([
      MaintenanceLog.find(query).populate("vehicle", "registrationNumber nameOrModel status").sort({ openedAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
      MaintenanceLog.countDocuments(query),
    ]);
    return res.status(200).json({ maintenanceLogs, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return next(error);
  }
};

const getMaintenanceLogById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid maintenance log id." });
    const maintenanceLog = await MaintenanceLog.findById(req.params.id).populate("vehicle", "registrationNumber nameOrModel status");
    if (!maintenanceLog) return res.status(404).json({ message: "Maintenance log not found." });
    return res.status(200).json({ maintenanceLog });
  } catch (error) {
    return next(error);
  }
};

const createMaintenanceLog = async (req, res, next) => {
  const payload = { ...buildPayload(req.body), vehicle: req.body.vehicle };
  const validationError = validatePayload(payload, { creating: true });
  if (validationError) return res.status(400).json({ message: validationError });

  const session = await mongoose.startSession();
  try {
    let response;
    await session.withTransaction(async () => {
      const vehicle = await Vehicle.findOneAndUpdate(
        { _id: payload.vehicle, status: "AVAILABLE" },
        { status: "IN_SHOP" },
        { new: true, session },
      );
      if (!vehicle) {
        response = { statusCode: 409, message: "Vehicle must be available before maintenance can begin." };
        return;
      }
      const maintenanceLog = await MaintenanceLog.create([{ ...payload, createdBy: req.user._id, status: "ACTIVE" }], { session });
      response = { statusCode: 201, message: "Maintenance log created; vehicle moved to In Shop.", maintenanceLog: maintenanceLog[0] };
    });
    return res.status(response.statusCode).json({ message: response.message, ...(response.maintenanceLog && { maintenanceLog: response.maintenanceLog }) });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};

const updateMaintenanceLog = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid maintenance log id." });
    if (req.body.status !== undefined || req.body.vehicle !== undefined || req.body.closedAt !== undefined) {
      return res.status(400).json({ message: "Vehicle and lifecycle fields cannot be edited." });
    }
    const payload = buildPayload(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ message: "No editable maintenance fields were provided." });
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const maintenanceLog = await MaintenanceLog.findOneAndUpdate({ _id: req.params.id, status: "ACTIVE" }, payload, { new: true, runValidators: true });
    if (!maintenanceLog) return res.status(409).json({ message: "Only active maintenance logs can be edited." });
    return res.status(200).json({ message: "Maintenance log updated successfully.", maintenanceLog });
  } catch (error) {
    return next(error);
  }
};

const closeMaintenanceLog = async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid maintenance log id." });

  const session = await mongoose.startSession();
  try {
    let response;
    await session.withTransaction(async () => {
      const maintenanceLog = await MaintenanceLog.findOne({ _id: req.params.id, status: "ACTIVE" }).session(session);
      if (!maintenanceLog) {
        response = { statusCode: 409, message: "Only active maintenance logs can be closed." };
        return;
      }
      const vehicle = await Vehicle.findById(maintenanceLog.vehicle).session(session);
      if (!vehicle) throw Object.assign(new Error("Vehicle linked to this maintenance log was not found."), { statusCode: 404 });

      maintenanceLog.status = "CLOSED";
      maintenanceLog.closedAt = new Date();
      maintenanceLog.closedBy = req.user._id;
      await maintenanceLog.save({ session });
      if (vehicle.status !== "RETIRED") {
        vehicle.status = "AVAILABLE";
        await vehicle.save({ session });
      }
      response = { statusCode: 200, message: "Maintenance closed; vehicle is available.", maintenanceLog };
    });
    return res.status(response.statusCode).json({ message: response.message, ...(response.maintenanceLog && { maintenanceLog: response.maintenanceLog }) });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};

module.exports = { createMaintenanceLog, getMaintenanceLogs, getMaintenanceLogById, updateMaintenanceLog, closeMaintenanceLog };
