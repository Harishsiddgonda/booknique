import React from "react";
import {
  Boxes,
  Users,
  Repeat2,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  BookOpen,
  Package,
  Receipt,
  RotateCcw
} from "lucide-react";
import { formatINR } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardView({
  data,
  inventory = [],
  rentals = [],
  customers = [],
  onOpenModal,
  onNavigate,
  onReturnRental,
  onViewReceipt
}) {
  const { role } = useAuth();

  const totalRevenue = data?.revenue || 54200.00;
  const activeRentalsCount = data?.activeRentals || rentals.filter(r => r.status === "Active").length;
  const subscribersCount = data?.subscribers || customers.filter(c => c.status === "Active").length;
  const totalUnits = data?.inventoryItems || inventory.reduce((s, i) => s + (i.total_quantity || 1), 0);
  const overdueCount = data?.overdueRentals || rentals.filter(r => r.status === "Overdue").length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block">
            Store Operations Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-0.5">
            BOOK<span className="text-amber-500">NIQUE</span> Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time MySQL relational monitoring, revenue tracking, and inventory fulfillment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenModal("issue")}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Rental</span>
          </button>
          
          <button
            onClick={() => onOpenModal("item")}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Boxes className="w-4 h-4" />
            <span>Add Catalog Item</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (All in ₹) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-2">
            {formatINR(totalRevenue)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>+14.2%</span>
            <span className="text-slate-400">vs last month</span>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Rentals</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Repeat2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-2">
            {activeRentalsCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {overdueCount > 0 ? (
              <span className="text-rose-600 font-bold">{overdueCount} overdue item(s)</span>
            ) : (
              <span className="text-emerald-600 font-semibold">100% on-time returns</span>
            )}
          </div>
        </div>

        {/* Total Catalog Units */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Stock</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-2">
            {totalUnits} Units
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            {inventory.length} distinct titles / sets
          </div>
        </div>

        {/* Active Members */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Subscribers</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-2">
            {subscribersCount} Members
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold">
            All Bengaluru zones
          </div>
        </div>

      </div>

      {/* Middle Grid: Revenue Trends & Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Rental Collections (₹)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recurring memberships and rental transactions</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Last 6 Months
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-slate-100">
            {(data?.monthlyTrend || []).map((m, idx) => {
              const maxRev = 60000;
              const heightPct = Math.min(100, Math.max(15, (Number(m.revenue) / maxRev) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatINR(m.revenue)}
                  </span>
                  <div
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-slate-900 to-amber-500 group-hover:from-amber-500 group-hover:to-amber-400 transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-semibold truncate max-w-full">
                    {m.month?.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Average Monthly Run-Rate: <strong>{formatINR(42000)}</strong></span>
            <button
              onClick={() => onNavigate("reports")}
              className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
            >
              <span>View Full Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stock & Maintenance Alerts */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Inventory Alerts</h3>
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Live Health
            </span>
          </div>

          <div className="space-y-3">
            {(data?.stockAlerts || inventory.slice(0, 4)).map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{item.item_code}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-slate-700 truncate max-w-[130px]">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {item.available_quantity || 0} of {item.total_quantity || 1} available
                  </span>
                </div>

                <div>
                  {item.rental_status === "Maintenance" ? (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                      Inspect
                    </span>
                  ) : item.available_quantity <= 1 ? (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Good
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate("inventory")}
            className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            Manage Catalog Stock
          </button>
        </div>

      </div>

      {/* Recent Rental Transactions Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Rental Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live order statuses, due dates, and fee calculations</p>
          </div>
          <button
            onClick={() => onNavigate("rentals")}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Item Title</th>
                <th className="py-3 px-4">Rent Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Monthly Fee (₹)</th>
                <th className="py-3 px-4">Late Fee (₹)</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentals.slice(0, 6).map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.rental_code}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{r.customer_name}</p>
                    <span className="text-[10px] text-slate-400">{r.member_code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 truncate max-w-xs">{r.item_title}</p>
                    <span className="text-[10px] text-slate-400">{r.item_code}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{r.rent_date}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{r.due_date}</td>
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
                  <td className="py-3 px-4 font-black text-slate-900">{formatINR(r.monthly_fee)}</td>
                  <td className="py-3 px-4 font-bold text-rose-600">
                    {Number(r.late_fee_charged || 0) > 0 ? formatINR(r.late_fee_charged) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {r.status !== "Returned" && (
                      <button
                        onClick={() => onReturnRental(r)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                        title="Process Return"
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
