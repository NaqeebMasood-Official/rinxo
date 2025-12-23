import express from "express"; 
import { uploadNIC } from "../middlewares/upload.middleware.js";
import { uploadNICImages } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middlerware.js";

const router = express.Router();

router.post("/upload-nic", protect, uploadNIC, uploadNICImages);


export default router
