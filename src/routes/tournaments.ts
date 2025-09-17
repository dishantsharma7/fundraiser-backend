// src/routes/tournaments.ts
import { Router } from "express";
import {
  createTournament,
  updateTournament,
  getTournament,
  listTournaments,
  deleteTournament,
  createTeams,
  updateTeam,
  listTeams,
} from "../controllers/tournamentController";
import verifyAdmin from "../middlewares/verifyAdmin";

const router = Router();

// Public
router.get("/", listTournaments);
router.get("/:id", getTournament);
router.get("/teams/list", listTeams); // ?tournamentId=...

// Admin-only
router.post("/", verifyAdmin, createTournament);
router.put("/:id", verifyAdmin, updateTournament);
router.delete("/:id", verifyAdmin, deleteTournament);

// Teams
router.post("/teams", verifyAdmin, createTeams);
router.put("/teams/:id", verifyAdmin, updateTeam);

export default router;
