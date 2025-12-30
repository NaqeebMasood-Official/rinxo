import express from "express";
import { uploadNIC } from "../middlewares/upload.middleware.js";
import {
  activateUser,
  deleteUser,
  showAllUsers,
  showloggedInAdminData,
  showSingleUser,
  updateAdminPassword,
  updateAdminProfile,
  uploadNICImages,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middlerware.js";
// import { verification } from "../middlewares/verification.middleware.js";

const router = express.Router();

// USER ROUTES
router.post("/upload-nic", protect, uploadNIC, uploadNICImages);

// ADMIN ROUTES
router.get("/admin/users", protect, showAllUsers);
router.delete("/admin/users/:idToDeleteUser", protect, deleteUser);
router.patch("/admin/users/:idToActivateUser", protect, activateUser);
router.get("/admin", protect, showloggedInAdminData);
// router.patch("/admin", protect, updateLoggedInAdminData);
router.patch("/admin/update-profile/:id", protect, updateAdminProfile);
router.patch("/admin/update-password/:id", protect, updateAdminPassword);

// user
router.get("/userData/:userId", protect, showSingleUser);

export default router;
