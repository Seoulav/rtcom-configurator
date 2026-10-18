const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Q=require('../src/quad-view.js');
const CE=require('../src/control-example.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const vdm=JSON.parse(read('data/products/vdm.json'));
const spec={...vdm.controlExample,id:vdm.id};

test('0.245: 쿼드뷰 커맨드는 VDM 매뉴얼 82·83쪽 예시와 글자까지 같다',()=>{
  const texts=(o,l,t)=>Q.commandsFor({out:o,layout:l,timing:t,withRoute:false}).lines.map(x=>x.text);
  assert.deepEqual(texts(1,'L05','T00'),['*255OQO01T00!','*255OQO01L05!']);
  assert.deepEqual(texts(2,'L07','T17'),['*255OQO02T17!','*255OQO02L07!']);
});

test('0.245: 레이아웃 8종(L01~L08)은 매뉴얼 63쪽 Format 도해와 82쪽 L1~L8 설명대로 채널과 칸을 가진다',()=>{
  assert.deepEqual(Q.LAYOUTS.map(l=>l.code),['L01','L02','L03','L04','L05','L06','L07','L08']);
  assert.deepEqual(Q.LAYOUTS.map(l=>l.channels.length),[1,1,1,1,4,4,2,4]);
  assert.deepEqual(Q.LAYOUTS.slice(0,4).map(l=>l.channels[0]),[1,2,3,4]);
  for(const l of Q.LAYOUTS){
    const area=l.cells.reduce((sum,c)=>sum+c[3]*c[4],0);
    assert.ok(Math.abs(area-10000)<2,`${l.code} 칸이 화면을 빈틈없이 채운다(${area})`);
  }
  const l6=Q.layoutOf('L06'),l8=Q.layoutOf('L08');
  assert.equal(l6.cells[0][3],75);assert.equal(l6.cells[0][4],100);
  assert.equal(l8.cells[0][3],100);assert.equal(l8.cells[0][4],75);
});

test('0.245: 타이밍 25종(T00~T24)과 레이아웃 번호는 제품 JSON의 OQ 명령 빌더와 같다',()=>{
  const oqt=vdm.controlExample.builders.find(b=>b.id==='oqt'),oql=vdm.controlExample.builders.find(b=>b.id==='oql');
  const tOpts=oqt.params.find(p=>p.id==='t').options,lOpts=oql.params.find(p=>p.id==='l').options;
  assert.deepEqual(Q.TIMINGS.map(t=>t.code),tOpts.map(o=>o[0]));
  assert.equal(Q.TIMINGS.length,25);
  assert.deepEqual(Q.LAYOUTS.map(l=>l.code),lOpts.map(o=>o[0]));
  // 빌더가 만든 글자와 시뮬레이터가 만든 글자가 같다
  for(const l of Q.LAYOUTS){
    const built=CE.buildCommand(spec,oql,{out:'3',l:l.code},{pad:2});
    assert.equal(built.text,Q.commandsFor({out:3,layout:l.code,withRoute:false}).lines.at(-1).text);
  }
  for(const t of Q.TIMINGS){
    const built=CE.buildCommand(spec,oqt,{out:'1',t:t.code},{pad:2});
    assert.equal(built.text,Q.commandsFor({out:1,timing:t.code,withRoute:false}).lines.at(-2).text);
  }
});

test('0.245: 입력 연결(C) 명령은 레이아웃이 쓰는 채널만, 카드 첫 출력 포트부터 순서대로 만든다',()=>{
  const quad=Q.commandsFor({out:1,layout:'L05',timing:'T11',inputs:[3,1,2,4],firstPort:5});
  assert.deepEqual(quad.lines.map(l=>l.text),['*255CI03O05!','*255CI01O06!','*255CI02O07!','*255CI04O08!','*255OQO01T11!','*255OQO01L05!']);
  const side=Q.commandsFor({out:1,layout:'L07',inputs:[7,8,9,10],firstPort:5});
  assert.deepEqual(side.lines.filter(l=>l.kind==='route').map(l=>l.text),['*255CI07O05!','*255CI08O06!']);
  const single=Q.commandsFor({out:1,layout:'L03',inputs:[1,2,3,4],firstPort:5});
  assert.deepEqual(single.lines.filter(l=>l.kind==='route').map(l=>l.text),['*255CI03O07!']);
  // 연결 명령은 CE 장비 명령 빌더 형식(c)과 같다
  const c=vdm.controlExample.builders.find(b=>b.id==='c');
  assert.equal(CE.buildCommand(spec,c,{inp:3,out:'5'},{pad:2}).text,'*255CI03O05!');
});

test('0.245: 3자리 번호와 범위 보정, 99를 넘는 번호 경고',()=>{
  const wide=Q.commandsFor({out:12,layout:'L05',inputs:[1,2,3,4],firstPort:101,pad:3});
  assert.equal(wide.lines[0].text,'*255CI001O101!');
  assert.equal(wide.lines.at(-1).text,'*255OQO012L05!');
  assert.equal(wide.warnings.length,0);
  const warn=Q.commandsFor({out:120,layout:'L05',withRoute:false});
  assert.ok(warn.warnings.some(w=>/3자리/.test(w)));
  const bad=Q.normalize({out:999,layout:'없음',timing:'T99',inputs:[0,'x',300],firstPort:900,pad:5});
  assert.equal(bad.out,256);assert.equal(bad.layout,'L05');assert.equal(bad.timing,'T00');
  assert.deepEqual(bad.inputs,[1,2,256,4]);assert.equal(bad.firstPort,253);assert.equal(bad.pad,2);
});

test('0.245: 화면에는 알티컴 확인 대기 안내와 출처 쪽을 남기고, 사이트 번들·배포 목록·제품 화면에 연결한다',()=>{
  assert.match(Q.FIELD_NOTE,/알티컴 확인 대기/);
  assert.match(Q.FIELD_NOTE,/카드 첫 출력 포트/);
  const src=read('src/quad-view.js');
  assert.match(src,/KV07/);assert.match(src,/63쪽/);assert.match(src,/82·83쪽/);
  assert.match(read('index.html'),/<script src="src\/quad-view\.js"><\/script>/);
  assert.match(read('scripts/package-site.cjs'),/'src\/quad-view\.js'/);
  const products=read('src/products.js'),app=read('src/app.js');
  assert.match(products,/function quadViewSection\(family\)\{\s*if\(family!=='VDM'\)return '';/);
  assert.match(products,/RtQuadView\?\.mountAll\(body\)/);
  assert.match(app,/'QOS4S-U':\{key:'vdm-quadview'/);
  assert.match(app,/'vdm-quadview':openQuadView/);
});

// 0.256 입력 선택 목록(사용자 요청 2026-10-18 "2번도 진행해"): 화면 소스에 선택·전환·경고가 연결되어 있다.
test('0.256: 쿼드뷰 시뮬레이터 입력 칸은 구성기 VDM 입력 카드 목록 선택, 직접 입력 전환, 구성에 없는 번호 경고가 연결되어 있다',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const src=fs.readFileSync(path.join(__dirname,'../src/quad-view.js'),'utf8');
  for(const t of ['data-qv-in-pick','__manual__','data-qv-input-list','savedInputChannels(raw?JSON.parse(raw):null,globalThis.RtCatalog,\'VDM\')','inputChoiceLabel(e)','inputProblems(','구성기에 없음','const manual=new Set()'])assert.ok(src.includes(t),t);
  const css=fs.readFileSync(path.join(__dirname,'../src/styles.css'),'utf8');
  for(const t of ['select.rt-qv-in-sel','.rt-qv-inrow input.is-missing'])assert.ok(css.includes(t),t);
  // 저장된 구성이 없는 Node 환경(전역 RtLayoutSim 없음)에서도 순수 함수는 그대로 동작한다
  const Q=require('../src/quad-view.js');
  assert.deepEqual(Q.normalize({}).inputs,[1,2,3,4]);
});
