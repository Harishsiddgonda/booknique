// Centralized Indian Currency (INR) Formatter using Intl.NumberFormat API
export const formatINR = (amount, options = {}) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: options.fractionDigits ?? (num % 1 === 0 ? 0 : 2),
    minimumFractionDigits: options.minimumFractionDigits ?? 0
  }).format(num);
};

// Backward-compatible alias for existing call sites
export const formatMoney = (amount) => formatINR(amount);

// Detect whether running in Capacitor Native Android/iOS or web
export function isNativePlatform() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === "capacitor:" ||
    window.location.origin === "https://localhost"
  );
}

// Smart Mobile & Web API Base URL Resolver
export function getApiBaseUrl() {
  const custom = localStorage.getItem("booknique_api_url");
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, "");
  }

  // Check Vite environment variable (set during production build)
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/$/, "");
  }

  // Detect Capacitor native platform (Android / iOS)
  if (isNativePlatform()) {
    const targetEnv = localStorage.getItem("booknique_env_mode") || "local";
    if (targetEnv === "render") {
      const customRender = localStorage.getItem("booknique_render_url") || "https://booknique-api.onrender.com";
      return customRender.trim().replace(/\/$/, "");
    }

    // Default to the host PC's Wi-Fi / Hotspot LAN IP (192.168.1.10)
    const savedHost = localStorage.getItem("booknique_host_ip") || "192.168.1.10";
    return `http://${savedHost}:5000`;
  }

  return "";
}

// Quick health probe for live status indicators
export async function checkApiHealth(targetUrl) {
  const url = (targetUrl || getApiBaseUrl()).replace(/\/$/, "");
  const pingUrl = `${url}/api/health`;
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(pingUrl, { signal: controller.signal });
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, latency, data, url };
    }
    return { ok: false, latency, error: `HTTP ${res.status}`, url };
  } catch (err) {
    return { ok: false, latency: Date.now() - start, error: err.message, url };
  }
}

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("rsr_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const baseUrl = getApiBaseUrl();
  const fullUrl = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  const timeoutMs = options.timeout || (isNativePlatform() ? 4500 : 8000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      signal: options.signal || controller.signal
    });
    clearTimeout(timer);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(","),
      ...rows.map(row =>
        headers
          .map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
