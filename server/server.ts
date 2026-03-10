import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});