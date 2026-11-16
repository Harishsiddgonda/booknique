import React from "react";
import { Users, Plus, Download, Search, Edit2, Trash2, ShieldAlert, CheckCircle2, Phone, MapPin } from "lucide-react";
import { exportToCSV } from "../utils/api";

export default function MembersView({
  customers = [],
  plans = [],
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onAdd,
  onEdit,
  onToggleStatus,
  onDelete
}) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900">
            Members & Subscriber Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active memberships, borrowing limits, subscription plans, and account status controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV("booknique_members", customers)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member name, ID, email or phone..."
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
          <option value="All">All Member Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Suspended">Suspended Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Phone & City</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Max Allowed</th>
                <th className="py-3 px-4">Join Date</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.member_code}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{c.full_name}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">{c.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-700">{c.phone}</p>
                    <p className="text-[10px] text-slate-400">{c.city || "Bengaluru"}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {c.plan_name || "Basic (Books Only)"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {c.max_items_allowed || 2} Items
                  </td>
                  <td className="py-3 px-4 text-slate-600">{c.join_date}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onToggleStatus(c.id, c.status)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                        c.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                      title="Click to toggle Active/Suspended status"
                    >
                      {c.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => onEdit(c)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                      title="Edit Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
