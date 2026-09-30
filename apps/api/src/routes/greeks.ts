import { Router } from "express";

export const greeksRouter = Router();

greeksRouter.post("/calculate", (req, res) => {
  const { stockPrice, strike, expiryDays, volatility, rate, optionType } = req.body;

  const d1 = (Math.log(stockPrice / strike) + (rate + (volatility * volatility) / 2) * (expiryDays / 365)) / (volatility * Math.sqrt(expiryDays / 365));
  const d2 = d1 - volatility * Math.sqrt(expiryDays / 365);

  const normPdf = (x: number) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
  const normCdf = (x: number) => 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));

  const delta = optionType === "CALL" ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = normPdf(d1) / (stockPrice * volatility * Math.sqrt(expiryDays / 365));
  const theta = ((stockPrice * normPdf(d1) * volatility) / (2 * Math.sqrt(expiryDays / 365)) - rate * strike * Math.exp(-rate * (expiryDays / 365)) * normCdf(optionType === "CALL" ? d2 : d2 - volatility * Math.sqrt(expiryDays / 365))) / 365;
  const vega = stockPrice * normPdf(d1) * Math.sqrt(expiryDays / 365) / 100;
  const rho = (strike * expiryDays * Math.exp(-rate * (expiryDays / 365)) * (optionType === "CALL" ? normCdf(d2) : -normCdf(-d2))) / 100;

  return res.json({
    greeks: {
      delta: Number(delta.toFixed(4)),
      gamma: Number(gamma.toFixed(4)),
      theta: Number(theta.toFixed(4)),
      vega: Number(vega.toFixed(4)),
      rho: Number(rho.toFixed(4)),
      iv: volatility,
    },
  });
});
