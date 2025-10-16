import Ticket from "../models/Ticket";
/**
 * GET /api/leaderboard/ticketleaderboard?tournamentId=...
 * Returns leaderboard ranking teams by their totalPoints in a tournament
 */
export async function ticketLeaderboard(req: Request, res: Response) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId required" });
    // Fetch all tickets for the tournament and sort by totalPoints
    const tickets = await Ticket.find({ tournamentId })
      .sort({ totalPoints: -1 })
      .populate("teams", "teamName seedNumber");
    // Assign ranks
    const leaderboard = tickets.map((ticket, idx) => ({
      ticketId: ticket._id,
      playerId: ticket.playerId,
      teams: ticket.teams,
      totalPoints: ticket.totalPoints,
      rank: idx + 1,
    }));
    return res.json(leaderboard);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
import { Request, Response } from "express";
import Leaderboard from "../models/Leaderboard";
import Score from "../models/Score";
import Team from "../models/Team";

/**
 * Rebuild leaderboard for a given tournament.
 * This recalculates all totals and ranks.
 * Called automatically when scores change or manually from admin.
 */
export async function rebuildLeaderboard(req: Request, res: Response) {
  try {
    const { tournamentId } = req.body;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId required" });

    // 1. Aggregate scores per team
    const scores = await Score.aggregate([
      { $match: { tournamentId: { $eq: tournamentId } } },
      {
        $group: {
          _id: "$teamId",
          totalPoints: { $sum: "$points" },
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    // 2. Clear old leaderboard entries
    await Leaderboard.deleteMany({ tournamentId });

    // 3. Rebuild leaderboard entries
    const bulkOps = scores.map((s, i) => ({
      updateOne: {
        filter: { tournamentId, teamId: s._id },
        update: {
          tournamentId,
          teamId: s._id,
          totalPoints: s.totalPoints,
          rank: i + 1,
          updatedAt: new Date(),
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) await Leaderboard.bulkWrite(bulkOps);

    return res.json({ msg: "Leaderboard rebuilt", count: scores.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Get current leaderboard for a tournament (public)
 */
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId required" });
    const leaderboard = await Leaderboard.find({ tournamentId })
      .populate("teamId", "teamName seedNumber")
      .sort({ rank: 1 });
    return res.json(leaderboard);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
