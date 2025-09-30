import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import authPlayerRoutes from "./routes/authPlayer";
import authAdminRoutes from "./routes/authAdmin";
import tournamentsRoutes from "./routes/tournaments";
import ticketsRoutes from "./routes/tickets";
import scoresRoutes from "./routes/scores";
// import prizesRoutes from "./routes/prizes";
import dashboardRoutes from "./routes/dashboard";

const app = express();
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://fund-raiser-jw2v.vercel.app", // production
];
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://fund-raiser-omega.vercel.app"],
//     credentials: true, // important!
//   })
// );

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies
};

app.use(cors(corsOptions));
app.use(express.json());

// routes
app.use("/api/auth/player", authPlayerRoutes);
app.use("/api/auth/admin", authAdminRoutes);
app.use("/api/tournaments", tournamentsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/scores", scoresRoutes);
// app.use("/api/prizes", prizesRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
