import { Request, Response } from "express";
import Player from "../models/Player";
import Ticket from "../models/Ticket";
import Tournament from "../models/Tournament";

// Get recent 5 created players
export async function getRecentPlayers(req: Request, res: Response) {
  try {
    const players = await Player.find().sort({ createdAt: -1 }).limit(5);
    return res.json(players);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

// Get recent 5 created tickets
export async function getRecentTickets(req: Request, res: Response) {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).limit(5);
    return res.json(tickets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

// Get recent 5 created tournaments
export async function getRecentTournaments(req: Request, res: Response) {
  try {
    const tournaments = await Tournament.find()
      .sort({ createdAt: -1 })
      .limit(5);
    return res.json(tournaments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}
