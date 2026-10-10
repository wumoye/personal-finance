import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertEvidence } from './evidence.mjs';

const p = join(
  process.env.B0_REPORT_DIR || 'work/auth-b0-local',
  'b0-summary.json',
);
const data = JSON.parse(readFileSync(p, 'utf8'));
assertEvidence(data);
console.log('B0 allowlisted evidence schema: PASS');
