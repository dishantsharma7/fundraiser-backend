import { Schema, model, Document, Types } from "mongoose";

export interface IPrize extends Document {
  tournamentId: Types.ObjectId;
  prizeType: string;
  amount?: number;
  item?: string;
  winnerTicketIds: Types.ObjectId[];
  createdAt: Date;
}

const prizeSchema = new Schema<IPrize>({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  prizeType: { type: String, required: true },
  amount: { type: Number },
  item: { type: String },
  winnerTicketIds: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
  createdAt: { type: Date, default: Date.now },
});

export default model<IPrize>("Prize", prizeSchema);
