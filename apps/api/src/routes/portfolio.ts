import { Router } from "express";
import { query } from "../db.js";

export const portfolioRouter = Router();

portfolioRouter.get("/", async (req: any, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const accountRows = await query(
      `SELECT id, buying_power, net_liquidation_value, cash_balance FROM accounts WHERE user_id = $1`,
      [userId]
    );

    if (!accountRows.length) {
      return res.status(404).json({ error: "Account not found" });
    }

    const account = accountRows[0];

    const positionRows = await query(
      `SELECT symbol, quantity, average_cost, side FROM positions WHERE user_id = $1 AND quantity != 0`,
      [userId]
    );

    const quoteSymbols = positionRows.map((pos) => pos.symbol);
    let marketPrices: Record<string, number> = {};

    if (quoteSymbols.length > 0) {
      const placeholders = quoteSymbols.map((_, i) => `$${i + 1}`).join(",");
      const quoteRows = await query(
        `SELECT DISTINCT ON (symbol) symbol, last_price FROM market_quotes WHERE symbol IN (${placeholders}) ORDER BY symbol, timestamp DESC`,
        quoteSymbols
      );

      quoteRows.forEach((row: any) => {
        marketPrices[row.symbol] = Number(row.last_price || row.average_cost);
      });
    }

    const positions = positionRows.map((position: any) => {
      const marketPrice = marketPrices[position.symbol] || Number(position.average_cost);
      const pnl = (marketPrice - Number(position.average_cost)) * Number(position.quantity) * 100;
      const totalValue = marketPrice * Number(position.quantity) * 100;

      return {
        symbol: position.symbol,
        quantity: position.quantity,
        side: position.side,
        averageCost: Number(position.average_cost),
        marketPrice,
        pnl,
        totalValue,
      };
    });

    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalPositionValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const nlv = Number(account.cash_balance) + totalPositionValue;

    return res.json({
      account: {
        cash: Number(account.cash_balance),
        buyingPower: Number(account.buying_power),
        netLiquidationValue: nlv,
      },
      positions,
      summary: {
        totalPnL,
        totalPositionValue,
      },
    });
  } catch (error) {
    console.error("Portfolio error:", error);
    return res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

portfolioRouter.get("/account", async (req: any, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rows = await query(
      `SELECT id, account_type, buying_power, net_liquidation_value, cash_balance, created_at FROM accounts WHERE user_id = $1`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Account not found" });
    }

    return res.json({ account: rows[0] });
  } catch (error) {
    console.error("Account error:", error);
    return res.status(500).json({ error: "Failed to fetch account" });
  }
});
