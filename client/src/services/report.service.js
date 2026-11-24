import { apiRequest } from "./api.js";

async function getReport(path, date) {
  const params = new URLSearchParams({ date });
  const response = await apiRequest(`${path}?${params.toString()}`);

  return response.data;
}

export function getDailyReport(date) {
  return getReport("/reports/daily", date);
}

export function getMtdReport(date) {
  return getReport("/reports/mtd", date);
}

export function getMonthlyReport(date) {
  return getReport("/reports/monthly", date);
}
