const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const asyncHandler = require("../utils/asyncHandler");
const { fetchUser } = require("../middleware/fetchUser");

const router = express.Router();

const sign = (doc, role) =>
  jwt.sign({ id: doc._id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const payload = (doc, role) => ({
  token: sign(doc, role),
  user: { id: doc._id, username: doc.username, email: doc.email, role },
});

const register = (Model, role) =>
  asyncHandler(async (req, res) => {
    const { username, email, password, adminKey } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (role === "admin" && adminKey !== process.env.ADMIN_KEY)
      return res.status(403).json({ message: "Invalid admin key" });

    const exists = await Model.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ message: "Username or email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const doc = await Model.create({ username, email, password: hashed });
    res.status(201).json(payload(doc, role));
  });

const login = (Model, role) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const doc = await Model.findOne({ email: (email || "").toLowerCase() });
    if (!doc || !(await bcrypt.compare(password || "", doc.password)))
      return res.status(401).json({ message: "Wrong email or password" });
    res.json(payload(doc, role));
  });

router.post("/register", register(User, "user"));
router.post("/login", login(User, "user"));
router.post("/admin/register", register(Admin, "admin"));
router.post("/admin/login", login(Admin, "admin"));

// Current logged-in account
router.get(
  "/me",
  fetchUser,
  asyncHandler(async (req, res) => {
    const Model = req.user.role === "admin" ? Admin : User;
    const doc = await Model.findById(req.user.id).select("-password");
    if (!doc) return res.status(404).json({ message: "Account not found" });
    res.json({ id: doc._id, username: doc.username, email: doc.email, role: req.user.role });
  })
);

module.exports = router;
