import { Schema, model, Document } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  createdAt: Date;
}

const playerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IPlayer>("Player", playerSchema);
