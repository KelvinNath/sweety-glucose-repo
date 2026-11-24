const express = require("express");
const { getDaily, getMtd, getMonthly } = require("../controllers/report.controller");
const { reportDateQueryValidator } = require("../validators/report.validator");
const validate = require("../middleware/validate.middleware");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/daily", authenticate, reportDateQueryValidator, validate, getDaily);
router.get("/mtd", authenticate, reportDateQueryValidator, validate, getMtd);
router.get(
  "/monthly",
  authenticate,
  reportDateQueryValidator,
  validate,
  getMonthly
);

module.exports = router;