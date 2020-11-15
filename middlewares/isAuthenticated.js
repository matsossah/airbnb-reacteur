const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ token: token }).select(
        "account email _id"
      );

      if (user) {
        req.user = user;
        return next();
      } else {
        return res.status(400).json({ message: "Unauthorized" });
      }
    } else {
      return res.status(400).json({ message: "Missing token" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
