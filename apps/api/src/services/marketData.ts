import fetch from "node-fetch";
import { query } from "../db.js";

type Quote = {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: string;
};

type Candle = {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const mockQuotes: Record<string, Quote> = {
  AAPL: { symbol: "AAPL", price: 220.12, bid: 219.98, ask: 220.26, volume: 1450000, timestamp: new Date().toISOString() },
  MSFT: { symbol: "MSFT", price: 428.91, bid: 428.48, ask: 429.14, volume: 920000, timestamp: new Date().toISOString() },
  NVDA: { symbol: "NVDA", price: 122.12, bid: 121.84, ask: 122.42, volume: 4108000, timestamp: new Date().toISOString() },
  SPY: { symbol: "SPY", price: 551.18, bid: 550.96, ask: 551.38, volume: 1680000, timestamp: new Date().toISOString() },
  QQQ: { symbol: "QQQ", price: 470.61, bid: 470.22, ask: 470.88, volume: 1420000, timestamp: new Date().toISOString() },
};

const mockCandles: Record<string, Candle[]> = {
  AAPL: [
    { symbol: "AAPL", timestamp: "2026-09-23T00:00:00Z", open: 215.2, high: 216.8, low: 214.5, close: 216.1, volume: 1200000 },
    { symbol: "AAPL", timestamp: "2026-09-24T00:00:00Z", open: 216.1, high: 218.9, low: 215.8, close: 217.5, volume: 1350000 },
    { symbol: "AAPL", timestamp: "2026-09-25T00:00:00Z", open: 217.5, high: 219.2, low: 216.8, close: 218.9, volume: 1500000 },
    { symbol: "AAPL", timestamp: "2026-09-26T00:00:00Z", open: 218.9, high: 220.6, low: 218.2, close: 219.8, volume: 1620000 },
    { symbol: "AAPL", timestamp: "2026-09-27T00:00:00Z", open: 219.8, high: 221.3, low: 219.1, close: 220.9, volume: 1750000 },
  ],
  MSFT: [
    { symbol: "MSFT", timestamp: "2026-09-23T00:00:00Z", open: 420.1, high: 423.0, low: 418.8, close: 421.5, volume: 900000 },
    { symbol: "MSFT", timestamp: "2026-09-24T00:00:00Z", open: 421.5, high: 425.2, low: 420.4, close: 424.2, volume: 950000 },
    { symbol: "MSFT", timestamp: "2026-09-25T00:00:00Z", open: 424.2, high: 427.9, low: 423.5, close: 426.8, volume: 980000 },
    { symbol: "MSFT", timestamp: "2026-09-26T00:00:00Z", open: 426.8, high: 431.4, low: 425.7, close: 429.9, volume: 1050000 },
    { symbol: "MSFT", timestamp: "2026-09-27T00:00:00Z", open: 429.9, high: 431.1, low: 426.8, close: 428.0, volume: 1010000 },
  ],
};

export async function fetchQuote(symbol: string): Promise<Quote> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey || apiKey === "demo") {
    return mockQuotes[symbol] || mockQuotes.AAPL;
  }

  try {
    const response = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${apiKey}`
    );
    const data = (await response.json()) as any;

    if (data.status === "OK" && data.results) {
      const result = data.results;
      return {
        symbol,
        price: result.last?.price || 0,
        bid: result.prevDay?.c || 0,
        ask: result.last?.price || 0,
        volume: result.last?.size || 0,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Polygon API error:", error);
  }

  return mockQuotes[symbol] || mockQuotes.AAPL;
}

export async function fetchCandles(symbol: string): Promise<Candle[]> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey || apiKey === "demo") {
    return mockCandles[symbol] || mockCandles.AAPL;
  }

  try {
    const response = await fetch(
      `https://api.polygon.io/v1/open-close/${symbol}/2026-09-27?adjusted=true&apikey=${apiKey}`
    );
    const data = (await response.json()) as any;

    if (data.status === "OK") {
      return [
        {
          symbol,
          timestamp: data.from,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
        },
      ];
    }
  } catch (error) {
    console.error("Polygon API error:", error);
  }

  return mockCandles[symbol] || mockCandles.AAPL;
}

export async function storeQuote(symbol: string, quote: Quote) {
  try {
    await query(
      `INSERT INTO market_quotes (symbol, last_price, bid, ask, volume, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (symbol, timestamp) DO UPDATE SET
       last_price = EXCLUDED.last_price,
       bid = EXCLUDED.bid,
       ask = EXCLUDED.ask,
       volume = EXCLUDED.volume`,
      [symbol, quote.price, quote.bid, quote.ask, quote.volume, quote.timestamp]
    );
  } catch (error) {
    console.error("Store quote error:", error);
  }
}

export async function storeCandle(candle: Candle) {
  try {
    await query(
      `INSERT INTO candles (symbol, time_period, open_price, high_price, low_price, close_price, volume, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (symbol, time_period, timestamp) DO UPDATE SET
       close_price = EXCLUDED.close_price,
       volume = EXCLUDED.volume`,
      [candle.symbol, "1d", candle.open, candle.high, candle.low, candle.close, candle.volume, candle.timestamp]
    );
  } catch (error) {
    console.error("Store candle error:", error);
  }
}
