import { Request, Response } from "express";
import Score from "../models/Score";
import { recomputeTicketTotals } from "../utils/leaderboard";

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

    // recompute ticket totals (simple approach)
    await recomputeTicketTotals(tournamentId);

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
