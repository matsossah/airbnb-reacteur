const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

router.post("/user/sign_up", async (req, res) => {
  const { email, username, phone, avatar, password } = req.fields;
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
        res.status(200).json({ message: "Authorized" });
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

module.exports = router;
