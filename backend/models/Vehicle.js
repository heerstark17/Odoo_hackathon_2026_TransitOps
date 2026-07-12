const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    nameOrModel: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, uppercase: true },
    maxLoadCapacityKg: { type: Number, required: true, min: 1 },
    odometerKm: { type: Number, required: true, min: 0 },
    acquisitionCost: { type: Number, required: true, min: 0 },
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
