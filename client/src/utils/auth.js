export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("/uploads")) return `${API_BASE_URL}${path}`;
  return path;
}

export function authHeaders(extraHeaders = {}) {
  return extraHeaders;
}

export function authOptions(extraOptions = {}) {
  return {
    ...extraOptions,
    credentials: "include",
    headers: authHeaders(extraOptions.headers || {}),
  };
}

export function clearSavedAuth() {
  localStorage.removeItem("eventhubUser");
  window.dispatchEvent(new Event("eventhub-auth-change"));
}
