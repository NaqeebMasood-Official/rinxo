import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("JWT_SECRET is not defined!");
  console.error("Current env: ", process.env.JWT_SECRET);
  throw new Error("JWT_SECRET is not defined");
}

console.log("JWT secret loaded successfully!");

export const setUser = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    secret,
    {
      expiresIn: "1h", // ⏱ token expires in 1 hour
    }
  );
};

export const getUser = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};
