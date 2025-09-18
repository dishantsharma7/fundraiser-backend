import { Router } from "express";
import {
  getRecentPlayers,
  getRecentTickets,
  getRecentTournaments,
} from "../controllers/dashboardController";

const router = Router();

router.get("/players/recent", getRecentPlayers);
router.get("/tickets/recent", getRecentTickets);
router.get("/tournaments/recent", getRecentTournaments);

export default router;
