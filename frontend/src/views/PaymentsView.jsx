import React from "react";
import { Receipt, Printer, Download, Search, CheckCircle2 } from "lucide-react";
import { formatINR, exportToCSV } from "../utils/api";

export default function PaymentsView({
  payments = [],
  search,
  setSearch,
  onViewReceipt
}) {
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900">
            Invoices & Payment Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete billing ledger, UPI / Net Banking references, and official tax invoices in Indian Rupees (₹).
          </p>
        </div>

        <button
          onClick={() => exportToCSV("booknique_payments", payments)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collections</span>
          <div className="text-2xl font-black text-slate-900 font-display mt-1">
            {formatINR(totalRevenue)}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Transactions</span>
          <div className="text-2xl font-black text-slate-900 font-display mt-1">
            {payments.length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Success Rate</span>
          <div className="text-2xl font-black text-emerald-600 font-display mt-1">
            100%
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.invoice_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{p.customer_name}</td>
                  <td className="py-3 px-4 text-slate-600">{p.payment_date}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {p.payment_type?.replace("_", " ")}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{p.payment_method}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {p.status || "Completed"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatINR(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onViewReceipt(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                      title="View & Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
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
