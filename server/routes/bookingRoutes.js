const express = require("express");
const crypto = require("crypto");
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser, adminOnly } = require("../middleware/fetchUser");

const router = express.Router();

const allSeats = (rows, cols) => {
  const set = new Set();
  for (let r = 0; r < rows; r++) for (let c = 1; c <= cols; c++) set.add(String.fromCharCode(65 + r) + c);
  return set;
};

// Create booking (payment is simulated - swap in Razorpay/Stripe here)
router.post(
  "/",
  fetchUser,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "user") return res.status(403).json({ message: "Log in as a user to book tickets" });

    const { showId, paymentMethod } = req.body;
    const seats = [...new Set(req.body.seats || [])];
    if (!seats.length) return res.status(400).json({ message: "Select at least one seat" });
    if (seats.length > 10) return res.status(400).json({ message: "You can book up to 10 seats at a time" });

    const show = await Show.findById(showId).populate("theatre");
    if (!show) return res.status(404).json({ message: "Show not found" });

    const valid = allSeats(show.theatre.rows, show.theatre.cols);
    if (!seats.every((s) => valid.has(s))) return res.status(400).json({ message: "Invalid seat selected" });

    // Atomic lock: only succeeds if NONE of the seats are already booked
    const locked = await Show.updateOne(
      { _id: showId, bookedSeats: { $nin: seats } },
      { $push: { bookedSeats: { $each: seats } } }
    );
    if (locked.modifiedCount === 0)
      return res.status(409).json({ message: "Some of these seats were just booked. Please pick other seats" });

    try {
      const booking = await Booking.create({
        user: req.user.id,
        show: showId,
        seats,
        amount: seats.length * show.price,
        payment: {
          method: paymentMethod || "card",
          status: "paid",
          transactionId: "TXN" + crypto.randomBytes(5).toString("hex").toUpperCase(),
        },
      });
      res.status(201).json(booking);
    } catch (err) {
      await Show.updateOne({ _id: showId }, { $pull: { bookedSeats: { $in: seats } } }); // rollback
      throw err;
    }
  })
);

const populateBooking = (q) =>
  q.populate({ path: "show", populate: [{ path: "movie", select: "movieName poster" }, { path: "theatre" }] });

router.get(
  "/my",
  fetchUser,
  asyncHandler(async (req, res) => res.json(await populateBooking(Booking.find({ user: req.user.id }).sort({ createdAt: -1 }))))
);

router.get(
  "/all",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) =>
    res.json(await populateBooking(Booking.find().populate("user", "username email").sort({ createdAt: -1 })))
  )
);

router.put(
  "/:id/cancel",
  fetchUser,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role !== "admin" && String(booking.user) !== req.user.id)
      return res.status(403).json({ message: "Not your booking" });
    if (booking.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });

    booking.status = "cancelled";
    booking.payment.status = "refunded";
    await booking.save();
    await Show.updateOne({ _id: booking.show }, { $pull: { bookedSeats: { $in: booking.seats } } });
    res.json(booking);
  })
);

module.exports = router;
