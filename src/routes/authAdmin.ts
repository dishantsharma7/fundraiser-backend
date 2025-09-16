import { Router } from "express";
import { registerAdmin, loginAdmin } from "../controllers/authAdminController";
const router = Router();
router.get("/", (req, res) => res.send("Auth Admin Route"));
router.post("/register", registerAdmin); // -> restrict after initial seeding
router.post("/login", loginAdmin);
export default router;
