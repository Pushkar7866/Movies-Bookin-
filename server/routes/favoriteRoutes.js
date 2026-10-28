const express = require("express");
const Favorite = require("../models/favoriteModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser } = require("../middleware/fetchUser");

const router = express.Router();

router.get(
  "/",
  fetchUser,
  asyncHandler(async (req, res) => {
    const favs = await Favorite.find({ user: req.user.id }).populate("movie").sort({ createdAt: -1 });
    res.json(favs.filter((f) => f.movie).map((f) => f.movie));
  })
);

// Toggle favorite for a movie
router.post(
  "/:movieId",
  fetchUser,
  asyncHandler(async (req, res) => {
    const filter = { user: req.user.id, movie: req.params.movieId };
    const existing = await Favorite.findOne(filter);
    if (existing) {
      await existing.deleteOne();
      return res.json({ favorite: false });
    }
    await Favorite.create(filter);
    res.json({ favorite: true });
  })
);

router.get(
  "/:movieId/status",
  fetchUser,
  asyncHandler(async (req, res) =>
    res.json({ favorite: !!(await Favorite.exists({ user: req.user.id, movie: req.params.movieId })) })
  )
);

module.exports = router;
