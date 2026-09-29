export type Greeks = {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  iv: number;
};

export function calculateGreeks({
  stockPrice,
  strike,
  expiryDays,
  volatility,
  rate,
  optionType,
}: {
  stockPrice: number;
  strike: number;
  expiryDays: number;
  volatility: number;
  rate: number;
  optionType: "CALL" | "PUT";
}): Greeks {
  const timeToExpiry = Math.max(expiryDays / 365, 0.01);
  const intrinsic = optionType === "CALL" ? Math.max(stockPrice - strike, 0) : Math.max(strike - stockPrice, 0);

  const delta = optionType === "CALL"
    ? 0.5 + (stockPrice - strike) / (stockPrice * 10 + 1) + 0.1
    : -0.5 + (strike - stockPrice) / (stockPrice * 10 + 1) - 0.1;

  const gamma = 0.05 / (Math.sqrt(timeToExpiry + 1));
  const theta = -0.08 - 0.02 * (volatility / 100);
  const vega = 0.12 + volatility / 200;
  const rho = optionType === "CALL" ? 0.08 + rate * 0.1 : -0.08 - rate * 0.1;
  const iv = volatility + (intrinsic > 0 ? 2 : 0);

  return {
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number(theta.toFixed(4)),
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4)),
    iv: Number(iv.toFixed(2)),
  };
}
