const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const L=require('../src/layout-sim.js');

// 0.224 XDM 화면 연출 시뮬레이터(WOS100 월 오버레이). 근거: 사용자 제공 XDM Command Guide 1013(44~55쪽)와 현장 메모(2026-10-16).
// 가이드·메모에 적힌 커맨드 원문이 글자 하나 다르지 않게 나와야 한다.

test('0.224: 프리셋의 커맨드가 가이드 예제 2·3과 현장 메모 3개 원문과 똑같다',()=>{
  const checked=L.PRESETS.filter(p=>p.expected);
  assert.equal(checked.length,5);
  for(const p of checked)assert.equal(L.commandFor(p.state).command,p.expected,p.id);
});

test('0.224: 출력 포트 배치는 슬롯 1장 = 디스플레이 2×2 블록(가이드 46~47쪽 Wall Port Connection)',()=>{
  // 3×2(슬롯 2장): 1행 1·2·5, 2행 3·4·7
  assert.deepEqual(L.portMapFor({cols:3,rows:2,startPort:1}),[[1,2,5],[3,4,7]]);
  // 6×3(슬롯 6장): 3행은 슬롯 4~6의 1·2번 포트만 쓴다(가이드 55쪽 예제 8: O013·O014·O017·O018·O021·O022)
  assert.deepEqual(L.portMapFor({cols:6,rows:3,startPort:1}),[[1,2,5,6,9,10],[3,4,7,8,11,12],[13,14,17,18,21,22]]);
  // 시작 포트는 슬롯 첫 포트(1·5·9…)로 맞춘다(사용자 메모 O009-012)
  assert.equal(L.normalize({startPort:10}).startPort,9);
  assert.equal(L.geometry({cols:1,rows:1,startPort:9}).endPort,12);
});

test('0.224: 창은 걸치는 슬롯마다 남은 포트 중 가장 작은 번호를 하나씩 쓴다(가이드 예제 1·5·6, 메모 창 2 → O010)',()=>{
  // 가이드 47쪽 예제 1: 3×2 월 좌우 2개 → I001 O001, I002 O002O005
  const r=L.commandFor(L.PRESETS.find(p=>p.id==='guide-1').state);
  assert.deepEqual(r.assigned.map(a=>a.ports),[[1],[2,5]]);
  assert.match(r.command,/I001O001X0Y0W2880H2160I002O002O005X2880Y0W2880H2160!$/);
  // 슬롯 1장에 창 5개는 포트가 모자란다 → 경고, 5번째 창은 커맨드에서 빠진다
  const five={cols:1,rows:1,timing:14,startPort:1,clear:'none',windows:Array.from({length:5},(_,i)=>({input:i+1,x:i*100,y:0,w:500,h:500}))};
  const r5=L.commandFor(five);
  assert.deepEqual(r5.assigned.map(a=>a.ports),[[1],[2],[3],[4],[]]);
  assert.ok(r5.warnings.some(w=>/포트 4개를 다른 창이 모두 쓰고/.test(w)));
  assert.equal((r5.command.match(/I00\d/g)||[]).length,4);
});

test('0.224: 월 밖으로 나가는 창·크기 0·겹침·미지원 해상도는 경고로 알려 준다',()=>{
  const r=L.commandFor({cols:2,rows:1,timing:10,startPort:1,windows:[{input:1,x:3000,y:0,w:1920,h:1080},{input:2,x:0,y:0,w:0,h:100},{input:3,x:0,y:0,w:1920,h:1080},{input:4,x:960,y:0,w:1920,h:1080}]});
  assert.ok(r.warnings.some(w=>/월 바깥/.test(w)));
  assert.ok(r.warnings.some(w=>/너비·높이가 0/.test(w)));
  assert.ok(r.warnings.some(w=>/창 3과 창 4이 겹칩니다/.test(w)));
  assert.ok(!r.command.includes('I002'),'크기 0인 창은 커맨드에 넣지 않는다');
  assert.ok(L.commandFor({cols:1,rows:1,timing:17,windows:[]}).warnings.some(w=>/Not support/.test(w)));
});

test('0.224: 화면별 표출 영역은 디스플레이 안 좌표로 적는다',()=>{
  const cover=L.coverageFor({cols:3,rows:1,timing:10,startPort:1,windows:[{input:3,x:480,y:270,w:960,h:540},{input:1,x:0,y:0,w:2880,h:1080}]});
  assert.deepEqual(cover[0].cells,[{row:1,col:1,port:1,x:480,y:270,w:960,h:540,full:false}]);
  assert.deepEqual(cover[1].cells.map(c=>[c.port,c.x,c.w,c.full]),[[1,0,1920,true],[2,0,960,false]]);
});

test('0.224: 시뮬레이터는 XDM 시리즈 화면의 07 카드에만 붙고, 사이트 번들·배포 목록에 들어간다',()=>{
  const products=fs.readFileSync('src/products.js','utf8');
  assert.match(products,/function layoutSimSection\(family\)\{\s*if\(family!=='XDM'\)return '';/);
  assert.match(products,/<span class="rt-pg-idx">07<\/span>화면 연출 시뮬레이터/);
  assert.match(products,/window\.RtLayoutSim\?\.mountAll\(body\)/);
  assert.match(products,/data-scroll-to="rt-layout-sim"/);
  assert.match(fs.readFileSync('index.html','utf8'),/<script src="src\/layout-sim\.js"><\/script><script src="src\/products\.js">/);
  assert.match(fs.readFileSync('scripts/package-site.cjs','utf8'),/'src\/layout-sim\.js'/);
  assert.match(fs.readFileSync('src/styles.css','utf8'),/#rtcom-design \.rt-ls-canvas\{[^}]*touch-action:none/);
});
