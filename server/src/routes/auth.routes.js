import express from "express";
import { body } from "express-validator";
import {
  loginUser,
  registerUser,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("fullName").notEmpty(),
  body("phoneNumber").notEmpty().isNumeric(),
  body("password").notEmpty(),
  validate,
  registerUser
);

router.get("/verify-email/:token", verifyEmail);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  loginUser
);

export default router;
