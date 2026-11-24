const { body } = require("express-validator");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const READING_SLOTS = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER",
];

function isValidCalendarDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const KOLKATA_TIME_ZONE = "Asia/Kolkata";

function getTodayKolkataYmd() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KOLKATA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isNotFutureKolkataDate(dateString) {
  return dateString <= getTodayKolkataYmd();
}

const readingValidator = [
  body("date")
    .trim()
    .notEmpty()
    .withMessage("Date is required")
    .matches(DATE_PATTERN)
    .withMessage("Date must be in YYYY-MM-DD format")
    .custom((value) => {
      if (!isValidCalendarDate(value)) {
        throw new Error("Date must be a valid calendar date");
      }
      if (!isNotFutureKolkataDate(value)) {
        throw new Error("Date cannot be in the future");
      }
      return true;
    }),

  body("slot")
    .trim()
    .notEmpty()
    .withMessage("Slot is required")
    .isIn(READING_SLOTS)
    .withMessage(
      "Slot must be one of MORNING, AFTER_BREAKFAST, AFTER_LUNCH, AFTER_DINNER"
    ),

  body("value")
    .notEmpty()
    .withMessage("Value is required")
    .isInt({ min: 40, max: 600 })
    .withMessage("Value must be an integer between 40 and 600")
    .toInt(),
];

module.exports = {
  readingValidator,
  DATE_PATTERN,
  isValidCalendarDate,
  isNotFutureKolkataDate,
};