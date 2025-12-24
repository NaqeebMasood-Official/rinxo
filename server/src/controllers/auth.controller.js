import bcrypt from "bcryptjs";
import { setUser } from "../service/auth.service.js";
import User from "../models/User.model.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const generateEmailToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        message: "Email already verified!",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired link!",
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    const token = generateEmailToken(user._id);
    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${token}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
      <h2>Email verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyLink}">Verify Email</a>
      <p>This link expires in 15 minutes.</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully! Verify Your E-Mail",
      token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
      error: err,
    });
  }
};

export const resendEmailVerification = async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Send token in request body!",
      });
    }

    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${token}`;

    const secretKey = process.env.JWT_SECRET;
    const userData = jwt.verify(token, secretKey);

    const user = await User.findById(userData.userId);
    console.log("userData: ", userData);

    await sendEmail({
      to: user.email,
      subject: "Verify your email (Resend)",
      html: `
          <h2>Email verification</h2>
          <p>Click the link below to verify your email:</p>
          <a href="${verifyLink}">Verify Email</a>
          <p>This link expires in 15 minutes.</p>
          `,
    });

    return res.status(200).json({
      success: true,
      message: "Email verification resent!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    if (!password || (!email && !phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Email or phone and password are required",
      });
    }

    let user = email
      ? await User.findOne({ email })
      : await User.findOne({ phoneNumber });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.isEmailVerified)
      return res
        .status(401)
        .json({ success: false, message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });

    const token = setUser(user); // JWT generation

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
        nicStatus: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("role", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};
