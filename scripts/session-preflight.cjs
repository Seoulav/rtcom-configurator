#!/usr/bin/env node
// 0.255 세션 시작 점검(사용자 요청 2026-10-18 "작업 충돌 줄이기", docs/implementation/SESSION_PREFLIGHT_0.255.md).
// 여러 세션이 동시에 작업하면 먼저 병합된 세션 때문에 버전 번호가 겹치고 CHANGELOG.md·CLAUDE.md·README.md·index.html에서 충돌이 납니다(0.253.0이 두 PR에서 겹친 일).
// 세션이 시작될 때(.claude/settings.json SessionStart hook) 이 브랜치가 main보다 얼마나 뒤처졌는지, 그 사이 main에 무엇이 병합됐는지,
// 내 브랜치와 같은 파일을 바꾼 것이 있는지(충돌 후보)를 알려 줍니다. 열린 PR은 GitHub 연결이 필요해 이 스크립트가 보지 못하므로 확인 안내만 붙입니다.
// 사용법: node scripts/session-preflight.cjs            → hook용 JSON(main 기준 브랜치를 찾지 못하면 아무것도 출력하지 않음)
//         node scripts/session-preflight.cjs --list     → 사람이 읽는 글
// 환경 변수: RTCOM_PREFLIGHT_ROOT(점검할 저장소 폴더, 시험용), RTCOM_PREFLIGHT_NO_FETCH=1(네트워크 없이 이미 받은 origin/main만 사용)
// 파일을 바꾸지 않고(git fetch만 함), 어떤 경우에도 exit 0으로 끝나 세션 시작을 막지 않습니다.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const ROOT=process.env.RTCOM_PREFLIGHT_ROOT?path.resolve(process.env.RTCOM_PREFLIGHT_ROOT):path.resolve(__dirname,'..');
const MAIN='origin/main';
// 병합할 때마다 거의 반드시 겹치는 기록 파일: 충돌 후보로 따로 알려 주되 "번호 이동으로 해결"하는 파일이다.
const RECORD_FILES=['CHANGELOG.md','CLAUDE.md','README.md','index.html'];

function git(args,timeout=15000){
  const r=spawnSync('git',args,{cwd:ROOT,encoding:'utf8',timeout,stdio:['ignore','pipe','ignore']});
  return r.status===0?String(r.stdout).replace(/\s+$/,''):null;
}
const versionOf=html=>{const m=/CATALOG BASED · (\d+\.\d+)/.exec(String(html||''));return m?m[1]:''};
const lines=text=>String(text||'').split('\n').map(x=>x.trim()).filter(Boolean);
const cmp=(a,b)=>{const [x,y]=a.split('.').map(Number),[p,q]=b.split('.').map(Number);return x-p||y-q};

// 순수 계산: 입력은 git에서 읽은 값, 출력은 사람이 읽을 요약과 위험 목록. 시험에서 직접 부른다.
function analyze({branch,mineVersion,mainVersion,behind,mainCommits,mainFiles,myFiles}){
  const mine=new Set(myFiles||[]);
  const overlap=(mainFiles||[]).filter(f=>mine.has(f));
  const records=overlap.filter(f=>RECORD_FILES.includes(f));
  const others=overlap.filter(f=>!RECORD_FILES.includes(f));
  const next=mainVersion?mainVersion.split('.').map(Number):null;
  const nextVersion=next?`${next[0]}.${next[1]+1}`:'';
  const versionClash=!!(mineVersion&&mainVersion&&cmp(mineVersion,mainVersion)<=0&&behind>0);
  return {branch,mineVersion,mainVersion,nextVersion,behind,mainCommits:mainCommits||[],overlap,records,others,versionClash,
    stale:behind>0,risky:others.length>0};
}

function describe(info){
  const out=[];
  out.push(`작업 시작 점검(자동): 브랜치 ${info.branch||'(분리됨)'} · 이 브랜치 화면 버전 ${info.mineVersion||'?'} · main 화면 버전 ${info.mainVersion||'?'}.`);
  if(!info.stale)out.push('이 브랜치는 main의 최신 내용을 모두 포함합니다.');
  else{
    out.push(`main이 이 브랜치보다 ${info.behind}개 커밋 앞서 있습니다(다른 세션이 먼저 병합한 작업일 수 있음):`);
    for(const c of info.mainCommits.slice(0,8))out.push(`- ${c}`);
    if(info.mainCommits.length>8)out.push(`- … 외 ${info.mainCommits.length-8}개`);
    out.push('작업을 이어가기 전에 `git merge origin/main`으로 main을 이 브랜치에 병합하세요(강제 push·rebase 금지).');
  }
  if(info.others.length)out.push(`내 브랜치와 main이 같은 파일을 모두 바꿨습니다(충돌 후보): ${info.others.slice(0,12).join(', ')}${info.others.length>12?' …':''}. 병합할 때 내용을 직접 확인하세요.`);
  if(info.records.length)out.push(`기록 파일(${info.records.join(', ')})은 병합할 때마다 겹치기 쉽습니다. 충돌하면 main 내용을 먼저 두고 이 브랜치의 항목을 새 번호로 다시 넣으세요.`);
  if(info.versionClash&&info.nextVersion)out.push(`이 브랜치의 화면 버전(${info.mineVersion})이 main(${info.mainVersion})과 같거나 낮습니다. 병합 직전 번호는 main + 1 = ${info.nextVersion}.0으로 정합니다.`);
  else if(info.nextVersion)out.push(`다음 병합 번호는 main + 1 = ${info.nextVersion}.0입니다(병합 직전에 main을 다시 확인해 확정).`);
  out.push('열린 PR은 이 점검이 볼 수 없습니다. 작업을 시작할 때 GitHub에서 열린 PR 목록을 확인해, 같은 파일(특히 src/control-example.js, 같은 제품 JSON, 기록 파일)을 바꾸는 다른 세션의 PR이 있으면 그 PR이 병합된 뒤에 시작하거나 사용자에게 먼저 알립니다.');
  return out.join('\n');
}

function collect(){
  if(process.env.RTCOM_PREFLIGHT_NO_FETCH!=='1')git(['fetch','origin','main','--quiet'],10000);
  if(git(['rev-parse','--verify','--quiet',`${MAIN}^{commit}`])===null)return null;
  const branch=git(['rev-parse','--abbrev-ref','HEAD'])||'';
  let mineHtml='';try{mineHtml=fs.readFileSync(path.join(ROOT,'index.html'),'utf8')}catch{}
  const mainVersion=versionOf(git(['show',`${MAIN}:index.html`])||'');
  const behind=Number(git(['rev-list','--count',`HEAD..${MAIN}`])||0);
  const base=git(['merge-base','HEAD',MAIN]);
  const mainCommits=lines(git(['log','--format=%h %s',`HEAD..${MAIN}`,'--max-count=30'])||'');
  const mainFiles=base?lines(git(['diff','--name-only',base,MAIN])||''):[];
  const myFiles=base?lines(git(['diff','--name-only',base,'HEAD'])||'').concat(lines(git(['diff','--name-only'])||''),lines(git(['diff','--name-only','--cached'])||'')):[];
  return analyze({branch:branch==='HEAD'?'':branch,mineVersion:versionOf(mineHtml),mainVersion,behind,mainCommits,mainFiles,myFiles:[...new Set(myFiles)]});
}

function main(){
  const info=collect();
  if(!info)return;
  const text=describe(info);
  if(process.argv.includes('--list')){process.stdout.write(text+'\n');return}
  const out={hookSpecificOutput:{hookEventName:'SessionStart',additionalContext:text}};
  if(info.stale||info.risky)out.systemMessage=`main이 ${info.behind}개 커밋 앞서 있습니다${info.risky?' · 같은 파일을 바꾼 충돌 후보가 있습니다':''}. 작업 전에 main을 병합하세요.`;
  process.stdout.write(JSON.stringify(out));
}

if(require.main===module){try{main()}catch{}process.exitCode=0}
module.exports={analyze,describe,versionOf,RECORD_FILES};
