import React from "react";
import { BarChart3, Download, TrendingUp, DollarSign, PieChart, BookOpen, Package } from "lucide-react";
import { formatINR, exportToCSV } from "../utils/api";

export default function ReportsView({ reports, dashboardData }) {
  const fin = reports?.financials || dashboardData?.financials || {
    totalRevenue: 54200.00,
    subscriptionRevenue: 34500.00,
    rentalRevenue: 16800.00,
    lateFeeRevenue: 2900.00
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900">
            Financial & Operational Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time accounting ledger, revenue segmentation, and utilization metrics in Indian Rupees (₹).
          </p>
        </div>

        <button
          onClick={() => exportToCSV("booknique_financial_report", [fin])}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* KPI Cards in ₹ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Gross Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
            {formatINR(fin.totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            All collections to date
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscription Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
            {formatINR(fin.subscriptionRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Recurring monthly plans
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Direct Rental Fees</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
            {formatINR(fin.rentalRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Pay-per-rental checkouts
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Overdue Late Fees</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-display mt-1">
            {formatINR(fin.lateFeeRevenue)}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
            Standard ₹50.00/day
          </span>
        </div>

      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Rented Titles */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Most Popular Rented Items</h3>

          <div className="space-y-3 text-xs">
            {[
              { title: "The Very Hungry Caterpillar", type: "Book", rentals: 24, fee: 149.00 },
              { title: "Melissa & Doug Wooden Railway", type: "Toy", rentals: 18, fee: 699.00 },
              { title: "Lego Classic Bricks Box (790 Pcs)", type: "Toy", rentals: 16, fee: 499.00 },
              { title: "Harry Potter & the Sorcerer's Stone", type: "Book", rentals: 14, fee: 249.00 }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <span className="text-[10px] text-slate-400">{item.type} • {formatINR(item.fee)}/mo</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900">{item.rentals} times</span>
                  <span className="text-[10px] text-slate-400 block">borrowed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Margins & Procurement Spend */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Capital Procurement & Asset Value</h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Total Inventory Asset Valuation</span>
              <div className="text-3xl font-black font-display text-white">
                {formatINR(148500)}
              </div>
              <p className="text-[11px] text-slate-400">
                Replacement value of all books, educational toys, and Lego construction assets stored in the warehouse.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <span className="text-xs font-bold text-amber-900 block">Procurement Inflow (Q3 - Q4 2026)</span>
              <p className="text-slate-700 font-semibold">{formatINR(89500)} total stock expenditure</p>
              <p className="text-[11px] text-slate-500">60 units acquired from Scholastic & Lego India distributors.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
