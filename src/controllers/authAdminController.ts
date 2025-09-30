import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function registerAdmin(req: Request, res: Response) {
  // NOTE: In production, restrict this endpoint to a "super-admin" or seed first admin only.
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: name, email, and password.",
    });
  }
  const existing = await Admin.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      message:
        "This email is already registered. Please use a different email.",
    });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = new Admin({ name, email, phone, passwordHash });
  await admin.save();
  return res.status(201).json({
    success: true,
    message: "Admin account created successfully.",
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
    },
  });
}

export async function loginAdmin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password.",
    });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password. Please try again.",
    });
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password. Please try again.",
    });
  }
  const token = jwt.sign({ id: admin._id, type: "admin" }, JWT_SECRET, {
    expiresIn: "2h",
  });
  // Set token in HTTP-only cookie
  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
    path: "/",
  });
  return res.json({
    success: true,
    message: "Login successful. Welcome, admin!",
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  });
}
