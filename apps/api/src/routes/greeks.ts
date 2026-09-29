import { Router } from "express";
import { calculateGreeks } from "@options-trading/shared";

export const greeksRouter = Router();

greeksRouter.post("/calculate", (req, res) => {
  const { stockPrice, strike, expiryDays, volatility, rate, optionType } = req.body;

  if (!stockPrice || !strike || !expiryDays || !volatility || !optionType) {
    return res.status(400).json({ error: "Missing required Greeks inputs" });
  }

  const greeks = calculateGreeks({
    stockPrice: Number(stockPrice),
    strike: Number(strike),
    expiryDays: Number(expiryDays),
    volatility: Number(volatility),
    rate: Number(rate || 0.05),
    optionType,
  });

  return res.json({ greeks });
});
