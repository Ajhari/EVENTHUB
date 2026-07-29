export function getAuthToken() {
  return localStorage.getItem("eventhubToken");
}

export function authHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  if (!token) {
    return extraHeaders;
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function clearSavedAuth() {
  localStorage.removeItem("eventhubUser");
  localStorage.removeItem("eventhubToken");
  window.dispatchEvent(new Event("eventhub-auth-change"));
}
