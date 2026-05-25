// ─────────────────────────────────────────────────────────
//  rules.js — 15 Supply-Chain Security Rules
//  Each rule reads DIRECTLY from nested input paths.
//  NO normalization. NO flattening. Just clean checks.
// ─────────────────────────────────────────────────────────

const rules = [

  // ── HIGH SEVERITY ──────────────────────────────────────

  {
    id: "SCTM-001",
    title: "Missing Dependency Lock File",
    severity: "High",
    remediation: "Generate a lock file with `npm install` or `yarn install` and commit it to version control.",
    check: (input) => {
      const deps = input.dependencies || {};
      if (!deps.lockfilePresent) {
        return "No lock file (package-lock.json / yarn.lock) was detected in the project.";
      }
      return null;
    }
  },

  {
    id: "SCTM-002",
    title: "Hardcoded Secrets Detected",
    severity: "High",
    remediation: "Remove all hardcoded secrets immediately. Migrate to a secrets manager like HashiCorp Vault or AWS Secrets Manager.",
    check: (input) => {
      const secrets = input.secretsExposure || {};
      if (secrets.hardcodedSecretsFound > 0) {
        return `${secrets.hardcodedSecretsFound} hardcoded secret(s) found in the codebase.`;
      }
      return null;
    }
  },

  {
    id: "SCTM-003",
    title: "Known Vulnerabilities in Dependencies",
    severity: "High",
    remediation: "Run `npm audit fix` or update vulnerable packages to their latest patched versions.",
    check: (input) => {
      const deps = input.dependencies || {};
      if (deps.knownVulnerabilities > 0) {
        return `${deps.knownVulnerabilities} known vulnerability(ies) detected in project dependencies.`;
      }
      return null;
    }
  },

  {
    id: "SCTM-004",
    title: "Insecure Secret Storage Method",
    severity: "High",
    remediation: "Migrate secrets to a dedicated secrets manager (e.g., HashiCorp Vault). Never store secrets in code or plain .env files in production.",
    check: (input) => {
      const secrets = input.secretsExposure || {};
      const insecure = ["hardcoded", "plaintext", ".env"];
      if (insecure.includes(secrets.storageMethod)) {
        return `Secrets are stored using an insecure method: "${secrets.storageMethod}".`;
      }
      return null;
    }
  },

  // ── MEDIUM SEVERITY ────────────────────────────────────

  {
    id: "SCTM-005",
    title: "MFA Not Enforced on Source Control",
    severity: "Medium",
    remediation: "Enforce multi-factor authentication for all contributors on your source control platform.",
    check: (input) => {
      const sc = input.sourceControl || {};
      if (!sc.mfaEnforced) {
        return "Multi-factor authentication is not enforced for repository access.";
      }
      return null;
    }
  },

  {
    id: "SCTM-006",
    title: "No Secrets Scanning in CI/CD",
    severity: "Medium",
    remediation: "Enable secrets scanning (e.g., GitHub secret scanning, GitLeaks) in your CI/CD pipeline.",
    check: (input) => {
      const ci = input.cicd || {};
      if (!ci.secretsScanning) {
        return "CI/CD pipeline does not include automated secrets scanning.";
      }
      return null;
    }
  },

  {
    id: "SCTM-007",
    title: "Dependency Versions Not Pinned",
    severity: "Medium",
    remediation: "Pin all dependencies to exact versions or narrow semver ranges to prevent supply-chain attacks via version hijacking.",
    check: (input) => {
      const deps = input.dependencies || {};
      if (!deps.pinnedVersions) {
        return "Dependencies are not pinned to specific versions, risking unexpected upstream changes.";
      }
      return null;
    }
  },

  {
    id: "SCTM-008",
    title: "Build Artifacts Not Signed",
    severity: "Medium",
    remediation: "Sign all build artifacts to ensure integrity and prevent tampering during distribution.",
    check: (input) => {
      const build = input.buildArtifacts || {};
      if (!build.artifactsSigned) {
        return "Build artifacts are not digitally signed, allowing potential tampering.";
      }
      return null;
    }
  },

  {
    id: "SCTM-009",
    title: "Public Registry Without Access Control",
    severity: "Medium",
    remediation: "Use a private registry with IAM-based access control, or enforce scoped access on your public registry.",
    check: (input) => {
      const reg = input.registry || {};
      if (reg.type === "public" && (!reg.accessControl || reg.accessControl === "none")) {
        return "Packages are published to a public registry with no access control.";
      }
      return null;
    }
  },

  {
    id: "SCTM-010",
    title: "No Secret Rotation Policy",
    severity: "Medium",
    remediation: "Implement an automated secret rotation policy with a maximum credential lifetime (e.g., 90 days).",
    check: (input) => {
      const secrets = input.secretsExposure || {};
      if (!secrets.rotationPolicy) {
        return "No secret rotation policy is in place — credentials may remain valid indefinitely.";
      }
      return null;
    }
  },

  {
    id: "SCTM-011",
    title: "No Deployment Approval Gate",
    severity: "Medium",
    remediation: "Require manual approval or peer review before deployments to production environments.",
    check: (input) => {
      const deploy = input.deployment || {};
      if (!deploy.manualApprovalRequired) {
        return "Production deployments do not require manual approval or peer review.";
      }
      return null;
    }
  },

  // ── LOW SEVERITY ───────────────────────────────────────

  {
    id: "SCTM-012",
    title: "No Branch Protection Rules",
    severity: "Low",
    remediation: "Enable branch protection on main/release branches requiring code review and passing status checks.",
    check: (input) => {
      const sc = input.sourceControl || {};
      if (!sc.branchProtection) {
        return "No branch protection rules are configured for the repository.";
      }
      return null;
    }
  },

  {
    id: "SCTM-013",
    title: "No CODEOWNERS File",
    severity: "Low",
    remediation: "Add a CODEOWNERS file to enforce mandatory review from designated owners for critical code paths.",
    check: (input) => {
      const sc = input.sourceControl || {};
      if (!sc.codeOwners) {
        return "No CODEOWNERS file found to enforce review ownership.";
      }
      return null;
    }
  },

  {
    id: "SCTM-014",
    title: "No Incident Response Plan",
    severity: "Low",
    remediation: "Document an incident response plan and conduct regular tabletop exercises with your team.",
    check: (input) => {
      const ir = input.incidentResponse || {};
      if (!ir.planDocumented) {
        return "No documented incident response plan exists for security events.";
      }
      return null;
    }
  },

  {
    id: "SCTM-015",
    title: "Unsigned Commits Allowed",
    severity: "Low",
    remediation: "Require GPG or SSH commit signing to verify the identity of all contributors.",
    check: (input) => {
      const sc = input.sourceControl || {};
      if (!sc.signedCommits) {
        return "Commits are not required to be signed, making author identity unverifiable.";
      }
      return null;
    }
  }

];

module.exports = rules;
