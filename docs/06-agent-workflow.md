# Multi-Agent Collaboration Workflow (MVP)

> Status: proposed via PR; effective after review and merge. This document supplements, but does not override, `AGENTS.md`, `docs/02-business-rules.md` or `docs/05-development-plan.md`.

## 1. System of record

- **GitHub Issues** are the authoritative record for each formal task: stable DEV-XXX identifier, scope, domain, dependencies, acceptance criteria, blockers, current status and final decision.
- **Pull Requests** are the authoritative record for code/document changes, exact HEAD SHA, checks and review. A PR is not proof of real-environment QA.
- **Project documents** are the authoritative specification for requirements, business rules, architecture, UI and development dependencies. If an Issue conflicts with an approved business rule, stop and escalate to 00.
- **ChatGPT conversations** are working interfaces, not the durable task ledger. Different chats cannot message or wake each other automatically.

## 2. Roles and routing

| Discussion | Responsibility | Write-back |
| --- | --- | --- |
| 00 Project Control | Create/prioritize/assign Issues, resolve dependencies, approve acceptance and merges | Issue decisions, state |
| 01 Requirements & Rules | Requirements and financial rules | Issue evidence and docs PR |
| 02 Architecture | Data models, interfaces, technical decisions | Issue evidence and architecture PR |
| 03 UI / Stitch | UI specifications and design review | Issue evidence, UI spec/design links |
| 04 Development / Codex | Implement scoped task, tests, PR | PR and Issue progress |
| 05 QA & Release | Independent testing, security audit, regression | QA comment on Issue and/or PR |

Domain labels describe responsibility; they are not GitHub user assignees. Assign actual GitHub accounts only when authorized and available. No chat is automatically triggered by an Issue update.

## 3. Task identity and records

- Preserve `DEV-001` ... `DEV-017` from `docs/05-development-plan.md`. GitHub `#123` is a separate transport ID, not a replacement.
- One DEV task = one primary Issue = one primary PR when implementation is needed; additional fix PRs link to the same Issue.
- Issue body contains stable scope, out-of-scope, dependency and acceptance criteria; comments contain timestamped progress, decisions, test evidence and blockers.
- Every report cites Issue number, PR URL, exact HEAD SHA, tested environment (without secrets), evidence and PASS/FAIL/BLOCKED. Do not publish passwords, tokens, cookies, secret/service-role keys or private financial data.
- PR descriptions should contain `Task: DEV-XXX` and `Tracking Issue: #N`. Do not use `Closes #N` for acceptance-gated tasks: merging must not automatically assert QA acceptance.
- Before acting, the receiving discussion reads the Issue, linked PR and relevant docs from GitHub. After work, it writes its results back to GitHub. The user only needs to open the relevant chat and provide an Issue URL/number.

## 4. Status model and governance

Use **exactly one** `status:*` label per active Issue; Issue open/closed is a separate lifecycle dimension.

| Status | Meaning |
| --- | --- |
| `status:backlog` | Recorded, not authorized to start |
| `status:ready` | Dependencies cleared and 00 authorizes start |
| `status:in-progress` | Work started |
| `status:in-review` | Implementation or QA evidence submitted; acceptance pending |
| `status:blocked` | Cannot proceed; comment records blocker, owner and resume condition |
| `status:done` | 00 explicitly accepted; required PR merged, Issue closed |

A blocked task resumes at the appropriate previous stage after the blocker is cleared. Failure is recorded in evidence; it does not automatically mean `status:done`.

Only 00 authorizes READY, final DONE, scope changes, merge approval and starting dependent DEV tasks. Developers and QA may report recommended status in comments, but status changes must reflect 00's decision. A GitHub label is not a technical authorization control; permissions and automation may be hardened later.

## 5. Minimum label taxonomy

Domain: `area:01`, `area:02`, `area:03`, `area:04`, `area:05` (00 is the control role).

Type: `type:feature`, `type:bug`, `type:qa`.

State: `status:backlog`, `status:ready`, `status:in-progress`, `status:in-review`, `status:blocked`, `status:done`.

Create these labels in the repository before applying them; do not assume they exist. The issue template does not itself provision labels.

## 6. Standard handoff

1. 00 checks the development plan and dependencies, creates Issue with scope, acceptance and status.
2. When prerequisites pass, 00 marks READY. User opens the relevant specialist chat and provides Issue link/number.
3. Specialist reads GitHub Issue/PR/docs; works only within approved scope; posts progress and blockers to Issue.
4. For code or document changes, create branch and PR, link Issue; CI runs on PR. Record exact HEAD and results.
5. 05 reads Issue/PR and tests independently; posts PASS/FAIL/BLOCKED with redacted evidence, untested cases and security findings.
6. 00 checks evidence, dependency gates and latest CI; either requests fixes or approves merge. After required merge and final acceptance, 00 marks DONE and closes Issue.
7. Dependent tasks remain blocked until 00 authorizes them.

## 7. Automation boundary

Already possible: GitHub-connected chats can read/write Issues and PRs when invoked; GitHub Actions can run lint/test/build on PR events. These do not automatically start another ChatGPT conversation.

Not enabled in MVP: Issue/PR label-sync Actions, automatic Codex dispatch, auto-merge, auto-close and production database actions. Investigate these separately with permission and idempotency reviews; any automatic sync must use exact PR HEAD, avoid duplicate comments and never mark DONE from CI success alone.

## 8. DEV-002 pilot and rollout

Pilot with a single DEV-002 Issue linked to existing PR #3. Preserve current state: basic real Supabase authentication reported PASS, but actual expired-access-token refresh and invalid/revoked refresh-token denial remain unverified; 9 npm audit findings (4 excluding dev dependencies) require itemized exploitability assessment and any necessary fixes. PR #3 remains open, DEV-003 remains unauthorized. This workflow PR does not modify that PR.

Do not backfill all DEV tasks. Create DEV-003/004 Issues only after the pilot is accepted and dependency gates are satisfied. Existing DEV-001 history stays in PR #2.
