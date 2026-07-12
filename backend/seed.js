require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");
const Trip = require("./models/Trip");
const MaintenanceLog = require("./models/MaintenanceLog");
const FuelLog = require("./models/FuelLog");
const Expense = require("./models/Expense");

// Dates are relative so the reports stay useful whenever the project is judged.
const daysFromToday = (days, hour = 9) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const seedDatabase = async () => {
  await connectDB();

  try {
    // A seed run intentionally creates one known, judge-ready dataset.
    await Promise.all([
      Expense.deleteMany({}),
      FuelLog.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      Trip.deleteMany({}),
      Driver.deleteMany({}),
      Vehicle.deleteMany({}),
      User.deleteMany({}),
    ]);

    const password = await bcrypt.hash("TransitOps@123", 12);
    const users = await User.insertMany([
      { name: "Maya Rao", email: "manager@transitops.demo", password, role: "FLEET_MANAGER" },
      { name: "Arjun Mehta", email: "dispatcher@transitops.demo", password, role: "DISPATCHER" },
      { name: "Nisha Kapoor", email: "safety@transitops.demo", password, role: "SAFETY_OFFICER" },
      { name: "Vikram Shah", email: "finance@transitops.demo", password, role: "FINANCIAL_ANALYST" },
    ]);
    const [manager, dispatcher, safetyOfficer, analyst] = users;

    const vehicles = await Vehicle.insertMany([
      { registrationNumber: "MH12TR1001", nameOrModel: "Tata Prima 5530", type: "TRUCK", maxLoadCapacityKg: 18000, odometerKm: 45820, acquisitionCost: 4200000, region: "West", status: "AVAILABLE", createdBy: manager._id },
      { registrationNumber: "MH12TR1002", nameOrModel: "Ashok Leyland 1920", type: "TRUCK", maxLoadCapacityKg: 12000, odometerKm: 36940, acquisitionCost: 3100000, region: "West", status: "ON_TRIP", createdBy: manager._id },
      { registrationNumber: "KA01TR2001", nameOrModel: "Eicher Pro 3019", type: "TRUCK", maxLoadCapacityKg: 9000, odometerKm: 28610, acquisitionCost: 2750000, region: "South", status: "AVAILABLE", createdBy: manager._id },
      { registrationNumber: "KA01VN2002", nameOrModel: "Force Traveller", type: "VAN", maxLoadCapacityKg: 1500, odometerKm: 18240, acquisitionCost: 1850000, region: "South", status: "IN_SHOP", createdBy: manager._id },
      { registrationNumber: "DL01VN3001", nameOrModel: "Tata Intra V50", type: "VAN", maxLoadCapacityKg: 1700, odometerKm: 22475, acquisitionCost: 980000, region: "North", status: "AVAILABLE", createdBy: manager._id },
      { registrationNumber: "DL01TR3002", nameOrModel: "BharatBenz 2823", type: "TRUCK", maxLoadCapacityKg: 14000, odometerKm: 51800, acquisitionCost: 3600000, region: "North", status: "ON_TRIP", createdBy: manager._id },
      { registrationNumber: "GJ05TR4001", nameOrModel: "Mahindra Blazo X", type: "TRUCK", maxLoadCapacityKg: 11000, odometerKm: 61750, acquisitionCost: 2900000, region: "West", status: "AVAILABLE", createdBy: manager._id },
      { registrationNumber: "TN09VN5001", nameOrModel: "Maruti Super Carry", type: "VAN", maxLoadCapacityKg: 740, odometerKm: 89400, acquisitionCost: 620000, region: "South", status: "RETIRED", createdBy: manager._id },
    ]);
    const [prima, leyland, eicher, traveller, intra, bharatbenz, blazo, retiredVan] = vehicles;

    const drivers = await Driver.insertMany([
      { name: "Alex Joseph", licenseNumber: "MH142018000101", licenseCategory: "HMV", licenseExpiryDate: daysFromToday(700), contactNumber: "+91 98765 10001", safetyScore: 96, status: "AVAILABLE", createdBy: safetyOfficer._id },
      { name: "Priya Nair", licenseNumber: "MH142019000102", licenseCategory: "HMV", licenseExpiryDate: daysFromToday(520), contactNumber: "+91 98765 10002", safetyScore: 94, status: "ON_TRIP", createdBy: safetyOfficer._id },
      { name: "Rohan Singh", licenseNumber: "KA052017000103", licenseCategory: "HMV", licenseExpiryDate: daysFromToday(430), contactNumber: "+91 98765 10003", safetyScore: 91, status: "AVAILABLE", createdBy: safetyOfficer._id },
      { name: "Kavita Iyer", licenseNumber: "KA052020000104", licenseCategory: "LMV", licenseExpiryDate: daysFromToday(610), contactNumber: "+91 98765 10004", safetyScore: 98, status: "AVAILABLE", createdBy: safetyOfficer._id },
      { name: "Imran Khan", licenseNumber: "DL142016000105", licenseCategory: "LMV", licenseExpiryDate: daysFromToday(300), contactNumber: "+91 98765 10005", safetyScore: 89, status: "AVAILABLE", createdBy: safetyOfficer._id },
      { name: "Neeraj Patel", licenseNumber: "DL142018000106", licenseCategory: "HMV", licenseExpiryDate: daysFromToday(540), contactNumber: "+91 98765 10006", safetyScore: 93, status: "ON_TRIP", createdBy: safetyOfficer._id },
      { name: "Sonal Desai", licenseNumber: "GJ052015000107", licenseCategory: "HMV", licenseExpiryDate: daysFromToday(250), contactNumber: "+91 98765 10007", safetyScore: 87, status: "OFF_DUTY", createdBy: safetyOfficer._id },
      { name: "Manoj Kumar", licenseNumber: "TN102014000108", licenseCategory: "LMV", licenseExpiryDate: daysFromToday(-20), contactNumber: "+91 98765 10008", safetyScore: 82, status: "SUSPENDED", createdBy: safetyOfficer._id },
    ]);
    const [alex, priya, rohan, kavita, imran, neeraj, sonal] = drivers;

    const completedTrips = await Trip.insertMany([
      { tripNumber: "TOPS-1001", source: "Pune", destination: "Mumbai", vehicle: prima._id, driver: alex._id, cargoWeightKg: 12500, plannedDistanceKm: 155, actualDistanceKm: 162, plannedStartAt: daysFromToday(-150), estimatedArrivalAt: daysFromToday(-150, 15), dispatchedAt: daysFromToday(-150), completedAt: daysFromToday(-149), startOdometerKm: 44120, endOdometerKm: 44282, fuelConsumedLiters: 48, revenue: 68000, status: "COMPLETED", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1002", source: "Bengaluru", destination: "Chennai", vehicle: eicher._id, driver: rohan._id, cargoWeightKg: 7200, plannedDistanceKm: 350, actualDistanceKm: 358, plannedStartAt: daysFromToday(-121), estimatedArrivalAt: daysFromToday(-120), dispatchedAt: daysFromToday(-121), completedAt: daysFromToday(-120), startOdometerKm: 27210, endOdometerKm: 27568, fuelConsumedLiters: 76, revenue: 89000, status: "COMPLETED", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1003", source: "Delhi", destination: "Jaipur", vehicle: intra._id, driver: imran._id, cargoWeightKg: 1100, plannedDistanceKm: 280, actualDistanceKm: 287, plannedStartAt: daysFromToday(-98), estimatedArrivalAt: daysFromToday(-97), dispatchedAt: daysFromToday(-98), completedAt: daysFromToday(-97), startOdometerKm: 21480, endOdometerKm: 21767, fuelConsumedLiters: 31, revenue: 42000, status: "COMPLETED", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1004", source: "Ahmedabad", destination: "Surat", vehicle: blazo._id, driver: sonal._id, cargoWeightKg: 9000, plannedDistanceKm: 270, actualDistanceKm: 278, plannedStartAt: daysFromToday(-74), estimatedArrivalAt: daysFromToday(-73), dispatchedAt: daysFromToday(-74), completedAt: daysFromToday(-73), startOdometerKm: 60210, endOdometerKm: 60488, fuelConsumedLiters: 64, revenue: 76000, status: "COMPLETED", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1005", source: "Mumbai", destination: "Nashik", vehicle: prima._id, driver: alex._id, cargoWeightKg: 8000, plannedDistanceKm: 170, actualDistanceKm: 176, plannedStartAt: daysFromToday(-52), estimatedArrivalAt: daysFromToday(-52, 16), dispatchedAt: daysFromToday(-52), completedAt: daysFromToday(-51), startOdometerKm: 45110, endOdometerKm: 45286, fuelConsumedLiters: 51, revenue: 61000, status: "COMPLETED", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1006", source: "Chennai", destination: "Coimbatore", vehicle: eicher._id, driver: rohan._id, cargoWeightKg: 6500, plannedDistanceKm: 505, actualDistanceKm: 512, plannedStartAt: daysFromToday(-30), estimatedArrivalAt: daysFromToday(-29), dispatchedAt: daysFromToday(-30), completedAt: daysFromToday(-29), startOdometerKm: 28098, endOdometerKm: 28610, fuelConsumedLiters: 108, revenue: 117000, status: "COMPLETED", createdBy: dispatcher._id },
    ]);
    const [trip1, trip2, trip3, trip4, trip5, trip6] = completedTrips;

    const activeTrips = await Trip.insertMany([
      { tripNumber: "TOPS-1007", source: "Pune", destination: "Goa", vehicle: leyland._id, driver: priya._id, cargoWeightKg: 9500, plannedDistanceKm: 450, plannedStartAt: daysFromToday(-1), estimatedArrivalAt: daysFromToday(1), dispatchedAt: daysFromToday(-1), startOdometerKm: 36940, revenue: 124000, status: "DISPATCHED", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1008", source: "Delhi", destination: "Lucknow", vehicle: bharatbenz._id, driver: neeraj._id, cargoWeightKg: 10500, plannedDistanceKm: 555, plannedStartAt: daysFromToday(0), estimatedArrivalAt: daysFromToday(1), dispatchedAt: daysFromToday(0), startOdometerKm: 51800, revenue: 142000, status: "DISPATCHED", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1009", source: "Pune", destination: "Kolhapur", vehicle: prima._id, driver: alex._id, cargoWeightKg: 7000, plannedDistanceKm: 235, plannedStartAt: daysFromToday(2), estimatedArrivalAt: daysFromToday(2, 18), revenue: 73000, status: "DRAFT", createdBy: dispatcher._id },
      { tripNumber: "TOPS-1010", source: "Delhi", destination: "Agra", vehicle: intra._id, driver: imran._id, cargoWeightKg: 900, plannedDistanceKm: 235, plannedStartAt: daysFromToday(-12), estimatedArrivalAt: daysFromToday(-12, 17), cancelledAt: daysFromToday(-11), revenue: 38000, status: "CANCELLED", createdBy: dispatcher._id },
    ]);
    const [activeTrip1, activeTrip2] = activeTrips;

    await MaintenanceLog.insertMany([
      { vehicle: traveller._id, maintenanceType: "Brake system overhaul", description: "Brake pads and rear drum inspection in progress.", cost: 18500, odometerKm: 18240, openedAt: daysFromToday(-3), status: "ACTIVE", createdBy: manager._id },
      { vehicle: prima._id, maintenanceType: "Scheduled oil service", description: "Engine oil, filters, and tyre rotation completed.", cost: 12400, odometerKm: 45290, openedAt: daysFromToday(-45), closedAt: daysFromToday(-44), status: "CLOSED", createdBy: manager._id, closedBy: manager._id },
      { vehicle: blazo._id, maintenanceType: "Tyre replacement", description: "Two rear tyres replaced after scheduled inspection.", cost: 22800, odometerKm: 60500, openedAt: daysFromToday(-20), closedAt: daysFromToday(-19), status: "CLOSED", createdBy: manager._id, closedBy: manager._id },
    ]);

    await FuelLog.insertMany([
      { vehicle: prima._id, trip: trip1._id, date: daysFromToday(-149), liters: 48, cost: 4896, odometerKm: 44282, fuelStation: "HPCL Panvel", recordedBy: analyst._id },
      { vehicle: eicher._id, trip: trip2._id, date: daysFromToday(-120), liters: 76, cost: 7752, odometerKm: 27568, fuelStation: "IndianOil Vellore", recordedBy: analyst._id },
      { vehicle: intra._id, trip: trip3._id, date: daysFromToday(-97), liters: 31, cost: 3193, odometerKm: 21767, fuelStation: "BPCL Jaipur Road", recordedBy: analyst._id },
      { vehicle: blazo._id, trip: trip4._id, date: daysFromToday(-73), liters: 64, cost: 6528, odometerKm: 60488, fuelStation: "HPCL Surat", recordedBy: analyst._id },
      { vehicle: prima._id, trip: trip5._id, date: daysFromToday(-51), liters: 51, cost: 5202, odometerKm: 45286, fuelStation: "IndianOil Nashik", recordedBy: analyst._id },
      { vehicle: eicher._id, trip: trip6._id, date: daysFromToday(-29), liters: 108, cost: 11124, odometerKm: 28610, fuelStation: "BPCL Coimbatore", recordedBy: analyst._id },
      { vehicle: leyland._id, trip: activeTrip1._id, date: daysFromToday(-1), liters: 85, cost: 8755, odometerKm: 36940, fuelStation: "HPCL Pune", recordedBy: analyst._id },
      { vehicle: bharatbenz._id, trip: activeTrip2._id, date: daysFromToday(0), liters: 95, cost: 9785, odometerKm: 51800, fuelStation: "IndianOil Delhi", recordedBy: analyst._id },
    ]);

    await Expense.insertMany([
      { vehicle: prima._id, trip: trip1._id, category: "TOLL", amount: 1250, expenseDate: daysFromToday(-149), description: "Mumbai–Pune Expressway toll", recordedBy: analyst._id },
      { vehicle: eicher._id, trip: trip2._id, category: "TOLL", amount: 1890, expenseDate: daysFromToday(-120), description: "Bengaluru–Chennai corridor tolls", recordedBy: analyst._id },
      { vehicle: intra._id, trip: trip3._id, category: "PARKING", amount: 450, expenseDate: daysFromToday(-97), description: "Jaipur delivery parking", recordedBy: analyst._id },
      { vehicle: blazo._id, trip: trip4._id, category: "TOLL", amount: 1420, expenseDate: daysFromToday(-73), description: "Ahmedabad–Surat highway toll", recordedBy: analyst._id },
      { vehicle: prima._id, trip: trip5._id, category: "OTHER", amount: 780, expenseDate: daysFromToday(-51), description: "Loading bay handling charge", recordedBy: analyst._id },
      { vehicle: traveller._id, category: "OTHER", amount: 1200, expenseDate: daysFromToday(-3), description: "Roadside assistance inspection", recordedBy: analyst._id },
    ]);

    console.log("TransitOps demo database seeded successfully.");
    console.log("Demo accounts (all use password: TransitOps@123):");
    console.log("  manager@transitops.demo    (Fleet Manager)");
    console.log("  dispatcher@transitops.demo (Dispatcher)");
    console.log("  safety@transitops.demo     (Safety Officer)");
    console.log("  finance@transitops.demo    (Financial Analyst)");
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase().catch((error) => {
  console.error("Seeding failed:", error.message);
  mongoose.connection.close().finally(() => process.exit(1));
});
