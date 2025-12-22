import express from "express";
import { protect } from "../middlewares/auth.middlerware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

// admin dashboard routes
router.get("/admin-stats", protect, authorize("admin"), getDashboardStats);

export default router;
