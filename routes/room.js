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
      // // Envoyer l'image à cloudinary
      // const result = await cloudinary.uploader.upload(picture, {
      //   folder: `/Airbnb/${newRoom._id}`,
      // });

      // newRoom.pictures.push(result);

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
        location: { lat: lat, lng: lng },
        owner: req.user,
      });
    } else {
      res.status(400).json({ message: "Invalid Parameters" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/room/upload_picture/:id", isAuthenticated, async (req, res) => {
  const picture = req.files.picture.path;
  let id = req.params.id;
  try {
    if (req.user && id && picture) {
      let roomToUpdate = await Room.findById(id);
      if (req.user._id == roomToUpdate.owner.toString()) {
        // Envoyer l'image à cloudinary
        const result = await cloudinary.uploader.upload(picture, {
          folder: `/Airbnb/${roomToUpdate._id}`,
        });

        roomToUpdate.pictures.push(result);
        await roomToUpdate.save();
        res.status(200).json(roomToUpdate);
      } else {
        res
          .status(200)
          .json({ message: "Only the owner of this room can add pictures" });
      }
    } else {
      res.status(400).json({ message: "Invalid Parameters" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/room/delete_picture/:id", isAuthenticated, async (req, res) => {
  let roomId = req.params.id;
  let picture_id = req.fields.picture_id;
  try {
    if (req.user && picture_id && roomId) {
      let roomToUpdate = await Room.findById(roomId);
      let cloudinaryAddress = `Airbnb/${roomId}/${picture_id}`;

      if (req.user._id == roomToUpdate.owner.toString()) {
        let roomPictures = roomToUpdate.pictures;
        let newRoomPictures = [];
        for (let i = 0; i < roomPictures.length; i++) {
          if (cloudinaryAddress === roomPictures[i].public_id) {
            await cloudinary.uploader.destroy(
              //needs the public_id to delete
              cloudinaryAddress,
              function (error, result) {
                console.log(result, error);
              }
            );
          } else {
            newRoomPictures.push(roomPictures[i]);
          }
        }
        roomToUpdate.pictures = newRoomPictures;
        roomToUpdate.save();
        res.status(200).json(roomToUpdate);
      } else {
        res
          .status(200)
          .json({ message: "Only the owner of this room can add pictures" });
      }
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

router.put("/room/update/:id", isAuthenticated, async (req, res) => {
  let id = req.params.id;
  try {
    if (id) {
      const room = await Room.findById(id).populate("owner");
      let roomOwnerToken = room.owner.token;
      let currentUserToken = req.token;
      let newTitle = req.fields.title;
      let newDescription = req.fields.description;
      let newPrice = req.fields.price;
      let newLat = req.fields.lat;
      let newLng = req.fields.lng;

      if (roomOwnerToken === currentUserToken) {
        if (newTitle) {
          room.title = newTitle;
        }
        if (newDescription) {
          room.description = newDescription;
        }
        if (newPrice) {
          room.price = newPrice;
        }
        if (newLat) {
          room.location.lat = newLat;
        }
        if (newLng) {
          room.location.lng = newLng;
        }
        room.save();
        res.status(200).json(room);
      } else {
        res.status(400).json({ message: "only the room owner can modify it" });
      }
    } else {
      res.status(400).json({ message: "Please specify a room id" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/room/delete/:id", isAuthenticated, async (req, res) => {
  let id = req.params.id;
  try {
    if (id) {
      const room = await Room.findById(id).populate("owner");
      let roomOwnerToken = room.owner.token;
      let currentUserToken = req.token;

      if (roomOwnerToken === currentUserToken) {
        await room.delete();
        let currentUserRooms = req.user.rooms;
        let updatedUserRooms = [];
        for (let i = 0; i < currentUserRooms.length; i++) {
          if (currentUserRooms[i] != room.id) {
            updatedUserRooms.push(currentUserRooms[i]);
          }
        }
        // let roomPictures = room.pictures;
        // for (let i = 0; i < roomPictures.length; i++) {
        //   await cloudinary.uploader.destroy(
        //     roomPictures[i].public_id,
        //     function (error, result) {
        //       console.log(result, error);
        //     }
        //   );
        // }

        req.user.rooms = updatedUserRooms;
        await req.user.save();
        res.status(200).json("Room Deleted");
      } else {
        res
          .status(400)
          .json({ message: "only the room owner can delete this room" });
      }
    } else {
      res.status(400).json({ message: "Please specify a room id" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
