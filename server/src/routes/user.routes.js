import express from "express";
import { uploadNIC } from "../middlewares/upload.middleware.js";
import {
  activateUser,
  deleteUser,
  showAllPaymentsOrFunds,
  showAllUsers,
  showloggedInAdminData,
  showSingleUser,
  updateAdminPassword,
  updateAdminProfile,
  uploadNICImages,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middlerware.js";
import { Transaction } from "../models/payment.models.js";

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
router.get("/admin/manage-funds", protect, showAllPaymentsOrFunds);
router.get("/admin/user-transactions/:userId", protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Send userId in the params!",
      });
    }

    const userTransactions = await Transaction.find({ user_id: userId });

    if (!userTransactions) {
      return res.status(404).json({
        success: false,
        message: `Transactions not found with userId: ${userId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User transaction found",
      transactions: userTransactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
});

// user
router.get("/userData/:userId", protect, showSingleUser);

export default router;
