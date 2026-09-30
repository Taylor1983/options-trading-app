import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query<T = any>(text: string, params?: any[]) {
  const result = await db.query<T>(text, params ?? []);
  return result.rows;
}

export async function initializeDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_type VARCHAR(50) DEFAULT 'paper',
      buying_power NUMERIC(18,2) DEFAULT 100000,
      net_liquidation_value NUMERIC(18,2) DEFAULT 100000,
      cash_balance NUMERIC(18,2) DEFAULT 100000,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS market_quotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      symbol VARCHAR(20) NOT NULL,
      last_price NUMERIC(12,4),
      bid NUMERIC(12,4),
      ask NUMERIC(12,4),
      volume BIGINT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(symbol, timestamp)
    );

    CREATE TABLE IF NOT EXISTS candles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      symbol VARCHAR(20) NOT NULL,
      time_period VARCHAR(10),
      open_price NUMERIC(12,4),
      high_price NUMERIC(12,4),
      low_price NUMERIC(12,4),
      close_price NUMERIC(12,4),
      volume BIGINT,
      timestamp TIMESTAMPTZ,
      UNIQUE(symbol, time_period, timestamp)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      symbol VARCHAR(20) NOT NULL,
      side VARCHAR(10) NOT NULL,
      quantity INTEGER NOT NULL,
      order_type VARCHAR(10) DEFAULT 'limit',
      limit_price NUMERIC(12,4),
      strategy_type VARCHAR(50),
      status VARCHAR(20) DEFAULT 'filled',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS positions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      symbol VARCHAR(20) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      average_cost NUMERIC(12,4) DEFAULT 0,
      side VARCHAR(10) DEFAULT 'LONG',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, symbol)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_market_quotes_symbol_ts ON market_quotes(symbol, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_candles_symbol_ts ON candles(symbol, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_positions_user_symbol ON positions(user_id, symbol);
  `;

  try {
    await db.query(schema);
    console.log("Database initialized");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}
