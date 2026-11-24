import { apiRequest } from "./api.js";

export async function getReadings() {
  const response = await apiRequest("/readings");

  return response.data;
}

export async function createReading(data) {
  const response = await apiRequest("/readings", {
    method: "POST",
    body: data,
  });

  return response.data;
}

export async function updateReading(id, data) {
  const response = await apiRequest(`/readings/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: data,
  });

  return response.data;
}

export async function deleteReading(id) {
  const response = await apiRequest(`/readings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return response.data;
}
