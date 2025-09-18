import Ticket from "../models/Ticket";
import Score from "../models/Score";

/**
 * Recompute totalPoints for all tickets of a tournament.
 * Strategy: for each ticket, fetch sum of points for all its teams across all rounds.
 */
export async function recomputeTicketTotals(tournamentId: string) {
  const tickets = await Ticket.find({ tournamentId });
  for (const t of tickets) {
    const teamIds = t.teams.map((x) => x.toString());
    const scores = await Score.aggregate([
      { $match: { tournamentId: t.tournamentId, teamId: { $in: t.teams } } },
      { $group: { _id: "$teamId", totalPoints: { $sum: "$points" } } },
    ]);
    const total = scores.reduce((acc, s) => acc + (s.totalPoints || 0), 0);
    t.totalPoints = total;
    await t.save();
  }
}
