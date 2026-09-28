#!/usr/bin/env node
// input_doc 새 자료 알림(2026-09-28, docs/implementation/LOCAL_INPUT_DOC_WORKFLOW.md).
// 로컬 Claude Code 세션이 시작될 때(.claude/settings.json SessionStart hook) input_doc/ 맨 위에 새로 들어온 파일을 찾아 알려 준다.
// 제조사 폴더(input_doc/<제조사>/...)로 이미 분류된 파일과 README.md·INDEX.md는 새 자료로 보지 않는다.
// 사용법: node scripts/input-doc-status.cjs          → hook용 JSON(새 자료가 없으면 아무것도 출력하지 않음)
//         node scripts/input-doc-status.cjs --list   → 사람이 읽는 목록
// 이 스크립트는 파일을 옮기거나 지우지 않으며, 어떤 경우에도 exit 0으로 끝나 세션 시작을 막지 않는다.
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const DIR=process.env.INPUT_DOC_DIR?path.resolve(process.env.INPUT_DOC_DIR):path.join(ROOT,'input_doc');
const IGNORED=new Set(['README.md','INDEX.md','.gitkeep','.DS_Store','Thumbs.db','desktop.ini']);

function newFiles(){
  let entries=[];
  try{entries=fs.readdirSync(DIR,{withFileTypes:true})}catch{return []}
  return entries.filter(entry=>entry.isFile()&&!IGNORED.has(entry.name)&&!entry.name.startsWith('~$')).map(entry=>{
    const stat=fs.statSync(path.join(DIR,entry.name));
    return {name:entry.name,size:stat.size};
  }).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
}

const size=bytes=>bytes>=1048576?`${(bytes/1048576).toFixed(1)}MB`:`${Math.max(1,Math.round(bytes/1024))}KB`;
const files=newFiles();

if(process.argv.includes('--list')){
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
