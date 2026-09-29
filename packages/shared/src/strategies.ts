export type StrategyType =
  | "long-call"
  | "long-put"
  | "short-call"
  | "short-put"
  | "bull-call-spread"
  | "bull-put-spread"
  | "bear-call-spread"
  | "bear-put-spread"
  | "iron-condor"
  | "long-straddle"
  | "long-strangle"
  | "calendar-spread";

export type StrategyLeg = {
  symbol: string;
  optionType: "CALL" | "PUT";
  strike: number;
  expiration: string;
  quantity: number;
  side: "BUY" | "SELL";
  price: number;
};

export type Strategy = {
  id: string;
  name: string;
  type: StrategyType;
  legs: StrategyLeg[];
  totalCost: number;
  createdAt: string;
};

export type StrategyCalculation = {
  maxProfit: number;
  maxLoss: number;
  breakEven: number[];
  profitAtExpiry: (stockPrice: number) => number;
  riskReward: number;
};

export function longCall(
  symbol: string,
  strike: number,
  expiration: string,
  entryPrice: number
): Strategy {
  return {
    id: `long-call-${symbol}-${strike}`,
    name: `Long ${symbol} ${strike} Call`,
    type: "long-call",
    legs: [
      {
        symbol,
        optionType: "CALL",
        strike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: entryPrice,
      },
    ],
    totalCost: entryPrice * 100,
    createdAt: new Date().toISOString(),
  };
}

export function longPut(
  symbol: string,
  strike: number,
  expiration: string,
  entryPrice: number
): Strategy {
  return {
    id: `long-put-${symbol}-${strike}`,
    name: `Long ${symbol} ${strike} Put`,
    type: "long-put",
    legs: [
      {
        symbol,
        optionType: "PUT",
        strike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: entryPrice,
      },
    ],
    totalCost: entryPrice * 100,
    createdAt: new Date().toISOString(),
  };
}

export function shortCall(
  symbol: string,
  strike: number,
  expiration: string,
  entryPrice: number
): Strategy {
  return {
    id: `short-call-${symbol}-${strike}`,
    name: `Short ${symbol} ${strike} Call`,
    type: "short-call",
    legs: [
      {
        symbol,
        optionType: "CALL",
        strike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: entryPrice,
      },
    ],
    totalCost: -entryPrice * 100,
    createdAt: new Date().toISOString(),
  };
}

export function shortPut(
  symbol: string,
  strike: number,
  expiration: string,
  entryPrice: number
): Strategy {
  return {
    id: `short-put-${symbol}-${strike}`,
    name: `Short ${symbol} ${strike} Put`,
    type: "short-put",
    legs: [
      {
        symbol,
        optionType: "PUT",
        strike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: entryPrice,
      },
    ],
    totalCost: entryPrice * 100,
    createdAt: new Date().toISOString(),
  };
}

export function bullCallSpread(
  symbol: string,
  longStrike: number,
  shortStrike: number,
  expiration: string,
  longPrice: number,
  shortPrice: number
): Strategy {
  return {
    id: `bull-call-spread-${symbol}-${longStrike}-${shortStrike}`,
    name: `Bull Call Spread ${symbol} ${longStrike}/${shortStrike}`,
    type: "bull-call-spread",
    legs: [
      {
        symbol,
        optionType: "CALL",
        strike: longStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: longPrice,
      },
      {
        symbol,
        optionType: "CALL",
        strike: shortStrike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: shortPrice,
      },
    ],
    totalCost: (longPrice - shortPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function bullPutSpread(
  symbol: string,
  shortStrike: number,
  longStrike: number,
  expiration: string,
  shortPrice: number,
  longPrice: number
): Strategy {
  return {
    id: `bull-put-spread-${symbol}-${shortStrike}-${longStrike}`,
    name: `Bull Put Spread ${symbol} ${shortStrike}/${longStrike}`,
    type: "bull-put-spread",
    legs: [
      {
        symbol,
        optionType: "PUT",
        strike: shortStrike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: shortPrice,
      },
      {
        symbol,
        optionType: "PUT",
        strike: longStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: longPrice,
      },
    ],
    totalCost: (shortPrice - longPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function bearCallSpread(
  symbol: string,
  shortStrike: number,
  longStrike: number,
  expiration: string,
  shortPrice: number,
  longPrice: number
): Strategy {
  return {
    id: `bear-call-spread-${symbol}-${shortStrike}-${longStrike}`,
    name: `Bear Call Spread ${symbol} ${shortStrike}/${longStrike}`,
    type: "bear-call-spread",
    legs: [
      {
        symbol,
        optionType: "CALL",
        strike: shortStrike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: shortPrice,
      },
      {
        symbol,
        optionType: "CALL",
        strike: longStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: longPrice,
      },
    ],
    totalCost: (shortPrice - longPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function bearPutSpread(
  symbol: string,
  longStrike: number,
  shortStrike: number,
  expiration: string,
  longPrice: number,
  shortPrice: number
): Strategy {
  return {
    id: `bear-put-spread-${symbol}-${longStrike}-${shortStrike}`,
    name: `Bear Put Spread ${symbol} ${longStrike}/${shortStrike}`,
    type: "bear-put-spread",
    legs: [
      {
        symbol,
        optionType: "PUT",
        strike: longStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: longPrice,
      },
      {
        symbol,
        optionType: "PUT",
        strike: shortStrike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: shortPrice,
      },
    ],
    totalCost: (longPrice - shortPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function longStraddle(
  symbol: string,
  strike: number,
  expiration: string,
  callPrice: number,
  putPrice: number
): Strategy {
  return {
    id: `long-straddle-${symbol}-${strike}`,
    name: `Long Straddle ${symbol} ${strike}`,
    type: "long-straddle",
    legs: [
      {
        symbol,
        optionType: "CALL",
        strike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: callPrice,
      },
      {
        symbol,
        optionType: "PUT",
        strike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: putPrice,
      },
    ],
    totalCost: (callPrice + putPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function longStrangle(
  symbol: string,
  callStrike: number,
  putStrike: number,
  expiration: string,
  callPrice: number,
  putPrice: number
): Strategy {
  return {
    id: `long-strangle-${symbol}-${callStrike}-${putStrike}`,
    name: `Long Strangle ${symbol} ${callStrike}/${putStrike}`,
    type: "long-strangle",
    legs: [
      {
        symbol,
        optionType: "CALL",
        strike: callStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: callPrice,
      },
      {
        symbol,
        optionType: "PUT",
        strike: putStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: putPrice,
      },
    ],
    totalCost: (callPrice + putPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function ironCondor(
  symbol: string,
  putShortStrike: number,
  putLongStrike: number,
  callShortStrike: number,
  callLongStrike: number,
  expiration: string,
  putShortPrice: number,
  putLongPrice: number,
  callShortPrice: number,
  callLongPrice: number
): Strategy {
  return {
    id: `iron-condor-${symbol}`,
    name: `Iron Condor ${symbol}`,
    type: "iron-condor",
    legs: [
      {
        symbol,
        optionType: "PUT",
        strike: putShortStrike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: putShortPrice,
      },
      {
        symbol,
        optionType: "PUT",
        strike: putLongStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: putLongPrice,
      },
      {
        symbol,
        optionType: "CALL",
        strike: callShortStrike,
        expiration,
        quantity: 1,
        side: "SELL",
        price: callShortPrice,
      },
      {
        symbol,
        optionType: "CALL",
        strike: callLongStrike,
        expiration,
        quantity: 1,
        side: "BUY",
        price: callLongPrice,
      },
    ],
    totalCost: (putShortPrice - putLongPrice + callShortPrice - callLongPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function calendarSpread(
  symbol: string,
  strike: number,
  nearExpiration: string,
  farExpiration: string,
  nearPrice: number,
  farPrice: number
): Strategy {
  return {
    id: `calendar-spread-${symbol}-${strike}`,
    name: `Calendar Spread ${symbol} ${strike}`,
    type: "calendar-spread",
    legs: [
      {
        symbol,
        optionType: "CALL",
        strike,
        expiration: nearExpiration,
        quantity: 1,
        side: "SELL",
        price: nearPrice,
      },
      {
        symbol,
        optionType: "CALL",
        strike,
        expiration: farExpiration,
        quantity: 1,
        side: "BUY",
        price: farPrice,
      },
    ],
    totalCost: (farPrice - nearPrice) * 100,
    createdAt: new Date().toISOString(),
  };
}

export function calculateStrategyMetrics(strategy: Strategy): StrategyCalculation {
  const debitOrCredit = strategy.totalCost / 100;
  const maxLoss = Math.abs(debitOrCredit) * 100;
  const maxProfit = Math.max(0, 1000 - Math.abs(debitOrCredit) * 100);

  const breakEven = strategy.legs.reduce((acc, leg) => {
    const strike = leg.strike;
    if (leg.optionType === "CALL") {
      const breakeven = strategy.legs.some((item) => item.side === "SELL" && item.optionType === "CALL")
        ? strike - Math.abs(debitOrCredit)
        : strike + Math.abs(debitOrCredit);
      acc.push(breakeven);
    } else {
      const breakeven = strategy.legs.some((item) => item.side === "SELL" && item.optionType === "PUT")
        ? strike + Math.abs(debitOrCredit)
        : strike - Math.abs(debitOrCredit);
      acc.push(breakeven);
    }
    return acc;
  }, [] as number[]);

  const profitAtExpiry = (stockPrice: number) => {
    let pnl = 0;

    for (const leg of strategy.legs) {
      const intrinsic = leg.optionType === "CALL"
        ? Math.max(stockPrice - leg.strike, 0)
        : Math.max(leg.strike - stockPrice, 0);

      const value = intrinsic * leg.quantity * 100;
      const legPnl = leg.side === "BUY" ? value - leg.price * leg.quantity * 100 : leg.price * leg.quantity * 100 - value;
      pnl += legPnl;
    }

    return pnl;
  };

  return {
    maxProfit,
    maxLoss,
    breakEven: breakEven.filter((n) => Number.isFinite(n)),
    profitAtExpiry,
    riskReward: maxLoss === 0 ? 0 : maxProfit / maxLoss,
  };
}

export function getStrategyExamples(symbol = "AAPL") {
  return [
    longCall(symbol, 220, "2026-10-17", 4.25),
    longPut(symbol, 215, "2026-10-17", 3.8),
    bullCallSpread(symbol, 218, 222, "2026-10-17", 6.2, 3.4),
    longStraddle(symbol, 220, "2026-10-17", 5.10, 4.90),
    ironCondor(symbol, 210, 205, 228, 232, "2026-10-17", 2.1, 0.9, 1.7, 0.8),
  ];
}

export default {
  longCall,
  longPut,
  shortCall,
  shortPut,
  bullCallSpread,
  bullPutSpread,
  bearCallSpread,
  bearPutSpread,
  longStraddle,
  longStrangle,
  ironCondor,
  calendarSpread,
  calculateStrategyMetrics,
  getStrategyExamples,
};

