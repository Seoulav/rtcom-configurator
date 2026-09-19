const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../src/catalog.js');require('../src/core.js');
const core=globalThis.RtCore;
const configured=()=>{
 const state={...core.initial(),model:'XDM-12',step:4,maxStep:4,placements:{'in-a':'XDM-CIS100','out-a':'XDM-COS100'},links:{'in-a':{device:'XDM-CTR100 · TX',count:2,distance:'30'},'out-a':{device:'XDM-CTR100 · RX',count:3,distance:'50'}}};
 state.portAssignments=core.syncPorts(state);return state;
};
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
 for(const change of [d=>d.schemaVersion=3,d=>d.catalogVersion='old',d=>d.state.family='__proto__']){
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
test('calculates a shortage of two when eight HDMI inputs require six active ports',()=>{
 const state={...core.initial(),model:'XDM-12',placements:{'in-a':'XDM-HI100','in-b':'XDM-HIS100'}};
 state.portAssignments=core.syncPorts(state);
 state.portAssignments['in-b:3'].quantity=0;state.portAssignments['in-b:4'].quantity=0;
 state.requirements.inputs=[{id:'hdmi-in',direction:'input',signalType:'HDMI',quantity:8,resolution:'3840x2160',frameRate:'60',distance:null,txRequired:false,rxRequired:false}];
 const row=core.validate(state).summary.find(item=>item.signalType==='HDMI'&&item.direction==='input');
 assert.deepEqual(row,{direction:'input',signalType:'HDMI',required:8,configured:6,shortage:2,surplus:0});
 assert(core.validate(state).issues.some(issue=>issue.level==='ERROR'&&issue.code.includes('SHORTAGE')));
});
test('marks an exact requirement as met',()=>{
 const state={...core.initial(),model:'XDM-12',placements:{'in-a':'XDM-HI100'}};
 state.portAssignments=core.syncPorts(state);
 state.requirements.inputs=[{id:'hdmi-in',direction:'input',signalType:'HDMI',quantity:4,resolution:'',frameRate:'',distance:null,txRequired:false,rxRequired:false}];
 const row=core.validate(state).summary[0];assert.equal(row.shortage,0);assert.equal(row.configured,4);
 assert(core.validate(state).issues.some(issue=>issue.level==='VALID'&&issue.code.includes('REQUIREMENT_MET')));
});
test('unused ports do not create an error',()=>{
 const state={...core.initial(),model:'XDM-12',placements:{'in-a':'XDM-CIS100'}};
 state.portAssignments=core.syncPorts(state);state.portAssignments['in-a:4'].quantity=0;
 const result=core.validate(state);
 assert(!result.issues.some(issue=>issue.level==='ERROR'&&issue.code.includes('UNUSED')));
});
test('new schema saves requirements and port assignments',()=>{
 const state=configured();
 state.requirements.inputs=[{id:'cat-in',direction:'input',signalType:'CAT',quantity:2,resolution:'4K',frameRate:'60',distance:30,txRequired:true,rxRequired:false}];
 state.portAssignments['in-a:1'].assignedDevice='Camera A';
 const doc=core.document(state),restored=core.parse(JSON.stringify(doc));
 assert.equal(doc.schemaVersion,2);assert.equal(restored.requirements.inputs[0].quantity,2);assert.equal(restored.portAssignments['in-a:1'].assignedDevice,'Camera A');
});
test('migrates a version one document with safe defaults',()=>{
 const legacy=core.document(configured());legacy.schemaVersion=1;
 delete legacy.state.requirements;delete legacy.state.physicalSlots;delete legacy.state.portAssignments;
 const restored=core.parse(JSON.stringify(legacy));
 assert.deepEqual(restored.requirements,{inputs:[],outputs:[]});assert.equal(restored.physicalSlots.status,'unknown');assert.equal(Object.keys(restored.portAssignments).length,8);
});
test('a saved history snapshot restores a port assignment',()=>{
 const state=configured();state.portAssignments['in-a:1'].assignedDevice='Camera A';
 const before=JSON.stringify(core.document(state));state.portAssignments['in-a:1'].assignedDevice='Camera B';
 const restored=core.parse(before);assert.equal(restored.portAssignments['in-a:1'].assignedDevice,'Camera A');
});
test('required TX quantity is validated and included in the BOM',()=>{
 const state=configured();
 state.requirements.inputs=[{id:'cat-tx',direction:'input',signalType:'CAT',quantity:3,resolution:'',frameRate:'',distance:30,txRequired:true,rxRequired:false}];
 assert(core.validate(state).issues.some(issue=>issue.code==='TX_SHORTAGE_input_CAT'&&issue.level==='ERROR'));
 assert.equal(core.bom(state).find(row=>row.model==='XDM-CTR100').quantity,5);
});
