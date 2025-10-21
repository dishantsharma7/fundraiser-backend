import { Router } from "express";
import {
  createTicketForPlayerEndpoint,
  getTicket,
  listTickets,
  getTicketsByPlayer,
  getTicketsByPlayerAdmin,
  exportTicketsCsv,
} from "../controllers/ticketController";
import verifyAdmin from "../middlewares/verifyAdmin";
import verifyPlayer from "../middlewares/verifyPlayer";

const router = Router();

// Player actions
router.get("/player/:playerId", verifyPlayer, getTicketsByPlayer);
router.get("/:id", verifyPlayer, getTicket);

// Admin actions
router.post("/create", createTicketForPlayerEndpoint); // for testing; in prod call from webhook
router.get("/", verifyAdmin, listTickets);
router.get("/export/csv", verifyAdmin, exportTicketsCsv);
router.get("/admin/player/:playerId", verifyAdmin, getTicketsByPlayerAdmin);

export default router;
