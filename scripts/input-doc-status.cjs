#!/usr/bin/env node
// input_doc 새 자료 알림(2026-09-28, docs/implementation/LOCAL_INPUT_DOC_WORKFLOW.md).
// 로컬 Claude Code 세션이 시작될 때(.claude/settings.json SessionStart hook) input_doc/ 맨 위에 새로 들어온 파일을 찾아 알려 준다.
// 제조사 폴더(input_doc/<제조사>/...)로 이미 분류된 파일과 README.md·INDEX.md는 새 자료로 보지 않는다.
// 사용법: node scripts/input-doc-status.cjs          → hook용 JSON(새 자료가 없으면 아무것도 출력하지 않음)
//         node scripts/input-doc-status.cjs --list   → 사람이 읽는 목록
//         node scripts/input-doc-status.cjs --status → input_doc/STATUS.md만 다시 만들고 요약 출력
// 모든 모드에서 input_doc/STATUS.md(로컬 전용)를 다시 만든다: docs/evidence/input-doc-ledger.json(Git에 올라가는 반영 장부)과
// 폴더 안 파일의 sha256 앞 16자리를 맞춰 "사이트에 반영됨·PDF 공개·같은 판·보관만·검토 전"을 파일마다 표시한다(사용자 요청 2026-09-28).
// 이 스크립트는 파일을 옮기거나 지우지 않으며, 어떤 경우에도 exit 0으로 끝나 세션 시작을 막지 않는다.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const ROOT=path.resolve(__dirname,'..');
const DIR=process.env.INPUT_DOC_DIR?path.resolve(process.env.INPUT_DOC_DIR):path.join(ROOT,'input_doc');
const IGNORED=new Set(['README.md','INDEX.md','STATUS.md','.gitkeep','.DS_Store','Thumbs.db','desktop.ini']);
// input_doc.py와 같은 규칙: 기본 input_doc이면 저장소 장부, 다른 폴더(테스트)면 그 폴더의 .ledger.json
const LEDGER=process.env.INPUT_DOC_LEDGER?path.resolve(process.env.INPUT_DOC_LEDGER):DIR===path.join(ROOT,'input_doc')?path.join(ROOT,'docs','evidence','input-doc-ledger.json'):path.join(DIR,'.ledger.json');
const MARK={published:'📄 PDF 공개',reflected:'✅ 사이트에 반영',same:'☑️ 같은 판(변경 없음)',archived:'🗄️ 보관만',pending:'⏳ 검토 전'};
const ORDER=['published','reflected','pending','same','archived'];

function newFiles(){
  let entries=[];
  try{entries=fs.readdirSync(DIR,{withFileTypes:true})}catch{return []}
  return entries.filter(entry=>entry.isFile()&&!IGNORED.has(entry.name)&&!/^[~.]/.test(entry.name)).map(entry=>{
    const stat=fs.statSync(path.join(DIR,entry.name));
    return {name:entry.name,size:stat.size};
  }).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
}

function sha16(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,16)}

function walk(dir,rel=''){
  let out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const sub=rel?`${rel}/${entry.name}`:entry.name;
    if(entry.isDirectory())out=out.concat(walk(path.join(dir,entry.name),sub));
    else if(rel&&!IGNORED.has(entry.name)&&!/^[~.]/.test(entry.name))out.push(sub);
  }
  return out;
}

// 반영 장부와 폴더를 맞춰 input_doc/STATUS.md를 쓴다. 장부나 폴더가 없으면 조용히 건너뛴다.
function writeStatus(){
  if(!fs.existsSync(DIR))return null;
  let ledger={entries:[]};
  try{ledger=JSON.parse(fs.readFileSync(LEDGER,'utf8'))}catch{}
  const bySha=new Map(),byFile=new Map();
  for(const entry of ledger.entries||[]){bySha.set(entry.sha256,entry);byFile.set(entry.file,entry)}
  const rows=[];
  for(const file of newFiles())rows.push({status:'pending',file:file.name,where:'아직 분류 전(맨 위 폴더)',release:'',note:''});
  for(const file of walk(DIR)){
    if(file.startsWith('_duplicates/'))continue;
    const entry=bySha.get(sha16(path.join(DIR,file)))||byFile.get(file);
    if(!entry){rows.push({status:'pending',file,where:'',release:'',note:'장부에 없음'});continue}
    const refl=entry.reflected||[];
    rows.push({status:entry.status in MARK?entry.status:'pending',file,where:refl.map(item=>`${item.where} — ${item.what}`).join('<br>'),release:[...new Set(refl.map(item=>item.release).filter(Boolean))].join(', '),note:entry.note||''});
  }
  rows.sort((a,b)=>ORDER.indexOf(a.status)-ORDER.indexOf(b.status)||a.file.localeCompare(b.file,'ko'));
  const count=Object.fromEntries(ORDER.map(key=>[key,rows.filter(row=>row.status===key).length]));
  const cell=value=>String(value||'').replace(/\|/g,'/');
  const text=['# input_doc 반영 현황','',
    '> 자동 생성 파일입니다. 직접 고치지 마세요. 세션을 시작할 때와 자료를 분류·반영할 때 `scripts/input-doc-status.cjs`가 다시 만듭니다.',
    '> 기준 장부: `docs/evidence/input-doc-ledger.json`(Git에 올라감) · 파일은 내용(sha256 앞 16자리)으로 맞추므로 이름을 바꿔도 표시가 유지됩니다.','',
    ORDER.map(key=>`${MARK[key]} ${count[key]}`).join(' · '),'',
    '| 상태 | 파일 | 반영한 곳 | 반영 버전·PR | 메모 |','|---|---|---|---|---|',
    ...rows.map(row=>`| ${MARK[row.status]} | ${cell(row.file)} | ${cell(row.where)} | ${cell(row.release)} | ${cell(row.note)} |`),''].join('\n');
  fs.writeFileSync(path.join(DIR,'STATUS.md'),text);
  return count;
}

const size=bytes=>bytes>=1048576?`${(bytes/1048576).toFixed(1)}MB`:`${Math.max(1,Math.round(bytes/1024))}KB`;
const files=newFiles();
let counts=null;
try{counts=writeStatus()}catch{}

if(process.argv.includes('--status')){
  console.log(counts?`input_doc/STATUS.md: ${ORDER.map(key=>`${MARK[key]} ${counts[key]}`).join(' · ')}`:'input_doc 없음');
}else if(process.argv.includes('--list')){
  if(!files.length)console.log('input_doc: 새 자료 없음');
  else{console.log(`input_doc: 새 자료 ${files.length}개`);for(const file of files)console.log(`- ${file.name} (${size(file.size)})`)}
}else if(files.length){
  const list=files.slice(0,30).map(file=>`- ${file.name} (${size(file.size)})`).join('\n')+(files.length>30?`\n- … 외 ${files.length-30}개`:'');
  process.stdout.write(JSON.stringify({
    systemMessage:`input_doc에 새 자료 ${files.length}개가 있습니다. 첫 요청을 처리할 때 Claude가 먼저 분류합니다.`,
    hookSpecificOutput:{hookEventName:'SessionStart',additionalContext:`input_doc/ 맨 위에 아직 분류하지 않은 사용자 자료가 ${files.length}개 있습니다.\n${list}\n사용자 지시(2026-09-28)에 따라, 이 세션의 첫 요청을 처리하기 전에 .claude/skills/input-doc/SKILL.md 절차(내용 확인 → 제조사 폴더 분류 → 이름 변경 → 필요한 곳으로 이동·반영)로 먼저 정리하고 결과를 보고하십시오. 공개 폴더(output/design/assets/docs/)에 PDF를 올리는 커밋은 목록을 보여 주고 사용자 확인을 받은 뒤에만 합니다.`}
  }));
}
process.exitCode=0;
