const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const L=require('../src/layout-sim.js');

// 0.224 XDM 화면 연출 시뮬레이터(WOS100 월 오버레이). 근거: 알티컴 XDM Command Guide 1013(44~55쪽, 0.209 공개본)과 알티컴 확인(0.210·0.214).
// 가이드에 적힌 커맨드 원문이 글자 하나 다르지 않게 나와야 한다.

test('0.224/0.233: 프리셋 커맨드가 가이드 예제 2·3 원문, 기본 예시 계산값, 현장 메모 원문 3개와 똑같다',()=>{
  const checked=L.PRESETS.filter(p=>p.expected);
  assert.equal(checked.length,6);
  for(const p of checked)assert.equal(L.commandFor(p.state).command,p.expected,p.id);
  assert.equal(L.PRESETS[0].state.mapping,'card','기본 프리셋은 알티컴 확인 배치');
  // 0.233 사용자 결정 2026-10-16 "2안으로 전부 공개해": 현장 메모 원문(출력 9~12번) 3개를 그대로 둔다
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
  assert.ok(r.warnings.some(w=>/겹치는 창: 창 3, 창 4\./.test(w)));
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
  assert.match(fs.readFileSync('index.html','utf8'),/<script src="src\/layout-sim\.js"><\/script>(<script src="src\/quad-view\.js"><\/script>)?(<script src="src\/vdm-wall\.js"><\/script>)?(<script src="src\/control-example\.js"><\/script>)?<script src="src\/products\.js">/);
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

// 0.235 카드별 레이어 사용량(사용자 질문 2026-10-16 "중간 분할 점에 레이어를 배치하면 어떻게 레이어 카운팅이 되는거야?").
test('0.235: 카드 경계에 걸친 창은 걸친 카드마다 레이어 1개씩 쓰고 카드별 남은 레이어를 센다',()=>{
  const base={cols:2,rows:2,mapping:'card',windows:[{input:1,x:0,y:0,w:7680,h:4320},{input:2,x:2880,y:1620,w:1920,h:1080},{input:3,x:100,y:100,w:800,h:600}]};
  const usage=L.cardUsage(L.normalize(base));
  assert.equal(usage.length,4);
  assert.deepEqual(usage.map(c=>c.used),[3,2,2,2]);
  assert.deepEqual(usage.map(c=>c.free),[1,2,2,2]);
  assert.deepEqual(usage[0].windows,[1,2,3]);
  assert.deepEqual(usage[1].windows,[1,2]);
  // 창 1(월 전체)과 창 2(중앙)는 카드 4장을 모두 걸치므로 각각 레이어 4개를 쓴다.
  const all=L.assignPorts(L.normalize(base));
  assert.equal(all[0].ports.length,4);assert.equal(all[1].ports.length,4);assert.equal(all[2].ports.length,1);
  // 한 카드에 창 5개를 올리면 5번째 창은 배정되지 못하고 overflow로 알려 준다.
  const five={cols:1,rows:1,windows:Array.from({length:5},(_,i)=>({input:i+1,x:i*10,y:0,w:1920,h:1080}))};
  const u5=L.cardUsage(L.normalize(five));
  assert.equal(u5[0].used,4);assert.equal(u5[0].free,0);assert.deepEqual(u5[0].overflow,[5]);
  // 너비·높이가 0인 창은 레이어를 쓰지 않는다.
  assert.equal(L.cardUsage(L.normalize({cols:1,rows:1,windows:[{input:1,x:0,y:0,w:0,h:0}]}))[0].used,0);
});

test('0.239: AMX 구성에 담을 항목은 시뮬레이터가 만든 커맨드 문자열 그대로다',()=>{
  const wos=L.PRESETS[0].state,hos=L.HOS_PRESETS[0].state;
  const w=L.amxItems('WOS100',wos,hos,{});
  assert.equal(w.length,1);assert.equal(w[0].text,L.commandFor(wos).command);
  const h=L.amxItems('HOS100',wos,hos,{});
  const hr=L.hosCommandFor(hos);
  assert.deepEqual(h.map(x=>x.text),[hr.switching,hr.command]);
  const all=L.amxItems('ALL',wos,hos,{wos:true,hos:true});
  assert.equal(all.length,3);
  assert.deepEqual(L.amxItems('ALL',wos,hos,{wos:false,hos:true}).map(x=>x.text),[hr.switching,hr.command]);
  assert.deepEqual(L.amxItems('ALL',wos,hos,{wos:false,hos:false}),[]);
  assert.ok(all.every(x=>x.source==='07 시뮬레이터'&&x.label));
});

// 0.237 창 정렬 버튼(사용자 선택 2026-10-16 "1번과 2번만 하자": 중간 분할점 연출을 마우스 조작 없이 재현).
test('0.237: 창 정렬은 월 전체·월 가운데(분할점 걸침)·디스플레이 1칸으로 위치와 크기를 맞춘다',()=>{
  const base={cols:2,rows:2,windows:[{input:1,x:0,y:0,w:7680,h:4320},{input:2,x:5760,y:3240,w:1920,h:1080}]};
  const n=L.normalize(base);
  // 월 가운데: 디스플레이 1칸(3840×2160)을 월 한가운데에 놓아 2×2 월의 분할점 위에 걸친다 → 카드 4장 모두 사용.
  const center=L.alignWindow(n,1,'center');
  assert.deepEqual({x:center.windows[1].x,y:center.windows[1].y,w:center.windows[1].w,h:center.windows[1].h},{x:1920,y:1080,w:3840,h:2160});
  assert.equal(L.assignPorts(center)[1].slots.length,4);
  assert.equal(L.commandFor(center).command.includes('I002'),true);
  assert.ok(L.commandFor(center).command.includes('X1920Y1080W3840H2160'));
  // 월 전체
  const wall=L.alignWindow(n,1,'wall');
  assert.deepEqual([wall.windows[1].x,wall.windows[1].y,wall.windows[1].w,wall.windows[1].h],[0,0,7680,4320]);
  // 디스플레이 1칸: 창 중심이 있는 칸(오른쪽 아래)을 가득 채워 카드 1장만 쓴다.
  const cell=L.alignWindow(n,1,'cell');
  assert.deepEqual([cell.windows[1].x,cell.windows[1].y,cell.windows[1].w,cell.windows[1].h],[3840,2160,3840,2160]);
  assert.equal(L.assignPorts(cell)[1].slots.length,1);
  // 다른 창은 그대로, 범위를 벗어난 번호나 알 수 없는 방식은 원본을 돌려준다.
  assert.deepEqual(center.windows[0],n.windows[0]);
  assert.deepEqual(L.alignWindow(n,5,'wall').windows,n.windows);
  assert.deepEqual(L.alignWindow(n,0,'none').windows,n.windows);
  // 가로 1대 월에서는 가운데가 디스플레이 안쪽이라 분할점에 걸치지 않는다.
  const one=L.alignWindow(L.normalize({cols:1,rows:1,windows:[{input:1,x:0,y:0,w:100,h:100}]}),0,'center');
  assert.deepEqual([one.windows[0].x,one.windows[0].y,one.windows[0].w,one.windows[0].h],[0,0,3840,2160]);
});

// 0.253 입력 번호 확인·연결 한 줄·꺼진 창(사용자 요청 2026-10-18 "입력 칸이 입력포트인거야?", "제안대로 진행해줘")
test('0.253: 구성기 저장 구성에서 입력 카드가 덮는 채널(CH)을 구성기 chRange와 같은 규칙으로 읽는다',()=>{
  const catalog=require('../src/catalog.js')||globalThis.RtCatalog;
  const cat=globalThis.RtCatalog;assert.ok(cat&&cat.XDM,'catalog.js가 RtCatalog를 전역에 둠');
  void catalog;
  const doc=(placements,family='XDM')=>({state:{family,model:'XDM-12',placements}});
  const a=L.savedInputChannels(doc({'in-1':'XDM-HI100','in-2':'XDM-HIS100','out-1':'XDM-HOS100'}),cat);
  assert.equal(a.text,'CH 1–8','입력 슬롯 1·2에 4채널 카드 → CH 1–8(이어지는 구간은 합침)');
  assert.equal(a.count,8);assert.ok(a.set.has(5)&&a.set.has(8)&&!a.set.has(9));
  // 빈 슬롯 사이는 구간이 나뉜다: 슬롯 3 = (3−1)×4+1 = CH 9–12
  const b=L.savedInputChannels(doc({'in-1':'XDM-HI100','in-3':'XDM-HI100'}),cat);
  assert.equal(b.text,'CH 1–4, CH 9–12');assert.ok(b.set.has(10)&&!b.set.has(5));
  assert.equal(L.savedInputChannels(doc({}),cat).text,'');
  assert.equal(L.savedInputChannels(doc({'in-1':'XDM-HI100'},'SPX'),cat),null,'XDM이 아니면 확인하지 않음');
  assert.equal(L.savedInputChannels(null,cat),null);assert.equal(L.savedInputChannels(doc({}),null),null);
  // src/app.js의 chRange와 같은 공식이라는 점을 소스에서도 확인한다
  const app=fs.readFileSync(require('node:path').join(__dirname,'../src/app.js'),'utf8');
  assert.match(app,/first=\(n-1\)\*Math\.max\(\.\.\.families\[state\.family\]\[slot\.dir\]\.map\(item=>item\[2\]\)\)\+1/);
});

test('0.253: 구성에 없는 입력 번호만 경고하고, 저장된 구성이 없으면 경고하지 않는다',()=>{
  const cat=globalThis.RtCatalog;
  const saved=L.savedInputChannels({state:{family:'XDM',model:'XDM-12',placements:{'in-1':'XDM-HI100','in-2':'XDM-HI100'}}},cat);
  const p=L.inputProblems([{n:3,input:2},{n:4,input:10}],saved);
  assert.equal(p.length,1);assert.equal(p[0].n,4);assert.equal(p[0].input,10);
  assert.match(p[0].text,/창 4\(입력 10\): 구성기에 저장된 XDM-12 구성에는 입력 10번이 없습니다\. 입력 카드는 CH 1–8입니다\./);
  assert.deepEqual(L.inputProblems([{n:1,input:99}],null),[]);
  const none=L.savedInputChannels({state:{family:'XDM',model:'XDM-12',placements:{}}},cat);
  assert.match(L.inputProblems([{n:1,input:1}],none)[0].text,/장착한 입력 카드가 없습니다/);
});

test('0.253: HOS100은 너비·높이가 0이거나 그 레이아웃이 쓰지 않는 창을 커맨드와 연결 줄에서 뺀다',()=>{
  // 사용자 캡처(2026-10-18): 창 1·2는 W0 H0(꺼짐), 창 3은 입력 2, 창 4는 입력 10
  const st=L.normalizeHos({layout:'L00',startPort:1,priority:'4321',windows:[{input:1,x:0,y:0,w:0,h:0},{input:2,x:1920,y:0,w:0,h:0},{input:2,x:1812,y:186,w:1368,h:1125},{input:10,x:82,y:216,w:1562,h:1188}]});
  assert.deepEqual(L.hosUsed(st).map(w=>[w.n,w.input,w.port]),[[3,2,3],[4,10,4]]);
  assert.equal(L.hosCommandFor(st).switching,'*255CI002O003,I010O004!','꺼진 창의 입력은 연결 커맨드에 들어가지 않는다');
  const links=L.hosLinks(st);
  assert.deepEqual(links.map(l=>[l.n,l.off,l.ports.join()]),[[1,true,''],[2,true,''],[3,false,'3'],[4,false,'4']]);
  // 고정 레이아웃 L10(1·2번 PBP)은 창 1·2만 쓴다
  const pbp=L.normalizeHos({layout:'L10',startPort:5,windows:[{input:7},{input:8},{input:9},{input:10}]});
  assert.deepEqual(L.hosUsed(pbp).map(w=>[w.n,w.input,w.port]),[[1,7,5],[2,8,6]]);
  assert.deepEqual(L.hosLinks(pbp).map(l=>l.off),[false,false,true,true]);
  // 창 n = 카드 포트 n: 시작 포트 5이면 창 4는 포트 8
  assert.equal(L.hosLinks(L.normalizeHos({layout:'L05',startPort:5}))[3].ports[0],8);
});

test('0.253: WOS100 연결 줄은 창이 받은 출력 포트 전부를 적는다',()=>{
  const st=L.normalize({mapping:'card',cols:2,rows:2,timing:14,startPort:1,priority:'4321',clear:'list',windows:[{input:3,label:'PC',x:0,y:0,w:7680,h:4320}]});
  const links=L.wosLinks(st);
  assert.equal(links.length,1);assert.equal(links[0].input,3);assert.equal(links[0].label,'PC');
  assert.deepEqual(links[0].ports,[1,5,9,13],'월 전체를 덮는 창은 카드 4장을 쓰고, 카드 1장 = 디스플레이 1대라 카드마다 첫 포트를 받는다(0.240)');
});

test('0.253: 화면 소스에 "꺼짐" 표시·입력 설명·연결 한눈에 보기·입력 확인이 연결되어 있다',()=>{
  const src=fs.readFileSync(require('node:path').join(__dirname,'../src/layout-sim.js'),'utf8');
  for(const t of ['rt-ls-offtag','is-off','is-missing','rt-ls-links','연결 한눈에 보기','savedHintHtml(saved)','linksHtml(hosLinks(hos))','linksHtml(wosLinks(state))','매트릭스 입력 포트 번호'])assert.ok(src.includes(t),t);
  const css=fs.readFileSync(require('node:path').join(__dirname,'../src/styles.css'),'utf8');
  for(const t of ['.rt-ls-offtag','.rt-ls-links','input.is-missing'])assert.ok(css.includes(t),t);
});
