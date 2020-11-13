const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");

// require("dotenv").config();

const app = express();
app.use(formidable());

mongoose.connect("mongodb://localhost:27017/Airbnb-Reacteur", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

app.all("*", (req, res) => {
  res.status(400).json({ message: "Cette route n'existe pas" });
});

app.listen("3000", () => {
  console.log("server started");
});
