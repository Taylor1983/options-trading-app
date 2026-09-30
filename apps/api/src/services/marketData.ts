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

type ChainRow = {
  strike: number;
  optionType: "CALL" | "PUT";
  bid: number;
  ask: number;
  delta: number;
  iv: number;
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

const mockChain: ChainRow[] = [
  { strike: 205, optionType: "CALL", bid: 12.4, ask: 12.9, delta: 0.61, iv: 27.8 },
  { strike: 210, optionType: "CALL", bid: 9.8, ask: 10.2, delta: 0.57, iv: 27.4 },
  { strike: 215, optionType: "CALL", bid: 7.15, ask: 7.5, delta: 0.51, iv: 26.9 },
  { strike: 220, optionType: "CALL", bid: 4.95, ask: 5.28, delta: 0.46, iv: 26.3 },
  { strike: 225, optionType: "CALL", bid: 3.12, ask: 3.5, delta: 0.41, iv: 25.9 },
  { strike: 230, optionType: "CALL", bid: 1.9, ask: 2.18, delta: 0.36, iv: 25.7 },
  { strike: 205, optionType: "PUT", bid: 2.2, ask: 2.5, delta: -0.39, iv: 27.8 },
  { strike: 210, optionType: "PUT", bid: 3.1, ask: 3.4, delta: -0.43, iv: 27.4 },
  { strike: 215, optionType: "PUT", bid: 4.7, ask: 5.1, delta: -0.49, iv: 26.9 },
  { strike: 220, optionType: "PUT", bid: 6.9, ask: 7.3, delta: -0.54, iv: 26.3 },
  { strike: 225, optionType: "PUT", bid: 9.3, ask: 9.8, delta: -0.59, iv: 25.9 },
  { strike: 230, optionType: "PUT", bid: 12.5, ask: 12.9, delta: -0.64, iv: 25.7 },
];

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
        bid: result.last?.bid || 0,
        ask: result.last?.ask || 0,
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
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2026-09-01/2026-09-27?apiKey=${apiKey}`
    );
    const data = (await response.json()) as any;

    if (data.results && Array.isArray(data.results)) {
      return data.results.map((row: any) => ({
        symbol,
        timestamp: new Date(row.t).toISOString(),
        open: row.o,
        high: row.h,
        low: row.l,
        close: row.c,
        volume: row.v,
      }));
    }
  } catch (error) {
    console.error("Polygon candles error:", error);
  }

  return mockCandles[symbol] || mockCandles.AAPL;
}

export async function fetchOptionChain(symbol: string) {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey || apiKey === "demo") {
    return {
      symbol,
      expiration: "2026-10-17",
      chain: mockChain,
    };
  }

  try {
    const response = await fetch(
      `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${symbol}&limit=12&apiKey=${apiKey}`
    );
    const data = (await response.json()) as any;

    if (Array.isArray(data.results)) {
      const chain = data.results.slice(0, 12).map((row: any, idx: number) => ({
        strike: Number(row.strike_price || 200 + idx * 5),
        optionType: row.contract_type === "call" ? "CALL" : "PUT",
        bid: Number(row.last_quote?.bid ?? row.bid ?? 2),
        ask: Number(row.last_quote?.ask ?? row.ask ?? 3),
        delta: Number(row.delta ?? (row.contract_type === "call" ? 0.45 : -0.45)),
        iv: Number(row.implied_volatility ?? 26),
      }));

      return {
        symbol,
        expiration: data.results[0]?.expiration_date || "2026-10-17",
        chain,
      };
    }
  } catch (error) {
    console.error("Polygon option chain error:", error);
  }

  return {
    symbol,
    expiration: "2026-10-17",
    chain: mockChain,
  };
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
