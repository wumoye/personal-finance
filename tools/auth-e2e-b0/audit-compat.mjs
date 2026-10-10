import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const output = process.env.B0_AUDIT_REPORT_DIR || '/tmp/auth-b0-audit';
const expectedHead = 'b7e0d271d575577d1f5c74a3a66d7383aa74e793';
const report = {
  task: 'DEV-002',
  phase: 'B-0',
  testedHead: expectedHead,
  mode: 'ephemeral-no-secrets',
  baseline: {},
  candidate: {},
  recommendation: 'REVIEW_REQUIRED',
};
function run(command, args, timeout = 420000) {
  const r = spawnSync(command, args, { cwd, encoding: 'utf8', timeout, maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, CI: 'true', NEXT_TELEMETRY_DISABLED: '1' } });
  return { code: r.status, stdout: r.stdout || '', error: r.error?.code || null };
}
function audit(mode) {
  const args = ['audit', '--json', ...(mode === 'prod' ? ['--omit=dev'] : [])];
  const r = run('npm', args);
  let counts = null;
  try {
    const metadata = JSON.parse(r.stdout).metadata?.vulnerabilities;
    if (metadata) counts = {
      low: metadata.low, moderate: metadata.moderate, high: metadata.high,
      critical: metadata.critical, total: metadata.total,
    };
  } catch {}
  return { exitCode: r.code, counts, parsed: !!counts };
}
function step(name, command, args, timeout) {
  const r = run(command, args, timeout);
  return { name, exitCode: r.code, timeout: r.error === 'ETIMEDOUT' };
}
try {
  report.baseline.install = step('npm ci', 'npm', ['ci', '--no-fund', '--ignore-scripts']);
  if (report.baseline.install.exitCode !== 0) throw new Error('baseline install failed');
  report.baseline.auditAll = audit('all');
  report.baseline.auditProd = audit('prod');
  report.baseline.prisma = step('db validate', 'npm', ['run', 'db:validate']);
  report.candidate.strategy = 'same-parent-major-with-transitive-overrides';
  report.candidate.packages = ['deepmerge-ts@8.0.2', 'mysql2@3.24.5'];
  report.candidate.override = step('npm pkg set', 'npm', ['pkg', 'set', 'overrides.deepmerge-ts=8.0.2', 'overrides.mysql2=3.24.5']);
  report.candidate.install = step('npm install', 'npm', ['install', '--no-fund', '--ignore-scripts'], 420000);
  if (report.candidate.install.exitCode === 0) {
    report.candidate.auditAll = audit('all');
    report.candidate.auditProd = audit('prod');
    report.candidate.validate = step('prisma validate', 'npm', ['run', 'db:validate']);
    report.candidate.generate = step('prisma generate', 'npm', ['run', 'db:generate']);
    report.candidate.lint = step('lint', 'npm', ['run', 'lint']);
    report.candidate.test = step('test', 'npm', ['run', 'test']);
    report.candidate.build = step('build', 'npm', ['run', 'build'], 420000);
  }
} catch {
  report.recommendation = 'BLOCKED_REVIEW_REQUIRED';
} finally {
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, 'audit-compat-summary.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  console.log('B0 isolated audit completed; detailed raw output suppressed; inspect allowlisted summary artifact.');
}
