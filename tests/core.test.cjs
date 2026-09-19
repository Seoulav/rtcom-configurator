const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../src/catalog.js');require('../src/core.js');
const core=globalThis.RtCore;
const configured=()=>({...core.initial(),model:'XDM-12',step:4,maxStep:4,placements:{'in-a':'XDM-CIS100','out-a':'XDM-COS100'},links:{'in-a':{device:'XDM-CTR100 · TX',count:2,distance:'30'},'out-a':{device:'XDM-CTR100 · RX',count:3,distance:'50'}}});
test('round-trip preserves separate TX/RX roles and combines purchasing quantities',()=>{
 const state=configured();assert.deepEqual(core.parse(JSON.stringify(core.document(state))),state);
 assert.equal(core.bom(state).find(r=>r.model==='XDM-CTR100').quantity,5);
 assert.equal(core.document(state).validation.canFinalize,false);
});
test('rejects wrong direction, family, count, missing chassis and unknown slot without mutation',()=>{
 for(const alter of [s=>s.links['in-a'].device='XDM-CTR100 · RX',s=>s.family='SPX',s=>s.links['in-a'].count=5,s=>s.links['in-a'].count=1.5,s=>s.links['in-a'].distance='2000',s=>s.model=null,s=>s.placements['in-z']='XDM-CIS100']){
  const state=configured();alter(state);const before=JSON.stringify(state);assert.throws(()=>core.checkState(state));assert.equal(JSON.stringify(state),before);
 }
});
test('rejects malformed, oversized, stale and future documents',()=>{
 assert.throws(()=>core.parse('{bad'));assert.throws(()=>core.parse(' '.repeat(1024*1024+1)));
 for(const change of [d=>d.schemaVersion=2,d=>d.catalogVersion='old',d=>d.state.family='__proto__']){
  const doc=core.document(configured());change(doc);assert.throws(()=>core.parse(JSON.stringify(doc)));
 }
});
test('does not trust validation or BOM supplied in a file',()=>{
 const doc=core.document(configured());doc.validation={canFinalize:true,status:'VERIFIED'};doc.bom=[];
 const restored=core.document(core.parse(JSON.stringify(doc)));
 assert.equal(restored.validation.canFinalize,false);assert.equal(restored.bom.length,4);
});
test('VDM Quad card is two ports and unknown remote links remain unconfirmed',()=>{
 const state={...core.initial(),family:'VDM',model:'VDM-8X',placements:{'in-a':'CIS4-U','out-a':'QOS4S-U'}};
 assert.equal(RtCatalog.VDM.output.find(c=>c[0]==='QOS4S-U')[2],2);
 assert(core.validate(state).issues.some(i=>i.code==='LINK_UNKNOWN_in-a'));
 assert.equal(core.choices('CIS4-U').length,0);
});
test('CSV contains explicit unverified status, quantities and accessory limitation',()=>{
 const csv=core.csv(configured());assert.match(csv,/UNVERIFIED_DRAFT/);assert.match(csv,/"XDM-CTR100","5"/);assert.match(csv,/기본 포함품 미확정/);
});
