# INFRA-QA-001 Phase A

Tracking Issue: #6. This isolated runner checks Chromium `about:blank` and a
credential-free GET to the independently approved Supabase DEV Auth health.
It never starts the application, signs in, creates sessions, or accesses data.

## Run and evidence

- Workflow: `.github/workflows/infra-qa-phase-a.yml`.
- Runner: GitHub-hosted Ubuntu 24.04, Node 24.19.0, Playwright 1.62.1.
- Install: `npm ci --ignore-scripts --prefix tools/infra-qa`, then
  `cd tools/infra-qa && npx --no-install playwright install --with-deps chromium`.
- Execute from repository root: `node tools/infra-qa/phase-a.mjs`.
- Optional `INFRA_QA_OUTPUT` selects a report directory; default is
  `work/infra-qa-local`. Keep generated reports out of commits.
- Optional `INFRA_QA_DEV_URL` is accepted only when it exactly matches the
  approved HTTPS DEV origin. Other origins, credentials, paths and query strings
  fail closed. No production URL or arbitrary dispatch input is accepted.
- Artifact: only `phase-a.json`, retained for seven days. It contains versions,
  exact CI HEAD, timestamp, status, exit codes and classified failures. No raw
  errors, response bodies, IP addresses, headers or environment dumps are saved.
- DNS is a separate local resolver observation; the HTTP proxy may resolve the
  target independently. TLS PASS requires a verified HTTPS response. HTTP 200
  indicates healthy service; other HTTP responses (including credential-free 401) establish network reachability only and do not establish Auth health.
  No HTTP response is BLOCKED and recorded as `httpStatus: null`.

## Trigger and safety boundaries

Manual dispatch is provided but GitHub requires the workflow to exist on the
default branch before dispatch becomes available. To obtain real evidence before
any merge, the bootstrap push trigger matches only
`infra/infra-qa-001-phase-a`, only infrastructure paths, and only the original
repository. There is no PR or fork trigger, no Secrets input and no automatic
merge/close. After the workflow is merged into the default branch, a manual
`workflow_dispatch` on `main` is authorized; the bootstrap `push` remains allowed
only on `infra/infra-qa-001-phase-a` with the original path filters. The job
requires the exact repository name and matching event/ref pair. No other branch,
PR or fork is authorized. A pre-merge push run cannot prove main dispatch works:
05 and 00 must verify a non-skipped main dispatch after authorized merge.

Actions use fixed commit SHAs, checkout does not persist credentials, and the job
has only `contents: read`, a ten-minute timeout and serialized branch execution.
Browser installation is pinned by the isolated lockfile; business dependencies
and the existing required CI remain untouched. GitHub step logs provide installer
exit results; the structured report covers the runtime probes even if an earlier
installation step fails. A missing artifact is a blocker, never a PASS.

05 must independently review the exact HEAD, run and artifact. 00 retains merge,
acceptance and Phase B authorization. AUTH-04/05, PR #3 and DEV-003 remain outside
this runner's scope. Do not upload `.env`, HAR, storageState, browser profiles,
credentials, cookies, tokens or financial data.
