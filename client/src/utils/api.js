export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function assetUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("/uploads")) {
    return apiUrl(path);
  }

  return path;
}
