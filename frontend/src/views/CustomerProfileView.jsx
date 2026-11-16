import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Mail, ShieldCheck, Check, Sparkles, Building, Moon, Sun, Smartphone, Server, LogOut } from "lucide-react";
import { formatINR, request, getApiBaseUrl } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function CustomerProfileView({ customer, onRefresh, onNavigate }) {
  const { user, logout, switchDemo } = useAuth();
  const [phone, setPhone] = useState(customer?.phone || "+91 98450 12345");
  const [address, setAddress] = useState(customer?.address || "Flat 402, Shriram Summit, Neeladri Road, Electronic City Phase 1");
  const [city, setCity] = useState(customer?.city || "Bengaluru");
  const [hostIp, setHostIp] = useState(localStorage.getItem("booknique_host_ip") || "10.0.2.2");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("booknique_dark_mode") === "true");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("booknique_dark_mode", String(darkMode));
  }, [darkMode]);

  async function handleSave(e) {
    e.preventDefault();
    setErrorMsg("");
    setSavedSuccess(false);
    setIsSaving(true);

    try {
      localStorage.setItem("booknique_host_ip", hostIp);
      if (customer?.id) {
        await request(`/api/customers/${customer.id}`, {
          method: "PUT",
          body: JSON.stringify({
            phone,
            address,
            city
          })
        });
        setSavedSuccess(true);
        if (onRefresh) onRefresh();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update delivery address.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900">
          Account & Mobile Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your BookNique membership, doorstep delivery address, and Android preferences.
        </p>
      </div>

      {/* Member Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
            BookNique Subscriber
          </span>
          <h2 className="text-xl font-black font-display text-white mt-1">
            {customer?.full_name || user?.name}
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
            <span>Member ID: <strong className="text-amber-400">{customer?.member_code || "M102"}</strong></span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
              {customer?.status || "Active"}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right sm:border-l sm:border-slate-700/80 sm:pl-6">
          <span className="text-[10px] text-slate-400 block">Allowed Items</span>
          <span className="text-2xl font-black text-amber-400 font-display">
            {customer?.max_items_allowed || 4} Items
          </span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("customer_rentals")}
          className="p-4 rounded-2xl bg-white border border-slate-200 text-left shadow-xs hover:border-amber-400 transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Rentals</span>
          <span className="text-sm font-bold text-slate-900 mt-1 block">My Borrowed Items</span>
          <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">View return dates ➔</span>
        </button>

        <button
          onClick={() => onNavigate("customer_invoices")}
          className="p-4 rounded-2xl bg-white border border-slate-200 text-left shadow-xs hover:border-amber-400 transition-all"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Billing & GST</span>
          <span className="text-sm font-bold text-slate-900 mt-1 block">Invoices & Receipts</span>
          <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">Print tax invoices ➔</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5 text-xs">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          Doorstep Delivery Address
        </h3>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile and settings saved successfully!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="text"
              disabled
              value={customer?.email || user?.email || ""}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Doorstep Address (Apartment, Street, Landmark) *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <textarea
              required
              rows={3}
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Android Backend Host IP Config */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-500" />
              <span>Android API Host IP</span>
            </label>
            <select
              value={hostIp}
              onChange={e => setHostIp(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="10.0.2.2">10.0.2.2 (Android Emulator)</option>
              <option value="192.168.1.2">192.168.1.2 (Local WiFi / Device)</option>
              <option value="localhost">localhost (Web Browser)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-bold"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Logout button */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 flex items-center justify-center gap-2 text-xs transition-all shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of BookNique</span>
        </button>
      </div>

    </div>
  );
}
