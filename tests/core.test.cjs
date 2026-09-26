const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../src/catalog.js');require('../src/core.js');
const core=globalThis.RtCore;

const configured=()=>{
  const state={...core.initial(),model:'XDM-12',step:4,maxStep:4,slot:'in-1',placements:{'in-1':'XDM-CIS100','out-1':'XDM-COS100'},physicalSlots:{status:'manual_documented',slots:['in-1','in-2','in-3','out-1','out-2','out-3']},links:{'in-1':{device:'XDM-CTR100 · TX',count:2,distance:'30'},'out-1':{device:'XDM-CTR100 · RX',count:3,distance:'50'}}};
  state.portAssignments=core.syncPorts(state);
  return state;
};

test('XDM-12 exposes three input and three output slots',()=>{
  const slots=core.slotsFor(configured());
  assert.deepEqual(slots.map(slot=>slot.id),['in-1','in-2','in-3','out-1','out-2','out-3']);
  assert.equal(slots.filter(slot=>slot.dir==='input').length,3);
  assert.equal(slots.filter(slot=>slot.dir==='output').length,3);
});

test('manual slot counts are used for every documented XDM frame',()=>{
  for(const [model,count] of Object.entries({'XDM-12':3,'XDM-20':5,'XDM-36':9,'XDM-72':18,'XDM-144':36,'XDM-216':54})){
    const slots=core.slotsFor({...core.initial(),model});
    assert.equal(slots.filter(slot=>slot.dir==='input').length,count,model+' input');
    assert.equal(slots.filter(slot=>slot.dir==='output').length,count,model+' output');
    assert.equal(slots.at(-1).id,`out-${count}`);
  }
});

test('every XDM card supplies four channels',()=>{
  for(const direction of ['input','output']) for(const item of RtCatalog.XDM[direction]) assert.equal(item[2],4,item[0]);
});

test('XDM-12 accepts all six cards and totals twelve channels each way',()=>{
  const state={...core.initial(),model:'XDM-12',slot:'in-1',placements:{'in-1':'XDM-HI100','in-2':'XDM-DPI100','in-3':'XDM-SIS100','out-1':'XDM-HOS100','out-2':'XDM-DPOS100','out-3':'XDM-SOS100'}};
  const checked=core.checkState(state);
  const input=Object.entries(checked.placements).filter(([slot])=>slot.startsWith('in-')).reduce((sum,[,id])=>sum+RtCatalog.XDM.input.find(card=>card[0]===id)[2],0);
  const output=Object.entries(checked.placements).filter(([slot])=>slot.startsWith('out-')).reduce((sum,[,id])=>sum+RtCatalog.XDM.output.find(card=>card[0]===id)[2],0);
  assert.equal(input,12);assert.equal(output,12);
  assert.equal(core.bom(checked).filter(row=>row.category.includes('카드')).reduce((sum,row)=>sum+row.quantity,0),6);
});

test('XDM-36 fills nine cards per side and totals thirty-six channels',()=>{
  const placements={};
  for(let index=1;index<=9;index++){placements[`in-${index}`]='XDM-HI100';placements[`out-${index}`]='XDM-HOS100';}
  const state=core.checkState({...core.initial(),model:'XDM-36',slot:'in-1',placements});
  assert.equal(Object.keys(state.placements).length,18);
  assert.equal(core.bom(state).find(row=>row.model==='XDM-HI100').quantity,9);
  assert.equal(core.bom(state).find(row=>row.model==='XDM-HOS100').quantity,9);
  assert.equal(Object.values(state.portAssignments).filter(port=>port.direction==='input').length,36);
  assert.equal(Object.values(state.portAssignments).filter(port=>port.direction==='output').length,36);
});

test('round-trip preserves TX/RX roles and combines purchasing quantities',()=>{
  const state=configured(),doc=core.document(state),restored=core.parse(JSON.stringify(doc));
  assert.equal(doc.schemaVersion,3);
  assert.deepEqual(restored,state);
  assert.equal(core.bom(state).find(row=>row.model==='XDM-CTR100').quantity,5);
  assert.equal(core.bom(state).find(row=>row.category==='전원 장비').quantity,1);
  assert(core.validate(state).issues.some(issue=>issue.code==='CTR_POWER_REQUIRED'));
  assert.equal(doc.validation.canFinalize,false);
});

test('schema two XDM-12 slots migrate to the six-slot identifiers',()=>{
  const legacy=core.document(configured());legacy.schemaVersion=2;
  legacy.state.placements={'in-a':'XDM-CIS100','out-b':'XDM-COS100'};
  legacy.state.links={'in-a':{device:'XDM-CTR100 · TX',count:1,distance:'30'},'out-b':{device:'XDM-CTR100 · RX',count:1,distance:'30'}};
  legacy.state.slot='out-b';legacy.state.portAssignments={};
  const restored=core.parse(JSON.stringify(legacy));
  assert.equal(restored.placements['in-1'],'XDM-CIS100');
  assert.equal(restored.placements['out-2'],'XDM-COS100');
  assert.equal(restored.slot,'out-2');
});

test('requirements from old files are intentionally discarded',()=>{
  const legacy=core.document(configured());legacy.schemaVersion=2;
  legacy.state.requirements={inputs:[{id:'old',direction:'input',signalType:'HDMI',quantity:4}],outputs:[]};
  assert.deepEqual(core.parse(JSON.stringify(legacy)).requirements,{inputs:[],outputs:[]});
});

test('rejects wrong direction, family, count, missing chassis and a fourth slot',()=>{
  for(const alter of [
    state=>state.links['in-1'].device='XDM-CTR100 · RX',
    state=>state.family='SPX',
    state=>state.links['in-1'].count=5,
    state=>state.links['in-1'].count=1.5,
    state=>state.model=null,
    state=>state.placements['in-4']='XDM-CIS100'
  ]){
    const state=configured();alter(state);const before=JSON.stringify(state);
    assert.throws(()=>core.checkState(state));assert.equal(JSON.stringify(state),before);
  }
});

test('rejects malformed, oversized, stale and future documents',()=>{
  assert.throws(()=>core.parse('{bad'));assert.throws(()=>core.parse(' '.repeat(1024*1024+1)));
  for(const change of [doc=>doc.schemaVersion=4,doc=>doc.catalogVersion='old',doc=>doc.state.family='__proto__']){
    const doc=core.document(configured());change(doc);assert.throws(()=>core.parse(JSON.stringify(doc)));
  }
});

test('does not trust validation or BOM supplied in a file',()=>{
  const doc=core.document(configured());doc.validation={canFinalize:true,status:'VERIFIED'};doc.bom=[];
  const restored=core.document(core.parse(JSON.stringify(doc)));
  assert.equal(restored.validation.canFinalize,false);assert.equal(restored.bom.length,5);
});

test('empty and partly used slots produce no error',()=>{
  const state={...core.initial(),model:'XDM-12',slot:'in-1',placements:{'in-1':'XDM-CIS100'}};
  state.portAssignments=core.syncPorts(state);state.portAssignments['in-1:4'].quantity=0;
  const result=core.validate(state);
  assert(!result.issues.some(issue=>issue.level==='ERROR'));
  assert(result.issues.some(issue=>issue.code==='XDM_SLOT_LAYOUT'&&issue.level==='VALID'));
});

test('VDM Quad card remains two ports and unknown remote links stay unconfirmed',()=>{
  const state={...core.initial(),family:'VDM',model:'VDM-8X',placements:{'in-a':'CIS4-U','out-a':'QOS4S-U'}};
  assert.equal(RtCatalog.VDM.output.find(card=>card[0]==='QOS4S-U')[2],2);
  assert(core.validate(state).issues.some(issue=>issue.code==='LINK_UNKNOWN_in-a'));
  assert.equal(core.choices('CIS4-U').length,0);
});

test('CSV contains draft status, combined quantities and accessory limitation',()=>{
  const csv=core.csv(configured());
  assert.match(csv,/UNVERIFIED_DRAFT/);assert.match(csv,/"XDM-CTR100","5"/);assert.match(csv,/"전원 장비"/);assert.match(csv,/기본 포함품 미확정/);
});

test('HDBaseT and fiber cards default to their catalog paired extenders',()=>{
  assert.deepEqual(core.defaultLink('XDM-CIS100',4),{device:'XDM-CTR100 · TX',count:4,distance:'30'});
  assert.deepEqual(core.defaultLink('XDM-COS100',4),{device:'XDM-CTR100 · RX',count:4,distance:'30'});
  assert.deepEqual(core.defaultLink('XDM-FIS100',4),{device:'XDM-FT101',count:4,distance:'30'});
  assert.deepEqual(core.defaultLink('XDM-FOS100',4),{device:'XDM-FR101',count:4,distance:'30'});
  for(const id of ['XDM-HI100','XDM-HOS100','XDM-SIS100','XDM-WOS100'])assert.equal(core.defaultLink(id,4),null);
  for(const id of ['XDM-CIS100','XDM-COS100','XDM-FIS100','XDM-FOS100'])assert.ok(core.choices(id).includes(core.defaultLink(id,4).device),`${id} default must be a selectable choice`);
  const state={...core.initial(),model:'XDM-12',placements:{'in-1':'XDM-CIS100','out-1':'XDM-FOS100'},links:{'in-1':core.defaultLink('XDM-CIS100',4),'out-1':core.defaultLink('XDM-FOS100',4)}};
  state.portAssignments=core.syncPorts(state);
  const bom=Object.fromEntries(core.bom(state).map(row=>[row.model,row.quantity]));
  assert.equal(bom['XDM-CTR100'],4);
  assert.equal(bom['XDM-FR101'],4);
});

test('CTR100 linked to matrix cards needs its own power and cannot use CTR100 PSE',()=>{
  const state=configured();
  const issue=core.validate(state).issues.find(item=>item.code==='CTR_POWER_REQUIRED');
  assert.ok(issue);
  assert.match(issue.message,/전원을 직접 연결/);
  assert.match(issue.message,/CTR100 PSE를 사용할 수 없습니다/);
  const power=core.bom(state).find(row=>row.category==='전원 장비');
  assert.match(power.model,/XDM-CTR100 전원 공급 장비/);
  assert.equal(core.bom(state).some(row=>row.model==='XDM-CTR100 PSE'),false);
});
