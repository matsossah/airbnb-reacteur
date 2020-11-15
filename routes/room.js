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
        location: {
          lat: lat,
          lng: lng,
        },
        owner: req.user,
      });
      // Envoyer l'image à cloudinary
      const result = await cloudinary.uploader.upload(picture, {
        folder: `/Airbnb/${newRoom._id}`,
      });

      newRoom.pictures.push(result);

      // Sauvegarder la room
      await newRoom.save();

      //Ajouter la room au compte du user
      req.user.rooms.push(newRoom);
      await req.user.save();

      res.status(200).json({
        _id: newRoom._id,
        title: title,
        description: description,
        price: price,
        pictures: newRoom.pictures,
        location: [lat, lng],
        owner: req.user,
      });
    } else {
      res.status(400).json({ message: "Invalid Parameters" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find().select(
      "_id title price owner pictures location"
    );
    res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/room/:id", async (req, res) => {
  let id = req.params.id;
  console.log(id);
  try {
    if (id) {
      const room = await Room.findById(id).populate("owner");
      res.status(200).json(room);
    } else {
      res.status(400).json({ message: "id missing" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
