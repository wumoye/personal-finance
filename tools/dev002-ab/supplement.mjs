import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir = resolve(process.env.RUNNER_TEMP || '/tmp', 'dev002-ab');
const reportPath = join(
  process.env.AB_EVIDENCE_DIR || join(dir, 'evidence'),
  'ab-result.json',
);
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const registryTime = new Date().toISOString();
function run(cwd, command, args, timeout = 25000) {
  const r = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout,
    maxBuffer: 2e6,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      CI: 'true',
      DIRECT_URL: '',
      DATABASE_URL: '',
      NEXT_TELEMETRY_DISABLED: '1',
    },
  });
  return {
    code: r.status,
    output: r.stdout || '',
    error: r.error?.code || null,
  };
}
function npmJson(cwd, args) {
  const r = run(cwd, 'npm', args);
  try {
    return { status: r.code, data: JSON.parse(r.output) };
  } catch {
    return { status: r.code, error: 'NON_JSON_RESPONSE' };
  }
}
const baseline = join(dir, 'baseline'),
  candidate = join(dir, 'A');
function parseDependency(spec, installed) {
  if (typeof spec !== 'string' || typeof installed !== 'string') return false;
  const v = installed.split('.').map(Number),
    match = (s) => {
      const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(s);
      return m && m.slice(1).map(Number);
    };
  const eq = (a, b) => a.every((n, i) => n === b[i]);
  if (match(spec)) return eq(match(spec), v);
  if (spec.startsWith('^') && match(spec.slice(1))) {
    let a = match(spec.slice(1));
    return v[0] === a[0] && (v[1] > a[1] || (v[1] === a[1] && v[2] >= a[2]));
  }
  if (spec.startsWith('~') && match(spec.slice(1))) {
    let a = match(spec.slice(1));
    return v[0] === a[0] && v[1] === a[1] && v[2] >= a[2];
  }
  if (spec.startsWith('>=')) return true;
  return false;
}
const snapshot = npmJson(baseline, ['view', 'prisma@7', 'version', '--json']);
const clientSnapshot = npmJson(baseline, [
  'view',
  '@prisma/client@7',
  'version',
  '--json',
]);
const all = Array.isArray(snapshot.data)
  ? snapshot.data
  : typeof snapshot.data === 'string'
    ? [snapshot.data]
    : [];
const clientSet = new Set(
  Array.isArray(clientSnapshot.data)
    ? clientSnapshot.data
    : typeof clientSnapshot.data === 'string'
      ? [clientSnapshot.data]
      : [],
);
const checked = [];
for (const version of all
  .filter((x) => /^7\.\d+\.\d+$/.test(x))
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))) {
  const p = npmJson(baseline, [
    'view',
    'prisma@' + version,
    'dependencies',
    '--json',
  ]);
  const c = npmJson(baseline, [
    'view',
    '@prisma/config@' + version,
    'dependencies',
    '--json',
  ]);
  const core = p.data?.['@prisma/config'] ?? null,
    sql = p.data?.mysql2 ?? null,
    deep = c.data?.['deepmerge-ts'] ?? null;
  const eligible = Boolean(
    clientSet.has(version) &&
    parseDependency(sql, '3.24.5') &&
    parseDependency(deep, '8.0.2') &&
    parseDependency(core, version),
  );
  checked.push({
    version,
    prismaQuery: p.status,
    configQuery: c.status,
    clientPublished: clientSet.has(version),
    config: core,
    mysql2: sql,
    deepmerge: deep,
    eligible,
  });
}
report.registryExpansion = {
  queriedAtUtc: registryTime,
  prismaVersionQuery: snapshot.status,
  clientVersionQuery: clientSnapshot.status,
  versionsListed: all.length,
  versionsChecked: checked.length,
  queryFailures: checked.filter(
    (x) => x.prismaQuery !== 0 || x.configQuery !== 0,
  ).length,
  contracts: checked,
  eligible: checked.filter((x) => x.eligible).map((x) => x.version),
  conclusion: checked.some((x) => x.eligible)
    ? 'ELIGIBLE_REVIEW_REQUIRED'
    : checked.some((x) => x.prismaQuery !== 0 || x.configQuery !== 0)
      ? 'BLOCKED_INCOMPLETE_REGISTRY'
      : 'NO_ELIGIBLE_IN_CHECKED_SET',
};
const lock = (p) =>
  JSON.parse(readFileSync(join(p, 'package-lock.json'), 'utf8')).packages;
const before = lock(baseline),
  after = lock(candidate);
report.lockExplanation = report.lockfileDiff.baselineVsA.map((x) => {
  const old = before[x.path] || {},
    now = after[x.path] || {};
  const name = x.path.replace('node_modules/', '');
  let cause = 'METADATA_CHANGED_SAME_VERSION';
  if (name === 'deepmerge-ts') cause = 'DIRECT_OVERRIDE_7_TO_8';
  else if (name === 'mysql2') cause = 'DIRECT_OVERRIDE_3_TO_3';
  else if (['denque', 'seq-queue', 'sqlstring'].includes(name))
    cause = 'MYSQL2_OLD_DEPENDENCY_REMOVED';
  else if (name === 'sql-escaper') cause = 'MYSQL2_NEW_DEPENDENCY_ADDED';
  return {
    path: x.path,
    cause,
    oldVersion: old.version || null,
    newVersion: now.version || null,
    oldResolved: old.resolved || null,
    newResolved: now.resolved || null,
    oldIntegrity: old.integrity || null,
    newIntegrity: now.integrity || null,
    oldDependencies: old.dependencies || {},
    newDependencies: now.dependencies || {},
    metadataChanged: Object.keys({ ...old, ...now })
      .filter((k) => JSON.stringify(old[k]) !== JSON.stringify(now[k]))
      .sort(),
  };
});
const pkg = (p, n) => lock(p)['node_modules/' + n] || {};
report.mysqlDependencyContracts = {
  before: pkg(baseline, 'mysql2').dependencies || {},
  after: pkg(candidate, 'mysql2').dependencies || {},
};
function internal(cwd) {
  const script = `const {createRequire}=require('node:module');const q=createRequire(process.argv[1]+'/package.json');let out={};try{const c=q('@prisma/config');out.exports=Object.keys(c).filter(x=>/config|load|define/i.test(x)).sort();for(const label of ['valid','missing','invalid','nested','arrays','undefined','error-path']){let conf={schema:'prisma/schema.prisma',datasource:{url:undefined},migrations:{path:'prisma/migrations'}};if(label==='missing')conf={};if(label==='invalid')conf.schema=123;if(label==='nested')conf={...conf,migrations:{path:'prisma/migrations',seed:undefined},tables:{nested:{enabled:true}}};if(label==='arrays')conf={...conf,experimental:{features:[]}};if(label==='error-path')conf.schema='nonexistent.prisma';try{const value=typeof c.defineConfig==='function'?c.defineConfig(conf):null;out[label]={status:value?'RETURNED':'NO_INTERNAL_DEFINE',keys:value?Object.keys(value).sort():[]}}catch(e){out[label]={status:'THREW',errorType:e?.name||'Error'}}}}catch(e){out.importError=e?.name||'Error'}process.stdout.write(JSON.stringify(out));`;
  const path = join(cwd, 'internal-probe.cjs');
  writeFileSync(path, script);
  const r = run(cwd, 'node', [path, cwd]);
  try {
    return { exit: r.code, data: JSON.parse(r.output) };
  } catch {
    return { exit: r.code, error: 'INTERNAL_IMPORT_OR_JSON_FAILURE' };
  }
}
function cli(cwd, label, config) {
  const file = join(cwd, 'prisma.ab-' + label + '.config.ts');
  writeFileSync(
    file,
    `import {defineConfig} from 'prisma/config';export default defineConfig(${config});\n`,
  );
  const r = run(
    cwd,
    './node_modules/.bin/prisma',
    ['validate', '--config', file],
    45000,
  );
  return {
    exit: r.code,
    category:
      r.code === 0 ? 'ACCEPTED' : r.error ? 'EXECUTION_ERROR' : 'REJECTED',
    error: r.error,
  };
}
const cliConfigs = {
  valid: "{schema:'prisma/schema.prisma',datasource:{url:undefined}}",
  wrong: "{schema:'__missing_schema__.prisma'}",
  invalid: '{schema:123}',
  nested:
    "{schema:'prisma/schema.prisma',migrations:{path:'prisma/migrations',seed:undefined}}",
  arrays: "{schema:'prisma/schema.prisma',experimental:{features:[]}}",
  missing: '{}',
};
report.internalAndCli = {};
for (const [name, cwd] of [
  ['baseline', baseline],
  ['A', candidate],
]) {
  const result = { internal: internal(cwd), cli: {} };
  for (const [label, config] of Object.entries(cliConfigs))
    result.cli[label] = cli(cwd, label, config);
  report.internalAndCli[name] = result;
}
report.internalAndCli.parity =
  JSON.stringify(report.internalAndCli.baseline.internal.data || null) ===
    JSON.stringify(report.internalAndCli.A.internal.data || null) &&
  JSON.stringify(report.internalAndCli.baseline.cli) ===
    JSON.stringify(report.internalAndCli.A.cli);
report.internalAndCli.scope =
  'ACTUAL_PRISMA_CONFIG_IMPORT_AND_CLI_VALIDATE_NOT_COMPLETE_PRIVATE_DEEPMERGE_COVERAGE';
const audit = report.cases.find((x) => x.label === 'A')?.auditAll;
report.lintRemediation = {
  observedNodes: (audit?.nodes || []).filter((x) =>
    [
      'eslint-config-next',
      '@next/eslint-plugin-next',
      'fast-glob',
      'micromatch',
      'braces',
    ].includes(x),
  ),
  advisories: audit?.advisories || [],
  registryCheckedAtUtc: registryTime,
};
for (const p of [
  'eslint-config-next@16',
  '@next/eslint-plugin-next@16',
  'fast-glob',
  'micromatch',
  'braces',
]) {
  const v = npmJson(candidate, ['view', p, 'version', '--json']);
  report.lintRemediation[p] = {
    queryExit: v.status,
    versions: Array.isArray(v.data)
      ? v.data.slice(-12)
      : [v.data].filter((x) => typeof x === 'string'),
  };
}
report.lintRemediation.status =
  'UPSTREAM_REVIEW_REQUIRED_NO_AUTOMATIC_OVERRIDE';
if (!report.internalAndCli.parity || report.registryExpansion.queryFailures)
  report.result = report.internalAndCli.parity ? 'BLOCKED' : 'FAIL';
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(
  'Supplement completed; CLI parity=' +
    report.internalAndCli.parity +
    ' registry=' +
    report.registryExpansion.conclusion +
    ' report=' +
    report.result,
);
