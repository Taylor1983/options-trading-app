import { Router } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { query } from "../db.js";

export const portfolioRouter = Router();

portfolioRouter.get("/", async (req: AuthRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const accountRows = await query(
      `SELECT id, user_id, account_type, buying_power, net_liquidation_value, cash_balance
       FROM accounts
       WHERE user_id = $1`,
      [userId]
    );

    const positionRows = await query(
      `SELECT symbol, side, quantity, average_cost, market_price, pnl
       FROM positions
       WHERE user_id = $1
       ORDER BY symbol ASC`,
      [userId]
    );

    const account = accountRows[0] || {
      id: null,
      user_id: userId,
      account_type: "paper",
      buying_power: 100000,
      net_liquidation_value: 100000,
      cash_balance: 100000,
    };

    const positions = positionRows.map((position) => ({
      symbol: position.symbol,
      side: position.side,
      quantity: Number(position.quantity),
      averageCost: Number(position.average_cost || 0),
      marketPrice: Number(position.market_price || 0),
      pnl: Number(position.pnl || 0),
    }));

    return res.json({
      account: {
        id: account.id,
        type: account.account_type,
        cash: Number(account.cash_balance || 0),
        buyingPower: Number(account.buying_power || 0),
        netLiquidationValue: Number(account.net_liquidation_value || 0),
      },
      accountValue: Number(account.net_liquidation_value || 0),
      buyingPower: Number(account.buying_power || 0),
      pnl: Number((Number(account.net_liquidation_value || 0) - 100000).toFixed(2)),
      positions,
    });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return res.status(500).json({ error: "Failed to load portfolio" });
  }
});
