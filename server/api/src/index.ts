import "dotenv/config";
import express from "express";
import cors from "cors";
import { marketRouter } from "./routes/market.js";
import { portfoliosRouter } from "./routes/portfolios.js";
import { screeningRouter } from "./routes/screening.js";
import { profilesRouter } from "./routes/profiles.js";
import { classroomsRouter } from "./routes/classrooms.js";
import { tradesRouter } from "./routes/trades.js";
import { stocksRouter } from "./routes/stocks.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/market", marketRouter);
app.use("/portfolios", portfoliosRouter);
app.use("/screening", screeningRouter);
app.use("/profiles", profilesRouter);
app.use("/classrooms", classroomsRouter);
app.use("/trades", tradesRouter);
app.use("/stocks", stocksRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
