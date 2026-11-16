import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { query } from "../config/db.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "rsr_rental_super_secure_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Authentication token required." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await query("SELECT id, name, email, role, phone, status FROM users WHERE id = ? AND status = 'Active'", [decoded.id]);
    if (!users.length) {
      return res.status(401).json({ error: "User session invalid or account inactive." });
    }
    req.user = users[0];

    // If customer, attach customer record
    if (req.user.role === "customer") {
      const customers = await query("SELECT * FROM customers WHERE user_id = ? OR email = ?", [req.user.id, req.user.email]);
      req.customer = customers[0] || null;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(", ")}] roles.` });
    }
    next();
  };
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const users = await query("SELECT id, name, email, role, status FROM users WHERE id = ?", [decoded.id]);
      if (users.length) {
        req.user = users[0];
        if (req.user.role === "customer") {
          const customers = await query("SELECT * FROM customers WHERE user_id = ? OR email = ?", [req.user.id, req.user.email]);
          req.customer = customers[0] || null;
        }
      }
    } catch {
      // Ignore token error for optional auth
    }
  }
  next();
}
