// src/controllers/prizeController.ts
import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import Prize from "../models/Prize";
import Tournament from "../models/Tournament";
import { Types } from "mongoose";
// import { sendEmail } from "../utils/emailSes";

/**
 * Admin: create prize configuration
 * POST /api/prizes
 * body: { tournamentId, prizeType, amount?, item? }
 */
export async function createPrize(req: Request, res: Response) {
  try {
    const { tournamentId, prizeType, amount, item } = req.body;
    if (!tournamentId || !prizeType)
      return res
        .status(400)
        .json({ msg: "tournamentId and prizeType required" });
    const prize = new Prize({
      tournamentId: new Types.ObjectId(tournamentId),
      prizeType,
      amount,
      item,
      winnerTicketIds: [],
    });
    await prize.save();
    return res.status(201).json(prize);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Compute winners after tournament ends.
 * POST /api/prizes/compute
 * body: { tournamentId }
 *
 * Logic:
 * - Find all tickets for tournament
 * - If prizeType "highest" -> find tickets that include winning team(s)
 * - For MVP: compute winners by totalPoints and mark prize winners
 * - Handle simple ties by splitting amount across tied tickets (equal share).
 */
export async function computePrizes(req: Request, res: Response) {
  try {
    const { tournamentId } = req.body;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId required" });
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });

    // Fetch existing prize configs for the tournament
    const prizeConfigs = await Prize.find({ tournamentId });

    // Simple approach: for each prize config, pick winners by highest/lowest totalPoints
    const tickets = await Ticket.find({ tournamentId }).populate("playerId");

    if (tickets.length === 0)
      return res.status(400).json({ msg: "No tickets found" });

    for (const pc of prizeConfigs) {
      let winners: any[] = [];
      if (pc.prizeType === "highest") {
        // find max totalPoints
        const maxPoints = Math.max(...tickets.map((t) => t.totalPoints || 0));
        winners = tickets.filter((t) => (t.totalPoints || 0) === maxPoints);
      } else if (pc.prizeType === "lowest") {
        const minPoints = Math.min(...tickets.map((t) => t.totalPoints || 0));
        winners = tickets.filter((t) => (t.totalPoints || 0) === minPoints);
      } else {
        // other prize types (e.g., 2ndHighest) - simplified: treat same as highest for now
        const sorted = [...tickets].sort(
          (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
        );
        if (pc.prizeType === "secondHighest") {
          const val = sorted[1]?.totalPoints ?? sorted[0]?.totalPoints;
          winners = tickets.filter((t) => (t.totalPoints || 0) === val);
        } else {
          // default fallback: top 1
          const maxPoints = Math.max(...tickets.map((t) => t.totalPoints || 0));
          winners = tickets.filter((t) => (t.totalPoints || 0) === maxPoints);
        }
      }

      // Save winners in prize document
      const winnerIds = winners.map((w) => w._id);
      pc.winnerTicketIds = winnerIds;
      await pc.save();

      // Mark tickets as winners and send email
      for (const w of winners) {
        w.isWinner = true;
        await w.save();

        // notify player
        try {
          const player: any = w.playerId;
          if (player?.email) {
            const subject = `You won: ${pc.prizeType}`;
            const body = `<p>Congratulations! Your ticket ${
              w.ticketNumber
            } won ${pc.prizeType}.</p>
                          <p>Prize: ${pc.amount ?? pc.item ?? "See admin"}</p>`;
            // await sendEmail(player.email, subject, body);       //send EMail function here!
          }
        } catch (emailErr) {
          console.warn("Failed to notify winner:", emailErr);
        }
      }
    }

    return res.json({ msg: "Prizes computed", counted: prizeConfigs.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * List prize configs & winners (public)
 * GET /api/prizes?tournamentId=...
 */
export async function listPrizes(req: Request, res: Response) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId required" });
    const prizes = await Prize.find({ tournamentId }).populate({
      path: "winnerTicketIds",
      populate: { path: "playerId" },
    });
    return res.json(prizes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
