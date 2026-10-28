const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    movieName: { type: String, required: [true, "Movie name is required"], trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, required: [true, "Description is required"], trim: true, minlength: [10, "Description must be at least 10 characters"] },
    genres: {
      type: [String],
      required: true,
      validate: { validator: (g) => Array.isArray(g) && g.length > 0, message: "At least one genre is required" },
    },
    language: { type: String, default: "English", trim: true },
    runtime: { type: Number, default: 120 },
    certification: { type: String, default: "UA" },
    releaseDate: { type: Date, required: [true, "Release date is required"] },
    poster: { type: String, default: "" },
    cast: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
