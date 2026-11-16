import React from "react";
import { Receipt, Printer, CheckCircle2, ShieldCheck, CreditCard, ArrowUpRight } from "lucide-react";
import { formatINR } from "../utils/api";

export default function CustomerInvoicesView({ customer, payments, onViewReceipt }) {
  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900">
          Payment Invoices & Receipts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all rental payments, subscription dues, and generate official printable tax invoices.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rentals Paid</span>
          <div className="text-2xl font-black text-slate-900 font-display mt-1">
            {formatINR(totalSpent)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            All transactions completed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoices Generated</span>
          <div className="text-2xl font-black text-slate-900 font-display mt-1">
            {payments.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Includes rental fees & deposits
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Refundable Deposits</span>
          <div className="text-2xl font-black text-amber-600 font-display mt-1">
            {formatINR(1500)}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            Held safely in escrow
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Transaction Ledger</h3>
          <span className="text-xs text-slate-400">All amounts in Indian Rupees (₹)</span>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Notes</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-600">{p.payment_date}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.notes || "Monthly rental subscription"}</p>
                      <span className="text-[10px] text-slate-400">Ref: {p.transaction_ref || "N/A"}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{p.payment_method || "UPI"}</td>
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
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
