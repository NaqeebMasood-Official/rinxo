// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// import { errorHandler } from "./middlewares/error.middleware.js";
// import { logger } from "./middlewares/logger.middleware.js";

// import authRoutes from "./routes/auth.routes.js";
// import dashboardRoutes from "./routes/dashboard.routes.js";
// import userRoutes from "./routes/user.routes.js"; 
// import paymentRoute from "./routes/nowpayment.routes.js";

// const app = express();

// app.use(express.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
 
// app.use(errorHandler);
// app.use(logger);

// app.use("/", authRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/user", userRoutes);

// app.use("/api/payment", paymentRoute);

// export default app;


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./middlewares/logger.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js"; 
import paymentRoute from "./routes/nowpayment.routes.js";
import withdrawalRoute from "./routes/withdrawal.routes.js";

// ✅ Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(errorHandler);
app.use(logger);

app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoute);
app.use("/api/withdrawal", withdrawalRoute);


export default app;