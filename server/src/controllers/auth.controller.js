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

    const verifyLink = `${process.env.SERVER_URL}/api/auth/verify-email/${token}`;

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
      message: "User registered successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
      error: err,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified. Please verify your email to login.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = setUser(user);
    const userRole = user.role;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("role", userRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
        nicStatus: user.isNicUploaded,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
