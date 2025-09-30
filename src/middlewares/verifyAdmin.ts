import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AdminRequest extends Request {
  admin?: any;
}

export default async function verifyAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction
) {
  // Get token from cookie
  const token = req.cookies?.admin_token;
  if (!token)
    return res.status(401).json({ msg: "Missing admin token in cookies" });
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.type !== "admin")
      return res.status(403).json({ msg: "Forbidden" });
    const admin = await Admin.findById(payload.id);
    if (!admin)
      return res.status(401).json({ msg: "Invalid token - no admin" });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}
