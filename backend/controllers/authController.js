const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const PUBLIC_REGISTRATION_ROLES = ["DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];

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

const createUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error("A user with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  return User.create({ name, email, password: hashedPassword, role });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    if (role === "FLEET_MANAGER") {
      return res.status(400).json({
        message: "Fleet Manager accounts must be created by an existing Fleet Manager.",
      });
    }

    if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
      return res.status(400).json({ message: "The selected role is not available for public registration." });
    }

    const user = await createUser({ name, email, password, role });

    return sendAuthResponse(res, 201, user);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
};

const createManager = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const user = await createUser({ name, email, password, role: "FLEET_MANAGER" });
    return res.status(201).json({ user: userResponse(user) });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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

const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required." });
    const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpiresAt");
    const response = { message: "If an account exists for that email, reset instructions have been generated." };
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      // An email provider can deliver this token in production. Exposing it locally keeps the flow testable.
      if (process.env.NODE_ENV !== "production") response.resetToken = rawToken;
    }
    return res.status(200).json(response);
  } catch (error) { return next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpiresAt: { $gt: new Date() } }).select("+passwordResetToken +passwordResetExpiresAt");
    if (!user) return res.status(400).json({ message: "This password reset link is invalid or has expired." });
    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = null; user.passwordResetExpiresAt = null; user.failedLoginAttempts = 0; user.lockedUntil = null;
    await user.save();
    return sendAuthResponse(res, 200, user);
  } catch (error) { return next(error); }
};

module.exports = { register, createManager, login, getMe, logout, forgotPassword, resetPassword };
