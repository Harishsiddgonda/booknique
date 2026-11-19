import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Save,
  Globe
} from "lucide-react";
import { getApiBaseUrl, checkApiHealth } from "../utils/api";

export default function ServerSettingsModal({ isOpen, onClose, onRefreshData }) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [hostIp, setHostIp] = useState("192.168.1.10");
  const [port, setPort] = useState("5000");
  const [envMode, setEnvMode] = useState("local"); // 'local' | 'render' | 'custom'
  const [customUrl, setCustomUrl] = useState("");
  const [pingStatus, setPingStatus] = useState(null); // { checking: boolean, ok: boolean, msg: string }

  useEffect(() => {
    if (!isOpen) return;
    const savedIp = localStorage.getItem("booknique_host_ip") || "192.168.1.10";
    const savedMode = localStorage.getItem("booknique_env_mode") || "local";
    const savedCustom = localStorage.getItem("booknique_api_url") || "";
    setHostIp(savedIp);
    setEnvMode(savedMode);
    setCustomUrl(savedCustom);
    setCurrentUrl(getApiBaseUrl() || "http://192.168.1.10:5000");
    testPing(getApiBaseUrl() || `http://${savedIp}:5000`);
  }, [isOpen]);

  async function testPing(targetUrl) {
    setPingStatus({ checking: true, msg: "Connecting to server..." });
    const result = await checkApiHealth(targetUrl);
    if (result.ok) {
      setPingStatus({
        checking: false,
        ok: true,
        msg: `Connected successfully! (${result.latency}ms) • MySQL & API Active`
      });
    } else {
      setPingStatus({
        checking: false,
        ok: false,
        msg: `Unable to connect: ${result.error || "Host unreachable"}. Offline fallback active.`
      });
    }
  }

  function handleSave() {
    let resolvedUrl = "";
    if (envMode === "local") {
      localStorage.setItem("booknique_env_mode", "local");
      localStorage.setItem("booknique_host_ip", hostIp.trim());
      localStorage.removeItem("booknique_api_url");
      resolvedUrl = `http://${hostIp.trim()}:${port.trim()}`;
    } else if (envMode === "render") {
      localStorage.setItem("booknique_env_mode", "render");
      localStorage.removeItem("booknique_api_url");
      resolvedUrl = "https://booknique-api.onrender.com";
    } else {
      localStorage.setItem("booknique_env_mode", "custom");
      localStorage.setItem("booknique_api_url", customUrl.trim());
      resolvedUrl = customUrl.trim();
    }

    setCurrentUrl(resolvedUrl);
    testPing(resolvedUrl);
    if (onRefreshData) onRefreshData();
    setTimeout(() => {
      onClose();
    }, 600);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Mobile Network & Server
              </h3>
              <p className="text-xs text-slate-500">Configure connection to Booknique backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Target Backend URL</span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
              {currentUrl || "Offline / Demo"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {pingStatus?.checking ? (
              <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
            ) : pingStatus?.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-500" />
            )}
            <span
              className={`text-xs font-medium ${
                pingStatus?.checking
                  ? "text-amber-600 dark:text-amber-400"
                  : pingStatus?.ok
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {pingStatus?.msg || "Checking connection..."}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Connection Mode:
          </label>

          {/* Local Wi-Fi Radio */}
          <div
            onClick={() => setEnvMode("local")}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              envMode === "local"
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Wifi className="w-4 h-4 text-indigo-500" />
                Local WiFi / Mobile Hotspot (Recommended)
              </span>
              <input
                type="radio"
                checked={envMode === "local"}
                onChange={() => setEnvMode("local")}
                className="accent-indigo-600"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Connect directly to the laptop running Booknique on your shared Wi-Fi or phone hotspot.
            </p>
            {envMode === "local" && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400">Host IP:</span>
                    <input
                      type="text"
                      value={hostIp}
                      onChange={(e) => setHostIp(e.target.value)}
                      placeholder="192.168.1.10"
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="w-20">
                    <span className="text-[10px] text-slate-400">Port:</span>
                    <input
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="5000"
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
                {/* 1-Tap Quick Fill Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400">Tap to fill:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHostIp("192.168.1.10");
                      testPing("http://192.168.1.10:5000");
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                  >
                    192.168.1.10 (Current)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHostIp("192.168.1.9");
                      testPing("http://192.168.1.9:5000");
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono text-slate-500 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  >
                    192.168.1.9
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHostIp("10.0.2.2");
                      testPing("http://10.0.2.2:5000");
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono text-slate-500 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  >
                    10.0.2.2 (Emulator)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cloud Render Radio */}
          <div
            onClick={() => setEnvMode("render")}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              envMode === "render"
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Render Cloud API
              </span>
              <input
                type="radio"
                checked={envMode === "render"}
                onChange={() => setEnvMode("render")}
                className="accent-indigo-600"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              https://booknique-api.onrender.com (When cloud deployment is live)
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              testPing(
                envMode === "local"
                  ? `http://${hostIp}:${port}`
                  : envMode === "render"
                  ? "https://booknique-api.onrender.com"
                  : customUrl
              )
            }
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Test Ping
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
