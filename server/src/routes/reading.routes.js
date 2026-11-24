const express = require("express");
const { create, getAll, update, remove } = require("../controllers/reading.controller");
const { readingValidator } = require("../validators/reading.validator");
const validate = require("../middleware/validate.middleware");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, readingValidator, validate, create);
router.get("/", authenticate, getAll);
router.put("/:id", authenticate, readingValidator, validate, update);
router.delete("/:id", authenticate, remove);

module.exports = router;