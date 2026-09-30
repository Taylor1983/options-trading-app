import { Router } from "express";
import { query } from "../db.js";

export const ordersRouter = Router();

ordersRouter.get("/history", async (req: any, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rows = await query(
      `SELECT id, symbol, side, quantity, order_type, limit_price, strategy_type, status, created_at
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    return res.json({ orders: rows });
  } catch (error) {
    console.error("Order history error:", error);
    return res.status(500).json({ error: "Failed to fetch order history" });
  }
});

ordersRouter.post("/", async (req: any, res) => {
  const { symbol, side, quantity, orderType, limitPrice, strategyType } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!symbol || !side || !quantity) {
    return res.status(400).json({ error: "symbol, side, and quantity are required" });
  }

  try {
    const qty = Number(quantity);
    const price = Number(limitPrice || 0);
    const cost = price * qty * 100;

    const accountRows = await query(
      `SELECT cash_balance, buying_power FROM accounts WHERE user_id = $1`,
      [userId]
    );

    if (!accountRows.length) {
      return res.status(404).json({ error: "Account not found" });
    }

    const account = accountRows[0];

    if (side.toUpperCase() === "BUY" && cost > account.cash_balance) {
      return res.status(400).json({ error: "Insufficient buying power" });
    }

    const orderRows = await query(
      `INSERT INTO orders (user_id, symbol, side, quantity, order_type, limit_price, strategy_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'filled')
       RETURNING id, symbol, side, quantity, order_type, limit_price, strategy_type, status, created_at`,
      [userId, symbol.toUpperCase(), side.toUpperCase(), qty, orderType || "limit", price, strategyType || null]
    );

    const order = orderRows[0];

    const existingPos = await query(
      `SELECT * FROM positions WHERE user_id = $1 AND symbol = $2`,
      [userId, symbol.toUpperCase()]
    );

    const sideUpper = side.toUpperCase();

    if (existingPos.length) {
      const current = existingPos[0];
      const nextQty = sideUpper === "BUY" ? current.quantity + qty : current.quantity - qty;
      const nextAvg =
        sideUpper === "BUY"
          ? (current.quantity * current.average_cost + qty * price) / (current.quantity + qty || 1)
          : current.average_cost;

      await query(
        `UPDATE positions
         SET quantity = $1, average_cost = $2, side = $3, updated_at = NOW()
         WHERE id = $4`,
        [nextQty, nextAvg, nextQty >= 0 ? "LONG" : "SHORT", current.id]
      );
    } else {
      await query(
        `INSERT INTO positions (user_id, symbol, quantity, average_cost, side)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, symbol.toUpperCase(), sideUpper === "BUY" ? qty : -qty, price, sideUpper === "BUY" ? "LONG" : "SHORT"]
      );
    }

    const newCash = sideUpper === "BUY" ? account.cash_balance - cost : account.cash_balance + cost;
    await query(
      `UPDATE accounts SET cash_balance = $1 WHERE user_id = $2`,
      [newCash, userId]
    );

    return res.status(201).json({
      status: "filled",
      order,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({ error: "Failed to place order" });
  }
});
