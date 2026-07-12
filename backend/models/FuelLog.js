const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    date: { type: Date, required: true, default: Date.now },
    liters: { type: Number, required: true, min: 0.01 },
    cost: { type: Number, required: true, min: 0 },
    odometerKm: { type: Number, min: 0, default: null },
    fuelStation: { type: String, trim: true, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

fuelLogSchema.index({ vehicle: 1, date: -1 });

module.exports = mongoose.model("FuelLog", fuelLogSchema);
