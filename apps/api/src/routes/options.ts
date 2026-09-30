import { Router } from "express";
import { fetchOptionChain } from "../services/marketData.js";

export const optionsRouter = Router();

optionsRouter.get("/chain/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol" });
  }

  const chain = await fetchOptionChain(symbol);

  return res.json({
    symbol,
    expiration: chain.expiration,
    chain: chain.chain,
  });
});
