import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { initializeDatabase } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { marketRouter } from "./routes/market.js";
import { greeksRouter } from "./routes/greeks.js";
import { quotesRouter } from "./routes/quotes.js";
import { optionsRouter } from "./routes/options.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { ordersRouter } from "./routes/orders.js";
import { strategiesRouter } from "./routes/strategies.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

// Auth routes (no middleware)
app.use("/api/auth", authRouter);

// Public routes
app.use("/api/market", marketRouter);
app.use("/api/greeks", greeksRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/options", optionsRouter);

// Protected routes
app.use("/api/portfolio", authMiddleware, portfolioRouter);
app.use("/api/orders", authMiddleware, ordersRouter);
app.use("/api/strategies", authMiddleware, strategiesRouter);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  socket.send(
    JSON.stringify({
      type: "connected",
      message: "Market feed connected",
      timestamp: new Date().toISOString(),
    })
  );

  socket.on("message", (message) => {
    try {
      const msg = JSON.parse(message.toString());
      console.log("WebSocket message:", msg);

      if (msg.type === "subscribe") {
        socket.send(JSON.stringify({ type: "subscribed", symbol: msg.symbol }));
      }
    } catch (e) {
      console.log("WebSocket parse error");
    }
  });
});

initializeDatabase().then(() => {
  server.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });
});
