const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post("/user/sign_up", async (req, res) => {
  res.status(200).json({ message: "LVQM First Tricorn" });
});

router.post("/user/log_in", async (req, res) => {
  res.status(200).json({ message: "LVQM First Tricorn" });
});

module.exports = router;
