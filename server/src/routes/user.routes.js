import express from "express";
import { uploadNIC } from "../middlewares/upload.middleware.js";
import {
  activateUser,
  deleteUser,
  showAllUsers,
  uploadNICImages,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middlerware.js";

const router = express.Router();

router.post("/upload-nic", protect, uploadNIC, uploadNICImages);

// ADMIN ROUTES
router.get("/admin/users", protect, showAllUsers);
router.delete("/admin/users/:idToDeleteUser", deleteUser);
router.patch("/admin/users/:idToActivateUser", activateUser);

export default router;
