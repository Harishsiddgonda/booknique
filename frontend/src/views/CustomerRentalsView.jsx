import React from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Truck,
  Receipt,
  BookOpen,
  Package,
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatINR } from "../utils/api";

export default function CustomerRentalsView({
  activeRentals,
  history,
  onReturn,
  onViewReceipt,
  onBrowseCatalog
}) {
  return (
    <div className="space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900">
            My Borrowed Books & Toys
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active rentals, due dates, doorstep delivery, and return history.
          </p>
        </div>
        <button
          onClick={onBrowseCatalog}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Catalog</span>
        </button>
      </div>

      {/* Active Borrowed Items Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span>Active In Your Possession</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
            {activeRentals.length}
          </span>
        </h2>

        {activeRentals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No items currently borrowed</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your borrowing slots are open! Browse our book and toy catalog to schedule your next doorstep delivery.
            </p>
            <button
              onClick={onBrowseCatalog}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Explore Catalog Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRentals.map(r => {
              const today = new Date();
              const due = new Date(r.due_date);
              const isOverdue = today > due;
              const diffMs = due - today;
              const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const overdueDays = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
              const estimatedLateFee = overdueDays * 50;

              return (
                <div
                  key={r.id}
                  className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col justify-between transition-all ${
                    isOverdue
                      ? "border-rose-300 ring-1 ring-rose-300"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                      <img
                        src={
                          r.item_type === "Toy"
                            ? "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80"
                            : "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80"
                        }
                        alt={r.item_title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {r.item_code}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {formatINR(r.monthly_fee)}/mo
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm truncate mt-1">
                        {r.item_title}
                      </h3>

                      {/* Delivery Status Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold">{r.delivery_status || "Delivered"}</span>
                      </div>

                      {/* Due Date Indicator */}
                      <div className="mt-2 text-xs">
                        {isOverdue ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Overdue by {overdueDays} day(s) • Late fee: {formatINR(estimatedLateFee)}</span>
                          </div>
                        ) : daysLeft <= 3 ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due in {daysLeft} day(s) ({r.due_date})</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-slate-500 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due on {r.due_date}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Order: {r.rental_code}
                    </span>
                    <button
                      onClick={() => onReturn(r)}
                      className="px-3 py-1.5 rounded-xl border border-amber-500 text-amber-700 hover:bg-amber-50 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return Item</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rental History Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span>Past Rental History</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
            {history.length}
          </span>
        </h2>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400">No past returned orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Rented Period</th>
                  <th className="py-3 px-4">Returned On</th>
                  <th className="py-3 px-4">Fee Paid</th>
                  <th className="py-3 px-4">Return Condition</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.rental_code}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{r.item_title}</p>
                      <span className="text-[10px] text-slate-400">{r.item_code}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.rent_date} to {r.due_date}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{r.return_date || "Returned"}</td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {formatINR(r.monthly_fee)}
                      {Number(r.late_fee_charged || 0) > 0 && (
                        <span className="text-[10px] text-rose-600 font-bold block">
                          +{formatINR(r.late_fee_charged)} Late Fee
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {r.condition_on_return || "Good"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewReceipt(r)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="View & Print Receipt"
                      >
                        <Receipt className="w-4 h-4" />
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
