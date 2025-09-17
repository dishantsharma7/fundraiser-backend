// src/services/paymentTicketService.ts
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
// import { sendEmail } from "../utils/emailSes";

interface CreateTicketArgs {
  playerId: string;
  tournamentId: string;
  teamsPerTicket: number;
  paymentRef: string;
  provider: "stripe" | "paypal";
}

export async function createTicketAfterPayment({
  playerId,
  tournamentId,
  teamsPerTicket,
  paymentRef,
  provider,
}: CreateTicketArgs) {
  if (!playerId || !tournamentId)
    throw new Error("Missing playerId/tournamentId");

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  // get teams
  const teams = (await Team.find({ tournamentId }).select("_id")) as Array<{
    _id: Types.ObjectId;
  }>;
  const ids = teams.map((t) => t._id.toString());
  if (ids.length < teamsPerTicket)
    throw new Error("Not enough teams configured");

  const combos = generateUniqueTeamCombos(ids, teamsPerTicket, 1);
  const combo = combos[0].map((x) => new Types.ObjectId(x));

  const ticket = new Ticket({
    playerId: new Types.ObjectId(playerId),
    tournamentId: new Types.ObjectId(tournamentId),
    ticketNumber: generateTicketNumber(),
    accessCode: generateAccessCode(),
    teams: combo,
    status: "paid",
    paymentRef,
  });
  await ticket.save();

  // send email
  const player = await Player.findById(playerId);
  if (player?.email) {
    const html = `<p>Your ticket: ${ticket.ticketNumber}</p><p>Access code: ${ticket.accessCode}</p>`;
    // await sendEmail(player.email, `Your Ticket - ${provider}`, html);
  }

  return ticket;
}
