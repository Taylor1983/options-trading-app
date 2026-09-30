import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "../db.js";

export const authRouter = Router();

function signToken(user: { id: string; email: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "supersecretjwtkey",
    { expiresIn: "7d" }
  );
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

authRouter.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await query(`SELECT id FROM users WHERE email = $1`, [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await hashPassword(password);

    const userRows = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email, passwordHash, firstName || "", lastName || ""]
    );

    const user = userRows[0];

    const accountRows = await query(
      `INSERT INTO accounts (user_id, account_type, buying_power, net_liquidation_value, cash_balance)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, account_type, buying_power, net_liquidation_value, cash_balance`,
      [user.id, "paper", 100000, 100000, 100000]
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    return res.status(201).json({
      user: safeUser,
      account: accountRows[0],
      token: signToken(safeUser),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userRows = await query(
      `SELECT id, email, first_name, last_name, password_hash FROM users WHERE email = $1`,
      [email]
    );

    if (!userRows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userRows[0];
    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accountRows = await query(
      `SELECT id, account_type, buying_power, net_liquidation_value, cash_balance FROM accounts WHERE user_id = $1`,
      [user.id]
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    return res.json({
      user: safeUser,
      account: accountRows[0] || null,
      token: signToken(safeUser),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

authRouter.post("/verify", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey");
    return res.json({ valid: true, user: payload });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});
