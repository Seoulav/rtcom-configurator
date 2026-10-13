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

test('메인프레임 slots는 매뉴얼 값(구성기 slotPlan)과 같고, 근거가 없는 XDM-288·VDM-288X에는 넣지 않음',()=>{
  for(const [family,id] of Object.entries(SERIES)){
    for(const entry of read(id).lineup.filter(item=>item.kind==='메인프레임')){
      const plan=core.slotPlan(family,entry.model);
      if(!plan){assert.ok(!('slots' in entry),`${entry.model}: 매뉴얼 근거가 없으면 slots를 넣지 않음`);continue}
      assert.deepEqual([entry.slots.input,entry.slots.output],plan,entry.model);
      assert.equal(entry.slots.verification,'VERIFIED',entry.model);
      assert.ok(!('shared' in entry.slots),entry.model);
    }
  }
  const missing=Object.values(SERIES).flatMap(id=>read(id).lineup.filter(item=>item.kind==='메인프레임'&&!item.slots).map(item=>item.model));
  assert.deepEqual(missing,['XDM-288','VDM-288X']);
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

test('확인하지 못한 단자는 REVIEW REQUIRED, SPX-R6는 모듈 칸 6개(shared)',()=>{
  const row=(id,model,connector)=>read(id).lineup.find(item=>item.model===model).io.find(item=>item.connector.startsWith(connector));
  assert.equal(row('xdm','XDM-COS100','피닉스 5핀(').verification,'REVIEW REQUIRED');
  assert.equal(row('xdm','XDM-COS100','피닉스 5핀(').quantity,'');
  assert.equal(row('vdm','SOS4','3.5mm').verification,'REVIEW REQUIRED');
  assert.equal(row('vdm','HOS4S-UW','USB').verification,'REVIEW REQUIRED');
  assert.equal(row('spx','SPX-HIS8','3.5mm').verification,'REVIEW REQUIRED');
  assert.ok(!read('xdm').lineup.find(item=>item.model==='XDM-WOS100').io.some(item=>item.group==='Audio'),'카탈로그에 없는 WOS100 오디오 단자를 지어내지 않음');
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
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').compatibleFrames.push('XDM-288')}),/XDM-288에 input 슬롯이 없음/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').compatibleFrames.push('SPX-M810')}),/같은 시리즈 메인프레임에 없음/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').io[0].direction='INOUT'}),/direction 값/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').io[0].quantity='네 개'}),/quantity/);
  assert.match(errorsFor(p=>{entry(p,'XDM-HIS100').io[0].quantity=''}),/VERIFIED로 둘 수 없음/);
  assert.match(errorsFor(p=>{delete entry(p,'XDM-HIS100').io}),/함께 넣어야 함/);
  assert.match(errorsFor(p=>{entry(p,'XDM-CTR100').slotType='input'}),/입력·출력 카드에만/);
});
