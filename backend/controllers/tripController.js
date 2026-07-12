const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");

const TRIP_STATUSES = ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"];
const EDITABLE_FIELDS = [
  "tripNumber",
  "source",
  "destination",
  "vehicle",
  "driver",
  "cargoWeightKg",
  "plannedDistanceKm",
  "plannedStartAt",
  "estimatedArrivalAt",
  "revenue",
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isLicenseExpired = (date) => {
  const expiry = new Date(date);
  expiry.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry < today;
};

const buildTripPayload = (body) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const validateTripPayload = (trip, { creating = false } = {}) => {
  const required = ["tripNumber", "source", "destination", "vehicle", "driver", "cargoWeightKg", "plannedDistanceKm", "plannedStartAt"];
  if (creating) {
    const missing = required.filter((field) => trip[field] === undefined || trip[field] === null || trip[field] === "");
    if (missing.length) return `Missing required fields: ${missing.join(", ")}.`;
  }

  for (const field of ["vehicle", "driver"]) {
    if (trip[field] !== undefined && !isValidId(trip[field])) return `${field} must be a valid id.`;
  }
  for (const field of ["cargoWeightKg", "plannedDistanceKm", "revenue"]) {
    if (trip[field] !== undefined && (!Number.isFinite(Number(trip[field])) || Number(trip[field]) < 0)) {
      return `${field} must be a non-negative number.`;
    }
  }
  for (const field of ["plannedStartAt", "estimatedArrivalAt"]) {
    if (trip[field] !== undefined && (trip[field] === "" || Number.isNaN(new Date(trip[field]).getTime()))) {
      return `${field} must be a valid date.`;
    }
  }
  return null;
};

const validateResources = async ({ vehicle, driver, cargoWeightKg }, session) => {
  const [vehicleDoc, driverDoc] = await Promise.all([
    Vehicle.findById(vehicle).session(session),
    Driver.findById(driver).session(session),
  ]);

  if (!vehicleDoc) return { message: "Vehicle not found.", statusCode: 404 };
  if (!driverDoc) return { message: "Driver not found.", statusCode: 404 };
  if (vehicleDoc.status !== "AVAILABLE") return { message: "Selected vehicle is not available.", statusCode: 409 };
  if (driverDoc.status !== "AVAILABLE") return { message: "Selected driver is not available.", statusCode: 409 };
  if (isLicenseExpired(driverDoc.licenseExpiryDate)) return { message: "Selected driver has an expired license.", statusCode: 409 };
  if (Number(cargoWeightKg) > vehicleDoc.maxLoadCapacityKg) {
    return { message: "Cargo weight exceeds the vehicle's maximum load capacity.", statusCode: 400 };
  }

  return { vehicle: vehicleDoc, driver: driverDoc };
};

const getTrips = async (req, res, next) => {
  try {
    const { status, vehicle, driver, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) {
      const normalized = String(status).trim().toUpperCase();
      if (!TRIP_STATUSES.includes(normalized)) {
        return res.status(400).json({ message: `status must be one of: ${TRIP_STATUSES.join(", ")}.` });
      }
      query.status = normalized;
    }
    if (vehicle) {
      if (!isValidId(vehicle)) return res.status(400).json({ message: "vehicle must be a valid id." });
      query.vehicle = vehicle;
    }
    if (driver) {
      if (!isValidId(driver)) return res.status(400).json({ message: "driver must be a valid id." });
      query.driver = driver;
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate("vehicle", "registrationNumber nameOrModel type status")
        .populate("driver", "name licenseNumber licenseExpiryDate status")
        .sort({ plannedStartAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Trip.countDocuments(query),
    ]);
    return res.status(200).json({
      trips,
      pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid trip id." });
    const trip = await Trip.findById(req.params.id)
      .populate("vehicle", "registrationNumber nameOrModel type status maxLoadCapacityKg")
      .populate("driver", "name licenseNumber licenseExpiryDate status");
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    return res.status(200).json({ trip });
  } catch (error) {
    return next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const payload = buildTripPayload(req.body);
    const validationError = validateTripPayload(payload, { creating: true });
    if (validationError) return res.status(400).json({ message: validationError });

    const resourceCheck = await validateResources(payload);
    if (resourceCheck.message) return res.status(resourceCheck.statusCode).json({ message: resourceCheck.message });

    const trip = await Trip.create({ ...payload, createdBy: req.user._id, status: "DRAFT" });
    return res.status(201).json({ message: "Trip created as draft.", trip });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "A trip with this trip number already exists." });
    return next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid trip id." });
    if (req.body.status !== undefined) return res.status(400).json({ message: "Use a trip lifecycle endpoint to change status." });

    const payload = buildTripPayload(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ message: "No editable trip fields were provided." });
    const validationError = validateTripPayload(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (trip.status !== "DRAFT") return res.status(409).json({ message: "Only draft trips can be edited." });

    const candidate = { ...trip.toObject(), ...payload };
    const resourceCheck = await validateResources(candidate);
    if (resourceCheck.message) return res.status(resourceCheck.statusCode).json({ message: resourceCheck.message });

    Object.assign(trip, payload);
    await trip.save();
    return res.status(200).json({ message: "Trip updated successfully.", trip });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "A trip with this trip number already exists." });
    return next(error);
  }
};

const dispatchTrip = async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid trip id." });

  const session = await mongoose.startSession();
  try {
    let response;
    await session.withTransaction(async () => {
      const trip = await Trip.findById(req.params.id).session(session);
      if (!trip) {
        response = { statusCode: 404, message: "Trip not found." };
        return;
      }
      if (trip.status !== "DRAFT") {
        response = { statusCode: 409, message: "Only draft trips can be dispatched." };
        return;
      }

      const resourceCheck = await validateResources(trip, session);
      if (resourceCheck.message) {
        response = resourceCheck;
        return;
      }

      const vehicle = await Vehicle.findOneAndUpdate(
        { _id: trip.vehicle, status: "AVAILABLE" },
        { status: "ON_TRIP" },
        { new: true, session },
      );
      const driver = await Driver.findOneAndUpdate(
        { _id: trip.driver, status: "AVAILABLE" },
        { status: "ON_TRIP" },
        { new: true, session },
      );
      if (!vehicle || !driver) throw Object.assign(new Error("Vehicle or driver became unavailable during dispatch."), { statusCode: 409 });

      trip.status = "DISPATCHED";
      trip.dispatchedAt = new Date();
      trip.startOdometerKm = vehicle.odometerKm;
      await trip.save({ session });
      response = { statusCode: 200, message: "Trip dispatched successfully.", trip };
    });
    return res.status(response.statusCode).json({ message: response.message, ...(response.trip && { trip: response.trip }) });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};

const completeTrip = async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid trip id." });

  const { endOdometerKm: endOdometerInput, fuelConsumedLiters: fuelConsumedInput } = req.body;
  if (endOdometerInput === null || fuelConsumedInput === null || endOdometerInput === undefined || fuelConsumedInput === undefined) {
    return res.status(400).json({ message: "endOdometerKm and fuelConsumedLiters are required." });
  }
  const endOdometerKm = Number(endOdometerInput);
  const fuelConsumedLiters = Number(fuelConsumedInput);
  if (!Number.isFinite(endOdometerKm) || endOdometerKm < 0 || !Number.isFinite(fuelConsumedLiters) || fuelConsumedLiters < 0) {
    return res.status(400).json({ message: "endOdometerKm and fuelConsumedLiters must be non-negative numbers." });
  }

  const session = await mongoose.startSession();
  try {
    let response;
    await session.withTransaction(async () => {
      const trip = await Trip.findById(req.params.id).session(session);
      if (!trip) {
        response = { statusCode: 404, message: "Trip not found." };
        return;
      }
      if (trip.status !== "DISPATCHED") {
        response = { statusCode: 409, message: "Only dispatched trips can be completed." };
        return;
      }
      if (endOdometerKm < trip.startOdometerKm) {
        response = { statusCode: 400, message: "endOdometerKm cannot be lower than the trip start odometer." };
        return;
      }

      const [vehicle, driver] = await Promise.all([
        Vehicle.findOneAndUpdate({ _id: trip.vehicle, status: "ON_TRIP" }, { status: "AVAILABLE", odometerKm: endOdometerKm }, { new: true, session }),
        Driver.findOneAndUpdate({ _id: trip.driver, status: "ON_TRIP" }, { status: "AVAILABLE" }, { new: true, session }),
      ]);
      if (!vehicle || !driver) throw Object.assign(new Error("Trip resources are not in the expected state."), { statusCode: 409 });

      trip.status = "COMPLETED";
      trip.completedAt = new Date();
      trip.endOdometerKm = endOdometerKm;
      trip.actualDistanceKm = endOdometerKm - trip.startOdometerKm;
      trip.fuelConsumedLiters = fuelConsumedLiters;
      await trip.save({ session });
      response = { statusCode: 200, message: "Trip completed successfully.", trip };
    });
    return res.status(response.statusCode).json({ message: response.message, ...(response.trip && { trip: response.trip }) });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};

const cancelTrip = async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid trip id." });

  const session = await mongoose.startSession();
  try {
    let response;
    await session.withTransaction(async () => {
      const trip = await Trip.findById(req.params.id).session(session);
      if (!trip) {
        response = { statusCode: 404, message: "Trip not found." };
        return;
      }
      if (!["DRAFT", "DISPATCHED"].includes(trip.status)) {
        response = { statusCode: 409, message: "Only draft or dispatched trips can be cancelled." };
        return;
      }

      if (trip.status === "DISPATCHED") {
        const [vehicle, driver] = await Promise.all([
          Vehicle.findOneAndUpdate({ _id: trip.vehicle, status: "ON_TRIP" }, { status: "AVAILABLE" }, { new: true, session }),
          Driver.findOneAndUpdate({ _id: trip.driver, status: "ON_TRIP" }, { status: "AVAILABLE" }, { new: true, session }),
        ]);
        if (!vehicle || !driver) throw Object.assign(new Error("Trip resources are not in the expected state."), { statusCode: 409 });
      }

      trip.status = "CANCELLED";
      trip.cancelledAt = new Date();
      await trip.save({ session });
      response = { statusCode: 200, message: "Trip cancelled successfully.", trip };
    });
    return res.status(response.statusCode).json({ message: response.message, ...(response.trip && { trip: response.trip }) });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, dispatchTrip, completeTrip, cancelTrip };
