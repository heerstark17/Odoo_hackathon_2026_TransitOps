const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

const sendAuthResponse = (res, statusCode, user) => {
  const token = createToken(user._id.toString());
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({ token, user: userResponse(user) });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role });

    return sendAuthResponse(res, 201, user);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been disabled." });
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      return res.status(423).json({ message: "Account is temporarily locked. Please try again later." });
    }

    if (user.lockedUntil && user.lockedUntil <= now) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }

      await user.save();

      if (user.lockedUntil) {
        return res.status(423).json({ message: "Account locked after 5 failed attempts. Try again in 15 minutes." });
      }

      return res.status(401).json({ message: "Invalid email or password." });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = now;
    await user.save();

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({ user: userResponse(req.user) });
};

const logout = (_req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully." });
};

module.exports = { register, login, getMe, logout };
