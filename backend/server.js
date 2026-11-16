import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import db, { initDatabase, query, getDatabaseDriver } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import rentalRoutes from "./src/routes/rentalRoutes.js";
import planRoutes from "./src/routes/planRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import supplierRoutes from "./src/routes/supplierRoutes.js";
import procurementRoutes from "./src/routes/procurementRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import queryRoutes from "./src/routes/queryRoutes.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import toyRoutes from "./src/routes/toyRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import returnRoutes from "./src/routes/returnRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const host = "0.0.0.0";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "frontend", "dist");

// Dynamic Production & Development CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://10.0.2.2:5000",
  "capacitor://localhost",
  "https://localhost",
  "http://localhost"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}
if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(",").forEach(o => allowedOrigins.push(o.trim()));
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server) or listed origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow for smooth cross-origin mobile app interaction
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());

// API Health Check
app.get("/api/health", async (_, res) => {
  try {
    const driver = getDatabaseDriver();
    const rows = await query("SELECT 1 as connected");
    const isConn = rows && rows.length > 0;
    res.json({
      status: "ok",
      app: "BOOKNIQUE - Books & Toys Rental Management Platform",
      version: "1.0.0",
      database: isConn ? "connected" : "error",
      db_driver: driver,
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected", error: err.message });
  }
});

// Database Reset (Reload Default Dataset)
app.post("/api/reset", async (_, res) => {
  try {
    await query("SET FOREIGN_KEY_CHECKS = 0;");
    await query("TRUNCATE TABLE audit_logs;");
    await query("TRUNCATE TABLE notifications;");
    await query("TRUNCATE TABLE payments;");
    await query("TRUNCATE TABLE rentals;");
    await query("TRUNCATE TABLE procurement_items;");
    await query("TRUNCATE TABLE procurement_orders;");
    await query("TRUNCATE TABLE inventory_items;");
    await query("TRUNCATE TABLE customers;");
    await query("TRUNCATE TABLE membership_plans;");
    await query("TRUNCATE TABLE categories;");
    await query("TRUNCATE TABLE suppliers;");
    await query("TRUNCATE TABLE users;");
    await query("SET FOREIGN_KEY_CHECKS = 1;");

    // Re-initialize and seed
    await initDatabase();
    res.json({ success: true, message: "Database reset to production demo records successfully." });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ error: "Failed to reset database." });
  }
});

// Mount Modular API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/toys", toyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/members", customerRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/query", queryRoutes);

// Backwards-compatible generic collection endpoint
app.get("/api/:type", async (req, res, next) => {
  const type = req.params.type;
  if (["inventory", "customers", "plans", "rentals", "payments"].includes(type)) {
    try {
      if (type === "inventory") {
        const rows = await query("SELECT * FROM inventory_items ORDER BY id ASC");
        return res.json(rows.map(r => ({
          ...r,
          item_id: r.item_code,
          code: r.item_code,
          name: r.title,
          category: r.category_name,
          ageGroup: r.age_group,
          fee: Number(r.monthly_rental_fee),
          monthly_rental_fee: Number(r.monthly_rental_fee),
          status: r.rental_status,
          condition: r.condition_status,
          total: r.total_quantity,
          available: r.available_quantity
        })));
      }
      if (type === "customers") {
        const rows = await query(`
          SELECT c.*, p.name as plan_name 
          FROM customers c 
          LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id 
          ORDER BY c.id ASC
        `);
        return res.json(rows.map(r => ({
          ...r,
          member_id: r.member_code,
          code: r.member_code,
          name: r.full_name,
          plan: r.plan_name,
          subscription_plan: r.plan_name,
          joinDate: r.join_date,
          maxItems: r.max_items_allowed
        })));
      }
      if (type === "plans") {
        const rows = await query("SELECT * FROM membership_plans ORDER BY price ASC");
        return res.json(rows.map(r => ({
          ...r,
          price: Number(r.price),
          books: r.max_books,
          toys: r.max_toys,
          maxItems: r.max_total_items,
          desc: r.description
        })));
      }
      if (type === "rentals") {
        const rows = await query("SELECT * FROM rentals ORDER BY id DESC");
        return res.json(rows.map(r => ({
          ...r,
          rental_id: r.rental_code,
          code: r.rental_code,
          member_id: r.member_code,
          customer: r.customer_name,
          item_id: r.item_code,
          item: r.item_title,
          rent_date: r.rent_date ? r.rent_date.toISOString().slice(0, 10) : "",
          date: r.rent_date ? r.rent_date.toISOString().slice(0, 10) : "",
          due_date: r.due_date ? r.due_date.toISOString().slice(0, 10) : "",
          dueDate: r.due_date ? r.due_date.toISOString().slice(0, 10) : "",
          return_date: r.return_date ? r.return_date.toISOString().slice(0, 10) : null,
          returnDate: r.return_date ? r.return_date.toISOString().slice(0, 10) : null,
          late_fee_charged: Number(r.late_fee_charged || 0),
          lateFee: Number(r.late_fee_charged || 0),
          amount: Number(r.monthly_fee || 0),
          item_condition_on_return: r.condition_on_return || "Pending"
        })));
      }
      if (type === "payments") {
        const rows = await query("SELECT p.*, c.member_code FROM payments p LEFT JOIN customers c ON p.customer_id = c.id ORDER BY p.id DESC");
        return res.json(rows.map(r => ({
          ...r,
          memberId: r.member_code || "",
          amount: Number(r.amount),
          date: r.payment_date ? r.payment_date.toISOString().slice(0, 10) : "",
          customer: r.customer_name
        })));
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  next();
});

// Serve static frontend in production
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Global 404 Handler for API
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.baseUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error." });
});

// Start Server & Connect Database
let server = null;

async function startServer() {
  try {
    await initDatabase();
    server = app.listen(port, "0.0.0.0", () => {
      const driver = getDatabaseDriver();
      console.log(`====================================================`);
      console.log(`🚀 BOOKNIQUE - Books & Toys Rental Management Platform API`);
      console.log(`📡 URL: http://0.0.0.0:${port} (Port: ${port})`);
      console.log(`🗄️ Database Driver: ${driver.toUpperCase()} (${driver === "postgres" ? "Render / Cloud PostgreSQL" : "Local MySQL"})`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error("FATAL: Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", () => server && server.close());
process.on("SIGTERM", () => server && server.close());
