import { Schema, model, Document, Types } from "mongoose";

export interface ITeam extends Document {
  tournamentId: Types.ObjectId;
  seedNumber: string;
  teamName?: string;
  status: "placeholder" | "confirmed";
  createdAt: Date;
}

const teamSchema = new Schema<ITeam>({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  seedNumber: { type: String, required: true },
  teamName: { type: String },
  status: { type: String, default: "placeholder" },
  createdAt: { type: Date, default: Date.now },
});

export default model<ITeam>("Team", teamSchema);
