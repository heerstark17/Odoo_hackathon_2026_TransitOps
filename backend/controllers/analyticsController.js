const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const FuelLog = require("../models/FuelLog");
const MaintenanceLog = require("../models/MaintenanceLog");

const getAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : null;
    const end = to ? new Date(to) : null;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime())) || (start && end && start > end)) {
      return res.status(400).json({ message: "Provide a valid date range." });
    }

    const tripMatch = { status: "COMPLETED", ...(start || end ? { completedAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } } : {}) };
    const fuelMatch = start || end ? { date: { ...(start && { $gte: start }), ...(end && { $lte: end }) } } : {};
    const maintenanceMatch = start || end ? { openedAt: { ...(start && { $gte: start }), ...(end && { $lte: end }) } } : {};

    const [tripTotals, fuelTotals, maintenanceTotals, acquisitionTotals, monthlyRevenue, fuelByVehicle, maintenanceByVehicle] = await Promise.all([
      Trip.aggregate([{ $match: tripMatch }, { $group: { _id: null, distance: { $sum: "$actualDistanceKm" }, fuel: { $sum: "$fuelConsumedLiters" }, revenue: { $sum: "$revenue" } } }]),
      FuelLog.aggregate([{ $match: fuelMatch }, { $group: { _id: null, cost: { $sum: "$cost" } } }]),
      MaintenanceLog.aggregate([{ $match: maintenanceMatch }, { $group: { _id: null, cost: { $sum: "$cost" } } }]),
      Vehicle.aggregate([{ $group: { _id: null, cost: { $sum: "$acquisitionCost" } } }]),
      Trip.aggregate([
        { $match: tripMatch },
        { $group: { _id: { year: { $year: "$completedAt" }, month: { $month: "$completedAt" } }, revenue: { $sum: "$revenue" } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $project: { _id: 0, year: "$_id.year", month: "$_id.month", revenue: 1 } },
      ]),
      FuelLog.aggregate([{ $match: fuelMatch }, { $group: { _id: "$vehicle", cost: { $sum: "$cost" } } }]),
      MaintenanceLog.aggregate([{ $match: maintenanceMatch }, { $group: { _id: "$vehicle", cost: { $sum: "$cost" } } }]),
    ]);

    const distance = tripTotals[0]?.distance || 0;
    const fuelConsumed = tripTotals[0]?.fuel || 0;
    const revenue = tripTotals[0]?.revenue || 0;
    const fuelCost = fuelTotals[0]?.cost || 0;
    const maintenanceCost = maintenanceTotals[0]?.cost || 0;
    const acquisitionCost = acquisitionTotals[0]?.cost || 0;
    const costByVehicle = new Map();
    for (const item of [...fuelByVehicle, ...maintenanceByVehicle]) {
      const id = item._id.toString();
      costByVehicle.set(id, (costByVehicle.get(id) || 0) + item.cost);
    }
    const vehicles = await Vehicle.find({ _id: { $in: [...costByVehicle.keys()] } }).select("registrationNumber nameOrModel");
    const vehicleLookup = new Map(vehicles.map((vehicle) => [vehicle._id.toString(), vehicle]));
    const costliestVehicles = [...costByVehicle.entries()]
      .map(([id, cost]) => ({ vehicle: vehicleLookup.get(id), cost }))
      .filter((item) => item.vehicle)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    const operationalCost = fuelCost + maintenanceCost;
    return res.status(200).json({
      kpis: {
        fuelEfficiencyKmPerLiter: fuelConsumed ? Number((distance / fuelConsumed).toFixed(2)) : 0,
        operationalCost,
        vehicleRoiPercent: acquisitionCost ? Number((((revenue - operationalCost) / acquisitionCost) * 100).toFixed(2)) : 0,
        revenue,
      },
      monthlyRevenue,
      costliestVehicles,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAnalytics };
