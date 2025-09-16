import { Schema, model, Document, Types } from "mongoose";

export interface IScore extends Document {
  tournamentId: Types.ObjectId;
  teamId: Types.ObjectId;
  roundNumber: number;
  points: number;
  updatedAt: Date;
}

const scoreSchema = new Schema<IScore>({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  roundNumber: { type: Number, required: true },
  points: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default model<IScore>("Score", scoreSchema);
