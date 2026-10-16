#!/usr/bin/env node
// 0.238 AMX 코드 잠금 비밀번호 설정 도구.
// 사용: node scripts/tools/set-amx-password.cjs "<비밀번호>"   (비밀번호를 바꿀 때마다 다시 실행)
// src/control-example.js의 `const AMX_LOCK=...;` 한 줄을 PBKDF2-SHA256 변환값(salt·iterations·hash)으로 바꿔 쓴다.
// 비밀번호 원문은 어디에도 저장하지 않는다. 확인만 하려면: node scripts/tools/set-amx-password.cjs --check "<비밀번호>"
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','..','src','control-example.js');
const args=process.argv.slice(2);
const check=args[0]==='--check';
const password=check?args[1]:args[0];
if(!password){console.error('사용법: node scripts/tools/set-amx-password.cjs "<비밀번호>"  (확인: --check "<비밀번호>")');process.exit(2)}
if(!check&&password.length<8){console.error('비밀번호는 8자 이상으로 정해 주세요.');process.exit(2)}
const ce=require(file);
(async()=>{
  const src=fs.readFileSync(file,'utf8');
  const re=/^(\s*)const AMX_LOCK=.*;$/m;
  if(!re.test(src)){console.error('src/control-example.js에서 AMX_LOCK 줄을 찾지 못했습니다.');process.exit(1)}
  if(check){console.log(await ce.verifyPassword(password)?'일치합니다':'일치하지 않습니다');process.exit(0)}
  const cfg=await ce.makeLock(password);
  fs.writeFileSync(file,src.replace(re,(_,ind)=>`${ind}const AMX_LOCK=${JSON.stringify(cfg)};`));
  const after=require('node:child_process').execFileSync(process.execPath,['-e',`const c=require(${JSON.stringify(file)});c.verifyPassword(process.argv[1]).then(ok=>console.log(ok?'OK':'FAIL'))`,password]).toString().trim();
  console.log(after==='OK'?'AMX 코드 잠금 비밀번호를 설정했습니다(변환값만 저장, 원문은 저장하지 않음).':'설정 후 확인에 실패했습니다. 파일을 확인하세요.');
  process.exit(after==='OK'?0:1);
})();
