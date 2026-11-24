const { query } = require("express-validator");
const {
  DATE_PATTERN,
  isValidCalendarDate,
  isNotFutureKolkataDate,
} = require("./reading.validator");

const reportDateQueryValidator = [
  query("date")
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
];

module.exports = {
  reportDateQueryValidator,
};