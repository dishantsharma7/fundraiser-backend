import { Types } from "mongoose";
import crypto from "crypto";

/**
 * Combinations util (returns arrays of indices)
 */
function combine<T>(arr: T[], k: number): T[][] {
  const res: T[][] = [];
  function helper(start: number, path: T[]) {
    if (path.length === k) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      helper(i + 1, path);
      path.pop();
    }
  }
  helper(0, []);
  return res;
}

export function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateTicketNumber() {
  return crypto.randomBytes(4).toString("hex"); // 8 chars
}

export function generateAccessCode() {
  return crypto.randomBytes(6).toString("hex"); // 12 chars
}

/**
 * teams: array of team ObjectIds (or strings)
 * k: teams per ticket
 * count: how many unique tickets you want (if omitted return all combos)
 */
export function generateUniqueTeamCombos(
  teams: (string | Types.ObjectId)[],
  k: number,
  count?: number
) {
  if (teams.length < k) throw new Error("Not enough teams");
  const combos = combine(teams, k);
  shuffle(combos);
  if (count && count < combos.length) return combos.slice(0, count);
  return combos;
}
