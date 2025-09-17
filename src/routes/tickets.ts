// src/routes/tickets.ts
import { Router } from "express";
import {
  createTicketForPlayerEndpoint,
  getTicket,
  listTickets,
  exportTicketsCsv,
} from "../controllers/ticketController";
import verifyAdmin from "../middlewares/verifyAdmin";
import verifyPlayer from "../middlewares/verifyPlayer";

const router = Router();

// Player actions
router.get("/:id", verifyPlayer, getTicket);

// Admin actions
router.post("/create", createTicketForPlayerEndpoint); // for testing; in prod call from webhook
router.get("/", verifyAdmin, listTickets);
router.get("/export/csv", verifyAdmin, exportTicketsCsv);

export default router;
