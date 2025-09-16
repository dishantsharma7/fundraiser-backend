import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Player from "../models/Player";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
  player?: any;
}

export default async function verifyPlayer(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ msg: "Missing token" });
  const token = auth.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.type !== "player")
      return res.status(403).json({ msg: "Forbidden" });
    const player = await Player.findById(payload.id);
    if (!player)
      return res.status(401).json({ msg: "Invalid token - no player" });
    req.player = player;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}
