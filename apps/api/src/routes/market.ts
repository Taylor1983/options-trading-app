import { Router } from "express";

export const marketRouter = Router();

type Candle = {
  timestamp: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
};

const candles: Record<string, Candle[]> = {
  AAPL: [
    { timestamp: "2026-09-01T00:00:00Z", open: 209.2, high: 210.4, low: 208.7, close: 210.8, volume: 1200000 },
    { timestamp: "2026-09-02T00:00:00Z", open: 210.8, high: 213.2, low: 209.9, close: 212.6, volume: 1200000 },
    { timestamp: "2026-09-03T00:00:00Z", open: 212.6, high: 214.3, low: 211.2, close: 213.9, volume: 1600000 },
    { timestamp: "2026-09-04T00:00:00Z", open: 213.9, high: 216.4, low: 212.5, close: 215.8, volume: 1900000 },
    { timestamp: "2026-09-05T00:00:00Z", open: 215.8, high: 218.4, low: 214.0, close: 217.6, volume: 1750000 },
    { timestamp: "2026-09-06T00:00:00Z", open: 217.6, high: 220.1, low: 216.9, close: 219.4, volume: 2100000 },
    { timestamp: "2026-09-07T00:00:00Z", open: 219.4, high: 221.0, low: 218.3, close: 220.9, volume: 2200000 },
  ],
  MSFT: [
    { timestamp: "2026-09-01T00:00:00Z", open: 420.1, high: 423.0, low: 418.8, close: 421.5, volume: 900000 },
    { timestamp: "2026-09-02T00:00:00Z", open: 421.5, high: 425.2, low: 420.4, close: 424.2, volume: 950000 },
    { timestamp: "2026-09-03T00:00:00Z", open: 424.2, high: 427.9, low: 423.5, close: 426.8, volume: 980000 },
    { timestamp: "2026-09-04T00:00:00Z", open: 426.8, high: 431.4, low: 425.7, close: 429.9, volume: 1050000 },
    { timestamp: "2026-09-05T00:00:00Z", open: 429.9, high: 431.1, low: 426.8, close: 428.0, volume: 1010000 },
    { timestamp: "2026-09-06T00:00:00Z", open: 428.0, high: 432.6, low: 427.4, close: 431.7, volume: 1180000 },
    { timestamp: "2026-09-07T00:00:00Z", open: 431.7, high: 434.0, low: 428.8, close: 433.4, volume: 1200000 },
  ],
};

marketRouter.get("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const data = candles[symbol] || candles.AAPL;
  return res.json({ symbol, candles: data });
});
