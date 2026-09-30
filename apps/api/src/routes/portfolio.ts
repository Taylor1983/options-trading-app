import { Router } from "express";
import { query } from "../db.js";

export const portfolioRouter = Router();

portfolioRouter.get("/", async (req: any, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const orderRows = await query(
    `SELECT symbol, side, quantity, limit_price, created_at
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  const positionsMap = new Map<string, { symbol: string; quantity: number; averageCost: number; side: string; pnl: number; }>();

  for (const row of orderRows) {
    const symbol = row.symbol;
    const current = positionsMap.get(symbol) || { symbol, quantity: 0, averageCost: 0, side: "LONG", pnl: 0 };
    const qty = Number(row.quantity);
    const price = Number(row.limit_price || 0);

    if (row.side === "BUY") {
      current.quantity += qty;
      current.averageCost = current.quantity ? ((current.averageCost * (current.quantity - qty)) + (price * qty)) / current.quantity : price;
      current.side = current.quantity >= 0 ? "LONG" : "SHORT";
    } else {
      current.quantity -= qty;
      current.side = current.quantity >= 0 ? "LONG" : "SHORT";
    }

    positionsMap.set(symbol, current);
  }

  const quoteRows = await query(
    `SELECT symbol, last_price FROM market_quotes WHERE symbol IN (${orderRows.map(() => "$" + (orderRows.indexOf((_: any) => _) + 1)).join(",") || "''"}) ORDER BY timestamp DESC`,
    orderRows.map((row) => row.symbol)
  );

  const positions = Array.from(positionsMap.values())
    .filter((position) => position.quantity !== 0)
    .map((position) => {
      const lastQuote = quoteRows.find((row) => row.symbol === position.symbol);
      const marketPrice = Number(lastQuote?.last_price || position.averageCost || 0);
      const pnl = (marketPrice - position.averageCost) * position.quantity * 100;
      return {
        symbol: position.symbol,
        quantity: position.quantity,
        side: position.side,
        price: position.averageCost,
        pnl,
      };
    });

  const accountValue = 1284920;
  const buyingPower = 245800;
  const pnl = positions.reduce((sum, position) => sum + position.pnl, 0);

  return res.json({
    accountValue,
    buyingPower,
    pnl,
    positions,
  });
});
