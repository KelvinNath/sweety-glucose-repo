const express = require("express");
const { create, getAll, update, remove } = require("../controllers/reading.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, create);
router.get("/", authenticate, getAll);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

module.exports = router;