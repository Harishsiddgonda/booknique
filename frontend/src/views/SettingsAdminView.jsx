import React, { useState, useEffect } from "react";
import { Settings, Save, Server, Database, Phone, MapPin, DollarSign, ShieldCheck } from "lucide-react";
import { request } from "../utils/api";

export default function SettingsAdminView({ showToast }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState(null);

  async function loadSettings() {
    try {
      setLoading(true);
      const [data, healthData] = await Promise.all([
        request("/api/admin/settings"),
        request("/api/health")
      ]);
      setSettings(data);
      setHealth(healthData);
    } catch (err) {
      if (showToast) showToast("Failed to load settings: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleValueChange(key, val) {
    setSettings(prev =>
      prev.map(s => (s.setting_key === key ? { ...s, setting_value: val } : s))
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await request("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ settings })
      });
      if (showToast) showToast("Store settings saved to production database!");
    } catch (err) {
      if (showToast) showToast(err.message, "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Store & Ecosystem Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure physical store locations, customer support contacts, automatic late-fee rules, and view Cloud/Render health.
        </p>
      </div>

      {/* Cloud & Database Status Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold font-display">System Health & Cloud Infrastructure</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-800">
          <div>
            <span className="text-slate-400 text-[10px] block">Database Engine</span>
            <span className="font-extrabold text-white uppercase">{health?.db_driver || "MySQL"}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Database Status</span>
            <span className="font-extrabold text-emerald-400 capitalize">{health?.database || "Connected"}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">API Version</span>
            <span className="font-extrabold text-white">{health?.version || "1.0.0"}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">API Host</span>
            <span className="font-extrabold text-amber-400 font-mono text-[11px]">0.0.0.0:5000</span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-xs">
        <h3 className="text-base font-bold text-slate-900">Configurable Store Parameters</h3>

        {settings.map(s => (
          <div key={s.id} className="space-y-1">
            <label className="block font-bold text-slate-700">
              {s.setting_key.replace(/_/g, " ")}
            </label>
            <p className="text-[11px] text-slate-400 mb-1">{s.description}</p>
            <input
              type="text"
              value={s.setting_value || ""}
              onChange={e => handleValueChange(s.setting_key, e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-800"
            />
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center gap-2 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Store Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
