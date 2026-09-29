import { Router } from "express";

export const ordersRouter = Router();

ordersRouter.post("/", (req, res) => {
  const { symbol, side, quantity, orderType, limitPrice } = req.body;

  if (!symbol || !side || !quantity) {
    return res.status(400).json({ error: "Missing required order fields" });
  }

  return res.status(201).json({
    status: "accepted",
    symbol: symbol.toUpperCase(),
    side,
    quantity,
    orderType: orderType || "limit",
    limitPrice: limitPrice || null,
    timestamp: new Date().toISOString(),
  });
});
