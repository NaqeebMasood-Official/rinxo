import express from "express";
import { body } from "express-validator";
import {
  loginUser,
  logout,
  registerUser,
  resendEmailVerification,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middlerware.js";

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
router.get("/resend-email-verification/:token", resendEmailVerification);

router.post(
  "/login",
  [body("password").notEmpty()],
  validate,
  loginUser
);

router.get("/check", protect, (req, res) => {
  res.json({ success: true, user: req.user });
});


router.post("/logout", logout);



export default router;
