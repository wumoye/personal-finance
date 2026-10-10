import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
const dir = resolve(process.env.AB_EVIDENCE_DIR || '/tmp/dev002-ab-evidence');
const baseline = 'b7e0d271d575577d1f5c74a3a66d7383aa74e793';
const sha = /^[a-f0-9]{40}$/;
const top = new Set([
  'task',
  'phase',
  'sourceHead',
  'workflowHead',
  'event',
  'node',
  'cases',
  'result',
  'upstream',
  'behaviorComparison',
  'lockfileDiff',
  'registryExpansion',
  'lockExplanation',
  'mysqlDependencyContracts',
  'internalAndCli',
  'lintRemediation',
]);
const prohibited =
  /(password|passwd|credential|secret|authorization|access[_-]?token|refresh[_-]?token|cookie|api[_-]?key|private[_-]?key|service[_-]?role|bearer|storageState|\.env(?:\b|\/)|database[_-]?url|direct[_-]?url|HAR[_-]?archive)/i;
const allowed = new Set([
  'task',
  'phase',
  'sourceHead',
  'workflowHead',
  'event',
  'node',
  'cases',
  'result',
  'upstream',
  'behaviorComparison',
  'lockfileDiff',
  'registryExpansion',
  'lockExplanation',
  'mysqlDependencyContracts',
  'internalAndCli',
  'lintRemediation',
  'label',
  'reason',
  'setup',
  'cleanCi',
  'lockfile',
  'tree',
  'explain',
  'auditAll',
  'auditProd',
  'behavior',
  'prismaValidate',
  'prismaGenerate',
  'lint',
  'typecheck',
  'test',
  'build',
  'provider',
  'packages',
  'sha256',
  'lockfileVersion',
  'version',
  'resolved',
  'integrity',
  'exit',
  'error',
  'output',
  'stderr',
  'counts',
  'nodes',
  'advisories',
  'errorType',
  'name',
  'location',
  'dependents',
  'type',
  'invalid',
  'paths',
  'data',
  'configImport',
  'mysqlLoad',
  'mysqlType',
  'status',
  'ok',
  'keys',
  'schema',
  'migrations',
  'datasourceHasUrl',
  'registryExit',
  'versionsInspected',
  'eligible',
  'contract',
  'prisma',
  'config',
  'deepmerge',
  'mysql',
  'baselineVsA',
  'baselineVsB',
  'before',
  'after',
  'path',
  'queriedAtUtc',
  'prismaVersionQuery',
  'clientVersionQuery',
  'versionsListed',
  'versionsChecked',
  'queryFailures',
  'contracts',
  'conclusion',
  'clientPublished',
  'mysql2',
  'deepmerge',
  'prismaQuery',
  'configQuery',
  'cause',
  'oldVersion',
  'newVersion',
  'oldResolved',
  'newResolved',
  'oldIntegrity',
  'newIntegrity',
  'oldDependencies',
  'newDependencies',
  'metadataChanged',
  'internal',
  'cli',
  'parity',
  'scope',
  'valid',
  'missing',
  'wrong',
  'nested',
  'arrays',
  'undefined',
  'error-path',
  'invalid',
  'category',
  'observedNodes',
  'registryCheckedAtUtc',
  'queryExit',
  'versions',
  'before',
  'after',
  'status',
  'upstream',
  'candidate',
  'low',
  'moderate',
  'high',
  'critical',
  'total',
  'info',
  'spec',
  'raw',
  'requested',
  'current',
  'deprecated',
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
  'devDependencies',
  'engine',
  'requires',
  'found',
  'to',
  'from',
  'isDirect',
  'overridden',
  'peer',
  'invalid',
  'production',
  'optional',
]);
function assert(ok, msg) {
  if (!ok) throw Error(msg);
}
function inspect(value, depth = 0) {
  assert(depth <= 20, 'depth exceeded');
  if (Array.isArray(value)) {
    assert(value.length <= 300, 'array too long');
    for (const v of value) inspect(v, depth + 1);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      assert(k.length <= 120, 'long key');
      assert(!prohibited.test(k), 'forbidden key');
      assert(
        allowed.has(k) ||
          /^(?:node_modules\/|@|[a-z][a-z0-9._-]*$|baselineVs[AB]$|\d+\.\d+\.\d+$)/.test(
            k,
          ),
        'unexpected key',
      );
      inspect(v, depth + 1);
    }
    return;
  }
  assert(
    value === null ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string',
    'unexpected type',
  );
  if (typeof value === 'string') {
    assert(value.length <= 800, 'long value');
    assert(!prohibited.test(value), 'forbidden value');
    assert(
      !/-----BEGIN|eyJ[A-Za-z0-9_-]{50,}\.|AKIA[0-9A-Z]{16}/.test(value),
      'sensitive-looking value',
    );
  }
}
function validate(value) {
  assert(
    value && typeof value === 'object' && !Array.isArray(value),
    'invalid root',
  );
  for (const k of Object.keys(value)) assert(top.has(k), 'unexpected root');
  for (const k of [
    'task',
    'phase',
    'sourceHead',
    'workflowHead',
    'cases',
    'result',
    'internalAndCli',
    'registryExpansion',
    'lockExplanation',
    'lintRemediation',
  ])
    assert(Object.hasOwn(value, k), 'missing root');
  assert(value.task === 'DEV-002' && value.phase === 'A-B', 'task mismatch');
  assert(
    value.sourceHead === baseline && sha.test(value.workflowHead),
    'head mismatch',
  );
  assert(value.event === 'push', 'event mismatch');
  assert(['PASS', 'FAIL', 'BLOCKED'].includes(value.result), 'bad result');
  assert(
    Array.isArray(value.cases) && value.cases.length === 3,
    'missing cases',
  );
  for (const c of value.cases)
    assert(
      ['PASS', 'FAIL', 'BLOCKED'].includes(c.result),
      'bad candidate outcome',
    );
  assert(
    Array.isArray(value.lockExplanation) && value.lockExplanation.length === 8,
    'lockfile delta missing',
  );
  assert(
    value.internalAndCli.baseline && value.internalAndCli.A,
    'no internal probes',
  );
  assert(value.registryExpansion.queriedAtUtc, 'no registry timestamp');
  inspect(value);
  return true;
}
try {
  const clone = {
    task: 'DEV-002',
    phase: 'A-B',
    sourceHead: baseline,
    workflowHead: '0'.repeat(40),
    event: 'push',
    cases: [{ result: 'PASS' }, { result: 'PASS' }, { result: 'BLOCKED' }],
    result: 'BLOCKED',
    lockExplanation: Array(8).fill({ cause: 'TEST' }),
    internalAndCli: { baseline: {}, A: {} },
    registryExpansion: { queriedAtUtc: '2026-10-10T00:00:00Z' },
    lintRemediation: {},
  };
  assert(validate(clone), 'positive self test');
  for (const change of [
    (x) => (x.credentials = 'x'),
    (x) => (x.cases[0].refresh_token = 'fake'),
    (x) => (x.lockExplanation = []),
  ]) {
    const t = structuredClone(clone);
    change(t);
    let rejected = false;
    try {
      validate(t);
    } catch {
      rejected = true;
    }
    assert(rejected, 'negative self test failed');
  }
  const names = readdirSync(dir);
  assert(
    names.length === 1 && names[0] === 'ab-result.json',
    'artifact allowlist mismatch',
  );
  const file = join(dir, names[0]);
  assert(statSync(file).size < 256000, 'oversized artifact');
  const value = JSON.parse(readFileSync(file, 'utf8'));
  validate(value);
  console.log(
    'Evidence gate PASS: single JSON schema, negative-test rejection, no sensitive fields, exact HEAD.',
  );
} catch (e) {
  console.error('Evidence gate FAIL: ' + e.message);
  process.exitCode = 1;
}
