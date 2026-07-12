const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
    cargoWeightKg: { type: Number, required: true, min: 0 },
    plannedDistanceKm: { type: Number, required: true, min: 0 },
    actualDistanceKm: { type: Number, min: 0, default: null },
    plannedStartAt: { type: Date, required: true },
    estimatedArrivalAt: { type: Date, default: null },
    dispatchedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    startOdometerKm: { type: Number, min: 0, default: null },
    endOdometerKm: { type: Number, min: 0, default: null },
    fuelConsumedLiters: { type: Number, min: 0, default: 0 },
    revenue: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

tripSchema.index({ vehicle: 1, status: 1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ status: 1, plannedStartAt: -1 });

module.exports = mongoose.model("Trip", tripSchema);
