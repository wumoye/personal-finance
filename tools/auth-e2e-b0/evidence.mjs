import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const allowedKeys = Object.freeze([
  'task', 'phase', 'timestamp', 'head', 'event', 'ref',
  'node', 'chromium', 'smoke', 'result',
]);
const safe = /^[a-zA-Z0-9_.:/+-]{1,140}$/;
export function assertEvidence(data) {
  const keys = Object.keys(data).sort();
  if (keys.join('|') !== [...allowedKeys].sort().join('|')) throw new Error('Evidence schema mismatch');
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string' || !safe.test(value)) throw new Error('Unsafe evidence field: ' + key);
  }
  if (!['PASS', 'FAIL', 'BLOCKED'].includes(data.result)) throw new Error('Unknown result');
  if (!/^[0-9a-f]{40}$/.test(data.head)) throw new Error('Expected exact commit SHA');
  if (data.phase !== 'B-0' || data.task !== 'DEV-002') throw new Error('Unexpected scope');
  return data;
}
export function writeEvidence(directory, data) {
  mkdirSync(directory, { recursive: true });
  const clean = assertEvidence(data);
  writeFileSync(join(directory, 'b0-summary.json'), JSON.stringify(clean, null, 2) + '\n', { mode: 0o600 });
}
