import { Router } from "express";

export const portfolioRouter = Router();

const positions = [
  { symbol: "AAPL", quantity: 30, side: "Long", price: 212.8, pnl: 480.0 },
  { symbol: "NVDA", quantity: 20, side: "Long", price: 118.2, pnl: 780.0 },
  { symbol: "SPY", quantity: 15, side: "Short", price: 556.4, pnl: -72.0 },
  { symbol: "MSFT", quantity: 10, side: "Long", price: 432.0, pnl: -34.0 },
];

portfolioRouter.get("/", (_req, res) => {
  return res.json({
    accountValue: 1284920,
    buyingPower: 245800,
    pnl: 13420,
    positions,
  });
});
