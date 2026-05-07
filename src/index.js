const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const { PORT } = require("../env");
const { models } = require("./models/index");

const app = express();
const server = http.createServer(app);

models;

app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

// Serve uploaded files as static assets
// Access photos via: http://localhost:<PORT>/uploads/photos/<filename>
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/", require("./routes/public.routes"));
app.use("/", require("./routes/private.routes"));

// Global error handler
app.use((err, req, res, next) => {
  // Handle multer file size errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB.",
    });
  }
  res.status(500).json({ success: false, message: err.message });
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Shutting down gracefully");
    process.exit(0);
  });
});

app.listen(PORT, () => console.log("Server running at port " + PORT));