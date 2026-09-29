import { Router } from "express";

export const quotesRouter = Router();

const quoteMap = {
  AAPL: { symbol: "AAPL", lastPrice: 220.12, bid: 219.98, ask: 220.26, volume: 1450000 },
  MSFT: { symbol: "MSFT", lastPrice: 428.91, bid: 428.48, ask: 429.14, volume: 920000 },
  NVDA: { symbol: "NVDA", lastPrice: 122.12, bid: 121.84, ask: 122.42, volume: 4108000 },
  SPY: { symbol: "SPY", lastPrice: 551.18, bid: 550.96, ask: 551.38, volume: 1680000 },
  QQQ: { symbol: "QQQ", lastPrice: 470.61, bid: 470.22, ask: 470.88, volume: 1420000 },
};

quotesRouter.get("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const quote = quoteMap[symbol as keyof typeof quoteMap];

  if (!quote) {
    return res.status(404).json({ error: "Symbol not found" });
  }

  return res.json({ ...quote, timestamp: new Date().toISOString() });
});
