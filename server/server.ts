import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

app.use(cors());
app.use(clerkMiddleware());

// Webhook — raw body, before express.json()
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// ✅ No top-level await, no app.listen()
export default app;