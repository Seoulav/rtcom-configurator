// 0.208 모듈형 장비 슬롯·카드 데이터(AV Portal·AV System Builder 요청 2026-10-13, docs/handoff/AV_PORTAL_MODULAR_SLOTS.md).
// 공개 JSON의 slots·slotType·compatibleFrames·io가 매뉴얼 값(구성기 RtCore.slotPlan)과 맞는지, 검증 스크립트가 잘못된 값을 잡는지 확인한다.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
require('../src/catalog.js');require('../src/core.js');
const core=globalThis.RtCore,catalog=globalThis.RtCatalog;
const {validate}=require('../scripts/build-product-index.cjs');
const read=id=>JSON.parse(fs.readFileSync(`data/products/${id}.json`,'utf8'));
const ids=new Set(fs.readdirSync('data/products').filter(name=>name.endsWith('.json')&&name!=='index.json').map(name=>name.replace(/\.json$/,'')));
const SERIES={XDM:'xdm',SPX:'spx',VDM:'vdm'};

test('메인프레임 slots는 매뉴얼 값(구성기 slotPlan)과 같고, 구성기에 없는 XDM-288·VDM-288X는 사용자 확인 72·72(0.212)',()=>{
  for(const [family,id] of Object.entries(SERIES)){
    for(const entry of read(id).lineup.filter(item=>item.kind==='메인프레임')){
      const plan=core.slotPlan(family,entry.model);
      // 0.212 XDM-288·VDM-288X: 주문 생산, 카드 1장 = 4채널이라 288 ÷ 4 = 72(서울영상테크 확인 2026-10-13). 구성기에는 넣지 않음
      if(!plan){assert.deepEqual([entry.slots.input,entry.slots.output],[72,72],entry.model);assert.match(entry.slots.source,/^U/,entry.model);assert.match(entry.summary,/주문 생산/,entry.model);continue}
      assert.deepEqual([entry.slots.input,entry.slots.output],plan,entry.model);
      assert.equal(entry.slots.verification,'VERIFIED',entry.model);
      assert.ok(!('shared' in entry.slots),entry.model);
    }
  }
  const missing=Object.values(SERIES).flatMap(id=>read(id).lineup.filter(item=>item.kind==='메인프레임'&&!item.slots).map(item=>item.model));
  assert.deepEqual(missing,[]);
  const noPlan=Object.entries(SERIES).flatMap(([family,id])=>read(id).lineup.filter(item=>item.kind==='메인프레임'&&!core.slotPlan(family,item.model)).map(item=>item.model));
  assert.deepEqual(noPlan,['XDM-288','VDM-288X'],'구성기에 없는 프레임은 두 288 모델뿐');
});

test('구성기 카드마다 slotType·compatibleFrames·io가 있고, 첫 단자 수량이 구성기 채널 수와 같음',()=>{
  for(const [family,id] of Object.entries(SERIES)){
    const lineup=read(id).lineup;
    for(const [dir,list] of [['input',catalog[family].input],['output',catalog[family].output]])for(const card of list){
      const entry=lineup.find(item=>item.model===card[0]);
      assert.ok(entry,`${card[0]} lineup 항목`);
      assert.equal(entry.slotType,dir,card[0]);
      assert.ok(entry.compatibleFrames.length>0,card[0]);
      assert.equal(entry.io[0].quantity,String(card[2]),`${card[0]} 채널 수`);
      assert.equal(entry.io[0].direction,dir==='input'?'IN':'OUT',card[0]);
    }
  }
});

test('SPX-HOS10은 SPX-M810·M1620에만, 나머지 SPX 카드는 SPX 5종 모두(매뉴얼 250805 3쪽)',()=>{
  const lineup=read('spx').lineup,frames=lineup.filter(item=>item.kind==='메인프레임').map(item=>item.model);
  assert.deepEqual(lineup.find(item=>item.model==='SPX-HOS10').compatibleFrames,['SPX-M810','SPX-M1620']);
  for(const model of ['SPX-HIS8','SPX-HOS12','SPX-COS12'])assert.deepEqual(lineup.find(item=>item.model===model).compatibleFrames,frames,model);
});

test('0.208에 미확인이던 단자는 모두 확인됨(0.210·0.212), SPX-R6는 모듈 칸 6개(shared)',()=>{
  const row=(id,model,connector)=>read(id).lineup.find(item=>item.model===model).io.find(item=>item.connector.startsWith(connector));
  // 0.210 COS100 전원은 출력마다 XDM-PHX 1개로 확인됨(알티컴 확인, 사용자 전달 2026-10-13)
  assert.equal(row('xdm','XDM-COS100','피닉스 5핀(').verification,'VERIFIED');
  assert.equal(row('xdm','XDM-COS100','피닉스 5핀(').quantity,'4');
  // 0.212 사용자 답변(2026-10-13): SOS4 오디오 있음, SIS4-U = VDM-SIS4(3.5mm), SPX-HIS8 3.5mm, HOS4S-UW USB는 쓰지 않아 뺌
  assert.equal(row('vdm','SOS4','3.5mm').verification,'VERIFIED');
  assert.equal(row('spx','SPX-HIS8','3.5mm').verification,'VERIFIED');
  assert.deepEqual(read('vdm').lineup.find(item=>item.model==='SIS4-U').io.filter(item=>item.group==='Audio').map(item=>item.direction+':'+item.verification),['IN:VERIFIED','OUT:VERIFIED']);
  assert.ok(!read('vdm').lineup.find(item=>item.model==='HOS4S-UW').io.some(item=>item.connector==='USB'),'HOS4S-UW USB 행 없음');
  for(const id of Object.values(SERIES))assert.ok(!JSON.stringify(read(id).lineup).includes('REVIEW REQUIRED'),`${id}: 미확인 단자 없음`);
  assert.ok(!read('xdm').lineup.find(item=>item.model==='XDM-WOS100').io.some(item=>item.group==='Audio'),'WOS100은 오디오 출력 없음(0.210 알티컴 확인)');
  const r6=read('spx-r6');
  assert.deepEqual(r6.slots,{shared:6,source:'S1',verification:'VERIFIED',note:r6.slots.note});
  assert.equal(r6.io.filter(item=>/모듈 칸마다 1개/.test(item.condition)).length,2,'기존 io 행은 그대로');
});

test('검증 스크립트가 잘못된 슬롯·카드 데이터를 잡음',()=>{
  const base=read('xdm');
  const errorsFor=change=>{const product=JSON.parse(JSON.stringify(base));change(product);return validate(product,'data/products/xdm.json',ids).join('\n')};
  const entry=(product,model)=>product.lineup.find(item=>item.model===model);
  assert.equal(errorsFor(()=>{}),'');
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').slots={input:1,source:'M',verification:'VERIFIED'}}),/slots는 메인프레임에만/);
  assert.match(errorsFor(p=>{entry(p,'XDM-12').slots.input=-1}),/0 이상 정수/);
  assert.match(errorsFor(p=>{entry(p,'XDM-12').slots.rows=2}),/정하지 않은 키: rows/);
  assert.match(errorsFor(p=>{entry(p,'XDM-12').slots.source='Z'}),/slots\.source\(Z\)/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').slotType='output'}),/slotType\(output\)/);
  assert.match(errorsFor(p=>{entry(p,'XDM-288').slots.input=0}),/XDM-288에 input 슬롯이 없음/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').compatibleFrames.push('SPX-M810')}),/같은 시리즈 메인프레임에 없음/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').io[0].direction='INOUT'}),/direction 값/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').io[0].quantity='네 개'}),/quantity/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').io[0].quantity=''}),/VERIFIED로 둘 수 없음/);
  assert.match(errorsFor(p=>{delete entry(p,'XDM-HIS100').io}),/함께 넣어야 함/);
  assert.match(errorsFor(p=>{entry(p,'XDM-CTR100').slotType='input'}),/입력·출력 카드에만/);
});
