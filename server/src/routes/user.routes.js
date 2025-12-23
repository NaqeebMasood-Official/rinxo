import express from "express";
import protect from "../middlewares/auth.middlerware.js";
import { uploadNIC } from "../middlewares/upload.middleware.js";
import { uploadNICImages } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/upload-nic", protect, uploadNIC, uploadNICImages);
