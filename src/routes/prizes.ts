// src/routes/prizes.ts
import { Router } from "express";
import {
  createPrize,
  computePrizes,
  listPrizes,
} from "../controllers/prizeController";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router();

// Admin
router.post("/", verifyAdmin, createPrize);
router.post("/compute", verifyAdmin, computePrizes);

// Public
router.get("/", listPrizes);

export default router;
