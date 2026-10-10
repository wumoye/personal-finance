# DEV-002 Phase B-0 — no-credentials smoke

Tracking Issue: #4; authorized by comment #6093526273. This test does **not** exercise AUTH-04/05, sign-in, sessions, tokens or DEV accounts. No Secrets or GitHub Environment are referenced.

Workflow: `.github/workflows/auth-e2e-b0.yml`. It runs on a scoped bootstrap push from `infra/dev002-phase-b0`; once accepted into main, main manual dispatch can run. The checked-out code is the workflow's exact `github.sha`. No arbitrary PR SHA, external ref or dispatch input is accepted.

The only installed Playwright dependencies are from `tools/infra-qa/package-lock.json` (already approved for Phase A). The smoke loads Chromium and evaluates an expression in `about:blank`; it does not use the network or test credentials. A production AUTH-04/05 flow would require a **separate** written 00 authorization and a distinct trusted workflow/checkout design. Never add Secrets to this workflow or load code from PR #3 under credentials.

Artifact is only `b0-summary.json`, 7 day retention, with schema-validated metadata. No request/response data, HAR, traces, screenshots, JWT, email, Cookie values, env dump or browser profile. QA must independently verify SHA-256, schema, exact HEAD and non-skipped job. A B-0 smoke PASS is not Phase B-1 authorization.

To check schema without browsers: `node tools/auth-e2e-b0/check-boundary.mjs` and `node tools/auth-e2e-b0/check-evidence.mjs` after running smoke. The report is intentionally not checked into Git.

## Ephemeral dependency trial

The companion `.github/workflows/auth-b0-dependencies.yml` checks out PR #3 at the explicitly pinned `b7e0d271d575577d1f5c74a3a66d7383aa74e793` in a sibling `auth-snapshot/` directory, without credentials, and evaluates candidate transitive overrides (`deepmerge-ts@8.0.2`, `mysql2@3.24.5`) only inside the disposable runner. It never commits lockfile or dependency changes. `audit-compat-summary.json` contains only command exit codes and aggregate vulnerability counts, not raw npm output. Candidate success is not a production compatibility approval: 00 and 05 must decide whether to proceed.

Final review requires the same exact B-0 HEAD to pass its own smoke, isolated audit assessment and unchanged repository CI. No candidate override is approved for feature/auth by a smoke result.
