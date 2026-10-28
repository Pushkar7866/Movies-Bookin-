const express = require("express");
const Show = require("../models/showModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser, adminOnly } = require("../middleware/fetchUser");

const router = express.Router();

// GET /api/shows?movieId=  (upcoming shows, sorted by date/time)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = {};
    if (req.query.movieId) q.movie = req.query.movieId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    q.showDate = { $gte: today };
    const shows = await Show.find(q).populate("theatre").populate("movie", "movieName poster").sort({ showDate: 1, showTime: 1 });
    res.json(shows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const show = await Show.findById(req.params.id).populate("theatre").populate("movie", "movieName poster language runtime");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  })
);

router.post(
  "/",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { movie, theatre, showDate, showTime, price } = req.body;
    if (!movie || !theatre || !showDate || !showTime || price == null)
      return res.status(400).json({ message: "Movie, theatre, date, time and price are required" });
    res.status(201).json(await Show.create({ movie, theatre, showDate, showTime, price }));
  })
);

router.delete(
  "/:id",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    await Show.findByIdAndDelete(req.params.id);
    res.json({ message: "Show deleted" });
  })
);

module.exports = router;
