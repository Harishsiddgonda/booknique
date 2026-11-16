import React from "react";
import { CreditCard, Plus, Check, Edit2, Trash2, ShieldCheck } from "lucide-react";
import { formatINR } from "../utils/api";

export default function PlansView({ plans = [], onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900">
            Membership Plans & Pricing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure subscription tiers, borrow quotas, and monthly membership fees in Indian Rupees (₹).
          </p>
        </div>

        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Plan</span>
        </button>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(p => (
          <div
            key={p.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {p.code}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(p)}
                    className="p-1 rounded text-slate-400 hover:text-amber-600"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 font-display">
                  {formatINR(p.price)}
                </span>
                <span className="text-xs text-slate-500">/{p.duration_days || 30} days</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {p.description}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Max Books Allowed:</span>
                  <strong className="text-slate-900">{p.max_books || 2}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Max Toys Allowed:</span>
                  <strong className="text-slate-900">{p.max_toys || 1}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Total Items at a time:</span>
                  <strong className="text-amber-600 font-display text-sm">{p.max_total_items || 3}</strong>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {p.status || "Active"}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
