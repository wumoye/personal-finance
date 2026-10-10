import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const BASE='b7e0d271d575577d1f5c74a3a66d7383aa74e793',CAND='1d8bed2ba11c9d2e64482d2b48b278f0147650cb';
const paths={baseline:resolve('baseline'),candidate:resolve('candidate')};
const out=resolve(process.env.RUNNER_TEMP||'/tmp','dev002-deep-evidence');mkdirSync(out,{recursive:true});
const run=(cwd,bin,args,timeout=45000)=>{const r=spawnSync(bin,args,{cwd,encoding:'utf8',timeout,maxBuffer:2e6,env:{PATH:process.env.PATH,HOME:process.env.HOME,CI:'true',DIRECT_URL:'',DATABASE_URL:'',NEXT_PUBLIC_SUPABASE_URL:'',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'',NEXT_TELEMETRY_DISABLED:'1'}});return {exit:r.status,error:r.error?.code||null,stdout:r.stdout||''}};
const probe=`const fs=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');const cwd=process.argv[2],q=createRequire(path.join(cwd,'package.json'));const cfg=q('@prisma/config');const result={exports:{load:typeof cfg.loadConfigFromFile,define:typeof cfg.defineConfig},tests:{}};const safe=v=>{if(v===undefined)return '__UNDEFINED__';if(v===null||typeof v!=='object')return typeof v==='string'?v.slice(0,120):v;if(Array.isArray(v))return v.slice(0,20).map(safe);return Object.fromEntries(Object.keys(v).filter(x=>['schema','migrations','datasource','experimental','features','path','seed','url','error','message','name','code'].includes(x)).sort().map(x=>[x,safe(v[x])]))};const variants={default:{},nested:{schema:'prisma/schema.prisma',migrations:{path:'prisma/migrations',seed:'safe-seed'},datasource:{url:undefined}},arrays:{schema:'prisma/schema.prisma',experimental:{features:['first','second']}},badPath:{schema:'missing-for-ab.prisma'},badType:{schema:123},missing:{schema:undefined},mixed:{schema:'prisma/schema.prisma',migrations:{path:'prisma/migrations'},datasource:{url:undefined}}};(async()=>{for(const [name,val] of Object.entries(variants)){const filename=path.join(cwd,'prisma.deep-'+name+'.config.js');const code='module.exports='+JSON.stringify(val,(k,v)=>v===undefined?'__UNDEFINED__':v)+';';fs.writeFileSync(filename,code);try{const x=await cfg.loadConfigFromFile({configRoot:cwd,configFile:filename});result.tests[name]={status:'RETURNED',keys:Object.keys(x||{}).sort(),config:safe(x?.config),error:x?.error?{name:x.error.name||'Error',code:x.error.code||null}:null}}catch(e){result.tests[name]={status:'THREW',error:{name:e?.name||'Error'}}}}process.stdout.write(JSON.stringify(result))})().catch(e=>{process.stdout.write(JSON.stringify({fatal:e?.name||'Error'}));process.exitCode=1});`;
const evidence={task:'DEV-002',type:'ONE_BOUNDED_DEEP_CONFIG_CHECK',sourceHeads:{baseline:BASE,candidate:CAND},workflowHead:process.env.GITHUB_SHA||'local',status:'NOT_COVERED',cases:{},scope:{realLoadConfigFromFile:true,prismaCli:true,realDatabase:false,arbitraryCycles:false,modelIntegration:false}};
for(const [label,cwd] of Object.entries(paths)){
 const file=join(cwd,'deep-probe.cjs');writeFileSync(file,probe);
 const installed=run(cwd,'npm',['ci','--no-fund','--no-audit'],300000);const verify=run(cwd,'git',['rev-parse','HEAD']);const target=label==='baseline'?BASE:CAND;
 const p={head:verify.stdout.trim(),npmCi:{exit:installed.exit,error:installed.error}};
 if(p.head!==target||installed.exit!==0){p.result='FAIL';evidence.cases[label]=p;continue}
 const f=run(cwd,'node',[file,cwd],60000);try{p.load={exit:f.exit,data:JSON.parse(f.stdout)}}catch{p.load={exit:f.exit,error:'PROBE_NO_JSON'}}
 p.cli={};for(const name of ['default','nested','arrays','badPath','badType','missing','mixed']){const c=run(cwd,'./node_modules/.bin/prisma',['validate','--config','prisma.deep-'+name+'.config.js'],20000);p.cli[name]={exit:c.exit,error:c.error}}
 p.versions={prisma:JSON.parse(readFileSync(join(cwd,'package-lock.json'))).packages['node_modules/prisma'].version,deepmerge:JSON.parse(readFileSync(join(cwd,'package-lock.json'))).packages['node_modules/deepmerge-ts'].version};
 p.result=p.load.exit===0?'PASS':'NOT_COVERED';evidence.cases[label]=p;
}
const b=evidence.cases.baseline,a=evidence.cases.candidate;
const same=JSON.stringify(b?.load?.data?.tests??null)===JSON.stringify(a?.load?.data?.tests??null);
const sameCli=JSON.stringify(b?.cli??null)===JSON.stringify(a?.cli??null);
evidence.comparison={loadDeepFinalValuesEqual:same,cliExitClassificationEqual:sameCli};
evidence.status=b?.result==='FAIL'||a?.result==='FAIL'?'FAIL':same&&sameCli?'PASS':'NOT_COVERED';
evidence.notCovered=['UNSUPPORTED_CONFIG_KEYS_OR_UNREACHABLE_DEEP_MERGE','CIRCULAR_AND_ADVERSARIAL_INPUT','MODEL_LEVEL_ORM_OR_DATABASE','CROSS_PLATFORM'];
const d=join(out,'deep-result.json');writeFileSync(d,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:evidence.status,baseline:b?.result,candidate:a?.result,parity:evidence.comparison}));
