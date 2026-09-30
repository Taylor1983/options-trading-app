import { Router } from "express";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

export const authRouter = Router();

function signToken(user: { id: string; email: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "supersecretjwtkey",
    { expiresIn: "7d" }
  );
}

authRouter.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingUser = await query(`SELECT id FROM users WHERE email = $1`, [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const rows = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email, password, firstName || "", lastName || ""]
    );

    const user = rows[0];

    const accountRows = await query(
      `INSERT INTO accounts (user_id, account_type, buying_power, net_liquidation_value, cash_balance)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [user.id, "paper", 100000, 100000, 100000]
    );

    return res.status(201).json({
      user,
      account: accountRows[0],
      token: signToken(user),
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
    const rows = await query(
      `SELECT id, email, first_name, last_name, password_hash FROM users WHERE email = $1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accountRows = await query(
      `SELECT id, buying_power, net_liquidation_value, cash_balance FROM accounts WHERE user_id = $1`,
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
