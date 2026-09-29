import { Router } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth.js";
import { fetchQuote, fetchCandles, storeQuote, storeCandle } from "../services/marketData.js";

export const marketRouter = Router();

marketRouter.get("/quote/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const quote = await fetchQuote(symbol);
  await storeQuote(symbol, quote);

  return res.json({
    symbol,
    lastPrice: quote.price,
    bid: quote.bid,
    ask: quote.ask,
    volume: quote.volume,
    timestamp: quote.timestamp,
  });
});

marketRouter.get("/candles/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const candles = await fetchCandles(symbol);

  for (const candle of candles) {
    await storeCandle(candle);
  }

  return res.json({
    symbol,
    candles: candles.map((c) => ({
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    })),
  });
});
