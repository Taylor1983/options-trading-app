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
import { fetchQuote } from "./services/marketData.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT || 4000);
const trackedSymbols = ["AAPL", "MSFT", "NVDA", "SPY", "QQQ"];

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/market", marketRouter);
app.use("/api/greeks", greeksRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/options", optionsRouter);
app.use("/api/portfolio", authMiddleware, portfolioRouter);
app.use("/api/orders", authMiddleware, ordersRouter);
app.use("/api/strategies", authMiddleware, strategiesRouter);

const wss = new WebSocketServer({ server, path: "/ws" });

const broadcastMarketSnapshot = async () => {
  const snapshot = await Promise.all(
    trackedSymbols.map(async (symbol) => {
      const quote = await fetchQuote(symbol);
      return {
        symbol,
        lastPrice: quote.price,
        bid: quote.bid,
        ask: quote.ask,
        volume: quote.volume,
        timestamp: quote.timestamp,
      };
    })
  );

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: "market-snapshot", data: snapshot }));
    }
  });
};

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "connected", message: "Market feed connected", timestamp: new Date().toISOString() }));
  void broadcastMarketSnapshot();

  socket.on("message", (message) => {
    try {
      const msg = JSON.parse(message.toString());
      if (msg.type === "subscribe") {
        socket.send(JSON.stringify({ type: "subscribed", symbol: msg.symbol }));
      }
    } catch (error) {
      console.log("WebSocket parse error");
    }
  });
});

setInterval(() => {
  void broadcastMarketSnapshot();
}, 5000);

initializeDatabase().then(() => {
  server.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });
});
