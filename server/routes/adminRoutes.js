const express = require("express");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser, adminOnly } = require("../middleware/fetchUser");

const router = express.Router();

router.get(
  "/stats",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [movies, theatres, shows, users, bookings, revenue] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.aggregate([{ $match: { status: "confirmed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);
    res.json({ movies, theatres, shows, users, bookings, revenue: revenue[0]?.total || 0 });
  })
);

module.exports = router;
