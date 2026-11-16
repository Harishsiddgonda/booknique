import React from "react";
import { Database, Code2, ArrowRight } from "lucide-react";
import { formatINR } from "../utils/api";

export default function SqlRelationalView({ relationalData = [], sqlPreset, setSqlPreset }) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900">
          Live Relational SQL JOIN Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Execute real-time relational SQL queries against MySQL database combining `rentals`, `customers`, `membership_plans`, and `inventory_items`.
        </p>
      </div>

      {/* SQL Code Block */}
      <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-[11px]">MySQL Relational Engine: rsr_rental_db</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            CONNECTED (3306)
          </span>
        </div>

        <pre className="text-amber-300 overflow-x-auto text-[11px] leading-relaxed">
{`SELECT 
  r.rental_code, r.customer_name, r.member_code, p.name as plan_name,
  r.item_title, r.item_code, i.type, i.category_name,
  r.rent_date, r.due_date, r.return_date, r.status,
  r.monthly_fee, r.late_fee_charged, r.condition_on_return
FROM rentals r
JOIN customers c ON r.customer_id = c.id
LEFT JOIN membership_plans p ON c.subscription_plan_id = p.id
JOIN inventory_items i ON r.item_id = i.id
ORDER BY r.id DESC;`}
        </pre>
      </div>

      {/* Real Execution Results */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Relational Result Set ({relationalData.length} records returned)
          </h3>
          <span className="text-xs text-slate-400">All currency fields in Indian Rupees (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Rental Code</th>
                <th className="py-3 px-3">Customer (JOIN customers)</th>
                <th className="py-3 px-3">Plan (JOIN plans)</th>
                <th className="py-3 px-3">Item (JOIN inventory_items)</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Fee (₹)</th>
                <th className="py-3 px-3 text-right">Late Fee (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {relationalData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.rental_code}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                    {row.customer_name} ({row.member_code})
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">{row.plan_name || "Basic"}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-semibold text-slate-900">{row.item_title}</span>{" "}
                    <span className="text-slate-400 text-[10px]">({row.item_code})</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{row.item_type || row.type}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.due_date}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === "Returned"
                          ? "bg-emerald-100 text-emerald-800"
                          : row.status === "Overdue"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    {formatINR(row.monthly_fee)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                    {Number(row.late_fee_charged || 0) > 0 ? formatINR(row.late_fee_charged) : "₹0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
