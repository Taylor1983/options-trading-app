import { Router } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: any, next: any) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey");
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid auth token" });
  }
};
