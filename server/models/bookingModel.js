const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    seats: { type: [String], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
    payment: {
      method: { type: String, default: "card" },
      status: { type: String, enum: ["paid", "refunded"], default: "paid" },
      transactionId: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
