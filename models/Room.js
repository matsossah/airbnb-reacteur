const mongoose = require("mongoose");

const Room = mongoose.model("Room", {
  title: String,
  description: String,
  price: Number,
  picture: { type: mongoose.Schema.Types.Mixed, default: {} },
  location: {
    lat: String,
    lng: String,
  },
});

module.exports = Room;
