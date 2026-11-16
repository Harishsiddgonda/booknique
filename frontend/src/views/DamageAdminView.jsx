import React, { useState, useEffect } from "react";
import { AlertTriangle, Wrench, Plus, CheckCircle2, Search, RefreshCw } from "lucide-react";
import { request, formatINR } from "../utils/api";

export default function DamageAdminView({ showToast }) {
  const [damages, setDamages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  const [formData, setFormData] = useState({
    item_id: "",
    customer_id: "",
    damage_type: "Torn Pages / Binding",
    severity: "Low",
    repair_cost: 0,
    fee_charged: 0,
    description: ""
  });

  async function loadData() {
    try {
      setLoading(true);
      const [dmgData, invData] = await Promise.all([
        request("/api/admin/damages"),
        request("/api/inventory")
      ]);
      setDamages(dmgData);
      setInventoryList(invData);
    } catch (err) {
      if (showToast) showToast("Failed to load damage logs: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await request("/api/admin/damages", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      if (showToast) showToast("Damage incident logged and inventory flagged!");
      setShowLogModal(false);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message, "danger");
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">Damage & Maintenance Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track damaged books and toys, manage repair costs, and transition items through sanitization and maintenance.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Log Damage Incident
        </button>
      </div>

      {/* Incident Log Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {damages.map(d => (
          <div key={d.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                d.severity === "Critical" ? "bg-rose-100 text-rose-800" : d.severity === "Medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
              }`}>
                {d.severity} Severity
              </span>
              <span className="text-[10px] text-slate-400">
                {d.created_at ? d.created_at.slice(0, 10) : ""}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{d.item_title}</h3>
              <p className="text-xs text-slate-500 font-semibold">{d.item_code} • {d.damage_type}</p>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
              {d.description || "No additional inspection notes."}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Repair Cost</span>
                <span className="font-bold text-slate-800">{formatINR(d.repair_cost)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Fee Charged</span>
                <span className="font-bold text-amber-600">{formatINR(d.fee_charged)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Log Item Damage Incident</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Item *</label>
                <select
                  required
                  value={formData.item_id}
                  onChange={e => setFormData({ ...formData, item_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- Choose Book or Toy --</option>
                  {inventoryList.map(i => (
                    <option key={i.id} value={i.id}>
                      [{i.item_code}] {i.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Damage Category</label>
                  <select
                    value={formData.damage_type}
                    onChange={e => setFormData({ ...formData, damage_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Torn Pages / Binding">Torn Pages / Binding</option>
                    <option value="Missing Parts">Missing Parts / Bricks</option>
                    <option value="Liquid / Stain Damage">Liquid / Stain Damage</option>
                    <option value="Electronic Fault">Electronic / Battery Fault</option>
                    <option value="General Wear">General Wear & Tear</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Low">Low (Repairable in store)</option>
                    <option value="Medium">Medium (Part replacement)</option>
                    <option value="Critical">Critical (Total Write-Off)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Repair Cost (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.repair_cost}
                    onChange={e => setFormData({ ...formData, repair_cost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fee Charged to Customer</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.fee_charged}
                    onChange={e => setFormData({ ...formData, fee_charged: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe exact condition and required action..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
