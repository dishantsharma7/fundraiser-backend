import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (MONGODB_URI) {
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
