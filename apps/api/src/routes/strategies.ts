import { Router } from "express";
import { calculateStrategyMetrics, getStrategyExamples } from "@options-trading/shared";
import { PaperTradingEngine, simulateStrategyProfit } from "../services/paperTrading.js";
import { query } from "../db.js";

export const strategiesRouter = Router();

const engines = new Map<string, PaperTradingEngine>();

function getEngine(userId: string) {
  if (!engines.has(userId)) {
    engines.set(userId, new PaperTradingEngine(100000));
  }
  return engines.get(userId)!;
}

strategiesRouter.get("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const examples = getStrategyExamples(symbol);

  return res.json({ symbol, strategies: examples });
});

strategiesRouter.post("/calculate", (req, res) => {
  const { strategy } = req.body;

  if (!strategy) {
    return res.status(400).json({ error: "Strategy payload is required" });
  }

  const metrics = calculateStrategyMetrics(strategy);
  return res.json({ strategy, metrics });
});

strategiesRouter.post("/paper-trade", async (req: any, res) => {
  const { symbol, side, quantity, orderType, limitPrice, strategyType } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!symbol || !side || !quantity) {
    return res.status(400).json({ error: "symbol, side, and quantity are required" });
  }

  try {
    const engine = getEngine(userId);
    const order = engine.placeOrder({
      symbol: symbol.toUpperCase(),
      side,
      quantity: Number(quantity),
      orderType: orderType || "market",
      limitPrice: Number(limitPrice || 0),
      strategyType,
    });

    const summary = engine.getPortfolioSummary();
    const projection = simulateStrategyProfit(strategyType || "long-call", Number(limitPrice || 220), 5, 220);

    await query(
      `INSERT INTO orders (user_id, symbol, side, quantity, order_type, limit_price, strategy_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'filled')`,
      [userId, symbol.toUpperCase(), side, Number(quantity), orderType || "market", Number(limitPrice || 0), strategyType || null]
    );

    return res.status(200).json({
      order,
      summary,
      projection,
    });
  } catch (error) {
    console.error("Paper trade error:", error);
    return res.status(500).json({ error: "Paper trade failed" });
  }
});
