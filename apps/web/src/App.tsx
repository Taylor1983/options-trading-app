import { useEffect, useMemo, useState } from "react";

const watchlist = [
  { symbol: "AAPL", last: 214.32, change: 2.54, percent: 1.2 },
  { symbol: "MSFT", last: 428.91, change: -1.72, percent: -0.4 },
  { symbol: "NVDA", last: 122.12, change: 4.98, percent: 4.2 },
  { symbol: "SPY", last: 551.18, change: 1.18, percent: 0.22 },
  { symbol: "QQQ", last: 470.61, change: 2.31, percent: 0.49 },
  { symbol: "AMD", last: 163.45, change: -0.94, percent: -0.57 },
  { symbol: "META", last: 512.36, change: 3.28, percent: 0.64 },
];

const positions = [
  { symbol: "AAPL", quantity: 30, side: "Long", price: 212.8, pnl: 480.0 },
  { symbol: "NVDA", quantity: 20, side: "Long", price: 118.2, pnl: 780.0 },
  { symbol: "SPY", quantity: 15, side: "Short", price: 556.4, pnl: -72.0 },
  { symbol: "MSFT", quantity: 10, side: "Long", price: 432.0, pnl: -34.0 },
];

const optionRows = [
  { strike: 200, callBid: 15.2, callAsk: 15.85, callDelta: 0.64, putBid: 1.6, putAsk: 1.95, putDelta: -0.36, iv: 28.1 },
  { strike: 205, callBid: 12.4, callAsk: 12.9, callDelta: 0.61, putBid: 2.2, putAsk: 2.5, putDelta: -0.39, iv: 27.8 },
  { strike: 210, callBid: 9.8, callAsk: 10.2, callDelta: 0.57, putBid: 3.1, putAsk: 3.4, putDelta: -0.43, iv: 27.4 },
  { strike: 215, callBid: 7.15, callAsk: 7.5, callDelta: 0.51, putBid: 4.7, putAsk: 5.1, putDelta: -0.49, iv: 26.9 },
  { strike: 220, callBid: 4.95, callAsk: 5.28, callDelta: 0.46, putBid: 6.9, putAsk: 7.3, putDelta: -0.54, iv: 26.3 },
  { strike: 225, callBid: 3.12, callAsk: 3.5, callDelta: 0.41, putBid: 9.3, putAsk: 9.8, putDelta: -0.59, iv: 25.9 },
  { strike: 230, callBid: 1.9, callAsk: 2.18, callDelta: 0.36, putBid: 12.5, putAsk: 12.9, putDelta: -0.64, iv: 25.7 },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Options Pro</div>
      <nav className="nav">
        <button className="nav-item active">Dashboard</button>
        <button className="nav-item">Analyze</button>
        <button className="nav-item">Trade</button>
        <button className="nav-item">Portfolio</button>
        <button className="nav-item">Alerts</button>
      </nav>

      <div className="watchlist">
        <div className="section-title">Watchlist</div>
        {watchlist.map((item) => (
          <div key={item.symbol} className="watch-item">
            <div><strong>{item.symbol}</strong></div>
            <div className="watch-metrics">
              <span>{item.last}</span>
              <span className={item.change >= 0 ? "positive" : "negative"}>
                {item.change >= 0 ? "+" : ""}{item.change} ({item.percent}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="market-search">
        <span className="symbol">AAPL</span>
        <input placeholder="Search symbol or strategy" />
      </div>
      <div className="account-summary">
        <div>
          <label>Buying Power</label>
          <strong>$245,800</strong>
        </div>
        <div>
          <label>Net Liquidating</label>
          <strong>$1,284,920</strong>
        </div>
        <div>
          <label>P&amp;L</label>
          <strong className="positive">+$13,420</strong>
        </div>
      </div>
    </header>
  );
}

function PriceChart() {
  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <span className="ticker">AAPL</span>
          <strong>$220.12</strong>
        </div>
        <span className="badge positive">+2.34%</span>
      </div>
      <div className="chart-box">
        <svg viewBox="0 0 700 260" className="svg-chart" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#5eead4" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <path d="M0,180 C70,170 120,120 170,140 S250,70 310,110 S390,100 420,90 S530,40 700,80 L700,260 L0,260 Z" fill="url(#lineFill)" />
          <path d="M0,180 C70,170 120,120 170,140 S250,70 310,110 S390,100 420,90 S530,40 700,80" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}

function OptionChain() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Option Chain</h3>
        <div className="pill-group">
          <span className="pill active">Calls</span>
          <span className="pill">Puts</span>
          <span className="pill">Greeks</span>
        </div>
      </div>

      <div className="option-table">
        <div className="option-header">
          <span>Strike</span>
          <span>Bid</span>
          <span>Ask</span>
          <span>Delta</span>
          <span>IV</span>
        </div>

        {optionRows.map((row) => (
          <div key={row.strike} className="option-row">
            <span>{row.strike}</span>
            <span className="positive">{row.callBid}</span>
            <span>{row.callAsk}</span>
            <span>{row.callDelta.toFixed(2)}</span>
            <span>{row.iv.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrderTicket() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Order Ticket</h3>
      </div>

      <div className="order-form">
        <div className="row">
          <button className="trade-btn buy">Buy</button>
          <button className="trade-btn sell">Sell</button>
        </div>

        <label>
          Symbol
          <input defaultValue="AAPL 220C" />
        </label>

        <label>
          Quantity
          <input defaultValue="5" />
        </label>

        <label>
          Order Type
          <select defaultValue="Limit">
            <option>Limit</option>
            <option>Market</option>
            <option>Stop</option>
            <option>OCO</option>
          </select>
        </label>

        <label>
          Limit Price
          <input defaultValue="4.25" />
        </label>

        <div className="risk-box">
          <span>Max Risk</span>
          <strong>$2,125</strong>
        </div>

        <button className="submit-order">Review Order</button>
      </div>
    </section>
  );
}

function PortfolioSummary() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Portfolio</h3>
      </div>

      <div className="portfolio-list">
        {positions.map((position) => (
          <div key={position.symbol} className="portfolio-row">
            <div>
              <strong>{position.symbol}</strong>
              <span>{position.side}</span>
            </div>
            <div>
              <span>{position.quantity} qty</span>
              <strong className={position.pnl >= 0 ? "positive" : "negative"}>
                {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StrategyBuilder() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("long-call");
  const [metrics, setMetrics] = useState<any>(null);
  const [tradeResult, setTradeResult] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/strategies/AAPL")
      .then((res) => res.json())
      .then((data) => setStrategies(data.strategies || []))
      .catch(() => {
        setStrategies([
          { id: "long-call", name: "Long Call", type: "long-call" },
          { id: "bull-call-spread", name: "Bull Call Spread", type: "bull-call-spread" },
          { id: "long-straddle", name: "Long Straddle", type: "long-straddle" },
          { id: "iron-condor", name: "Iron Condor", type: "iron-condor" },
        ]);
      });
  }, []);

  useEffect(() => {
    const chosen = strategies.find((s) => s.type === selectedStrategy) || strategies[0];
    if (!chosen) return;

    fetch("http://localhost:4000/api/strategies/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy: chosen }),
    })
      .then((res) => res.json())
      .then((data) => setMetrics(data.metrics))
      .catch(() => {
        setMetrics({ maxProfit: 1250, maxLoss: 425, breakEven: [214, 226], riskReward: 2.94 });
      });
  }, [selectedStrategy, strategies]);

  const handlePaperTrade = async () => {
    const payload = {
      symbol: "AAPL",
      side: "BUY",
      quantity: 1,
      orderType: "limit",
      limitPrice: 4.25,
      strategyType: selectedStrategy,
    };

    const res = await fetch("http://localhost:4000/api/strategies/paper-trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setTradeResult(data);
  };

  const selected = useMemo(
    () => strategies.find((s) => s.type === selectedStrategy) || strategies[0],
    [selectedStrategy, strategies]
  );

  return (
    <section className="panel strategy-panel">
      <div className="panel-header">
        <h3>Strategy Builder</h3>
      </div>

      <div className="strategy-grid">
        <div className="strategy-list">
          {strategies.map((strategy) => (
            <button
              key={strategy.type}
              className={selectedStrategy === strategy.type ? "strategy-card selected" : "strategy-card"}
              onClick={() => setSelectedStrategy(strategy.type)}
            >
              <strong>{strategy.name}</strong>
              <small>{strategy.type}</small>
            </button>
          ))}
        </div>

        <div className="metrics-box">
          {selected && <h4>{selected.name}</h4>}
          {metrics ? (
            <>
              <div className="metric-row">
                <span>Max Profit</span>
                <strong className="positive">${metrics.maxProfit}</strong>
              </div>
              <div className="metric-row">
                <span>Max Loss</span>
                <strong className="negative">${metrics.maxLoss}</strong>
              </div>
              <div className="metric-row">
                <span>Break-Even</span>
                <strong>{metrics.breakEven.join(" / ")}</strong>
              </div>
              <div className="metric-row">
                <span>Risk/Reward</span>
                <strong>{metrics.riskReward.toFixed(2)}x</strong>
              </div>
            </>
          ) : (
            <p>Loading metrics...</p>
          )}

          <button className="submit-order" onClick={handlePaperTrade}>Simulate Trade</button>

          {tradeResult && (
            <div className="trade-result">
              <h5>Paper Trade Result</h5>
              <p>Status: {tradeResult.order?.status}</p>
              <p>Cash after trade: ${tradeResult.summary?.cash}</p>
              <p>Projected P&amp;L: ${tradeResult.projection?.projectedPnl?.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [quote, setQuote] = useState<{ symbol: string; lastPrice: number; bid: number; ask: number } | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/quotes/AAPL")
      .then((res) => res.json())
      .then((data) => setQuote(data))
      .catch(() => setQuote({ symbol: "AAPL", lastPrice: 220.12, bid: 219.98, ask: 220.26 }));
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-panel">
        <TopBar />
        <div className="content-grid">
          <div className="left-column">
            <section className="panel info-panel">
              <div className="panel-header">
                <h3>Market Snapshot</h3>
              </div>
              <div className="market-grid">
                <div>
                  <span className="label">Last</span>
                  <strong>${quote?.lastPrice ?? 220.12}</strong>
                </div>
                <div>
                  <span className="label">Bid</span>
                  <strong>${quote?.bid ?? 219.98}</strong>
                </div>
                <div>
                  <span className="label">Ask</span>
                  <strong>${quote?.ask ?? 220.26}</strong>
                </div>
              </div>
            </section>
            <PriceChart />
            <StrategyBuilder />
            <PortfolioSummary />
          </div>
          <div className="right-column">
            <OptionChain />
            <OrderTicket />
          </div>
        </div>
      </main>
    </div>
  );
}
