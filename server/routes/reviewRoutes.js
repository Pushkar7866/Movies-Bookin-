const express = require("express");
const Review = require("../models/reviewModel");
const Movie = require("../models/movieModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser, adminOnly } = require("../middleware/fetchUser");

const router = express.Router();

const recalc = async (movieId) => {
  const reviews = await Review.find({ movie: movieId });
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Movie.findByIdAndUpdate(movieId, { rating: Math.round(avg * 10) / 10, ratingCount: count });
};

router.get(
  "/movie/:movieId",
  asyncHandler(async (req, res) =>
    res.json(await Review.find({ movie: req.params.movieId }).populate("user", "username").sort({ createdAt: -1 }))
  )
);

// One review per user per movie (posting again updates it)
router.post(
  "/movie/:movieId",
  fetchUser,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "user") return res.status(403).json({ message: "Log in as a user to review" });
    const { rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { user: req.user.id, movie: req.params.movieId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await recalc(req.params.movieId);
    res.status(201).json(review);
  })
);

router.delete(
  "/:id",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (review) await recalc(review.movie);
    res.json({ message: "Review removed" });
  })
);

module.exports = router;
