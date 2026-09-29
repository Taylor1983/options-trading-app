import { useMemo, useState } from "react";

function LoginForm({ onLogin }: { onLogin: (payload: any) => void }) {
  const [email, setEmail] = useState("demo@trader.app");
  const [password, setPassword] = useState("password123");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    onLogin(data);
  };

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button className="submit-order" onClick={handleSubmit}>Sign In</button>
    </div>
  );
}

function GreekCard({ name, value }: { name: string; value: number }) {
  return (
    <div className="greek-card">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState<any>(null);
  const [chart, setChart] = useState<any[]>([]);
  const [greeks, setGreeks] = useState<any>(null);

  const marketSummary = useMemo(() => {
    if (!quote) return { last: 220.12, bid: 219.98, ask: 220.26 };
    return { last: quote.lastPrice, bid: quote.bid, ask: quote.ask };
  }, [quote]);

  const fetchMarket = async (symbolToUse = symbol) => {
    const quoteRes = await fetch(`http://localhost:4000/api/quotes/${symbolToUse}`);
    const quoteData = await quoteRes.json();
    setQuote(quoteData);

    const chartRes = await fetch(`http://localhost:4000/api/market/${symbolToUse}`);
    const chartData = await chartRes.json();
    setChart(chartData.candles || []);

    const greekRes = await fetch("http://localhost:4000/api/greeks/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  };

  const handleLogin = async (payload: any) => {
    if (payload.token) {
      setToken(payload.token);
      await fetchMarket();
    }
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell dark">
      <div className="dashboard-header">
        <div>
          <span className="symbol-chip">{symbol}</span>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
        </div>
        <button className="submit-order" onClick={() => fetchMarket()}>Refresh</button>
      </div>

      <div className="market-grid">
        <div className="stat-box">
          <span>Last</span>
          <strong>${marketSummary.last}</strong>
        </div>
        <div className="stat-box">
          <span>Bid</span>
          <strong>${marketSummary.bid}</strong>
        </div>
        <div className="stat-box">
          <span>Ask</span>
          <strong>${marketSummary.ask}</strong>
        </div>
      </div>

      <div className="chart-panel">
        <h3>Live Chart</h3>
        <div className="chart-surface">
          {chart.map((point, index) => (
            <div key={`${point.timestamp}-${index}`} className="candlestick" style={{ height: `${Math.max((point.high - point.low) * 10, 8)}px`, left: `${(index / chart.length) * 100}%` }} />
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
    </div>
  );
}
