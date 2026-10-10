import { spawnSync } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Deliberately independent of the app, Supabase SDK, credentials and sessions.
const require = createRequire(import.meta.url);
const expectedHost = 'kxikrmydgulnqierddun.supabase.co';
const output = path.resolve(
  process.env.INFRA_QA_OUTPUT || 'work/infra-qa-local',
);
const report = {
  task: 'INFRA-QA-001',
  phase: 'A',
  timestamp: new Date().toISOString(),
  head: /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA || '')
    ? process.env.GITHUB_SHA
    : null,
  environment:
    process.env.GITHUB_ACTIONS === 'true'
      ? 'github-hosted-ubuntu-24.04'
      : 'codex-local',
  node: process.version,
  npm: null,
  chromium: { status: 'BLOCKED', exitCode: 1 },
  network: { target: 'verified-supabase-dev-auth-health', status: 'BLOCKED' },
};
const npm = spawnSync('npm', ['--version'], { encoding: 'utf8' });
report.npm = {
  version: /^\d+\.\d+\.\d+$/.test(npm.stdout?.trim() || '')
    ? npm.stdout.trim()
    : null,
  exitCode: npm.status,
};
let browser;
try {
  const { chromium } = require('playwright');
  report.playwright = require('playwright/package.json').version;
  browser = await chromium.launch({ headless: true, timeout: 20000 });
  const page = await browser.newPage();
  await page.goto('about:blank', { timeout: 10000 });
  const pass =
    page.url() === 'about:blank' && (await page.evaluate(() => 1 + 1)) === 2;
  report.chromium = {
    status: pass ? 'PASS' : 'FAIL',
    exitCode: pass ? 0 : 1,
    version: browser.version(),
    page: 'about:blank',
  };
} catch (error) {
  // Only classified flags survive; never persist exception text or browser logs.
  const text = String(error.message);
  report.chromium = {
    status: 'BLOCKED',
    exitCode: 1,
    reason: /Executable doesn't exist/.test(text)
      ? 'browser-not-installed'
      : /Cannot find module/.test(text)
        ? 'playwright-not-installed'
        : /Operation not permitted|Permission denied/.test(text)
          ? 'runtime-permission-denied'
          : 'launch-or-navigation-failed',
  };
} finally {
  if (browser) await browser.close().catch(() => {});
}
let url;
try {
  url = new URL(process.env.INFRA_QA_DEV_URL || `https://${expectedHost}`);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== expectedHost ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !['', '/'].includes(url.pathname)
  )
    throw new Error('invalid-target');
} catch {
  report.network.reason = 'dev-url-validation-failed';
}
if (url && !report.network.reason) {
  try {
    await lookup(expectedHost);
    report.network.dns = 'PASS';
  } catch {
    report.network.dns = 'BLOCKED';
  }
  const result = spawnSync(
    'curl',
    [
      '--silent',
      '--show-error',
      '--output',
      '/dev/null',
      '--connect-timeout',
      '10',
      '--max-time',
      '20',
      '--write-out',
      '%{http_code} %{ssl_verify_result}',
      '--proto',
      '=https',
      `${url.origin}/auth/v1/health`,
    ],
    { encoding: 'utf8', timeout: 25000 },
  );
  const match = /^(\d{3}) (\d+)$/.exec(result.stdout || '');
  const http = match ? Number(match[1]) : 0;
  const exitCode = result.status;
  const reasons = {
    5: 'proxy-dns-failed',
    6: 'target-dns-failed',
    7: 'connection-failed',
    28: 'timeout',
    35: 'tls-handshake-failed',
    60: 'tls-certificate-failed',
    56: 'proxy-or-receive-failed',
  };
  report.network = {
    ...report.network,
    status: exitCode === 0 && http >= 100 && http < 600 ? 'PASS' : 'BLOCKED',
    httpStatus: http || null,
    curlExitCode: exitCode,
    proxyConfigured: Boolean(
      process.env.HTTPS_PROXY || process.env.https_proxy,
    ),
    tls:
      exitCode === 0 && http > 0
        ? 'PASS'
        : [35, 60].includes(exitCode)
          ? 'FAIL'
          : 'BLOCKED',
    reason:
      exitCode === 0
        ? http === 200
          ? 'health-ok'
          : 'http-reachable-without-credentials'
        : reasons[exitCode] || 'request-failed',
  };
}
report.result =
  report.chromium.status === 'PASS' &&
  report.network.status === 'PASS' &&
  report.npm.exitCode === 0
    ? 'PASS'
    : 'BLOCKED';
await mkdir(output, { recursive: true });
await writeFile(
  path.join(output, 'phase-a.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.result === 'PASS' ? 0 : 1;
