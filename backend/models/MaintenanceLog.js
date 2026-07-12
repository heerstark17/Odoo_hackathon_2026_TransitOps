const mongoose = require("mongoose");

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    maintenanceType: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    cost: { type: Number, required: true, min: 0 },
    odometerKm: { type: Number, min: 0, default: null },
    openedAt: { type: Date, required: true, default: Date.now },
    closedAt: { type: Date, default: null },
    status: { type: String, enum: ["ACTIVE", "CLOSED"], default: "ACTIVE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

maintenanceLogSchema.index({ vehicle: 1, status: 1 });

module.exports = mongoose.model("MaintenanceLog", maintenanceLogSchema);
