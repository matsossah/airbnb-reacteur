const mongoose = require("mongoose");

const User = mongoose.model("User", {
  account: {
    email: {
      required: true,
      unique: true,
      type: String,
    },
    username: String,
    phone: String,
    avatar: mongoose.Schema.Types.Mixed,
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
