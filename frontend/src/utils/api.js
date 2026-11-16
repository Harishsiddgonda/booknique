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

// Smart Mobile & Web API Base URL Resolver
export function getApiBaseUrl() {
  const custom = localStorage.getItem("booknique_api_url");
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, "");
  }

  // Detect Capacitor native platform (Android / iOS)
  const isNative = typeof window !== "undefined" && (
    window.Capacitor?.isNativePlatform() ||
    window.location.protocol === "capacitor:" ||
    window.location.origin === "https://localhost"
  );

  if (isNative) {
    // 10.0.2.2 points to host machine from Android Emulator, 192.168.1.2 for physical device
    const savedHost = localStorage.getItem("booknique_host_ip") || "10.0.2.2";
    return `http://${savedHost}:5000`;
  }

  return "";
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

  const res = await fetch(fullUrl, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
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
