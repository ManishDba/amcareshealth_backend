const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const { PORT } = require("../env");
const { models } = require("./models/index");
const errorHandler = require("./middleware/errorHandler.middleware");
const { apiRateLimit } = require("./middleware/rateLimit.middleware");

console.log('🏁 Starting AmCaresHealth Backend...');
const app = express();
const server = http.createServer(app);

console.log('📦 Loading models...');
// Initialize models & run sync
models;
console.log('✅ Models loaded.');

// ─── Global Middleware ────────────────────────────────────────
console.log('🛡️ Configuring middleware...');
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(apiRateLimit); // Global rate limiting

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

console.log('🛣️ Mounting routes...');
// ─── API v1 Routes (New modular structure) ────────────────────
app.use("/api/v1", require("./routes/v1"));

// ─── Legacy Routes (Backward compatibility for current frontend) ──
app.use("/", require("./routes/public.routes"));
app.use("/", require("./routes/private.routes"));
console.log('✅ Routes mounted.');

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    code: "NOT_FOUND",
  });
});

// ─── Global Error Handler (must be last) ─────────────────────
app.use(errorHandler);

// ─── Graceful Shutdown ───────────────────────────────────────
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Shutting down gracefully");
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`\n🏥 AmCaresHealth API Server`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   API v1:     http://localhost:${PORT}/api/v1`);
  console.log(`   Legacy:     http://localhost:${PORT} (backward compat)\n`);
});