import { Router } from "express";
import {
  rebuildLeaderboard,
  getLeaderboard,
  ticketLeaderboard,
} from "../controllers/leaderboardController";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router();

// Admin can rebuild leaderboard manually
router.post("/rebuild", verifyAdmin, rebuildLeaderboard);

// Public leaderboard view
router.get("/", getLeaderboard);

router.get("/ticketleaderbaord", ticketLeaderboard);

export default router;
