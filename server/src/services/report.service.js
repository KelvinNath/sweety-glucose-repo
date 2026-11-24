const prisma = require("../config/prisma");

const SLOT_ORDER = {
  MORNING: 0,
  AFTER_BREAKFAST: 1,
  AFTER_LUNCH: 2,
  AFTER_DINNER: 3,
};

function toUtcMidnightDate(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function formatStatistics(aggregate) {
  const count = aggregate._count._all;

  if (count === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      count: 0,
    };
  }

  return {
    highest: aggregate._max.value,
    lowest: aggregate._min.value,
    average: Math.round(aggregate._avg.value * 10) / 10,
    count,
  };
}

async function aggregateReadingStatistics(where) {
  const aggregate = await prisma.reading.aggregate({
    where,
    _max: { value: true },
    _min: { value: true },
    _avg: { value: true },
    _count: { _all: true },
  });

  return formatStatistics(aggregate);
}

function getMonthToDateRange(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  const monthPadded = String(month).padStart(2, "0");

  return {
    from: `${year}-${monthPadded}-01`,
    to: dateString,
  };
}

function getPreviousCalendarMonthRange(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  const monthPadded = String(previousMonth).padStart(2, "0");
  const lastDay = new Date(Date.UTC(previousYear, previousMonth, 0)).getUTCDate();

  return {
    from: `${previousYear}-${monthPadded}-01`,
    to: `${previousYear}-${monthPadded}-${String(lastDay).padStart(2, "0")}`,
  };
}

function sortReadingsBySlot(readings) {
  return [...readings].sort(
    (a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]
  );
}

async function getDailyReport({ userId, date }) {
  const where = {
    userId,
    date: toUtcMidnightDate(date),
  };

  const [readings, statistics] = await Promise.all([
    prisma.reading.findMany({ where }),
    aggregateReadingStatistics(where),
  ]);

  return {
    date,
    readings: sortReadingsBySlot(readings),
    statistics,
  };
}

async function getMtdReport({ userId, date }) {
  const dateRange = getMonthToDateRange(date);
  const where = {
    userId,
    date: {
      gte: toUtcMidnightDate(dateRange.from),
      lte: toUtcMidnightDate(dateRange.to),
    },
  };

  const statistics = await aggregateReadingStatistics(where);

  return {
    dateRange,
    statistics,
  };
}

async function getMonthlyReport({ userId, date }) {
  const dateRange = getPreviousCalendarMonthRange(date);
  const where = {
    userId,
    date: {
      gte: toUtcMidnightDate(dateRange.from),
      lte: toUtcMidnightDate(dateRange.to),
    },
  };

  const statistics = await aggregateReadingStatistics(where);

  return {
    dateRange,
    statistics,
  };
}

module.exports = {
  getDailyReport,
  getMtdReport,
  getMonthlyReport,
};