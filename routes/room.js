const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Room = require("../models/Room");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/room/publish", isAuthenticated, async (req, res) => {
  const { title, description, price, lat, lng } = req.fields;
  const picture = req.files.picture.path;
  try {
    // Création d'un nouvelle offre (sans l'image)
    if (title && description && price && lat && lng) {
      const newRoom = new Room({
        title: title,
        description: description,
        price: price,
        lat: lat,
        lng: lng,
        owner: req.user,
      });
      // Envoyer l'image à cloudinary
      const result = await cloudinary.uploader.upload(picture, {
        folder: `/Airbnb/${newRoom._id}`,
      });

      newRoom.picture = result;

      // Sauvegarder l'offre
      await newRoom.save();

      res.status(200).json(newRoom);
    } else {
      res.status(400).json({ message: "Invalid Parameters" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
