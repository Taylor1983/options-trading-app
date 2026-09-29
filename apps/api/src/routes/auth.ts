import { Router } from "express";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

export const authRouter = Router();

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretjwtkey", {
    expiresIn: "7d",
  });
}

authRouter.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const rows = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, first_name, last_name`,
    [email, password, firstName || "", lastName || ""]
  );

  const user = rows[0];
  return res.status(201).json({ user, token: signToken(user) });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

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

  const safeUser = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  };

  return res.json({ user: safeUser, token: signToken(safeUser) });
});
