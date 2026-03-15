import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhooks.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductRouter from "./routes/productsRoutes.js";

const app = express();

app.use(cors());
app.use(clerkMiddleware());

app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.use("/api/products", ProductRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDB();   // ✅ connect first
  await makeAdmin();   // ✅ run admin script after DB ready

  console.log(`Server running on http://localhost:${PORT}`);
});