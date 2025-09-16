import { Schema, model, Document, Types } from "mongoose";

export interface ITicket extends Document {
  playerId: Types.ObjectId;
  tournamentId: Types.ObjectId;
  ticketNumber: string;
  accessCode: string;
  teams: Types.ObjectId[];
  status: "paid" | "free";
  totalPoints: number;
  isWinner: boolean;
  createdAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  playerId: { type: Schema.Types.ObjectId, ref: "Player" },
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  ticketNumber: { type: String, required: true, unique: true },
  accessCode: { type: String, required: true },
  teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  status: { type: String, default: "paid" },
  totalPoints: { type: Number, default: 0 },
  isWinner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model<ITicket>("Ticket", ticketSchema);
