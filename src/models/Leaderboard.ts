import mongoose, { Schema, Document } from "mongoose";

export interface ILeaderboard extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  totalPoints: number;
  rank: number;
  updatedAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboard>({
  tournamentId: {
    type: Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  totalPoints: { type: Number, required: true, default: 0 },
  rank: { type: Number, required: true, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

leaderboardSchema.index({ tournamentId: 1, teamId: 1 }, { unique: true });

export default mongoose.model<ILeaderboard>("Leaderboard", leaderboardSchema);
