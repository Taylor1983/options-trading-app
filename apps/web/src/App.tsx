import { useEffect, useMemo, useState } from "react";

const defaultChain = [
  { strike: 205, callBid: 12.4, callAsk: 12.9, callDelta: 0.61, putBid: 2.2, putAsk: 2.5, putDelta: -0.39, iv: 27.8 },
  { strike: 210, callBid: 9.8, callAsk: 10.2, callDelta: 0.57, putBid: 3.1, putAsk: 3.4, putDelta: -0.43, iv: 27.4 },
  { strike: 215, callBid: 7.15, callAsk: 7.5, callDelta: 0.51, putBid: 4.7, putAsk: 5.1, putDelta: -0.49, iv: 26.9 },
  { strike: 220, callBid: 4.95, callAsk: 5.28, callDelta: 0.46, putBid: 6.9, putAsk: 7.3, putDelta: -0.54, iv: 26.3 },
  { strike: 225, callBid: 3.12, callAsk: 3.5, callDelta: 0.41, putBid: 9.3, putAsk: 9.8, putDelta: -0.59, iv: 25.9 },
  { strike: 230, callBid: 1.9, callAsk: 2.18, callDelta: 0.36, putBid: 12.5, putAsk: 12.9, putDelta: -0.64, iv: 25.7 },
];

function normalizeChain(rows: any[]) {
  const byStrike = new Map<number, any>();

  for (const row of rows) {
    const strike = Number(row.strike || row.strike_price || 220);
    const bucket = byStrike.get(strike) || { strike, callBid: 0, callAsk: 0, callDelta: 0, putBid: 0, putAsk: 0, putDelta: 0, iv: 0 };

    const optionType = String(row.optionType || row.contract_type || row.type || "CALL").toUpperCase();

    if (optionType === "CALL") {
      bucket.callBid = Number(row.bid ?? row.last_quote?.bid ?? bucket.callBid);
      bucket.callAsk = Number(row.ask ?? row.last_quote?.ask ?? bucket.callAsk);
      bucket.callDelta = Number(row.delta ?? bucket.callDelta);
      bucket.iv = Number(row.iv ?? row.implied_volatility ?? bucket.iv);
    } else {
      bucket.putBid = Number(row.bid ?? row.last_quote?.bid ?? bucket.putBid);
      bucket.putAsk = Number(row.ask ?? row.last_quote?.ask ?? bucket.putAsk);
      bucket.putDelta = Number(row.delta ?? bucket.putDelta);
      bucket.iv = Number(row.iv ?? row.implied_volatility ?? bucket.iv);
    }

    byStrike.set(strike, bucket);
  }

  return Array.from(byStrike.values()).sort((a, b) => a.strike - b.strike);
}

function LoginForm({ onLogin }: { onLogin: (payload: any) => void }) {
  const [email, setEmail] = useState("demo@trader.app");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      onLogin(data);
    } catch (error) {
      console.error("Login error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Login to Trader</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button className="submit-order" onClick={handleSubmit} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
}

function GreekCard({ name, value }: { name: string; value: number }) {
  return (
    <div className="greek-card">
      <span>{name}</span>
      <strong>{value.toFixed(2)}</strong>
    </div>
  );
}

type OptionSide = "CALL" | "PUT";
type StrategyType = "long-call" | "long-put" | "bull-call-spread" | "iron-condor" | "long-straddle";

function OptionChainPanel({
  optionChain,
  onSelectStrike,
}: {
  optionChain: any[];
  onSelectStrike: (strike: number, side: OptionSide, price: number) => void;
}) {
  const [selectedTab, setSelectedTab] = useState<"calls" | "puts" | "both">("both");
  const rows = optionChain.length ? normalizeChain(optionChain) : defaultChain;

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Option Chain - AAPL Oct 17</h3>
        <div className="pill-group">
          <button className={`pill ${selectedTab === "calls" ? "active" : ""}`} onClick={() => setSelectedTab("calls")}>Calls</button>
          <button className={`pill ${selectedTab === "puts" ? "active" : ""}`} onClick={() => setSelectedTab("puts")}>Puts</button>
          <button className={`pill ${selectedTab === "both" ? "active" : ""}`} onClick={() => setSelectedTab("both")}>Both</button>
        </div>
      </div>

      <div className="option-table">
        <div className="option-header">
          <span>Strike</span>
          {(selectedTab === "calls" || selectedTab === "both") && <><span>Call Bid</span><span>Call Ask</span><span>Delta</span></>}
          {(selectedTab === "puts" || selectedTab === "both") && <><span>Put Bid</span><span>Put Ask</span><span>Delta</span></>}
          <span>IV</span>
        </div>

        {rows.map((row) => (
          <div key={row.strike} className="option-row">
            <span className="strike-cell">{row.strike}</span>

            {(selectedTab === "calls" || selectedTab === "both") && (
              <>
                <button className="price-btn positive" onClick={() => onSelectStrike(row.strike, "CALL", row.callBid)}>{row.callBid}</button>
                <button className="price-btn" onClick={() => onSelectStrike(row.strike, "CALL", row.callAsk)}>{row.callAsk}</button>
                <span>{row.callDelta.toFixed(2)}</span>
              </>
            )}

            {(selectedTab === "puts" || selectedTab === "both") && (
              <>
                <button className="price-btn positive" onClick={() => onSelectStrike(row.strike, "PUT", row.putBid)}>{row.putBid}</button>
                <button className="price-btn" onClick={() => onSelectStrike(row.strike, "PUT", row.putAsk)}>{row.putAsk}</button>
                <span>{row.putDelta.toFixed(2)}</span>
              </>
            )}

            <span>{Number(row.iv || 0).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const strategies: { id: StrategyType; name: string; description: string }[] = [
  { id: "long-call", name: "Long Call", description: "Bullish: buy a call and profit if the stock rises." },
  { id: "long-put", name: "Long Put", description: "Bearish: buy a put and profit if the stock falls." },
  { id: "bull-call-spread", name: "Bull Call Spread", description: "Moderate bullish with capped risk and reward." },
  { id: "iron-condor", name: "Iron Condor", description: "Neutral strategy using short call and put spreads." },
  { id: "long-straddle", name: "Long Straddle", description: "Volatility play: buy both call and put at the same strike." },
];

function StrategyBuilderPanel({
  selectedStrike,
  selectedSide,
  selectedPrice,
  onStrategySelect,
}: {
  selectedStrike: number | null;
  selectedSide: OptionSide | null;
  selectedPrice: number | null;
  onStrategySelect: (strategy: StrategyType) => void;
}) {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>("long-call");

  const handleStrategyClick = (strategy: StrategyType) => {
    setSelectedStrategy(strategy);
    onStrategySelect(strategy);
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Strategy Builder</h3>
      </div>

      <div className="strategy-list">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            className={`strategy-item ${selectedStrategy === strategy.id ? "active" : ""}`}
            onClick={() => handleStrategyClick(strategy.id)}
          >
            <div className="strategy-name">{strategy.name}</div>
            <div className="strategy-desc">{strategy.description}</div>
          </button>
        ))}
      </div>

      {selectedStrike && selectedSide && selectedPrice && (
        <div className="selected-leg">
          <h4>Selected Leg</h4>
          <div className="leg-info">
            <span>{selectedSide} {selectedStrike}</span>
            <strong>${selectedPrice}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

function OrderTicketPanel({
  selectedStrike,
  selectedSide,
  selectedPrice,
  selectedStrategy,
}: {
  selectedStrike: number | null;
  selectedSide: OptionSide | null;
  selectedPrice: number | null;
  selectedStrategy: StrategyType | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [limitPrice, setLimitPrice] = useState(selectedPrice?.toString() || "");

  const totalRisk = useMemo(() => {
    if (!selectedPrice || !quantity) return 0;
    return selectedPrice * 100 * quantity;
  }, [selectedPrice, quantity]);

  const handlePlaceOrder = async () => {
    if (!selectedStrike || !selectedSide || !selectedPrice) {
      alert("Select a strike first.");
      return;
    }

    const token = localStorage.getItem("trader_token");
    const payload = {
      symbol: "AAPL",
      side: "BUY",
      quantity,
      orderType,
      limitPrice: Number(limitPrice || selectedPrice),
      strategyType: selectedStrategy,
    };

    try {
      const res = await fetch("http://localhost:4000/api/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(`Order ${data.status}: ${selectedSide} AAPL ${selectedStrike} x ${quantity}`);
    } catch (error) {
      alert("Order failed");
    }
  };

  return (
    <section className="panel">
      <div className="panel-header"><h3>Order Ticket</h3></div>
      <div className="order-form">
        {selectedStrike && selectedSide && selectedPrice ? (
          <>
            <div className="symbol-display">
              <strong>{selectedSide} AAPL {selectedStrike}</strong>
              <span>${selectedPrice}</span>
            </div>

            <label>
              Quantity
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} min={1} />
            </label>

            <label>
              Order Type
              <select value={orderType} onChange={(e) => setOrderType(e.target.value as "market" | "limit")}>
                <option value="limit">Limit</option>
                <option value="market">Market</option>
              </select>
            </label>

            {orderType === "limit" && (
              <label>
                Limit Price
                <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} step="0.05" />
              </label>
            )}

            <div className="risk-summary">
              <div className="risk-row">
                <span>Max Risk</span>
                <strong className="negative">${totalRisk.toFixed(2)}</strong>
              </div>
              <div className="risk-row">
                <span>Buying Power</span>
                <strong>$245,800</strong>
              </div>
            </div>

            <button className="submit-order" onClick={handlePlaceOrder}>Place Paper Trade</button>
          </>
        ) : (
          <p className="placeholder">Select an option from the chain to begin.</p>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("trader_token"));
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState<any>(null);
  const [chart, setChart] = useState<any[]>([]);
  const [greeks, setGreeks] = useState<any>(null);
  const [optionChain, setOptionChain] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [selectedSide, setSelectedSide] = useState<OptionSide | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType | null>("long-call");
  const [wsStatus, setWsStatus] = useState("connecting");

  const marketSummary = useMemo(() => {
    if (!quote) return { last: 220.12, bid: 219.98, ask: 220.26 };
    return { last: quote.lastPrice, bid: quote.bid, ask: quote.ask };
  }, [quote]);

  const fetchMarket = async (symbolToUse = symbol) => {
    try {
      const quoteRes = await fetch(`http://localhost:4000/api/market/quote/${symbolToUse}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const quoteData = await quoteRes.json();
      setQuote(quoteData);

      const chartRes = await fetch(`http://localhost:4000/api/market/candles/${symbolToUse}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const chartData = await chartRes.json();
      setChart(chartData.candles || []);

      const greekRes = await fetch("http://localhost:4000/api/greeks/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          stockPrice: quoteData.lastPrice,
          strike: 220,
          expiryDays: 18,
          volatility: 28,
          rate: 0.05,
          optionType: "CALL",
        }),
      });
      const greekData = await greekRes.json();
      setGreeks(greekData.greeks);
    } catch (error) {
      console.error("Failed to load market data", error);
    }
  };

  const fetchOptionChain = async (symbolToUse = symbol) => {
    try {
      const res = await fetch(`http://localhost:4000/api/options/chain/${symbolToUse}`);
      const data = await res.json();
      setOptionChain(data.chain || []);
    } catch (error) {
      console.error("Failed to load option chain", error);
    }
  };

  const fetchPortfolio = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:4000/api/portfolio/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPortfolio(data);
    } catch (error) {
      console.error("Failed to load portfolio", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMarket();
      fetchOptionChain();
      fetchPortfolio();
    }
  }, [token, symbol]);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket("ws://localhost:4000/ws");

    socket.onopen = () => setWsStatus("live");
    socket.onclose = () => setWsStatus("offline");

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "market-snapshot") {
        const target = msg.data.find((item: any) => item.symbol === symbol.toUpperCase());
        if (target) {
          setQuote({
            symbol: target.symbol,
            lastPrice: target.lastPrice,
            bid: target.bid,
            ask: target.ask,
            volume: target.volume,
            timestamp: target.timestamp,
          });
        }
      }

      if (msg.type === "market-update") {
        const payload = msg.data;
        if (payload.symbol === symbol.toUpperCase()) {
          setQuote({
            symbol: payload.symbol,
            lastPrice: payload.lastPrice,
            bid: payload.bid,
            ask: payload.ask,
            volume: payload.volume,
            timestamp: payload.timestamp,
          });
        }
      }
    };

    return () => socket.close();
  }, [token, symbol]);

  const handleLogin = (payload: any) => {
    if (payload.token) {
      localStorage.setItem("trader_token", payload.token);
      setToken(payload.token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("trader_token");
    setToken(null);
  };

  const handleSelectStrike = (strike: number, side: OptionSide, price: number) => {
    setSelectedStrike(strike);
    setSelectedSide(side);
    setSelectedPrice(price);
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell dark">
      <div className="dashboard-header">
        <div className="header-left">
          <span className="symbol-chip">{symbol}</span>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
        </div>

        <div className="toolbar-actions">
          <span className={`ws-status ${wsStatus}`}>{wsStatus.toUpperCase()}</span>
          <button className="secondary-btn" onClick={() => fetchMarket()}>Refresh</button>
          <button className="secondary-btn danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="market-grid">
        <div className="stat-box"><span>Last</span><strong>${marketSummary.last}</strong></div>
        <div className="stat-box"><span>Bid</span><strong>${marketSummary.bid}</strong></div>
        <div className="stat-box"><span>Ask</span><strong>${marketSummary.ask}</strong></div>
      </div>

      <div className="chart-panel">
        <h3>Live Chart</h3>
        <div className="chart-surface">
          {chart.map((point, index) => (
            <div
              key={`${point.timestamp}-${index}`}
              className="candlestick"
              style={{
                height: `${Math.max((point.high - point.low) * 12, 8)}px`,
                left: `${(index / Math.max(chart.length, 1)) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {greeks && (
        <div className="greeks-grid">
          <GreekCard name="Delta" value={greeks.delta} />
          <GreekCard name="Gamma" value={greeks.gamma} />
          <GreekCard name="Theta" value={greeks.theta} />
          <GreekCard name="Vega" value={greeks.vega} />
          <GreekCard name="Rho" value={greeks.rho} />
          <GreekCard name="IV" value={greeks.iv} />
        </div>
      )}

      {portfolio && (
        <div className="portfolio-summary">
          <div className="stat-box"><span>Account Value</span><strong>${portfolio.accountValue}</strong></div>
          <div className="stat-box"><span>Buying Power</span><strong>${portfolio.buyingPower}</strong></div>
          <div className="stat-box"><span>P&L</span><strong>${portfolio.pnl}</strong></div>
        </div>
      )}

      <div className="trading-grid">
        <OptionChainPanel optionChain={optionChain} onSelectStrike={handleSelectStrike} />

        <div className="right-column">
          <StrategyBuilderPanel
            selectedStrike={selectedStrike}
            selectedSide={selectedSide}
            selectedPrice={selectedPrice}
            onStrategySelect={setSelectedStrategy}
          />
          <OrderTicketPanel
            selectedStrike={selectedStrike}
            selectedSide={selectedSide}
            selectedPrice={selectedPrice}
            selectedStrategy={selectedStrategy}
          />
        </div>
      </div>
    </div>
  );
}
