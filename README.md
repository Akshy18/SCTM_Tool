# SCTM Tool — Supply Chain Threat Modeler

A proof-of-concept tool that scans a JSON project profile against 15 supply-chain security rules and returns a prioritised risk report.

---

## Stack

| Layer    | Tech              |
| -------- | ----------------- |
| Backend  | Node.js + Express |
| Frontend | React 18 + Vite   |
| Database | None              |

---

## How to Run

**Backend** (port 4000):
```bash
cd backend
npm install
npm start
```

**Frontend** (port 3000):
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

---

## Using the Tool

**Upload a file:** Click "Choose .json File" and select any `.json` profile that matches the schema below.

**Quick test:** Use the three sample buttons on the upload screen — 🟢 Low Risk, 🟡 Medium Risk, 🔴 High Risk.

---

## Input Format

The tool accepts a **nested JSON object**. The rules read directly from nested category paths — a flat object will not trigger most rules.

```json
{
  "projectName": "My Project",
  "sourceControl": {
    "mfaEnforced": false,
    "branchProtection": false,
    "signedCommits": false,
    "codeOwners": false
  },
  "dependencies": {
    "lockfilePresent": false,
    "pinnedVersions": false,
    "knownVulnerabilities": 0,
    "sbomGenerated": false
  },
  "cicd": {
    "secretsScanning": false,
    "pipelineAsCode": false
  },
  "buildArtifacts": {
    "artifactsSigned": false
  },
  "registry": {
    "type": "public",
    "accessControl": "none"
  },
  "deployment": {
    "manualApprovalRequired": false
  },
  "secretsExposure": {
    "storageMethod": "hardcoded",
    "rotationPolicy": false,
    "hardcodedSecretsFound": 0
  },
  "incidentResponse": {
    "planDocumented": false
  }
}
```

---

## Rules & Scoring

| ID       | Rule                                   | Severity | Points |
| -------- | -------------------------------------- | -------- | ------ |
| SCTM-001 | Missing Dependency Lock File           | High     | 10     |
| SCTM-002 | Hardcoded Secrets Detected             | High     | 10     |
| SCTM-003 | Known Vulnerabilities in Dependencies  | High     | 10     |
| SCTM-004 | Insecure Secret Storage Method         | High     | 10     |
| SCTM-005 | MFA Not Enforced on Source Control     | Medium   | 5      |
| SCTM-006 | No Secrets Scanning in CI/CD           | Medium   | 5      |
| SCTM-007 | Dependency Versions Not Pinned         | Medium   | 5      |
| SCTM-008 | Build Artifacts Not Signed             | Medium   | 5      |
| SCTM-009 | Public Registry Without Access Control | Medium   | 5      |
| SCTM-010 | No Secret Rotation Policy              | Medium   | 5      |
| SCTM-011 | No Deployment Approval Gate            | Medium   | 5      |
| SCTM-012 | No Branch Protection Rules             | Low      | 2      |
| SCTM-013 | No CODEOWNERS File                     | Low      | 2      |
| SCTM-014 | No Incident Response Plan              | Low      | 2      |
| SCTM-015 | Unsigned Commits Allowed               | Low      | 2      |

**Maximum score: 83.** Findings are always returned sorted High → Medium → Low.

---

## Known Limitations

- **Nested JSON only.** The rules read from category sub-objects (`sourceControl`, `dependencies`, etc.). Passing a flat object will cause most rules to silently pass because the expected keys won't be found.
- **Manual upload only.** There is no live Git or webhook integration. You must upload a JSON file manually each time.
- **No persistence.** Scan results are in-memory only. Refreshing the page clears them.
- **No authentication.** The API has no auth layer — suitable for local use only.
- **Hard-coded rules.** The 15 rules cannot be added to, removed, or modified from the UI.
- **One file at a time.** Batch or directory scanning is not supported.
