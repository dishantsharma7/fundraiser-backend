import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Player from "../models/Player";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function register(req: Request, res: Response) {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: name, email, and password.",
    });
  }
  const existing = await Player.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      message:
        "This email is already registered. Please use a different email.",
    });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const player = new Player({ name, email, phone, passwordHash });
  await player.save();
  return res.status(201).json({
    success: true,
    message: "Player registered successfully.",
    player: {
      id: player._id,
      name: player.name,
      email: player.email,
      phone: player.phone,
    },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password.",
    });
  }
  const player = await Player.findOne({ email });
  if (!player) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password. Please try again.",
    });
  }
  const ok = await bcrypt.compare(password, player.passwordHash);
  if (!ok) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password. Please try again.",
    });
  }
  const token = jwt.sign({ id: player._id, type: "player" }, JWT_SECRET, {
    expiresIn: "2h",
  });
  // Set token in HTTP-only cookie
  res.cookie("player_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });
  return res.json({
    success: true,
    message: "Login successful. Welcome, player!",
    player: {
      id: player._id,
      name: player.name,
      email: player.email,
    },
  });
}
