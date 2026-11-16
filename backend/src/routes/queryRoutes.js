import express from "express";
import { query, initDatabase } from "../config/db.js";

const router = express.Router();

// GET /api/query/relational (Live 3-way SQL Relational JOIN Explorer)
router.get("/relational", async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        r.id,
        r.rental_code,
        r.rental_code as rental_id,
        c.member_code,
        c.member_code as member_id,
        c.full_name,
        c.status as member_status,
        COALESCE(p.name, 'Custom') as subscription_plan,
        i.item_code,
        i.item_code as item_id,
        i.title as item_title,
        i.title as item,
        i.type as item_type,
        i.type,
        i.category_name as category,
        i.rental_status as current_item_status,
        DATE_FORMAT(r.rent_date, '%Y-%m-%d') as rent_date,
        DATE_FORMAT(r.due_date, '%Y-%m-%d') as due_date,
        IFNULL(DATE_FORMAT(r.return_date, '%Y-%m-%d'), 'NULL') as return_date,
        r.status as rental_status,
        r.delivery_status,
        r.monthly_fee,
        r.late_fee_charged,
        r.condition_on_issue,
        r.condition_on_return
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id
      JOIN inventory_items i ON r.item_id = i.id
      ORDER BY r.id DESC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("Relational query error:", err);
    res.status(500).json({ error: "Failed to run relational JOIN query." });
  }
});

export default router;
