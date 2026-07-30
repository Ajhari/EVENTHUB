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
