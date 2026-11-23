const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const readingRoutes = require("./routes/reading.routes");
const errorMiddleware = require("./middleware/error.middleware");
const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use(errorMiddleware);

module.exports = app;