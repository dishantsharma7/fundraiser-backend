import { Request, Response } from "express";
import Tournament from "../models/Tournament";
import Team from "../models/Team";
import { Types } from "mongoose";

/**
 * Create a tournament (admin-only)
 */
export async function createTournament(req: Request, res: Response) {
  try {
    const { name, rounds, teamsPerTicket, announcementDate } = req.body;
    if (!name) return res.status(400).json({ msg: "Missing tournament name" });

    const tournament = new Tournament({
      name,
      rounds: rounds || 1,
      teamsPerTicket: teamsPerTicket || 3,
      announcementDate,
      createdBy: (req as any).admin?._id,
    });
    await tournament.save();
    return res.status(201).json(tournament);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Update tournament (admin-only)
 */
export async function updateTournament(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const t = await Tournament.findByIdAndUpdate(id, updates, { new: true });
    if (!t) return res.status(404).json({ msg: "Tournament not found" });
    return res.json(t);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Get tournament by id (public)
 */
export async function getTournament(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const t = await Tournament.findById(id);
    if (!t) return res.status(404).json({ msg: "Tournament not found" });
    return res.json(t);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * List tournaments (public)
 */
export async function listTournaments(req: Request, res: Response) {
  try {
    const list = await Tournament.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Delete tournament (admin-only)
 */
export async function deleteTournament(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await Tournament.findByIdAndDelete(id);
    // Note: consider cascading deletes for teams/tickets/scores/prizes in production
    return res.json({ msg: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * --- Team related endpoints (admin-only)
 */

/**
 * Create multiple seed teams for a tournament
 * body: { teams: [{ seedNumber: "AFC #1", teamName?: "PIT" }, ...] }
 */
export async function createTeams(req: Request, res: Response) {
  try {
    const { tournamentId, teams } = req.body;
    if (!tournamentId || !Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ msg: "tournamentId and teams required" });
    }
    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ msg: "Tournament not found" });
    }
    const docs = teams.map((t) => ({
      tournamentId: new Types.ObjectId(tournamentId),
      seedNumber: t.seedNumber,
      teamName: t.teamName,
      status: t.teamName ? "confirmed" : "placeholder",
    }));
    const created = await Team.insertMany(docs);
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Update a team (admin-only)
 * body: { teamName: "New Name", status?: "confirmed" }
 */
export async function updateTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const team = await Team.findByIdAndUpdate(id, updates, { new: true });
    if (!team) return res.status(404).json({ msg: "Team not found" });
    return res.json(team);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * List teams for a tournament (public)
 */
export async function listTeams(req: Request, res: Response) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId query required" });
    const teams = await Team.find({ tournamentId }).sort({ seedNumber: 1 });
    return res.json(teams);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
