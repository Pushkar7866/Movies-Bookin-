const express = require("express");
const Movie = require("../models/movieModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser, adminOnly } = require("../middleware/fetchUser");

const router = express.Router();

const clean = (b) => ({
  ...b,
  genres: Array.isArray(b.genres) ? b.genres : String(b.genres || "").split(",").map((s) => s.trim()).filter(Boolean),
  cast: Array.isArray(b.cast) ? b.cast : String(b.cast || "").split(",").map((s) => s.trim()).filter(Boolean),
});

// GET /api/movies?search=&genre=&language=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, genre, language } = req.query;
    const q = {};
    if (search) q.movieName = { $regex: search, $options: "i" };
    if (genre) q.genres = genre;
    if (language) q.language = language;
    res.json(await Movie.find(q).sort({ releaseDate: -1 }));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  })
);

router.post(
  "/",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => res.status(201).json(await Movie.create(clean(req.body))))
);

router.put(
  "/:id",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    const movie = await Movie.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  })
);

router.delete(
  "/:id",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: "Movie deleted" });
  })
);

module.exports = router;
