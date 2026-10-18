const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const P=require('../scripts/session-preflight.cjs');

// 0.255 세션 시작 점검(사용자 요청 2026-10-18 "작업 충돌 줄이기"): 다른 세션이 먼저 병합한 작업과 같은 파일 수정을 세션이 시작될 때 알려 준다.

test('0.255: analyze는 main이 앞선 정도와 같은 파일을 바꾼 충돌 후보를 가른다',()=>{
  const a=P.analyze({branch:'work',mineVersion:'0.254',mainVersion:'0.255',behind:2,mainCommits:['a1 x','b2 y'],
    mainFiles:['CHANGELOG.md','src/a.js','README.md'],myFiles:['CHANGELOG.md','src/a.js','src/b.js']});
  assert.equal(a.stale,true);assert.equal(a.risky,true);
  assert.deepEqual(a.records,['CHANGELOG.md']);assert.deepEqual(a.others,['src/a.js']);
  assert.equal(a.nextVersion,'0.256');assert.equal(a.versionClash,true,'내 번호가 main보다 낮고 main이 앞서면 번호 겹침 경고');
  const none=P.analyze({branch:'work',mineVersion:'0.256',mainVersion:'0.255',behind:0,mainCommits:[],mainFiles:[],myFiles:['src/b.js']});
  assert.equal(none.stale,false);assert.equal(none.risky,false);assert.equal(none.versionClash,false);
});

test('0.255: describe는 병합 방법·충돌 후보·번호 규칙·열린 PR 확인 안내를 한국어로 적는다',()=>{
  const text=P.describe(P.analyze({branch:'work',mineVersion:'0.254',mainVersion:'0.255',behind:1,mainCommits:['c3 0.255.0 무엇'],mainFiles:['CHANGELOG.md','data/products/xdm.json'],myFiles:['CHANGELOG.md','data/products/xdm.json']}));
  for(const t of ['main이 이 브랜치보다 1개 커밋 앞서','c3 0.255.0 무엇','git merge origin/main','강제 push·rebase 금지','(충돌 후보): data/products/xdm.json','기록 파일(CHANGELOG.md)','main + 1 = 0.256.0','열린 PR은 이 점검이 볼 수 없습니다'])assert.ok(text.includes(t),t);
  const clean=P.describe(P.analyze({branch:'work',mineVersion:'0.255',mainVersion:'0.255',behind:0,mainCommits:[],mainFiles:[],myFiles:[]}));
  assert.match(clean,/main의 최신 내용을 모두 포함/);assert.doesNotMatch(clean,/충돌 후보/);
});

test('0.255: 훅은 SessionStart에 등록되어 있고 기존 input_doc 알림은 그대로 첫 번째다',()=>{
  const settings=JSON.parse(fs.readFileSync(path.join(__dirname,'../.claude/settings.json'),'utf8'));
  const hooks=settings.hooks.SessionStart[0].hooks;
  assert.match(hooks[0].command,/scripts\/input-doc-status\.cjs/);
  assert.match(hooks[1].command,/scripts\/session-preflight\.cjs/);
  assert.ok(hooks[1].timeout>=20,'git fetch 시간을 넉넉히');
});

// 임시 저장소 둘(원격 + 작업본)과 "다른 세션" 작업본으로 실제 git 흐름을 시험한다. 네트워크는 쓰지 않는다(로컬 경로 원격).
function sh(cwd,...args){const r=spawnSync('git',['-c','user.name=t','-c','user.email=t@example.com','-c','commit.gpgsign=false',...args],{cwd,encoding:'utf8'});if(r.status!==0)throw new Error(`git ${args.join(' ')} 실패: ${r.stderr}`);return r.stdout}
function write(dir,rel,text){fs.mkdirSync(path.dirname(path.join(dir,rel)),{recursive:true});fs.writeFileSync(path.join(dir,rel),text)}
test('0.255: 실제 git에서 main이 앞서고 같은 파일을 바꾸면 알림 JSON이 나오고, main이 없으면 아무것도 출력하지 않는다',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rtcom-preflight-'));
  try{
    const origin=path.join(tmp,'origin.git'),mine=path.join(tmp,'mine'),other=path.join(tmp,'other');
    sh(tmp,'init','--bare','-b','main',origin);
    sh(tmp,'clone',origin,mine);
    write(mine,'index.html','<b>CATALOG BASED · 0.10</b>');write(mine,'CHANGELOG.md','## 0.10.0\n');write(mine,'data/x.json','{}');
    sh(mine,'add','-A');sh(mine,'commit','-m','base');sh(mine,'branch','-M','main');sh(mine,'push','-u','origin','main');
    sh(tmp,'clone',origin,other);
    write(other,'index.html','<b>CATALOG BASED · 0.11</b>');write(other,'CHANGELOG.md','## 0.11.0\n## 0.10.0\n');write(other,'data/x.json','{"a":1}');
    sh(other,'add','-A');sh(other,'commit','-m','0.11.0 다른 세션 작업');sh(other,'push','origin','main');
    sh(mine,'checkout','-b','work');
    write(mine,'CHANGELOG.md','## 0.10.1\n## 0.10.0\n');write(mine,'data/x.json','{"b":2}');
    sh(mine,'add','-A');sh(mine,'commit','-m','내 작업');
    const run=(root,env={})=>spawnSync(process.execPath,[path.join(__dirname,'../scripts/session-preflight.cjs')],{env:{...process.env,RTCOM_PREFLIGHT_ROOT:root,...env},encoding:'utf8'});
    const r=run(mine);
    assert.equal(r.status,0);
    const json=JSON.parse(r.stdout);
    assert.equal(json.hookSpecificOutput.hookEventName,'SessionStart');
    const ctx=json.hookSpecificOutput.additionalContext;
    for(const t of ['브랜치 work','main 화면 버전 0.11','1개 커밋 앞서','0.11.0 다른 세션 작업','(충돌 후보): data/x.json','기록 파일(CHANGELOG.md)','main + 1 = 0.12.0'])assert.ok(ctx.includes(t),t);
    assert.match(json.systemMessage,/main이 1개 커밋 앞서 있습니다.*충돌 후보/);
    // --list는 같은 글을 일반 글로
    const list=run(mine,{});assert.equal(list.status,0);
    const listed=spawnSync(process.execPath,[path.join(__dirname,'../scripts/session-preflight.cjs'),'--list'],{env:{...process.env,RTCOM_PREFLIGHT_ROOT:mine},encoding:'utf8'});
    assert.ok(listed.stdout.includes('1개 커밋 앞서'));
    // main을 병합하면 앞선 커밋이 사라진다
    sh(mine,'merge','--no-edit','-X','theirs','origin/main');
    const after=JSON.parse(run(mine,{RTCOM_PREFLIGHT_NO_FETCH:'1'}).stdout);
    assert.match(after.hookSpecificOutput.additionalContext,/main의 최신 내용을 모두 포함/);
    assert.equal(after.systemMessage,undefined,'뒤처지지 않고 겹침도 없으면 사용자에게 보이는 알림은 없다');
    // origin/main이 없는 저장소(또는 저장소가 아님)면 조용히 끝난다
    const bare=path.join(tmp,'plain');fs.mkdirSync(bare);sh(bare,'init','-b','main');
    const quiet=run(bare,{RTCOM_PREFLIGHT_NO_FETCH:'1'});assert.equal(quiet.status,0);assert.equal(quiet.stdout,'');
    const notRepo=run(path.join(tmp,'nowhere'),{RTCOM_PREFLIGHT_NO_FETCH:'1'});assert.equal(notRepo.status,0);assert.equal(notRepo.stdout,'');
  }finally{fs.rmSync(tmp,{recursive:true,force:true})}
});
