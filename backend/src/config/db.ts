import { connect } from "mongoose"
import { config } from "dotenv"

config()

const DB_URI = process.env["DB_URI"];

// Connect to MongoDB; if the database becomes unreachable later, queries fail after 5s
// (instead of the default 30s) so users get an error message quickly
export const connectDB = async () => {
  try {
    if (!DB_URI) throw new Error("Mongodb url is not provided correctly")
    await connect(DB_URI, { serverSelectionTimeoutMS: 5000 })
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1)
  }
}
