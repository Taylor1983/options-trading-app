import { Router } from "express";
import { query } from "../db.js";

export const ordersRouter = Router();

ordersRouter.get("/history", async (req: any, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rows = await query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );

  return res.json({ orders: rows });
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

  const rows = await query(
    `INSERT INTO orders (user_id, symbol, side, quantity, order_type, limit_price, strategy_type, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'filled')
     RETURNING *`,
    [userId, symbol.toUpperCase(), side.toUpperCase(), Number(quantity), orderType || "limit", Number(limitPrice || 0), strategyType || null]
  );

  const order = rows[0];

  const existing = await query(
    `SELECT * FROM positions WHERE user_id = $1 AND symbol = $2`,
    [userId, symbol.toUpperCase()]
  );

  const qty = Number(quantity);
  const sideUpper = side.toUpperCase();
  const cost = Number(limitPrice || 0);

  if (existing.length) {
    const current = existing[0];
    const nextQty = sideUpper === "BUY" ? current.quantity + qty : current.quantity - qty;
    const nextAvg = sideUpper === "BUY"
      ? ((current.quantity * current.average_cost) + (qty * cost)) / (current.quantity + qty || 1)
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
      [userId, symbol.toUpperCase(), sideUpper === "BUY" ? qty : -qty, cost, sideUpper === "BUY" ? "LONG" : "SHORT"]
    );
  }

  return res.status(201).json({
    status: "filled",
    order,
    timestamp: new Date().toISOString(),
  });
});
