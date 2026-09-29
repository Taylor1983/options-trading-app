import { Router } from "express";
import { calculateStrategyMetrics, getStrategyExamples } from "@options-trading/shared";
import { PaperTradingEngine, simulateStrategyProfit } from "../services/paperTrading.js";

export const strategiesRouter = Router();

const engine = new PaperTradingEngine();

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

strategiesRouter.post("/paper-trade", (req, res) => {
  const { symbol, side, quantity, orderType, limitPrice, strategyType } = req.body;

  if (!symbol || !side || !quantity) {
    return res.status(400).json({ error: "symbol, side, and quantity are required" });
  }

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

  return res.status(200).json({
    order,
    summary,
    projection,
  });
});
