const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");
const Room = require("../models/Room");

router.post("/user/sign_up", async (req, res) => {
  const { email, username, phone, avatar, password, description } = req.fields;
  try {
    if (email && password) {
      const newUserExists = await User.findOne({ email: email });

      if (newUserExists) {
        res.status(409).json({ message: "This email is already taken" });
      } else {
        let newUserSalt = uid2(16);
        let newUserHash = SHA256(password + newUserSalt).toString(encBase64);
        let newUserToken = uid2(16);

        newUserFields = {
          account: {
            email: email,
          },
          token: newUserToken,
          hash: newUserHash,
          salt: newUserSalt,
        };

        if (username) {
          newUserFields.account.username = username;
        }
        if (description) {
          newUserFields.account.description = description;
        }
        if (phone) {
          newUserFields.account.phone = phone;
        }
        if (avatar) {
          newUserFields.account.avatar = avatar;
        }
        let newUser = await new User(newUserFields);
        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          account: newUser.account,
          token: newUser.token,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/log_in", async (req, res) => {
  const { email, password } = req.fields;
  try {
    if (email && password) {
      const existingUser = await User.findOne({ "account.email": email });
      console.log(existingUser);

      let currentUserHash = SHA256(password + existingUser.salt).toString(
        encBase64
      );

      if (currentUserHash === existingUser.hash) {
        res.status(200).json({
          _id: existingUser._id,
          account: existingUser.account,
          token: existingUser.token,
        });
      } else {
        res.status(400).json({ message: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "Invalid request" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/upload_picture/:id", isAuthenticated, async (req, res) => {
  let id = req.params.id;
  let userPicture = req.files.picture.path;
  try {
    if (req.user) {
      const result = await cloudinary.uploader.upload(userPicture, {
        folder: `/Airbnb/${req.user._id}`,
      });

      req.user.account.avatar = result;
      req.user.save();
      res.status(200).json(req.user);
    } else if (id) {
      let userToUpdate = await User.findById(id);

      const result = await cloudinary.uploader.upload(userPicture, {
        folder: `/Airbnb/${userToUpdate._id}`,
      });

      userToUpdate.account.avatar = result;
      userToUpdate.save();
      res.status(200).json(req.user);
    } else {
      res.status(400).json({ message: "Please log in or specify a user id" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/user/delete_picture/:id", isAuthenticated, async (req, res) => {
  let id = req.params.id;
  try {
    if (req.user) {
      req.user.account.avatar = null;
      req.user.save();
      res.status(200).json(req.user);
    } else if (id) {
      let userToUpdate = await User.findById(id);

      userToUpdate.account.avatar = null;
      userToUpdate.save();
      res.status(200).json(userToUpdate);
    } else {
      res.status(400).json({ message: "Please log in or specify a user id" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
