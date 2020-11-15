const mongoose = require("mongoose");

const Room = mongoose.model("Room", {
  title: String,
  description: String,
  price: Number,
  pictures: [{ type: mongoose.Schema.Types.Mixed, default: {} }],
  location: {
    lat: String,
    lng: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Room;
