import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./middlewares/logger.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js"; 
import paymentRoute from "./routes/nowpayment.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
 
app.use(errorHandler);
app.use(logger);

app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userRoutes);

app.use("/api/payment", paymentRoute);

export default app;
