export type Quote = {
  symbol: string;
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: string;
};

export type OptionContract = {
  symbol: string;
  expiration: string;
  strike: number;
  optionType: "CALL" | "PUT";
  bid: number | null;
  ask: number | null;
  lastPrice: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  rho: number | null;
  impliedVolatility: number | null;
};
