const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    category: {
      type: String,
      enum: ["TOLL", "PARKING", "OTHER"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, required: true, default: Date.now },
    description: { type: String, trim: true, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

expenseSchema.index({ vehicle: 1, expenseDate: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
