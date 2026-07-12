const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const FuelLog = require("../models/FuelLog");
const MaintenanceLog = require("../models/MaintenanceLog");

const CATEGORIES = ["TOLL", "PARKING", "OTHER"];
const EDITABLE_FIELDS = ["vehicle", "trip", "category", "amount", "expenseDate", "description"];
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPayload = (body) =>
  EDITABLE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const validatePayload = (expense, { creating = false } = {}) => {
  if (creating && (!expense.vehicle || !expense.category || expense.amount === undefined || expense.amount === null)) {
    return "vehicle, category, and amount are required.";
  }
  if (expense.vehicle !== undefined && !isValidId(expense.vehicle)) return "vehicle must be a valid id.";
  if (expense.trip !== undefined && expense.trip !== null && !isValidId(expense.trip)) return "trip must be a valid id.";
  if (expense.category !== undefined && !CATEGORIES.includes(String(expense.category).trim().toUpperCase())) {
    return `category must be one of: ${CATEGORIES.join(", ")}.`;
  }
  if (expense.amount !== undefined && (!Number.isFinite(Number(expense.amount)) || Number(expense.amount) < 0)) {
    return "amount must be a non-negative number.";
  }
  if (expense.expenseDate !== undefined && Number.isNaN(new Date(expense.expenseDate).getTime())) return "expenseDate must be a valid date.";
  return null;
};

const verifyReferences = async ({ vehicle, trip }) => {
  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) return { statusCode: 404, message: "Vehicle not found." };
  if (!trip) return null;

  const tripDoc = await Trip.findById(trip);
  if (!tripDoc) return { statusCode: 404, message: "Trip not found." };
  if (tripDoc.vehicle.toString() !== vehicleDoc._id.toString()) {
    return { statusCode: 400, message: "The trip does not belong to the selected vehicle." };
  }
  return null;
};

const getExpenses = async (req, res, next) => {
  try {
    const { vehicle, trip, category, page = 1, limit = 20 } = req.query;
    const query = {};
    for (const [field, value] of Object.entries({ vehicle, trip })) {
      if (value) {
        if (!isValidId(value)) return res.status(400).json({ message: `${field} must be a valid id.` });
        query[field] = value;
      }
    }
    if (category) {
      const normalized = String(category).trim().toUpperCase();
      if (!CATEGORIES.includes(normalized)) return res.status(400).json({ message: `category must be one of: ${CATEGORIES.join(", ")}.` });
      query.category = normalized;
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const [expenses, total] = await Promise.all([
      Expense.find(query).populate("vehicle", "registrationNumber nameOrModel").populate("trip", "tripNumber status").sort({ expenseDate: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
      Expense.countDocuments(query),
    ]);
    return res.status(200).json({ expenses, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return next(error);
  }
};

const getExpenseById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid expense id." });
    const expense = await Expense.findById(req.params.id).populate("vehicle", "registrationNumber nameOrModel").populate("trip", "tripNumber status");
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    return res.status(200).json({ expense });
  } catch (error) {
    return next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = validatePayload(payload, { creating: true });
    if (validationError) return res.status(400).json({ message: validationError });
    payload.category = payload.category.trim().toUpperCase();
    const referenceError = await verifyReferences(payload);
    if (referenceError) return res.status(referenceError.statusCode).json({ message: referenceError.message });

    const expense = await Expense.create({ ...payload, recordedBy: req.user._id });
    return res.status(201).json({ message: "Expense created successfully.", expense });
  } catch (error) {
    return next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid expense id." });
    const payload = buildPayload(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ message: "No editable expense fields were provided." });
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ message: validationError });
    if (payload.category) payload.category = payload.category.trim().toUpperCase();

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    const referenceError = await verifyReferences({ ...expense.toObject(), ...payload });
    if (referenceError) return res.status(referenceError.statusCode).json({ message: referenceError.message });

    Object.assign(expense, payload);
    await expense.save();
    return res.status(200).json({ message: "Expense updated successfully.", expense });
  } catch (error) {
    return next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid expense id." });
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    return res.status(200).json({ message: "Expense deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

const getExpenseSummary = async (req, res, next) => {
  try {
    const { vehicle, trip, from, to } = req.query;
    const expenseMatch = {};
    if (vehicle) {
      if (!isValidId(vehicle)) return res.status(400).json({ message: "vehicle must be a valid id." });
      expenseMatch.vehicle = new mongoose.Types.ObjectId(vehicle);
    }
    if (trip) {
      if (!isValidId(trip)) return res.status(400).json({ message: "trip must be a valid id." });
      expenseMatch.trip = new mongoose.Types.ObjectId(trip);
    }
    if (from || to) {
      const start = from ? new Date(from) : null;
      const end = to ? new Date(to) : null;
      if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) return res.status(400).json({ message: "from and to must be valid dates." });
      if (start && end && start > end) return res.status(400).json({ message: "from cannot be after to." });
      expenseMatch.expenseDate = { ...(start && { $gte: start }), ...(end && { $lte: end }) };
    }

    const fuelMatch = { ...expenseMatch };
    if (fuelMatch.expenseDate) {
      fuelMatch.date = fuelMatch.expenseDate;
      delete fuelMatch.expenseDate;
    }
    const maintenanceMatch = { ...expenseMatch };
    delete maintenanceMatch.trip;
    if (maintenanceMatch.expenseDate) {
      maintenanceMatch.openedAt = maintenanceMatch.expenseDate;
      delete maintenanceMatch.expenseDate;
    }

    const [expenseTotals, fuelTotals, maintenanceTotals] = await Promise.all([
      Expense.aggregate([{ $match: expenseMatch }, { $group: { _id: "$category", total: { $sum: "$amount" } } }]),
      FuelLog.aggregate([{ $match: fuelMatch }, { $group: { _id: null, total: { $sum: "$cost" } } }]),
      MaintenanceLog.aggregate([{ $match: maintenanceMatch }, { $group: { _id: null, total: { $sum: "$cost" } } }]),
    ]);
    const categories = Object.fromEntries(expenseTotals.map((item) => [item._id, item.total]));
    const fuelCost = fuelTotals[0]?.total || 0;
    const maintenanceCost = maintenanceTotals[0]?.total || 0;
    const tollCost = categories.TOLL || 0;
    const parkingCost = categories.PARKING || 0;
    const otherCost = categories.OTHER || 0;
    return res.status(200).json({
      fuelCost,
      maintenanceCost,
      tollCost,
      parkingCost,
      otherCost,
      otherExpenseCost: tollCost + parkingCost + otherCost,
      totalOperationalCost: fuelCost + maintenanceCost,
      totalRecordedCost: fuelCost + maintenanceCost + tollCost + parkingCost + otherCost,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseSummary };
