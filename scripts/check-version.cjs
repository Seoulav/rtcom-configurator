// 0.159 — 여러 세션이 동시에 main에 병합하면서 버전 번호가 겹치거나(같은 0.154.0 두 번) 건너뛰는 일이 생겨 만든 점검 도구.
// (사용자 요청 2026-09-29 "1번 진행해줘": 여러 세션 동시 작업 정리, 규칙은 CLAUDE.md "여러 세션이 동시에 작업할 때")
// 사용법: node scripts/check-version.cjs                     → 네 곳의 버전 표기가 서로 맞는지 확인
//         node scripts/check-version.cjs --against origin/main → 위 확인 + main보다 한 단계 높은 번호인지 확인(병합 직전)
// 네 곳: index.html 우측 상단 "CATALOG BASED · 0.N", README "현재 버전: 0.N", CHANGELOG 첫 "## 0.N.0" 제목,
//        CLAUDE.md 이력의 "`0.N.0`으로 기록"과 "다음 기능 묶음은 `0.(N+1).0`".
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');

const parse=v=>{const m=String(v||'').match(/^(\d+)\.(\d+)/);return m?[Number(m[1]),Number(m[2])]:null};
const fmt=v=>v?`${v[0]}.${v[1]}`:'(없음)';
const cmp=(a,b)=>a[0]-b[0]||a[1]-b[1];

// 파일 내용(문자열)만 받아 버전을 읽고 문제 목록을 돌려준다. 단위 테스트에서 가짜 내용으로도 부른다.
function readVersions({index,readme,changelog,claude}){
  const headings=[...String(changelog||'').matchAll(/^## (\d+\.\d+\.\d+)\s*$/gm)].map(m=>m[1]);
  const recorded=[...String(claude||'').matchAll(/`(\d+\.\d+)\.0`(?:으로|은)\s*기록했습니다/g)].map(m=>m[1]);
  return {
    index:parse((String(index||'').match(/CATALOG BASED · (\d+\.\d+)/)||[])[1]),
    readme:parse((String(readme||'').match(/현재 버전: (\d+\.\d+)/)||[])[1]),
    changelog:parse(headings[0]),
    headings,
    claudeRecorded:parse(recorded[recorded.length-1]),
    claudeNext:parse((String(claude||'').match(/다음 기능 묶음은 `(\d+\.\d+)\.0`/)||[])[1])
  };
}
function checkConsistency(files){
  const v=readVersions(files),problems=[];
  if(!v.index)problems.push('index.html에서 "CATALOG BASED · 0.N" 표기를 찾지 못했습니다.');
  const base=v.index;
  if(base){
    for(const [name,got] of [['README.md "현재 버전"',v.readme],['CHANGELOG.md 첫 버전 제목',v.changelog],['CLAUDE.md 마지막 기록 버전',v.claudeRecorded]]){
      if(!got||cmp(got,base)!==0)problems.push(`${name}이(가) ${fmt(got)}로, index.html ${fmt(base)}와 다릅니다.`);
    }
    const next=[base[0],base[1]+1];
    if(!v.claudeNext||cmp(v.claudeNext,next)!==0)problems.push(`CLAUDE.md "다음 기능 묶음"이 ${fmt(v.claudeNext)}.0입니다. ${fmt(next)}.0이어야 합니다.`);
  }
  const seen=new Set();
  for(const h of v.headings){if(seen.has(h))problems.push(`CHANGELOG.md에 "## ${h}" 제목이 두 번 있습니다.`);seen.add(h)}
  return {versions:v,problems};
}
// 병합 직전 점검: 기능 변경(문서 밖 파일)이 있으면 main보다 정확히 한 단계 높아야 하고, 문서만 바뀌었으면 main과 같아야 한다.
function checkAgainst(local,main,changedFiles){
  const problems=[];
  if(!local||!main)return ['버전을 읽지 못했습니다.'];
  const docsOnly=changedFiles.length>0&&changedFiles.every(f=>f.startsWith('docs/')||f==='CHANGELOG.md');
  const d=cmp(local,main);
  if(d<0)problems.push(`main이 ${fmt(main)}로 더 새 버전입니다. main을 먼저 병합하고 번호를 ${main[0]}.${main[1]+1}로 다시 정하세요.`);
  else if(d===0&&!docsOnly&&changedFiles.length)problems.push(`문서 밖 파일이 바뀌었는데 버전이 main과 같은 ${fmt(main)}입니다. ${main[0]}.${main[1]+1}로 올리세요.`);
  else if(d>0&&docsOnly)problems.push(`문서만 바뀌었는데 버전이 ${fmt(local)}로 올라갔습니다. main과 같은 ${fmt(main)}로 두세요.`);
  else if(d>0&&!(local[0]===main[0]&&local[1]===main[1]+1))problems.push(`버전 ${fmt(local)}이(가) main ${fmt(main)}보다 한 단계 넘게 높습니다. ${main[0]}.${main[1]+1}로 맞추세요.`);
  return problems;
}

module.exports={readVersions,checkConsistency,checkAgainst};

if(require.main===module){
  const read=f=>fs.readFileSync(f,'utf8');
  const files={index:read('index.html'),readme:read('README.md'),changelog:read('CHANGELOG.md'),claude:read('CLAUDE.md')};
  const {versions,problems}=checkConsistency(files);
  const at=process.argv.indexOf('--against');
  if(at>0){
    const ref=process.argv[at+1]||'origin/main';
    const git=args=>execFileSync('git',args,{encoding:'utf8'});
    let mainIndex;
    try{mainIndex=git(['show',`${ref}:index.html`])}catch{problems.push(`${ref}의 index.html을 읽지 못했습니다. 먼저 git fetch origin main을 실행하세요.`)}
    if(mainIndex){
      const changed=git(['diff','--name-only',ref]).split('\n').filter(Boolean);
      problems.push(...checkAgainst(versions.index,readVersions({index:mainIndex}).index,changed));
      console.log(`main(${ref}) ${fmt(readVersions({index:mainIndex}).index)} → 이 브랜치 ${fmt(versions.index)}, 바뀐 파일 ${changed.length}개`);
    }
  }
  if(problems.length){console.error(problems.map(p=>`✗ ${p}`).join('\n'));process.exit(1)}
  console.log(`버전 표기 일치: ${fmt(versions.index)}`);
}
