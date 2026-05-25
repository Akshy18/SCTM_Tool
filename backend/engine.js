// ─────────────────────────────────────────────────────────
//  engine.js — Core Threat-Modeling Scan Engine
//  Takes the RAW nested JSON, evaluates every rule, and
//  returns a sorted report with a cumulative risk score.
//  NO normalization. NO flattening. Just scan.
// ─────────────────────────────────────────────────────────

const rules = require("./rules");

const SEVERITY_ORDER  = { High: 0, Medium: 1, Low: 2 };
const SEVERITY_WEIGHT = { High: 10, Medium: 5, Low: 2 };

const runScan = (input) => {
  const findings = [];
  let totalScore = 0;

  // Evaluate each rule against the raw input
  for (const rule of rules) {
    const evidence = rule.check(input);

    if (evidence !== null) {
      findings.push({
        id: rule.id,
        title: rule.title,
        severity: rule.severity,
        evidence,
        remediation: rule.remediation
      });
      totalScore += SEVERITY_WEIGHT[rule.severity] || 0;
    }
  }

  // CRITICAL: sort by severity — High first, then Medium, then Low
  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  // Max possible score from all 15 rules
  const maxScore = rules.reduce((sum, r) => sum + (SEVERITY_WEIGHT[r.severity] || 0), 0);

  return {
    projectName: input.projectName || "Unknown Project",
    scannedAt: new Date().toISOString(),
    totalFindings: findings.length,
    riskScore: totalScore,
    maxPossibleScore: maxScore,
    findings
  };
};

module.exports = { runScan };
