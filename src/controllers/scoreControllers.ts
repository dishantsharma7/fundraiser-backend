import { Request, Response } from "express";
import Score from "../models/Score";
import { recomputeTicketTotals } from "../utils/leaderboard";
import mongoose from "mongoose";
import Leaderboard from "../models/Leaderboard";

/**
 * Admin-only: upsert score for a team in a round
 * POST /api/scores
 * body: { tournamentId, teamId, roundNumber, points }
 */
export async function upsertScore(req: Request, res: Response) {
  try {
    const { tournamentId, teamId, roundNumber, points } = req.body;
    if (
      !tournamentId ||
      !teamId ||
      roundNumber === undefined ||
      points === undefined
    ) {
      return res
        .status(400)
        .json({ msg: "tournamentId, teamId, roundNumber, points required" });
    }

    let score = await Score.findOne({ tournamentId, teamId, roundNumber });
    if (!score) {
      score = new Score({ tournamentId, teamId, roundNumber, points });
    } else {
      score.points = points;
      score.updatedAt = new Date();
    }
    await score.save();

    await recomputeTicketTotals(tournamentId);
    const totals = await Score.aggregate([
      { $match: { tournamentId: new mongoose.Types.ObjectId(tournamentId) } },
      { $group: { _id: "$teamId", totalPoints: { $sum: "$points" } } },
      { $sort: { totalPoints: -1 } },
    ]);

    await Leaderboard.deleteMany({ tournamentId });
    const bulkOps = totals.map((s, i) => ({
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

    return res.json({ msg: "Score saved", score });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * List scores for a tournament (public)
 * GET /api/scores?tournamentId=...
 */
export async function listScores(req: Request, res: Response) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId query required" });
    const scores = await Score.find({ tournamentId }).sort({ roundNumber: 1 });
    return res.json(scores);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
