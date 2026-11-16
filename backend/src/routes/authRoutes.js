import express from "express";
import bcrypt from "bcryptjs";
import { query, executeTransaction } from "../config/db.js";
import { generateToken, verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const users = await query("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (!users.length) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ error: `Account is ${user.status}. Please contact store administration.` });
    }

    let customer = null;
    if (user.role === "customer") {
      const customers = await query(
        "SELECT c.*, p.name as plan_name, p.max_total_items FROM customers c LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id WHERE c.user_id = ? OR c.email = ?",
        [user.id, user.email]
      );
      customer = customers[0] || null;
    }

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status
      },
      customer
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// POST /api/auth/register (Customer Registration)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, city, subscription_plan_id } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existing = await query("SELECT id FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (existing.length) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const planId = Number(subscription_plan_id) || 1;
    const plans = await query("SELECT * FROM membership_plans WHERE id = ?", [planId]);
    const maxItems = plans.length ? plans[0].max_total_items : 2;

    const result = await executeTransaction(async (conn) => {
      // 1. Insert user
      const [uRes] = await conn.query(
        "INSERT INTO users (name, email, password, role, phone, status) VALUES (?, ?, ?, 'customer', ?, 'Active')",
        [name, email.toLowerCase().trim(), hashedPassword, phone || ""]
      );
      const userId = uRes.insertId;

      // 2. Generate member code
      const [countRows] = await conn.query("SELECT COUNT(*) as c FROM customers");
      const memberCode = `M10${(countRows[0].c || 0) + 1}`;

      // 3. Insert customer profile
      const today = new Date().toISOString().slice(0, 10);
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const expDate = nextYear.toISOString().slice(0, 10);

      const [cRes] = await conn.query(
        `INSERT INTO customers (user_id, member_code, full_name, email, phone, address, city, subscription_plan_id, join_date, expiration_date, status, max_items_allowed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
        [userId, memberCode, name, email.toLowerCase().trim(), phone || "", address || "", city || "Bengaluru", planId, today, expDate, maxItems]
      );

      return { userId, customerId: cRes.insertId, memberCode };
    });

    const users = await query("SELECT id, name, email, role, phone, status FROM users WHERE id = ?", [result.userId]);
    const user = users[0];
    const token = generateToken(user);
    const customers = await query("SELECT * FROM customers WHERE id = ?", [result.customerId]);

    res.status(201).json({
      message: "Customer account registered successfully.",
      token,
      user,
      customer: customers[0]
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, async (req, res) => {
  res.json({
    user: req.user,
    customer: req.customer || null
  });
});

// GET /api/auth/switch-demo/:roleOrEmail (Fast Role Switcher for instant UI testing)
router.get("/switch-demo/:identifier", async (req, res) => {
  try {
    const ident = req.params.identifier.toLowerCase();
    let user = null;

    if (ident === "admin") {
      const rows = await query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
      user = rows[0];
    } else if (ident === "staff") {
      const rows = await query("SELECT * FROM users WHERE role = 'staff' LIMIT 1");
      user = rows[0];
    } else if (ident === "customer") {
      const rows = await query("SELECT * FROM users WHERE role = 'customer' AND status = 'Active' LIMIT 1");
      user = rows[0];
    } else {
      const rows = await query("SELECT * FROM users WHERE email = ? OR id = ?", [ident, Number(ident) || 0]);
      user = rows[0];
    }

    if (!user) {
      return res.status(404).json({ error: `Demo user for '${req.params.identifier}' not found.` });
    }

    let customer = null;
    if (user.role === "customer") {
      const customers = await query(
        "SELECT c.*, p.name as plan_name, p.max_total_items FROM customers c LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id WHERE c.user_id = ? OR c.email = ?",
        [user.id, user.email]
      );
      customer = customers[0] || null;
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status
      },
      customer
    });
  } catch (err) {
    console.error("Switch demo error:", err);
    res.status(500).json({ error: "Error switching demo user." });
  }
});

export default router;
