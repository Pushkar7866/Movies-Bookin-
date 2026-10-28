const express = require("express");
const Theatre = require("../models/theatreModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser, adminOnly } = require("../middleware/fetchUser");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => res.json(await Theatre.find().sort({ theatreName: 1 }))));

router.post(
  "/",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => res.status(201).json(await Theatre.create(req.body)))
);

router.delete(
  "/:id",
  fetchUser,
  adminOnly,
  asyncHandler(async (req, res) => {
    await Theatre.findByIdAndDelete(req.params.id);
    res.json({ message: "Theatre deleted" });
  })
);

module.exports = router;
