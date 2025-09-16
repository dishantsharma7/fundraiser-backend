import { Router } from "express";
import { register, login } from "../controllers/authPlayerController";
const router = Router();
router.get("/", (req, res) => res.send("Auth Player Route"));
router.post("/register", register);
router.post("/login", login);
export default router;
