const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : null;
    const token = bearerToken || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication is required." });
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("JWT_SECRET is not configured."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User is no longer authorized." });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired authentication token." });
    }

    return next(error);
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action." });
  }

  return next();
};

module.exports = { protect, authorize };
