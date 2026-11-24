import { apiRequest, clearAuthToken } from "./api.js";

export async function login(credentials) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });

  return response.data;
}

export async function register(userData) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: userData,
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiRequest("/auth/me");

  return response.data.user;
}

export function logout() {
  clearAuthToken();
}
