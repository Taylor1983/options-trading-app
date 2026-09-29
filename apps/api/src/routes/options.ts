import { Router } from "express";

export const optionsRouter = Router();

const optionChain = [
  { strike: 205, optionType: "CALL", bid: 12.4, ask: 12.9, delta: 0.61, iv: 27.8 },
  { strike: 210, optionType: "CALL", bid: 9.8, ask: 10.2, delta: 0.57, iv: 27.4 },
  { strike: 215, optionType: "CALL", bid: 7.15, ask: 7.5, delta: 0.51, iv: 26.9 },
  { strike: 220, optionType: "CALL", bid: 4.95, ask: 5.28, delta: 0.46, iv: 26.3 },
  { strike: 225, optionType: "CALL", bid: 3.12, ask: 3.5, delta: 0.41, iv: 25.9 },
  { strike: 230, optionType: "CALL", bid: 1.9, ask: 2.18, delta: 0.36, iv: 25.7 },
  { strike: 205, optionType: "PUT", bid: 2.2, ask: 2.5, delta: -0.39, iv: 27.8 },
  { strike: 210, optionType: "PUT", bid: 3.1, ask: 3.4, delta: -0.43, iv: 27.4 },
  { strike: 215, optionType: "PUT", bid: 4.7, ask: 5.1, delta: -0.49, iv: 26.9 },
  { strike: 220, optionType: "PUT", bid: 6.9, ask: 7.3, delta: -0.54, iv: 26.3 },
  { strike: 225, optionType: "PUT", bid: 9.3, ask: 9.8, delta: -0.59, iv: 25.9 },
  { strike: 230, optionType: "PUT", bid: 12.5, ask: 12.9, delta: -0.64, iv: 25.7 },
];

optionsRouter.get("/chain/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol" });
  }

  return res.json({
    symbol,
    expiration: "2026-10-17",
    chain: optionChain,
  });
});
