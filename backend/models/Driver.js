const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    licenseCategory: { type: String, required: true, trim: true, uppercase: true },
    licenseExpiryDate: { type: Date, required: true },
    contactNumber: { type: String, required: true, trim: true },
    safetyScore: { type: Number, required: true, min: 0, max: 100, default: 100 },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"],
      default: "AVAILABLE",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

driverSchema.index({ status: 1, licenseExpiryDate: 1 });

module.exports = mongoose.model("Driver", driverSchema);
