export type PaperTradeOrder = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  orderType: "market" | "limit";
  limitPrice?: number;
  status: "pending" | "filled" | "rejected";
  strategyType?: string;
  createdAt: string;
};

export type PaperPosition = {
  symbol: string;
  quantity: number;
  averageCost: number;
  marketPrice: number;
  side: "LONG" | "SHORT";
  pnl: number;
};

export type PortfolioSummary = {
  cash: number;
  buyingPower: number;
  netLiquidationValue: number;
  positions: PaperPosition[];
  openOrders: PaperTradeOrder[];
};

export class PaperTradingEngine {
  private cash: number;
  private positions: Map<string, PaperPosition>;
  private orders: PaperTradeOrder[];

  constructor(initialCash = 100000) {
    this.cash = initialCash;
    this.positions = new Map();
    this.orders = [];
  }

  public placeOrder(order: Omit<PaperTradeOrder, "id" | "status" | "createdAt">): PaperTradeOrder {
    const quantity = Math.abs(order.quantity);
    const side = order.side.toUpperCase() as "BUY" | "SELL";

    if (quantity <= 0) {
      return { ...order, id: crypto.randomUUID(), status: "rejected", createdAt: new Date().toISOString() };
    }

    const estimatedPrice = order.limitPrice ?? 100;
    const estimatedCost = estimatedPrice * quantity * 100;

    if (side === "BUY" && estimatedCost > this.cash) {
      return { ...order, id: crypto.randomUUID(), status: "rejected", createdAt: new Date().toISOString() };
    }

    const fillPrice = order.orderType === "limit" && order.limitPrice ? order.limitPrice : estimatedPrice;
    const orderRecord: PaperTradeOrder = {
      ...order,
      id: crypto.randomUUID(),
      status: "filled",
      limitPrice: fillPrice,
      createdAt: new Date().toISOString(),
    };

    this.orders.push(orderRecord);

    if (side === "BUY") {
      this.cash -= fillPrice * quantity * 100;
      const current = this.positions.get(order.symbol) ?? {
        symbol: order.symbol,
        quantity: 0,
        averageCost: 0,
        marketPrice: fillPrice,
        side: "LONG",
        pnl: 0,
      };

      const newQty = current.quantity + quantity;
      const newAvg = (current.quantity * current.averageCost + quantity * fillPrice) / newQty;

      this.positions.set(order.symbol, {
        ...current,
        quantity: newQty,
        averageCost: newAvg,
        marketPrice: fillPrice,
        side: "LONG",
      });
    } else {
      this.cash += fillPrice * quantity * 100;
      const current = this.positions.get(order.symbol) ?? {
        symbol: order.symbol,
        quantity: 0,
        averageCost: 0,
        marketPrice: fillPrice,
        side: "SHORT",
        pnl: 0,
      };

      const newQty = current.quantity - quantity;
      this.positions.set(order.symbol, {
        ...current,
        quantity: newQty,
        averageCost: current.averageCost || fillPrice,
        marketPrice: fillPrice,
        side: newQty >= 0 ? "LONG" : "SHORT",
      });
    }

    return orderRecord;
  }

  public getPortfolioSummary(): PortfolioSummary {
    const positions = Array.from(this.positions.values()).map((position) => ({
      ...position,
      pnl: (position.marketPrice - position.averageCost) * position.quantity * 100,
    }));

    const netLiquidationValue = this.cash + positions.reduce((sum, position) => {
      const mark = position.marketPrice * position.quantity * 100;
      return sum + mark;
    }, 0);

    return {
      cash: this.cash,
      buyingPower: this.cash * 0.5,
      netLiquidationValue,
      positions,
      openOrders: this.orders.filter((order) => order.status === "filled"),
    };
  }
}

export function simulateStrategyProfit(
  strategyType: string,
  underlyingPrice: number,
  premium = 2.5,
  strike = 220
) {
  const base = underlyingPrice * 0.02;
  const bullishBias = underlyingPrice > strike ? 1 : -1;

  return {
    strategyType,
    underlyingPrice,
    premium,
    projectedPnl: (base * (bullishBias > 0 ? 1.5 : 1.2)) - premium * 100,
    risk: Math.max(100, premium * 100),
  };
}
