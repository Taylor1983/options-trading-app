export type Greeks = {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  iv: number;
  theoreticalPrice: number;
};

const PI = Math.PI;
const SQRT2PI = Math.sqrt(2 * PI);

function cumulativeNormalDistribution(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);

  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}

function normalProbabilityDensity(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT2PI;
}

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
  const T = Math.max(expiryDays / 365, 0.001);
  const S = stockPrice;
  const K = strike;
  const r = rate;
  const sigma = volatility / 100;

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const Nd1 = cumulativeNormalDistribution(d1);
  const Nd2 = cumulativeNormalDistribution(d2);
  const nd1 = normalProbabilityDensity(d1);

  let delta: number;
  let gamma: number;
  let theta: number;
  let theoreticalPrice: number;

  if (optionType === "CALL") {
    delta = Nd1;
    theoreticalPrice = S * Nd1 - K * Math.exp(-r * T) * Nd2;
    theta = (-S * nd1 * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * Nd2;
  } else {
    delta = Nd1 - 1;
    theoreticalPrice = K * Math.exp(-r * T) * cumulativeNormalDistribution(-d2) - S * cumulativeNormalDistribution(-d1);
    theta = (-S * nd1 * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * cumulativeNormalDistribution(-d2);
  }

  gamma = nd1 / (S * sigma * Math.sqrt(T));
  const vega = S * nd1 * Math.sqrt(T) / 100;
  const rho = (optionType === "CALL" ? K * T * Math.exp(-r * T) * Nd2 : -K * T * Math.exp(-r * T) * cumulativeNormalDistribution(-d2)) / 100;

  return {
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number((theta / 365).toFixed(4)),
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4)),
    iv: volatility,
    theoreticalPrice: Number(theoreticalPrice.toFixed(2)),
  };
}
