import React, { useState, useEffect } from "react";
import { Tag, Plus, CheckCircle2, Search, RefreshCw, Calendar } from "lucide-react";
import { request, formatINR } from "../utils/api";

export default function DiscountsAdminView({ showToast }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: 10,
    fixed_amount: 0,
    min_order_amount: 300,
    max_discount_amount: 150,
    expiry_date: "2027-12-31",
    usage_limit: 100
  });

  async function loadCoupons() {
    try {
      setLoading(true);
      const data = await request("/api/admin/discounts");
      setCoupons(data);
    } catch (err) {
      if (showToast) showToast("Failed to load discount coupons: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleCreateCoupon(e) {
    e.preventDefault();
    try {
      await request("/api/admin/discounts", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      if (showToast) showToast("Discount coupon created successfully!");
      setShowModal(false);
      setFormData({
        code: "",
        discount_percent: 10,
        fixed_amount: 0,
        min_order_amount: 300,
        max_discount_amount: 150,
        expiry_date: "2027-12-31",
        usage_limit: 100
      });
      loadCoupons();
    } catch (err) {
      if (showToast) showToast(err.message, "danger");
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">Coupons & Rental Discounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage promotional discount coupons for checkout and rental memberships.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Benefit</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Usage Limit</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-extrabold text-slate-900">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                      {c.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {c.discount_percent > 0 ? `${c.discount_percent}% OFF` : `${formatINR(c.fixed_amount)} Flat OFF`}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatINR(c.min_order_amount)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.used_count || 0} / {c.usage_limit} used
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {c.expiry_date ? c.expiry_date.slice(0, 10) : "2027-12-31"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Create Promotion Coupon</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMERKIDS20"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flat Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.fixed_amount}
                    onChange={e => setFormData({ ...formData, fixed_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
