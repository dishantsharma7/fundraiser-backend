import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authPlayerRoutes from "./routes/authPlayer";
import authAdminRoutes from "./routes/authAdmin";
import tournamentsRoutes from "./routes/tournaments";
import ticketsRoutes from "./routes/tickets";
import scoresRoutes from "./routes/scores";
// import prizesRoutes from "./routes/prizes";
import dashboardRoutes from "./routes/dashboard";

const app = express();
app.use(cors());
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
