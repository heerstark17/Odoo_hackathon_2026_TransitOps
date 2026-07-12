const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/, "Enter a valid vehicle registration number."],
    },
    nameOrModel: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
    type: { type: String, required: true, trim: true, uppercase: true, enum: ["TRUCK", "VAN", "BUS"] },
    maxLoadCapacityKg: { type: Number, required: true, min: 100, max: 100000 },
    odometerKm: { type: Number, required: true, min: 0, max: 5000000 },
    acquisitionCost: { type: Number, required: true, min: 50000, max: 100000000 },
    region: { type: String, trim: true, default: "Unassigned" },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"],
      default: "AVAILABLE",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

vehicleSchema.index({ type: 1, status: 1, region: 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
