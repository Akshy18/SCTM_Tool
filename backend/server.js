// ─────────────────────────────────────────────────────────
//  server.js — Express API for the SCTM Tool
//  Single endpoint: POST /api/scan
// ─────────────────────────────────────────────────────────

const express = require("express");
const cors = require("cors");
const { runScan } = require("./engine");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// POST /api/scan — accepts a nested JSON profile, returns the threat report
app.post("/api/scan", (req, res) => {
  const input = req.body;

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object." });
  }

  try {
    const report = runScan(input);
    return res.json(report);
  } catch (err) {
    console.error("Scan error:", err.message);
    return res.status(500).json({ error: "Scan failed: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SCTM API server running on http://localhost:${PORT}`);
});
