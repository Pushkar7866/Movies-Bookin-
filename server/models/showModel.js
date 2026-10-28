const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre", required: true },
    showDate: { type: Date, required: true },
    showTime: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    bookedSeats: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Show", showSchema);
