# SCTM Tool — Supply Chain Threat Modeler

A proof-of-concept (POC) tool that scans project manifest files for supply-chain security risks, scores them by severity, and presents an interactive threat report.

---

## 📋 Project Overview

Modern software projects pull in dozens — sometimes hundreds — of third-party dependencies, each one a potential attack vector. The **SCTM Tool** evaluates a project's configuration against **15 supply-chain security rules** and produces a prioritized risk report with actionable remediation guidance.

This POC is intentionally lightweight: no database, no auth, no build pipeline. It is designed to validate the core concept before investing in production infrastructure.

---

## 🏗️ Architecture

```
┌──────────────────────┐         HTTP POST         ┌──────────────────────┐
│                      │    /api/scan (JSON body)   │                      │
│   React Frontend     │ ────────────────────────▶  │   Express Backend    │
│   (Vite, port 3000)  │                            │   (Node.js, port 4000)│
│                      │ ◀──────────────────────── │                      │
│  • File upload (JSON)│    JSON threat report       │  • 15 security rules │
│  • Risk dashboard    │    (sorted by severity)     │  • Scoring engine    │
│  • Severity filters  │                            │  • Severity sort     │
│  • Finding cards     │                            │                      │
└──────────────────────┘                            └──────────────────────┘
```

| Layer    | Tech              | Purpose                                        |
| -------- | ----------------- | ---------------------------------------------- |
| Frontend | React 18 + Vite 5 | Upload JSON files, render interactive dashboard |
| Backend  | Node.js + Express | Evaluate rules, compute risk score, return JSON |
| Styling  | Vanilla CSS       | Custom dark-mode UI with animations             |
| Database | —                 | None (stateless, no persistence)                |

---

## 🚀 How to Run

### Prerequisites

- **Node.js** ≥ 18 LTS
- **npm** ≥ 9

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

The API server will start on **http://localhost:4000**.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server will start on **http://localhost:3000**.

### 3. Run a Scan

1. Open **http://localhost:3000** in your browser.
2. Upload a JSON manifest file (a `sample-input.json` is provided in the project root).
3. Review the threat report — findings are sorted **High → Medium → Low**.
4. Use the severity toggle buttons to filter the results.

---

## 📁 Project Structure

```
SCTM_Tool/
├── backend/
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Express API (POST /api/scan)
│   ├── engine.js           # Core scan engine
│   └── rules.js            # 15 supply-chain security rules
├── frontend/
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── index.html          # HTML entry point
│   └── src/
│       ├── main.jsx        # React mount point
│       ├── App.jsx         # Main application component
│       └── App.css         # Custom dark-mode styles
├── sample-input.json       # Example input for testing
└── README.md               # This file
```

---

## 🔍 The 15 Security Rules

| ID        | Rule                            | Severity |
| --------- | ------------------------------- | -------- |
| SCTM-001  | Missing Lock File               | High     |
| SCTM-002  | Wildcard Dependency Versions    | High     |
| SCTM-003  | Suspicious Lifecycle Scripts    | High     |
| SCTM-004  | No Package Integrity Verification | High   |
| SCTM-005  | Untrusted Package Registry      | Medium   |
| SCTM-006  | Dependencies Pinned to 'latest' | Medium   |
| SCTM-007  | Outdated Runtime Version        | Medium   |
| SCTM-008  | No Security Policy              | Medium   |
| SCTM-009  | Missing License Declaration     | Medium   |
| SCTM-010  | No CI/CD Pipeline               | Medium   |
| SCTM-011  | Excessive Dependency Count      | Medium   |
| SCTM-012  | No Branch Protection Rules      | Low      |
| SCTM-013  | No CODEOWNERS File              | Low      |
| SCTM-014  | Package Visibility Risk         | Low      |
| SCTM-015  | No Code Signing                 | Low      |

### Scoring

- **High** → 10 points each
- **Medium** → 5 points each
- **Low** → 2 points each
- **Maximum possible score** → 83

---

## ⚠️ Known Limitations

1. **Manual JSON Upload Only** — The tool relies on manually uploading JSON files. It does not connect to live Git repositories or webhooks.
2. **No Database** — Scan results are not persisted. Refreshing the page clears the current report.
3. **Static Rule Set** — The 15 rules are hard-coded. There is no mechanism for users to add, edit, or disable rules at runtime.
4. **No Authentication** — The API is open and unauthenticated. This is acceptable for a local POC but not for production.
5. **Single-File Input** — The tool scans one manifest at a time. It does not support batch or directory scanning.

---

## 🗺️ Future Roadmap

| Phase | Feature                            | Description                                                              |
| ----- | ---------------------------------- | ------------------------------------------------------------------------ |
| v1.1  | **Git Webhook Integration**        | Accept `push` events from GitHub/GitLab and auto-scan the repository     |
| v1.2  | **Database Persistence**           | Store scan history in MongoDB for trend analysis and audit logs          |
| v1.3  | **Custom Rule Builder**            | Let users define and toggle custom rules through the UI                  |
| v2.0  | **SBOM Parsing**                   | Parse CycloneDX / SPDX SBOMs in addition to custom JSON manifests       |
| v2.1  | **CI/CD Plugin**                   | Publish as a GitHub Action / GitLab CI template for pipeline integration |
| v2.2  | **Team Dashboard & Auth**          | Multi-user support with role-based access and organization-level views   |
| v3.0  | **Dependency Graph Visualization** | Interactive graph showing transitive dependency chains and risk clusters |

---

## 📝 License

This project is a Proof of Concept and is provided as-is for educational and evaluation purposes.
