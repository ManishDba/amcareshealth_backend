const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Bare minimum server is running" });
});

app.listen(5000, () => {
  console.log("Bare minimum server on 5000");
});
