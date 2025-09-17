// src/routes/webhooks.ts
import express, { Request, Response } from "express";
import Stripe from "stripe";
import { createTicketAfterPayment } from "../services/paymentTicketService";

const router = express.Router();

// --- STRIPE SETUP ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

// Stripe requires the raw body to verify signature:
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;
    try {
      if (!sig || !endpointSecret) throw new Error("Missing sig/secret");
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error("⚠️ Stripe signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Retrieve custom metadata you passed when creating the session
      const playerId = session.metadata?.playerId;
      const tournamentId = session.metadata?.tournamentId;
      const teamsPerTicket = session.metadata?.teamsPerTicket || 3;

      if (!tournamentId) {
        console.error("Missing tournamentId in Stripe session metadata");
        return res.status(400).send("Missing tournamentId in metadata");
      }

      if (!playerId) {
        console.error("Missing playerId in Stripe session metadata");
        return res.status(400).send("Missing playerId in metadata");
      }

      try {
        await createTicketAfterPayment({
          playerId,
          tournamentId,
          teamsPerTicket: Number(teamsPerTicket),
          paymentRef: session.id,
          provider: "stripe",
        });
      } catch (ticketErr) {
        console.error(
          "Failed to create ticket after Stripe payment:",
          ticketErr
        );
      }
    }

    res.status(200).json({ received: true });
  }
);

export default router;
