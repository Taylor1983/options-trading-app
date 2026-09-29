import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { quotesRouter } from "./routes/quotes.js";
import { optionsRouter } from "./routes/options.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { ordersRouter } from "./routes/orders.js";
import { strategiesRouter } from "./routes/strategies.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.use("/api/quotes", quotesRouter);
app.use("/api/options", optionsRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/strategies", strategiesRouter);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "connected", message: "Market feed connected", timestamp: new Date().toISOString() }));
  socket.on("message", (message) => {
    console.log("received message:", message.toString());
  });
});

server.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
