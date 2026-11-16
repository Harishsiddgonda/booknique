import React from "react";
import {
  Repeat2,
  Plus,
  Download,
  Search,
  Filter,
  RotateCcw,
  Receipt,
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { formatINR, exportToCSV } from "../utils/api";

export default function RentalsView({
  rentals = [],
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onOpenIssue,
  onProcessReturn,
  onViewReceipt,
  onUpdateDelivery
}) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900">
            Rental Transactions & Despatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time borrowing transactions, overdue fees (₹50/day), return condition inspections, and receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV("booknique_rentals", rentals)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenIssue}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Issue Rental</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID, member, or item title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
        >
          <option value="All">All Order Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Overdue">Overdue Only</option>
          <option value="Returned">Returned Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Rent Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Delivery Stage</th>
                <th className="py-3 px-4">Fee (₹)</th>
                <th className="py-3 px-4">Late Fee (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.rental_code}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{r.customer_name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{r.member_code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 truncate max-w-xs">{r.item_title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{r.item_code}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{r.rent_date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{r.due_date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === "Returned"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "Overdue"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={r.delivery_status || "Delivered"}
                      onChange={e => onUpdateDelivery && onUpdateDelivery(r.id, e.target.value)}
                      className="py-1 px-2 rounded-lg border border-slate-200 bg-white font-medium text-[11px] focus:outline-none"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packed">Packed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned to Store">Returned to Store</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {formatINR(r.monthly_fee)}
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600">
                    {Number(r.late_fee_charged || 0) > 0 ? formatINR(r.late_fee_charged) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {r.status !== "Returned" && (
                      <button
                        onClick={() => onProcessReturn(r)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                        title="Process Return & Late Fee"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onViewReceipt(r)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title="View Receipt"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
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
