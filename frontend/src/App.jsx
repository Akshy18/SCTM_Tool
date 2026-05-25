import { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

const API_URL = "http://localhost:4000/api/scan";

function App() {
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");

  // ── File handling ───────────────────────────────────────

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setLoading(true);
    setReport(null);
    setFilter("All");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);

        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json)
        })
          .then((res) =>
            res.json().then((data) => {
              if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
              return data;
            })
          )
          .then((data) => {
            setReport(data);
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message || "Failed to reach the API server. Is the backend running on port 4000?");
            setLoading(false);
          });
      } catch {
        setError("Invalid JSON — could not parse the uploaded file.");
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e) => processFile(e.target.files[0]);

  // ── Helpers ─────────────────────────────────────────────

  const getFiltered = () => {
    if (!report) return [];
    if (filter === "All") return report.findings;
    return report.findings.filter((f) => f.severity === filter);
  };

  const countSeverity = (sev) => {
    if (!report) return 0;
    return report.findings.filter((f) => f.severity === sev).length;
  };

  const riskMeta = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 60) return { label: "Critical", cls: "critical" };
    if (pct >= 35) return { label: "Elevated", cls: "elevated" };
    return { label: "Low", cls: "low-risk" };
  };

  const resetScan = () => {
    setReport(null);
    setFileName("");
    setError(null);
    setFilter("All");
  };

  // ── Derived state ───────────────────────────────────────

  const findings = getFiltered();
  const risk = report ? riskMeta(report.riskScore, report.maxPossibleScore) : null;
  const pct = report ? Math.round((report.riskScore / report.maxPossibleScore) * 100) : 0;
  const circumference = 2 * Math.PI * 52;

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="app">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={resetScan} style={{ cursor: "pointer" }}>
            <span className="logo-diamond">◆</span>
            <h1>SCTM</h1>
          </div>
          <p className="tagline">Supply Chain Threat Modeler</p>
        </div>
      </header>

      <main className="main">

        {/* ── Upload screen ─────────────────────────────── */}
        {!report && !loading && (
          <section className="upload-section">
            <div className="upload-card">
              <div className="upload-glow"></div>
              <div className="upload-icon">
                <FiUploadCloud size={52} />
              </div>
              <h2>Upload Project Manifest</h2>
              <p className="upload-hint">
                Select your JSON configuration file below to analyze the project.
              </p>
              <label className="upload-btn" htmlFor="file-input">
                <span className="btn-icon">↑</span> Choose .json File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="file-input-hidden"
              />
              {error && <p className="error-msg">{error}</p>}
            </div>
          </section>
        )}

        {/* ── Loading spinner ───────────────────────────── */}
        {loading && (
          <section className="loading-section">
            <div className="spinner"></div>
            <p className="loading-text">
              Analyzing <strong>{fileName}</strong> …
            </p>
          </section>
        )}

        {/* ── Dashboard ─────────────────────────────────── */}
        {report && (
          <section className="dashboard">

            {/* Top bar */}
            <div className="dash-topbar">
              <div className="project-meta">
                <h2 className="project-name">{report.projectName}</h2>
                <span className="scan-time">
                  Scanned {new Date(report.scannedAt).toLocaleString()}
                </span>
              </div>
              <button className="new-scan-btn" onClick={resetScan}>
                ← New Scan
              </button>
            </div>

            {/* Score panel */}
            <div className="score-panel">
              <div className="score-ring-wrap">
                <svg className="score-ring" viewBox="0 0 120 120">
                  <circle className="ring-bg" cx="60" cy="60" r="52" />
                  <circle
                    className={"ring-fill " + risk.cls}
                    cx="60" cy="60" r="52"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: circumference * (1 - pct / 100)
                    }}
                  />
                </svg>
                <div className="score-center">
                  <span className="score-num">{report.riskScore}</span>
                  <span className="score-denom">/ {report.maxPossibleScore}</span>
                </div>
              </div>
              <div className="score-info">
                <span className={"risk-badge " + risk.cls}>{risk.label} Risk</span>
                <p className="score-subtitle">
                  {report.totalFindings} finding{report.totalFindings !== 1 ? "s" : ""} detected across 15 rules
                </p>
              </div>
            </div>

            {/* Severity stat cards */}
            <div className="stat-row">
              <div className="stat-card high">
                <span className="stat-num">{countSeverity("High")}</span>
                <span className="stat-lbl">High</span>
              </div>
              <div className="stat-card medium">
                <span className="stat-num">{countSeverity("Medium")}</span>
                <span className="stat-lbl">Medium</span>
              </div>
              <div className="stat-card low">
                <span className="stat-num">{countSeverity("Low")}</span>
                <span className="stat-lbl">Low</span>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="filters" id="severity-filters">
              {["All", "High", "Medium", "Low"].map((level) => (
                <button
                  key={level}
                  id={"filter-" + level.toLowerCase()}
                  className={
                    "filter-btn" +
                    (filter === level ? " active" : "") +
                    (level !== "All" ? " sev-" + level.toLowerCase() : "")
                  }
                  onClick={() => setFilter(level)}
                >
                  {level}
                  <span className="filter-count">
                    {level === "All" ? report.totalFindings : countSeverity(level)}
                  </span>
                </button>
              ))}
            </div>

            {/* Findings list */}
            <div className="findings-list">
              {findings.length === 0 && (
                <div className="empty-state">
                  <span className="empty-check">✓</span>
                  <p>No {filter.toLowerCase()} severity findings detected.</p>
                </div>
              )}

              {findings.map((f, i) => (
                <article
                  key={f.id}
                  className="finding-card"
                  style={{ animationDelay: i * 0.04 + "s" }}
                >
                  <div className="card-top">
                    <span className={"sev-pill " + f.severity.toLowerCase()}>
                      {f.severity}
                    </span>
                    <span className="card-id">{f.id}</span>
                  </div>
                  <h3 className="card-title">{f.title}</h3>
                  <div className="card-body">
                    <div className="card-section">
                      <span className="section-tag evidence-tag">Evidence</span>
                      <p>{f.evidence}</p>
                    </div>
                    <div className="card-section">
                      <span className="section-tag remediation-tag">Remediation</span>
                      <p>{f.remediation}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
