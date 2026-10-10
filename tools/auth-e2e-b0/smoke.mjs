import { chromium } from '../infra-qa/node_modules/playwright/index.mjs';
import { writeEvidence } from './evidence.mjs';

const data = {
  task: 'DEV-002',
  phase: 'B-0',
  timestamp: new Date().toISOString(),
  head: process.env.EXPECTED_HEAD || '0000000000000000000000000000000000000000',
  event: process.env.GITHUB_EVENT_NAME || 'local',
  ref: process.env.GITHUB_REF || 'local',
  node: process.version,
  chromium: 'not-started',
  smoke: 'not-run',
  result: 'FAIL',
};
let browser;
try {
  browser = await chromium.launch({ headless: true });
  data.chromium = browser.version();
  const page = await browser.newPage();
  await page.goto('about:blank');
  if ((await page.evaluate(() => 6 * 7)) !== 42)
    throw new Error('Smoke failed');
  data.smoke = 'about:blank';
  data.result = 'PASS';
  console.log('B0 Chromium about:blank smoke: PASS');
} catch {
  data.result = 'BLOCKED';
  console.error('B0 Chromium about:blank smoke: BLOCKED');
  process.exitCode = 1;
} finally {
  await browser?.close();
  writeEvidence(process.env.B0_REPORT_DIR || 'work/auth-b0-local', data);
}
