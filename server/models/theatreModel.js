const mongoose = require("mongoose");

// Seat layout is generated from rows x cols (A1, A2 ... B1 ...)
const theatreSchema = new mongoose.Schema(
  {
    theatreName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    rows: { type: Number, required: true, min: 1, max: 26, default: 8 },
    cols: { type: Number, required: true, min: 1, max: 30, default: 12 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theatre", theatreSchema);
