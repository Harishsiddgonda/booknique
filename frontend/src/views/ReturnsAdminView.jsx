import React, { useState, useEffect } from "react";
import { RotateCcw, AlertTriangle, CheckCircle2, Clock, Search, RefreshCw } from "lucide-react";
import { request, formatINR } from "../utils/api";

export default function ReturnsAdminView({ showToast, onReturnSuccess }) {
  const [pendingReturns, setPendingReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRental, setSelectedRental] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [condition, setCondition] = useState("Good");
  const [damageFee, setDamageFee] = useState(0);
  const [returnNotes, setReturnNotes] = useState("");

  async function loadPending() {
    try {
      setLoading(true);
      const data = await request("/api/returns/pending");
      setPendingReturns(data);
    } catch (err) {
      if (showToast) showToast("Failed to fetch pending returns: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleConfirmReturn(e) {
    e.preventDefault();
    if (!selectedRental) return;

    try {
      setProcessing(true);
      const res = await request("/api/returns/process", {
        method: "POST",
        body: JSON.stringify({
          rental_id: selectedRental.id,
          condition_on_return: condition,
          damage_fee: Number(damageFee) || 0,
          notes: returnNotes
        })
      });

      if (showToast) showToast(res.message);
      setSelectedRental(null);
      loadPending();
      if (onReturnSuccess) onReturnSuccess();
    } catch (err) {
      if (showToast) showToast(err.message, "danger");
    } finally {
      setProcessing(false);
    }
  }

  const filtered = pendingReturns.filter(r => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.item_title.toLowerCase().includes(q) ||
        r.customer_name.toLowerCase().includes(q) ||
        r.rental_code.toLowerCase().includes(q) ||
        r.member_code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">Item Returns & Late Fee Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Check-in returned books and toys, inspect physical condition, calculate automatic late-fees (₹30/day), and release deposits.
          </p>
        </div>

        <button
          onClick={loadPending}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Desk
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer, book/toy title, or rental code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
        />
      </div>

      {/* Pending Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => {
          const dueDate = new Date(r.due_date);
          const isOverdue = new Date() > dueDate;
          const diffDays = Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={r.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                isOverdue ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {r.rental_code}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isOverdue ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {isOverdue ? `Overdue by ${diffDays} day(s)` : "Active Borrow"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{r.item_title}</h3>
              <p className="text-xs text-slate-600 mb-2">
                Member: <strong className="text-slate-800">{r.customer_name}</strong> ({r.member_code})
              </p>

              <div className="text-[11px] text-slate-500 space-y-1 mb-4 bg-slate-50 p-2.5 rounded-xl">
                <div>Due Date: <strong className="text-slate-700">{r.due_date ? r.due_date.slice(0, 10) : ""}</strong></div>
                <div>Deposit Held: <strong className="text-slate-700">{formatINR(r.deposit_held)}</strong></div>
                {isOverdue && (
                  <div className="text-rose-600 font-bold">
                    Est. Late Fee: {formatINR(diffDays * 30)} (₹30/day)
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedRental(r);
                  setCondition("Good");
                  setDamageFee(0);
                  setReturnNotes("");
                }}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Process Return
              </button>
            </div>
          );
        })}
      </div>

      {/* Return Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Process Return: {selectedRental.rental_code}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedRental.item_title} • {selectedRental.customer_name}
            </p>

            <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Condition on Return</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Excellent">Excellent (Like New)</option>
                  <option value="Good">Good (Normal wear)</option>
                  <option value="Needs Inspection">Needs Inspection / Deep Cleaning</option>
                  <option value="Damaged">Damaged / Missing Parts</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Damage / Missing Part Fee (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  value={damageFee}
                  onChange={e => setDamageFee(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Return Inspection Notes</label>
                <textarea
                  rows="3"
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  placeholder="e.g. All 790 Lego pieces verified. Sanitized in UVC chamber."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRental(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  {processing ? "Processing..." : "Complete Check-In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
