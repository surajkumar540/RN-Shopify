import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhooks.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductRouter from "./routes/productsRoutes.js";
import CartRouter from "./routes/cartRoutes.js";
import OrderRouter from "./routes/orderRoutes.js";
import AddressRouter from "./routes/addressRoutes.js";
import AdminRouter from "./routes/adminRoutes.js";

const app = express();

app.use(cors());
app.use(clerkMiddleware());


app.use(express.json());
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.use("/api/products", ProductRouter)
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/addresses ", AddressRouter);
app.use("/api/admin", AdminRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDB();   // ✅ connect first
  await makeAdmin();   // ✅ run admin script after DB ready

  console.log(`Server running on http://localhost:${PORT}`);
});