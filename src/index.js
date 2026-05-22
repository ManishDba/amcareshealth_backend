const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const timeout = require("connect-timeout");

const Logger = require("./lib/logger");

const { PORT } = require("../env");
const { models, sequelize } = require("./models/index");
const errorHandler = require("./middleware/errorHandler.middleware");
const { apiRateLimit } = require("./middleware/rateLimit.middleware");

console.log('🏁 Starting AmCaresHealth Backend...');
const app = express();
const server = http.createServer(app);

console.log('📦 Loading models...');
// Initialize models & connection in background (non-blocking)
// authenticateApp() does its own logging and will not block server start.
sequelize.authenticateApp();
Logger.info('Database authenticate initiated (background).');



// ─── Global Middleware ────────────────────────────────────────
console.log('🛡️ Configuring middleware...');

// Lightweight health endpoint should be mounted BEFORE heavy middleware
// to avoid unnecessary work (no DB calls, no body parsing, etc.).
let healthCache = { value: { status: "ok" }, ts: 0, ttl: 30 * 1000 };
app.get('/health', (req, res) => {
  const now = Date.now();
  if (now - healthCache.ts < healthCache.ttl) {
    res.setHeader('Connection', 'keep-alive');
    return res.json(healthCache.value);
  }
  // No DB access here; just lightweight response and cache update
  healthCache.ts = now;
  healthCache.value = { status: 'ok' };
  res.setHeader('Connection', 'keep-alive');
  res.json(healthCache.value);
});

// Compression should be early
app.use(compression());
app.use(cors({ origin: "*" }));
app.use(helmet());
// Apply a global request timeout (express middleware)
app.use(timeout('30s'));
// JSON/body parsing for routes that need it
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(apiRateLimit); // Global rate limiting (enable selectively)

// Timeout handler middleware: if a request times out, end early.
app.use((req, res, next) => {
  if (req.timedout) return;
  // set keep-alive header by default for clients that respect it
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

console.log('🛣️ Mounting routes...');
// ─── API v1 Routes (New modular structure) ────────────────────
app.use("/api/v1", require("./routes/v1"));

// ─── Legacy Routes (Backward compatibility for current frontend) ──
app.use("/", require("./routes/public.routes"));
app.use("/", require("./routes/private.routes"));

// Health check and Route listing for deployment debugging
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "UP", 
    timestamp: new Date().toISOString(),
    service: "AmCaresHealth API"
  });
});

app.get("/api/debug-routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push(`${Object.keys(handler.route.methods)} ${handler.route.path}`);
        }
      });
    }
  });
  res.json({ success: true, routes });
});

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

// Tune server keep-alive to reduce connection churn on platforms like Render
server.keepAliveTimeout = 60 * 1000; // 60s
// headersTimeout should be slightly larger than keepAliveTimeout
server.headersTimeout = 65 * 1000; // 65s

// Start server
server.listen(PORT, () => {
  Logger.info('AmCaresHealth API Server started', {
    port: PORT,
    apiV1: `/api/v1`,
  });
  console.log(`\n🏥 AmCaresHealth API Server`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   API v1:     http://localhost:${PORT}/api/v1`);
  console.log(`   Legacy:     http://localhost:${PORT} (backward compat)\n`);
});