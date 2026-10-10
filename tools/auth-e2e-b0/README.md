# DEV-002 Phase B-0 — no-credentials smoke

Tracking Issue: #4; authorized by comment #6093526273. This test does **not** exercise AUTH-04/05, sign-in, sessions, tokens or DEV accounts. No Secrets or GitHub Environment are referenced.

Workflow: `.github/workflows/auth-e2e-b0.yml`. It runs on a scoped bootstrap push from `infra/dev002-phase-b0`; once accepted into main, main manual dispatch can run. The checked-out code is the workflow's exact `github.sha`. No arbitrary PR SHA, external ref or dispatch input is accepted.

The only installed Playwright dependencies are from `tools/infra-qa/package-lock.json` (already approved for Phase A). The smoke loads Chromium and evaluates an expression in `about:blank`; it does not use the network or test credentials. A production AUTH-04/05 flow would require a **separate** written 00 authorization and a distinct trusted workflow/checkout design. Never add Secrets to this workflow or load code from PR #3 under credentials.

Artifact is only `b0-summary.json`, 7 day retention, with schema-validated metadata. No request/response data, HAR, traces, screenshots, JWT, email, Cookie values, env dump or browser profile. QA must independently verify SHA-256, schema, exact HEAD and non-skipped job. A B-0 smoke PASS is not Phase B-1 authorization.

To check schema without browsers: `node tools/auth-e2e-b0/check-boundary.mjs` and `node tools/auth-e2e-b0/check-evidence.mjs` after running smoke. The report is intentionally not checked into Git.
