import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();
const PORT = 5000;


await connectDB();

app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
app.use(clerkMiddleware());


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});