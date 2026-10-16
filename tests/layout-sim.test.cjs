const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const L=require('../src/layout-sim.js');

// 0.224 XDM 화면 연출 시뮬레이터(WOS100 월 오버레이). 근거: 알티컴 XDM Command Guide 1013(44~55쪽, 0.209 공개본)과 알티컴 확인(0.210·0.214).
// 가이드에 적힌 커맨드 원문이 글자 하나 다르지 않게 나와야 한다.

test('0.224/0.229: 프리셋 커맨드가 가이드 예제 2·3 원문, 기본 예시 계산값, 현장 메모 원문 3개와 똑같다',()=>{
  const checked=L.PRESETS.filter(p=>p.expected);
  assert.equal(checked.length,6);
  for(const p of checked)assert.equal(L.commandFor(p.state).command,p.expected,p.id);
  assert.equal(L.PRESETS[0].state.mapping,'card','기본 프리셋은 알티컴 확인 배치');
  // 0.229 사용자 결정 2026-10-16 "2안으로 전부 공개해": 현장 메모 원문(출력 9~12번) 3개를 그대로 둔다
  const memo=L.PRESETS.filter(p=>p.id.startsWith('memo-'));
  assert.deepEqual(memo.map(p=>p.expected),[
    '*255OWO009-012W14H01V01P4321O000I001O009X0Y295W1920H1571I002O010X1920Y295W1920H1571!',
    '*255OWO009-012W14H01V01P4321O000I003O009X0Y0W3840H2160!',
    '*255OWO009-012W14H01V01P4321O000I007O009X0Y295W3840H1571!']);
  // 참고 커맨드(가이드 본문에 없는 현장 확인값)도 함께 공개
  const text=JSON.stringify(L.FIELD_NOTES);
  for(const cmd of ['*255IVI001I002I003M03!','*255IVI001I002M00!','*255IVI003M00!','*255IEI009M18!','*255IEI009M19!'])assert.ok(text.includes(cmd),cmd);
  assert.ok(/2112x1728/.test(text)&&/딥 스위치 1번/.test(text));
});

test('0.224: 포트 배치 — card는 디스플레이 1대 = 카드 1장(OUT 1), guide는 디스플레이 2×2 = 카드 1장(가이드 46~47쪽)',()=>{
  assert.deepEqual(L.portMapFor({mapping:'card',cols:3,rows:2,startPort:1}),[[1,5,9],[13,17,21]]);
  assert.deepEqual(L.portMapFor({mapping:'guide',cols:3,rows:2,startPort:1}),[[1,2,5],[3,4,7]]);
  // 6×3(가이드 55쪽 예제 8): 3행은 카드 4~6의 1·2번 포트만 쓴다(O013·O014·O017·O018·O021·O022)
  assert.deepEqual(L.portMapFor({mapping:'guide',cols:6,rows:3,startPort:1}),[[1,2,5,6,9,10],[3,4,7,8,11,12],[13,14,17,18,21,22]]);
  assert.equal(L.normalize({}).mapping,'card');
  // 시작 포트는 카드 첫 포트(1·5·9…)로 맞춘다
  assert.equal(L.normalize({startPort:10}).startPort,9);
  assert.equal(L.geometry({mapping:'card',cols:2,rows:2,startPort:1}).endPort,16);
  assert.equal(L.geometry({mapping:'guide',cols:2,rows:2,startPort:1}).endPort,4);
});

test('0.224: 창은 걸치는 카드마다 남은 포트 중 가장 작은 번호를 하나씩 쓴다(가이드 예제 1: I002 O002O005)',()=>{
  const r=L.commandFor(L.PRESETS.find(p=>p.id==='guide-1').state);
  assert.deepEqual(r.assigned.map(a=>a.ports),[[1],[2,5]]);
  assert.match(r.command,/I001O001X0Y0W2880H2160I002O002O005X2880Y0W2880H2160!$/);
  // card 배치 2×2: 전체 창은 카드 4장의 1번 포트, PIP 창은 4번째 카드의 남은 포트 14
  const pip=L.commandFor(L.PRESETS[0].state);
  assert.deepEqual(pip.assigned.map(a=>a.ports),[[1,5,9,13],[14]]);
  // 디스플레이 1대에 창 5개는 포트가 모자란다 → 경고, 5번째 창은 커맨드에서 빠진다
  const five={mapping:'card',cols:1,rows:1,timing:14,startPort:1,clear:'none',windows:Array.from({length:5},(_,i)=>({input:i+1,x:i*100,y:0,w:500,h:500}))};
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
  const cover=L.coverageFor({mapping:'guide',cols:3,rows:1,timing:10,startPort:1,windows:[{input:3,x:480,y:270,w:960,h:540},{input:1,x:0,y:0,w:2880,h:1080}]});
  assert.deepEqual(cover[0].cells,[{row:1,col:1,port:1,x:480,y:270,w:960,h:540,full:false}]);
  assert.deepEqual(cover[1].cells.map(c=>[c.port,c.x,c.w,c.full]),[[1,0,1920,true],[2,0,960,false]]);
  const card=L.coverageFor({mapping:'card',cols:2,rows:1,timing:14,startPort:1,windows:[{input:1,x:1920,y:0,w:3840,h:2160}]});
  assert.deepEqual(card[0].cells.map(c=>[c.port,c.x,c.w]),[[1,1920,1920],[5,0,1920]]);
});

test('0.224: 시뮬레이터는 XDM 시리즈 화면의 07 카드에만 붙고, 사이트 번들·배포 목록에 들어가며 공개 커맨드 가이드로 링크한다',()=>{
  const products=fs.readFileSync('src/products.js','utf8');
  assert.match(products,/function layoutSimSection\(family\)\{\s*if\(family!=='XDM'\)return '';/);
  assert.match(products,/<span class="rt-pg-idx">07<\/span>화면 연출 시뮬레이터/);
  assert.match(products,/window\.RtLayoutSim\?\.mountAll\(body\)/);
  assert.match(products,/data-scroll-to="rt-layout-sim"/);
  assert.match(fs.readFileSync('index.html','utf8'),/<script src="src\/layout-sim\.js"><\/script><script src="src\/products\.js">/);
  assert.match(fs.readFileSync('scripts/package-site.cjs','utf8'),/'src\/layout-sim\.js'/);
  assert.match(fs.readFileSync('src/styles.css','utf8'),/#rtcom-design \.rt-ls-canvas\{[^}]*touch-action:none/);
  assert.equal(L.GUIDE_PDF,'output/design/assets/docs/xdm-command-guide.pdf');
  assert.ok(fs.existsSync(L.GUIDE_PDF),'0.209에서 공개한 커맨드 가이드 PDF');
});

// 0.225 2차: XDM-HOS100 한 화면 멀티뷰(OQ, Command Guide 25~29쪽).
test('0.225: HOS100 프리셋 커맨드가 가이드 28쪽 예제 4개(L00 계단식·L09 PIP·L05·L12) 원문과 똑같다',()=>{
  const checked=L.HOS_PRESETS.filter(p=>p.expected);
  assert.equal(checked.length,4);
  for(const p of checked)assert.equal(L.hosCommandFor(p.state).command,p.expected,p.id);
  // 끄기 커맨드(가이드 28쪽 "Quadview mode OFF")
  assert.equal(L.hosCommandFor({startPort:1}).off,'*255OQO001M00!');
});

test('0.225: HOS100 창 n은 카드 포트 n에 연결되고(스위칭 C 커맨드), 레이어 수에 따라 포트 상태를 알려 준다',()=>{
  const stairs=L.hosCommandFor(L.HOS_PRESETS[0].state);
  assert.equal(stairs.switching,'*255CI001O001,I002O002,I003O003,I004O004!');
  assert.deepEqual(stairs.ports,['합성 출력','1번과 같은 화면','1번과 같은 화면','1번과 같은 화면']);
  const pip=L.hosCommandFor({layout:'L09',startPort:9,windows:[{input:5},{input:6,x:1920,y:1080,w:1920,h:1080}]});
  assert.equal(pip.switching,'*255CI005O009,I006O010!','카드 시작 포트 9번이면 창 1·2 = 포트 9·10');
  assert.equal(pip.command,'*255OQO009M14L09X1920Y1080W1920H1080!');
  assert.deepEqual(pip.ports,['합성 출력','사용 불가','따로 스위칭','따로 스위칭']);
  // L00에서 창 3·4를 끄면(W0 H0) 레이어 2개로 센다
  const two=L.hosCommandFor({layout:'L00',windows:[{input:1,x:0,y:0,w:1920,h:2160},{input:2,x:1920,y:0,w:1920,h:2160},{w:0,h:0},{w:0,h:0}]});
  assert.equal(two.layers,2);
  assert.match(two.command,/O003X\d{4}Y\d{4}W0000H0000O004X\d{4}Y\d{4}W0000H0000!$/,'꺼진 창은 W0000 H0000(좌표는 그대로)');
  assert.equal(two.switching,'*255CI001O001,I002O002!');
});

test('0.225: HOS100 고정 레이아웃은 출력 해상도 비율로 창 위치를 계산하고 끌 수 없으며, L13은 넣지 않았다',()=>{
  assert.deepEqual(L.hosWindows({layout:'L05',timing:10}).map(w=>[w.n,w.x,w.y,w.w,w.h,w.free]),[[1,0,0,960,540,false],[2,960,0,960,540,false],[3,0,540,960,540,false],[4,960,540,960,540,false]]);
  const pip=L.hosWindows({layout:'L09',timing:14,windows:[{},{x:100,y:200,w:800,h:450}]});
  assert.deepEqual(pip.map(w=>[w.n,w.free]),[[1,false],[2,true]]);
  assert.ok(!L.HOS_LAYOUTS.some(l=>l.code==='L13'));
  assert.equal(L.HOS_LAYOUTS.length,13);
  const out=L.hosCommandFor({layout:'L00',windows:[{input:1,x:3000,y:0,w:1920,h:1080}]});
  assert.ok(out.warnings.some(w=>/밖으로 나갑니다/.test(w)));
});

test('0.225: "맨 위로"는 그 창이 맨 위 포트를 받도록 순서를 바꾼다(WOS100은 창 순서, HOS100 L00은 포트 자리 맞바꿈)',()=>{
  // WOS100 기본 프리셋: 전체 창(포트 1·5·9·13) 위에 PIP(포트 14). 전체 창을 맨 위로 → 뒤로 가서 PIP가 13, 전체 창이 1·5·9·14를 받아 P4321에서 맨 위
  const base=L.PRESETS[0].state;
  const front=L.bringToFront(base,0);
  const r=L.commandFor(front);
  assert.deepEqual(r.assigned.map(a=>a.ports),[[13],[1,5,9,14]]);
  assert.match(r.command,/I002O013X5760Y3240W1920H1080I001O001O005O009O014X0Y0W7680H4320!$/);
  // P1234면 앞으로 옮긴다(이미 맨 앞이면 그대로)
  assert.equal(L.bringToFront({...base,priority:'1234'},0).windows[0].input,1);
  assert.equal(L.bringToFront({...base,priority:'1234'},1).windows[0].input,2);
  // HOS100 L00: P4321이면 창 4 자리가 맨 위 → 창 1 데이터를 4번 자리로 맞바꿈(입력 1이 포트 4로)
  const hos=L.hosBringToFront({layout:'L00',priority:'4321',windows:[{input:1},{input:2},{input:3},{input:4}]},0);
  assert.deepEqual(hos.windows.map(w=>w.input),[4,2,3,1]);
  assert.equal(L.hosCommandFor(hos).switching,'*255CI004O001,I002O002,I003O003,I001O004!');
  assert.deepEqual(L.hosBringToFront({layout:'L00',priority:'1234',windows:[{input:1},{input:2},{input:3},{input:4}]},2).windows.map(w=>w.input),[3,2,1,4]);
  // 쌓임 순서(위가 먼저): WOS100 P4321은 큰 포트 번호가 위
  assert.deepEqual(L.stackOrder(front),[1,0]);
  assert.deepEqual(L.stackOrder({...front,priority:'1234'}),[0,1]);
});

// 0.226 두 카드를 한 구성에(사용자 설명 2026-10-16 "HOS 카드로 인풋 2개·4개 연출 … WOS 카드는 디스플레이 4개에 걸쳐서 레이어 연출 … 둘 다 사용하는 경우").
test('0.226: 전체 커맨드는 포함한 카드의 커맨드를 순서대로 모으고 출력 포트가 겹치면 경고한다',()=>{
  const wos=L.PRESETS[0].state;
  const both=L.combinedCommands(wos,{startPort:1},{wos:true,hos:true});
  assert.deepEqual(both.lines.map(l=>l.card),['WOS100','HOS100','HOS100']);
  assert.equal(both.lines[0].text,L.PRESETS[0].expected);
  assert.match(both.lines[1].text,/^\*255CI001O001,I002O002,I003O003,I004O004!$/);
  assert.ok(both.overlap&&both.warnings.some(w=>/출력 포트가 겹칩니다.*17번으로 옮기세요/.test(w)));
  assert.equal(both.nextFreePort,17);
  const apart=L.combinedCommands(wos,{startPort:17},{wos:true,hos:true});
  assert.ok(!apart.overlap);
  assert.match(apart.lines[1].text,/O017,I002O018,I003O019,I004O020!$/);
  assert.match(apart.lines[2].text,/^\*255OQO017M14L00P4321O017X/);
  const only=L.combinedCommands(wos,{startPort:1},{wos:false,hos:true});
  assert.deepEqual(only.lines.map(l=>l.card),['HOS100','HOS100']);
  assert.ok(!only.overlap);
  assert.ok(L.combinedCommands(wos,{},{wos:false,hos:false}).warnings.some(w=>/포함한 카드가 없습니다/.test(w)));
});
