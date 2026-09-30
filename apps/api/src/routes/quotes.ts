import { Router } from "express";

export const quotesRouter = Router();

quotesRouter.get("/:symbol", (req, res) => {
  return res.json({ symbol: req.params.symbol.toUpperCase(), lastPrice: 220.12 });
});
