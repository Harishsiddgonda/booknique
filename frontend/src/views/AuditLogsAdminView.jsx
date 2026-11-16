import React, { useState, useEffect } from "react";
import { Shield, Clock, Search, RefreshCw, FileText } from "lucide-react";
import { request } from "../utils/api";

export default function AuditLogsAdminView({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await request("/api/admin/audit-logs");
      setLogs(data);
    } catch (err) {
      if (showToast) showToast("Failed to fetch audit logs: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.user_name && l.user_name.toLowerCase().includes(q)) ||
        (l.entity_type && l.entity_type.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">System Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit trail of administrative actions, user logins, returns, and inventory modifications.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No audit records recorded yet. All actions are securely logged upon mutation.
                  </td>
                </tr>
              ) : (
                filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {l.created_at ? l.created_at.replace("T", " ").slice(0, 19) : ""}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {l.user_name || "System Automated"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-600">
                      {l.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {l.entity_type} {l.entity_id ? `(#${l.entity_id})` : ""}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {l.ip_address || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
