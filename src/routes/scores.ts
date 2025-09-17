// src/routes/scores.ts
import { Router } from "express";
import { upsertScore, listScores } from "../controllers/scoreController";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router();

// Admin-only to enter scores
router.post("/", verifyAdmin, upsertScore);

// Public to list scores
router.get("/", listScores);

export default router;
