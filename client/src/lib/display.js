export function getInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const letters =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : `${parts[0][0]}${parts[parts.length - 1][0]}`;

  return letters.toUpperCase();
}

export function formatDisplayDate(dateString, options = {}) {
  const [year, month, day] = String(dateString ?? "").split("-").map(Number);

  if (!year || !month || !day) {
    return dateString || "";
  }

  const formatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    ...options,
  };

  if (options.year !== false) {
    formatOptions.year = options.year ?? "numeric";
  } else {
    delete formatOptions.year;
  }

  return new Intl.DateTimeFormat("en-US", formatOptions).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

export function displayStat(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return value;
}

export function displayAverage(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toFixed(1);
}

export function calendarDate(value) {
  return typeof value === "string" ? value.slice(0, 10) : "";
}
