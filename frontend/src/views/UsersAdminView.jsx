import React, { useState, useEffect } from "react";
import { Users, Shield, UserCheck, UserX, Search, RefreshCw } from "lucide-react";
import { request } from "../utils/api";

export default function UsersAdminView({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await request("/api/users");
      setUsers(data);
    } catch (err) {
      if (showToast) showToast("Failed to load users: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(userId, newRole) {
    try {
      await request(`/api/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole })
      });
      if (showToast) showToast(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      if (showToast) showToast(err.message, "danger");
    }
  }

  async function handleStatusToggle(userId, currentStatus) {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await request(`/api/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      if (showToast) showToast(`User account status set to ${nextStatus}`);
      loadUsers();
    } catch (err) {
      if (showToast) showToast(err.message, "danger");
    }
  }

  const filtered = users.filter(u => {
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">User & Staff Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated users, staff credentials, and role-based permissions across Web & Android.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          />
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          {["All", "admin", "staff", "customer"].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                roleFilter === r ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {r === "All" ? "All Roles" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                        u.role === "admin"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : u.role === "staff"
                          ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                          : "bg-slate-50 text-slate-800 border-slate-200"
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="customer">Customer</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      u.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        u.status === "Active"
                          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {u.status === "Active" ? "Suspend" : "Activate"}
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
