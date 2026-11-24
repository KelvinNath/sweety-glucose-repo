export const TOKEN_STORAGE_KEY = "sweety_auth_token";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Add it to client/.env.local (see client/.env.example).",
    );
  }

  return String(baseUrl).replace(/\/$/, "");
}

function isPlainJsonBody(body) {
  if (Array.isArray(body)) {
    return true;
  }

  if (body === null || typeof body !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(body);
  return prototype === Object.prototype || prototype === null;
}

function isPublicAuthRequest(path, method) {
  const pathname = path.split("?")[0].replace(/\/$/, "") || "/";
  const normalizedMethod = String(method || "GET").toUpperCase();

  return (
    normalizedMethod === "POST" &&
    (pathname === "/auth/login" || pathname === "/auth/register")
  );
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export async function apiRequest(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const { body, headers: callerHeaders, ...rest } = options;
  const headers = new Headers(callerHeaders);
  let requestBody = body;

  if (isPlainJsonBody(body)) {
    requestBody = JSON.stringify(body);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const token = getAuthToken();
  const authenticatedWithStoredToken = Boolean(token) && !headers.has("Authorization");

  if (authenticatedWithStoredToken) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...rest,
    headers,
    body: requestBody,
  });
  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (
      response.status === 401 &&
      authenticatedWithStoredToken &&
      !isPublicAuthRequest(normalizedPath, rest.method)
    ) {
      clearAuthToken();
    }

    const message =
      (data && typeof data === "object" && data.message) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
