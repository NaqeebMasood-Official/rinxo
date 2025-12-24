import express from "express";
import { uploadNIC } from "../middlewares/upload.middleware.js";
import {
  activateUser,
  deleteUser,
  showAllUsers,
  showloggedInAdminData,
  updateLoggedInAdminData,
  uploadNICImages,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middlerware.js";

const router = express.Router();

// USER ROUTES
router.post("/upload-nic", protect, uploadNIC, uploadNICImages);

// ADMIN ROUTES
router.get("/admin/users", protect, showAllUsers);
router.delete("/admin/users/:idToDeleteUser", protect, deleteUser);
router.patch("/admin/users/:idToActivateUser", protect, activateUser);
router.get("/admin", protect, showloggedInAdminData);
router.patch(
  "/admin/:id",
  // protect,
  updateLoggedInAdminData
);

export default router;
