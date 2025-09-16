import { Schema, model, Document, Types } from "mongoose";

export interface ITournament extends Document {
  name: string;
  status: "upcoming" | "active" | "completed";
  rounds: number;
  teamsPerTicket: number;
  announcementDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const tournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  status: { type: String, default: "upcoming" },
  rounds: { type: Number, default: 1 },
  teamsPerTicket: { type: Number, default: 3 },
  announcementDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
});

export default model<ITournament>("Tournament", tournamentSchema);
