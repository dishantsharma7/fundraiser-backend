import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import Team from "../models/Team";
import Tournament from "../models/Tournament";
import Player from "../models/Player";
import {
  generateTicketNumber,
  generateAccessCode,
  generateUniqueTeamCombos,
} from "../utils/ticketGenerator";
import { Types } from "mongoose";
// import { sendEmail } from "../utils/emailSes"; // adjust export name if needed

/**
 * NOTE: In production you MUST trigger ticket creation after successful payment webhook.
 * Here we provide a helper endpoint for testing that simulates "purchase success".
 */

/**
 * Endpoint: POST /api/tickets/create
 * Body: { playerId, tournamentId, teamsPerTicket }
 * - creates one ticket with a unique combo and returns the ticket.
 * - sends email to player (if email exists)
 */
export async function createTicketForPlayerEndpoint(
  req: Request,
  res: Response
) {
  try {
    const { playerId, tournamentId, teamsPerTicket } = req.body;
    if (!playerId || !tournamentId || !teamsPerTicket) {
      return res
        .status(400)
        .json({ msg: "playerId, tournamentId, teamsPerTicket required" });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ msg: "Tournament not found" });

    // get all teams for tournament
    const teams = (await Team.find({ tournamentId }).select("_id")) as Array<{
      _id: Types.ObjectId;
    }>;
    const ids = teams.map((t) => t._id.toString());
    if (ids.length < teamsPerTicket) {
      return res.status(400).json({ msg: "Not enough teams configured" });
    }

    const combos = generateUniqueTeamCombos(ids, teamsPerTicket, 1);
    const combo = combos[0].map((x) => new Types.ObjectId(x));

    const ticket = new Ticket({
      playerId: new Types.ObjectId(playerId),
      tournamentId: new Types.ObjectId(tournamentId),
      ticketNumber: generateTicketNumber(),
      accessCode: generateAccessCode(),
      teams: combo,
      status: "paid",
    });
    await ticket.save();

    // send ticket email (best-effort)
    // try {
    //   const player = await Player.findById(playerId);
    //   if (player?.email) {
    //     const html = `<p>Your ticket: ${ticket.ticketNumber}</p><p>Access code: ${ticket.accessCode}</p>`;
    //     console.log("Email sent to:", player.email);
    //     // await sendEmail(player.email, "Your Ticket", html);     //send email fn here!
    //   }
    // } catch (emailErr) {
    //   console.warn("Failed to send email:", emailErr);
    // }

    return res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Player-only: fetch player's ticket by id
 * GET /api/tickets/:id
 */
export async function getTicket(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id).populate("teams");
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });
    // ensure player owns the ticket (if player route)
    const player = (req as any).player;
    if (player && ticket.playerId.toString() !== player._id.toString()) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    return res.json(ticket);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Admin-only: list tickets for a tournament (with filters)
 * GET /api/tickets?tournamentId=...
 */
export async function listTickets(req: Request, res: Response) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId required" });
    // const q: any = { tournamentId };
    // if (status) q.status = status;
    const tickets = await Ticket.find({ tournamentId })
      .populate("teams")
      .limit(1000);
    return res.json(tickets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

/**
 * Admin-only: export tickets CSV (simple implementation)
 */
export async function exportTicketsCsv(req: Request, res: Response) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId)
      return res.status(400).json({ msg: "tournamentId required" });
    const tickets = await Ticket.find({ tournamentId }).populate("teams");
    // CSV header
    const rows = ["ticketNumber,accessCode,playerId,status,totalPoints,teams"];
    for (const t of tickets) {
      const teamNames = (t.teams as any[])
        .map((x) => x.teamName || x.seedNumber)
        .join("|");
      rows.push(
        `${t.ticketNumber},${t.accessCode},${t.playerId || ""},${t.status},${
          t.totalPoints
        },${teamNames}`
      );
    }
    const csv = rows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tickets_${tournamentId}.csv"`
    );
    return res.send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
