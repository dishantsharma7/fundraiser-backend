import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  createdAt: Date;
}

const adminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IAdmin>("Admin", adminSchema);
