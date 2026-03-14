import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

app.use(cors());
app.use(clerkMiddleware());

app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// ✅ connect DB inside listen callback — no top-level await
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});