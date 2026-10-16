const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ce=require('../src/control-example.js');

// 근거: HDS-42MU 사용자 매뉴얼 9쪽 RS-232C Control
const spec=JSON.parse(fs.readFileSync('data/products/hds-42mu.json','utf8')).controlExample;

test('HDS-42MU 입력 선택 커맨드는 매뉴얼 예시(*000CI02O02!)와 같다',()=>{
  assert.equal(ce.switchCommand(spec,2,2).text,'*000CI02O02!');
  assert.equal(ce.switchCommand(spec,4,1).text,'*000CI04O01!');
});

test('입력·출력 번호는 제품 범위(입력 4·출력 2) 안으로 맞춘다',()=>{
  assert.equal(ce.switchCommand(spec,9,9).text,'*000CI04O02!');
  assert.equal(ce.switchCommand(spec,0,0).text,'*000CI01O01!');
});

test('볼륨은 50이 0dB, 코드 1당 0.5dB이며 매뉴얼 예시 0dB→2dB는 V54',()=>{
  assert.equal(ce.volumeCode(spec,0),50);
  assert.equal(ce.volumeCode(spec,2),54);
  assert.equal(ce.volumeCode(spec,-2),46);
  assert.equal(ce.volumeCommand(spec,2).text,'*000V54!');
  assert.equal(ce.volumeCommand(spec,0.5).code,51);
  assert.equal(ce.dbOf(spec,54),2);
});

test('HEX는 문자열 바이트 뒤에 Enter(0D)를 붙인다',()=>{
  assert.equal(ce.toHex('*000CI02O02!'),'2A 30 30 30 43 49 30 32 4F 30 32 21 0D');
});

test('AMX 코드는 9600bps 설정과 SEND_STRING 한 줄씩을 담는다',()=>{
  const code=ce.amxCode(spec,['*000CI02O02!','*000V54!']);
  assert.match(code,/SET BAUD 9600,N,8,1 485 DISABLE/);
  assert.match(code,/SEND_STRING dvHDS42MU,"'\*000CI02O02!',\$0D"/);
  assert.match(code,/SEND_STRING dvHDS42MU,"'\*000V54!',\$0D"/);
});

test('제품 데이터는 AMX 예시 카드 값을 갖고 근거 쪽수를 밝힌다',()=>{
  assert.equal(spec.productId,'000');
  assert.equal(spec.serial.baud,9600);
  assert.match(spec.source,/9쪽/);
});

// HDS-21U 사용자 매뉴얼 9쪽: 입력 2번 → 출력 1번 예시 *000CI02O01!, 표의 Mute 칸 값 0
const spec21=JSON.parse(fs.readFileSync('data/products/hds-21u.json','utf8')).controlExample;

test('HDS-21U 입력 선택은 매뉴얼 예시(*000CI02O01!)와 같고 출력은 1개뿐이다',()=>{
  assert.equal(ce.switchCommand(spec21,2,1).text,'*000CI02O01!');
  assert.equal(ce.switchCommand(spec21,1,1).text,'*000CI01O01!');
  assert.equal(ce.switchCommand(spec21,9,9).text,'*000CI02O01!');
});

test('HDS-21U 볼륨 V54=+2dB, 뮤트는 표의 Mute 칸 값 0(*000V00!)이며 dB 값은 뮤트 코드로 내려가지 않는다',()=>{
  assert.equal(ce.volumeCommand(spec21,2).text,'*000V54!');
  assert.equal(ce.muteCommand(spec21).text,'*000V00!');
  assert.equal(ce.volumeCommand(spec21,-100).code,1);
});

test('뮤트 값이 없는 HDS-42MU는 뮤트 커맨드를 만들지 않는다',()=>{
  assert.equal(ce.muteCommand(spec),null);
});

test('AMX 코드는 명령마다 버튼 이벤트를 하나씩 만든다',()=>{
  const code=ce.amxCode(spec21,[{label:'IN 2 → OUT 1',text:'*000CI02O01!'},{label:'뮤트',text:'*000V00!'}]);
  assert.match(code,/BUTTON_EVENT\[dvTP,1\]/);
  assert.match(code,/BUTTON_EVENT\[dvTP,2\]/);
  assert.match(code,/SEND_STRING dvHDS21U,"'\*000V00!',\$0D"/);
});

// QMS-88UX 사용자 매뉴얼 28·31·36·37쪽, QMS-44UX 사용자 매뉴얼 25·28쪽
const q88=JSON.parse(fs.readFileSync('data/products/qms-88ux.json','utf8')).controlExample;
const q44=JSON.parse(fs.readFileSync('data/products/qms-44ux.json','utf8')).controlExample;

test('QMS-88UX 연결 커맨드는 매뉴얼 31쪽 예시와 같다(여러 경로·범위·해제)',()=>{
  assert.equal(ce.routeCommand(q88,[[4,1],[2,2]]).text,'*255CI04O01,I02O02!');
  const all=Array.from({length:10},(_,o)=>[1,o+1]);
  assert.equal(ce.routeCommand(q88,all).text,'*255CI01O01-10!');
  assert.equal(ce.routeCommand(q88,[[4,1],[2,2]],'D').text,'*255DI04O01,I02O02!');
  assert.equal(ce.routeCommand(q88,[[9,1]]).text,'*255CIQ1O01!');
});

test('QMS-88UX 같은 입력의 이어진 출력 3개 이상만 범위로 줄이고 2개는 따로 적는다',()=>{
  assert.equal(ce.routeCommand(q88,[[1,1],[1,2]]).text,'*255CI01O01,I01O02!');
  assert.equal(ce.routeCommand(q88,[[1,1],[1,2],[1,3],[1,5]]).text,'*255CI01O01-03,I01O05!');
  assert.equal(ce.routeCommand(q88,[]),null);
  assert.equal(ce.routeCommand(q88,[[1,1],[1,1]]).count,1);
  assert.equal(ce.routeCommand(q88,[[99,1]]),null);
});

test('QMS-88UX 프리셋 불러오기·저장·삭제는 매뉴얼 36·37쪽 예시와 같고 20번을 넘지 않는다',()=>{
  assert.equal(ce.presetCommand(q88,'call',1).text,'*255PC01!');
  assert.equal(ce.presetCommand(q88,'save',13).text,'*255PS13!');
  assert.equal(ce.presetCommand(q88,'clear',13).text,'*255PR13!');
  assert.equal(ce.presetCommand(q88,'call',99).text,'*255PC20!');
});

test('QMS-44UX는 제품 ID 01, 한 입력 전체 출력은 A 명령, 해제·프리셋은 만들지 않는다',()=>{
  assert.equal(ce.routeCommand(q44,[[4,1],[2,2]]).text,'*01CI04O01,I02O02!');
  assert.equal(ce.routeCommand(q44,[[1,1],[1,2],[1,3],[1,4]]).text,'*01AI01!');
  assert.equal(ce.routeCommand(q44,[[4,1]],'D').text,'*01CI04O01!');
  assert.equal(ce.presetCommand(q44,'call',1),null);
});

test('QMS 두 제품은 115200bps 8N1과 매뉴얼 쪽수 근거를 갖고 AMX 코드에 통신 설정이 들어간다',()=>{
  for(const q of [q88,q44]){
    assert.equal(q.serial.baud,115200);
    assert.match(q.source,/쪽/);
    assert.match(ce.amxCode(q,[{label:'x',text:'*0!'}]),/SET BAUD 115200,N,8,1 485 DISABLE/);
  }
});

// ---- 명령 빌더: 매뉴얼 예시와 글자까지 같아야 한다(QMS-88UX 32~39쪽, QMS-44UX 28~30쪽) ----
const B=(spec,id)=>spec.builders.find(b=>b.id===id);
const build=(spec,id,values)=>ce.buildCommand(spec,B(spec,id),values).text;

test('번호 목록 파싱: 콤마·하이픈·공백, 범위 밖과 중복 제외',()=>{
  assert.deepEqual(ce.parseNumList('4,8',1,10),[4,8]);
  assert.deepEqual(ce.parseNumList('1-4, 8 3',1,10),[1,2,3,4,8]);
  assert.deepEqual(ce.parseNumList('0,9-12',1,10),[9,10]);
  assert.deepEqual(ce.parseNumList('abc',1,10),[]);
  assert.deepEqual(ce.formatNumList([1,2,3,4,8],'O',2,'range').map(i=>i.text),['O01-04','O08']);
  assert.deepEqual(ce.formatNumList([1,2,3],'O',2,'explicit').map(i=>i.text),['O01','O02','O03']);
});

test('QMS-88UX 출력 해상도(OS)·테스트 패턴(OT·IT)·출력 초기화(OR)·정보(OF)는 매뉴얼 예시와 같다',()=>{
  assert.equal(build(q88,'res',{out:'4,8',res:'09'}),'*255OSO04O08H09!');
  assert.equal(build(q88,'res',{out:'1-10',res:'10'}),'*255OSO01-10H10!');
  assert.equal(build(q88,'tp',{out:'3',pat:'01'}),'*255OTO03M01!');
  assert.equal(build(q88,'tp',{out:'1-4',pat:'06'}),'*255OTO01-04M06!');
  assert.equal(build(q88,'itp',{inp:'3',pat:'04'}),'*255ITI03M04!');
  assert.equal(build(q88,'itp',{inp:'1-4',pat:'07'}),'*255ITI01-04M07!');
  assert.equal(build(q88,'reset',{out:'1-4'}),'*255ORO01-04!');
  assert.equal(build(q88,'reset',{out:'5'}),'*255ORO05!');
  assert.equal(build(q88,'of',{out:1}),'*255OFO01!');
});

test('QMS-88UX 비디오 월(OW)은 매뉴얼 35쪽 예시 2개와 같고 해상도를 생략할 수 있다',()=>{
  assert.equal(build(q88,'wall',{range:'1-6',res:'13',h:2,v:3,members:'1-6'}),'*255OWO01-06M13H02V03O01O02O03O04O05O06!');
  assert.equal(build(q88,'wall',{range:'1-6',res:'',h:2,v:3,members:'1-6'}),'*255OWO01-06H02V03O01O02O03O04O05O06!');
});

test('QMS-88UX 멀티뷰(Q)는 매뉴얼 39쪽 예시 2개와 같다',()=>{
  assert.equal(build(q88,'mv',{res:'13',layer:'01',inopt:'0',outopt:'0'}),'*255QM13L01S00!');
  assert.equal(build(q88,'mv',{res:'10',layer:'07',inopt:'0',outopt:'2'}),'*255QM10L07S02!');
});

test('QMS-44UX 화면 모드(WM)·해상도(TC)·줌(Z)·보레이트(@)는 매뉴얼 28~30쪽 예시와 같다',()=>{
  assert.equal(build(q44,'wm',{mode:'00'}),'*01WM00!');
  assert.equal(build(q44,'wm',{mode:'03'}),'*01WM03!');
  assert.equal(build(q44,'wmq',{lay:'01'}),'*01WM01P01!');
  assert.equal(build(q44,'wmw',{lay:'2',inp:'1'}),'*01WM02P21!');
  assert.equal(build(q44,'wmd',{top:'1',bottom:'1'}),'*01WM03P11!');
  assert.equal(build(q44,'wmd',{top:'2',bottom:'0'}),'*01WM03P20!');
  assert.equal(build(q44,'tc',{out:'4',res:'00'}),'*01TCO04S00!');
  assert.equal(build(q44,'tc',{out:'1',res:'02'}),'*01TCO01S02!');
  assert.equal(build(q44,'zoom',{out:'01'}),'*01ZO01!');
  assert.equal(build(q44,'baud',{rate:'05'}),'*01@05!');
});

test('빌더 입력이 비었거나 틀리면 명령을 만들지 않고 안내 문구를 돌려준다',()=>{
  const r=ce.buildCommand(q88,B(q88,'res'),{out:'',res:'09'});
  assert.equal(r.text,undefined);
  assert.match(r.error,/출력 번호/);
  assert.match(ce.buildCommand(q88,B(q88,'res'),{out:'1',res:'99'}).error,/해상도/);
});

test('빌더 정의는 모두 기본값으로 명령이 만들어지고 매뉴얼 쪽 근거를 갖는다',()=>{
  for(const q of [q88,q44])for(const b of q.builders){
    const r=ce.buildCommand(q,b,ce.builderDefaults(b));
    assert.ok(r.text&&r.text.startsWith('*'+q.productId)&&r.text.endsWith('!'),`${b.id}: ${r.error||r.text}`);
    assert.match(b.page,/쪽/);
  }
});

// ---- 모듈러 매트릭스(XDM 가이드 12~22·67~69쪽, SPX 매뉴얼 34~51쪽, VDM 매뉴얼 67~84쪽): 매뉴얼 예시와 글자까지 같아야 한다 ----
const xdm=JSON.parse(fs.readFileSync('data/products/xdm.json','utf8')).controlExample;
const spx=JSON.parse(fs.readFileSync('data/products/spx.json','utf8')).controlExample;
const vdm=JSON.parse(fs.readFileSync('data/products/vdm.json','utf8')).controlExample;
const T2={pad:2},T3={pad:3};
const mk=(spec,ctx)=>(id,values)=>{const b=spec.builders.find(x=>x.id===id);assert.ok(b,`빌더 ${id} 없음`);const r=ce.buildCommand(spec,b,values,ctx);assert.ok(r.text,`${id}: ${r.error}`);return r.text};

test('XDM 연결·해제·프리셋·상태는 가이드 12~14쪽 예시와 같다(3자리 번호)',()=>{
  const x=mk(xdm);
  assert.equal(x('conn',{inp:1,out:'12'}),'*255CI001O012!');
  assert.equal(x('conn',{inp:2,out:'1-5'}),'*255CI002O001-005!');
  assert.equal(x('disc',{out:'12'}),'*255DI000O012!');
  assert.equal(x('disc',{out:'1-5'}),'*255DI000O001-005!');
  assert.equal(x('preset',{n:2}),'*255PC02!');
  assert.equal(x('preset',{n:12}),'*255PC12!');
  assert.equal(x('status',{out:5}),'*255?VO005!');
  assert.equal(x('status',{out:0}),'*255?VO000!');
});

test('XDM 입력 설정 명령은 가이드 15~18쪽 예시와 같다',()=>{
  const x=mk(xdm);
  assert.equal(x('inftime',{inp:'0'}),'*255?IFI000!');
  assert.equal(x('inftime',{inp:'1-4'}),'*255?IFI001-004!');
  assert.equal(x('inftime',{inp:'1,5'}),'*255?IFI001I005!');
  assert.equal(x('inf',{inp:1}),'*255IFI001!');
  assert.equal(x('ia',{inp:'1',mode:'H01'}),'*255IAI001H01!');
  assert.equal(x('ia',{inp:'1-3',mode:'H01'}),'*255IAI001-003H01!');
  assert.equal(x('ia',{inp:'1,4',mode:'D01'}),'*255IAI001I004D01!');
  assert.equal(x('iv',{inp:'1',m:'M01'}),'*255IVI001M01!');
  assert.equal(x('iv',{inp:'1-5',m:'M02'}),'*255IVI001-005M02!');
  assert.equal(x('it',{inp:'1',m:'M01'}),'*255ITI001M01!');
  assert.equal(x('it',{inp:'1-4',m:'M04'}),'*255ITI001-004M04!');
  assert.equal(x('ir',{inp:'1-4'}),'*255IRI001-004!');
});

test('XDM 출력 설정·OSD·시스템 조회는 가이드 19~22·67~69쪽 예시와 같다',()=>{
  const x=mk(xdm);
  assert.equal(x('of',{out:1}),'*255OFO001!');
  assert.equal(x('os',{out:'1,2',h:'H11'}),'*255OSO001O002H11!');
  assert.equal(x('ov',{out:'1',m:'M01'}),'*255OVO001M01!');
  assert.equal(x('ov',{out:'1-3',m:'M02'}),'*255OVO001-003M02!');
  assert.equal(x('ov',{out:'1,4',m:'M00'}),'*255OVO001O004M00!');
  assert.equal(x('ot',{out:'1',m:'M02'}),'*255OTO001M02!');
  assert.equal(x('ot',{out:'1-3',m:'M01'}),'*255OTO001-003M01!');
  assert.equal(x('og',{out:'1',k:'C',v:128}),'*255OGO001C128!');
  assert.equal(x('og',{out:'1-4',k:'S',v:0}),'*255OGO001-004S000!');
  assert.equal(x('og',{out:'1,3',k:'H',v:100}),'*255OGO001O003H100!');
  assert.equal(x('osdi',{inp:'1',m:'M01',text:'Camera 1'}),'*255IDI001M01S"Camera 1"!');
  assert.equal(x('osdo',{out:'3',m:'M12',text:'01:05:45'}),'*255ODO003M12S"01:05:45"!');
  assert.equal(x('sys',{q:'?SID'}),'*255?SID!');
  assert.equal(x('sys',{q:'H000'}),'*255H000!');
});

test('SPX 커맨드 1(*255…!)은 매뉴얼 34~45쪽 예시와 같다',()=>{
  const x=mk(spx);
  assert.equal(x('conn',{inp:1,out:'1'}),'*255CI001O001!');
  assert.equal(x('conn',{inp:1,out:'1-7'}),'*255CI001O001-007!');
  assert.equal(x('disc',{out:'12'}),'*255DI000O012!');
  assert.equal(x('disc',{out:'1-5'}),'*255DI000O001-005!');
  assert.equal(x('preset',{n:2}),'*255PC02!');
  assert.equal(x('preset',{n:12}),'*255PC12!');
  assert.equal(x('status',{out:5}),'*255?VO005!');
  assert.equal(x('status',{out:0}),'*255?VO000!');
  assert.equal(x('inf',{inp:12}),'*255IFI012!');
  assert.equal(x('ia',{inp:'1',v:51}),'*255IAI001V51!');
  assert.equal(x('of',{out:12}),'*255OFO012!');
  assert.equal(x('os',{out:'1',h:'H01'}),'*255OSO001H01!');
  assert.equal(x('os',{out:'2-6',h:'H09'}),'*255OSO002-006H09!');
  assert.equal(x('os',{out:'1,4',h:'H13'}),'*255OSO001O004H13!');
  assert.equal(x('ov',{out:'1',m:'M01'}),'*255OVO001M01!');
  assert.equal(x('ov',{out:'1-4',m:'M02'}),'*255OVO001-004M02!');
  assert.equal(x('ov',{out:'1,4',m:'M02'}),'*255OVO001O004M02!');
  assert.equal(x('og',{out:'1',k:'C',v:128}),'*255OGO001C128!');
  assert.equal(x('og',{out:'1-4',k:'B',v:100}),'*255OGO001-004B100!');
  assert.equal(x('og',{out:'1,4',k:'B',v:100}),'*255OGO001O004B100!');
  assert.equal(x('oq',{out:'1',m:'M13',l:5}),'*255OQO001M13L05!');
  assert.equal(x('ob',{out:'1',h:1,v:1}),'*255OBO001H01V01!');
  assert.equal(x('ob',{out:'1,5',h:1,v:1}),'*255OBO001O005H01V01!');
  assert.equal(x('ob',{out:'1-4',h:2,v:1}),'*255OBO001-004H02V01!');
  assert.equal(x('oc',{out:'1-4',m:'M01'}),'*255OCO001-004M01!');
  assert.equal(x('oa',{out:'1',v:51}),'*255OAO001V51!');
  assert.equal(x('oacheck',{out:1}),'*255?OAO001V!');
  assert.equal(x('oacheck',{out:0}),'*255?OAO000V!');
  assert.equal(x('ver',{}),'*255?version!');
});

test('SPX 비디오 월(OW) 생성·끄기는 매뉴얼 41·42쪽 예시와 같다',()=>{
  const x=mk(spx);
  assert.equal(x('ow',{range:'1-9',m:'M09',h:3,v:3,members:'1-9'}),'*255OWO001-009M09H03V03O001O002O003O004O005O006O007O008O009!');
  assert.equal(x('ow',{range:'1-4',m:'M09',h:2,v:2,members:'1-4'}),'*255OWO001-004M09H02V02O001O002O003O004!');
  assert.equal(x('ow',{range:'1-4',m:'M09',h:1,v:1,members:'1-4'}),'*255OWO001-004M09H01V01O001O002O003O004!');
  assert.equal(x('owoff',{range:'1-9'}),'*255OWO001-009M00!');
});

test('SPX 커맨드 2(문장형)는 매뉴얼 46~51쪽 예시와 같고 Enter를 붙이지 않는다',()=>{
  const x=mk(spx);
  assert.equal(x('t_av',{x:1,y:2}),'s in 1 av out 2!');
  assert.equal(x('t_save',{z:1}),'s save preset 1!');
  assert.equal(x('t_recall',{z:1}),'s recall preset 1!');
  assert.equal(x('t_clear',{z:1}),'s clear preset 1!');
  assert.equal(x('t_wall',{v:2,w:3,x:3,y:'13',z:13,set:''}),'s wall 2 hdiv 3 vdiv 3 time 13 out 13!');
  assert.equal(x('t_wall',{v:2,w:3,x:3,y:'13',z:13,set:'set '}),'s wall 2 set hdiv 3 vdiv 3 time 13 out 13!');
  assert.equal(x('t_wallsw',{x:2,y:2}),'s in 2 wall out 2!');
  assert.equal(x('t_walloff',{x:2}),'s wall 2 off!');
  assert.equal(x('t_quad',{x:1,y:'9',z:1}),'s quad on layer 1 time 9 out 1!');
  assert.equal(x('t_quadoff',{x:1}),'s quad off out 1!');
  assert.equal(x('t_cec',{y:0,m:'on'}),'s cec hdmi out 0 on!');
  assert.equal(x('t_edid',{x:1,z:1}),'s edid in 1 from 1!');
  assert.equal(x('t_edid',{x:0,z:1}),'s edid in 0 from 1!');
  assert.equal(x('t_q',{q:'r type'}),'r type!');
  const b=spx.builders.find(y=>y.id==='t_av');
  assert.equal(ce.buildCommand(spx,b,{x:1,y:2}).enter,false);
  assert.equal(ce.toHex('s in 1 av out 2!',false).endsWith('21'),true);
});

test('VDM 2자리 번호 명령은 매뉴얼 67~84쪽 예시와 같다',()=>{
  const x=mk(vdm,T2);
  assert.equal(x('c',{inp:1,out:'1'}),'*255CI01O01!');
  assert.equal(x('c',{inp:1,out:'1-7'}),'*255CI01O01-07!');
  assert.equal(x('vc',{inp:1,out:'1'}),'*255VCI01O01!');
  assert.equal(x('ac',{inp:1,out:'1-7'}),'*255ACI01O01-07!');
  assert.equal(x('d',{inp:1,out:'1'}),'*255DI01O01!');
  assert.equal(x('dall',{k:'D'}),'*255DALLIO!');
  assert.equal(x('dall',{k:'VD'}),'*255VDALLIO!');
  assert.equal(x('dall',{k:'AD'}),'*255ADALLIO!');
  assert.equal(x('stat',{k:'?',dir:'I',n:1}),'*255?I01!');
  assert.equal(x('stat',{k:'?',dir:'O',n:7}),'*255?O07!');
  assert.equal(x('stat',{k:'A?',dir:'O',n:7}),'*255A?O07!');
  assert.equal(x('statall',{k:'?'}),'*255?ALLIO!');
  assert.equal(x('statall',{k:'A?'}),'*255A?ALLIO!');
  assert.equal(x('iv',{inp:'1-9',m:'M'}),'*255IVI01-09M!');
  assert.equal(x('ia',{inp:'1-9',m:'M'}),'*255IAI01-09M!');
  assert.equal(x('im',{inp:2}),'*255IMI02!');
  assert.equal(x('im',{inp:0}),'*255IMI00!');
  assert.equal(x('if',{inp:1}),'*255IFI01!');
  assert.equal(x('om',{out:'1-9',m:'M'}),'*255OMO01-09M!');
  assert.equal(x('os',{out:'1-9',m:'M'}),'*255OSO01-09M!');
  assert.equal(x('ot',{out:'1-9',t:'T05',p:'P05'}),'*255OTO01-09T05P05!');
  assert.equal(x('of',{out:2}),'*255OFO02!');
  assert.equal(x('oqt',{out:'1',t:'T00'}),'*255OQO01T00!');
  assert.equal(x('oqt',{out:'2',t:'T17'}),'*255OQO02T17!');
  assert.equal(x('oql',{out:'1',l:'L05'}),'*255OQO01L05!');
  assert.equal(x('oql',{out:'2',l:'L07'}),'*255OQO02L07!');
  assert.equal(x('oz',{out:'1,2'}),'*255OZO01,O02!');
  assert.equal(x('av',{out:'1-9',v:99}),'*255AVO01-09V99!');
  assert.equal(x('af',{out:1}),'*255AFO01!');
  assert.equal(x('baud',{r:'004'}),'*255@004!');
  assert.equal(x('touch',{k:'KON'}),'*255KON!');
  assert.equal(x('conn',{}),'*255H000!');
  assert.equal(x('ver',{}),'*999?version!');
});

test('VDM-128X·256X는 3자리 번호로 만든다(매뉴얼 68쪽 예시)',()=>{
  const x=mk(vdm,T3);
  assert.equal(x('c',{inp:1,out:'1'}),'*255CI001O001!');
  assert.equal(x('c',{inp:1,out:'1-7'}),'*255CI001O001-007!');
  assert.equal(x('vc',{inp:1,out:'1-7'}),'*255VCI001O001-007!');
  assert.equal(x('stat',{k:'?',dir:'O',n:7}),'*255?O007!');
  assert.equal(x('d',{inp:0,out:'3-5'}),'*255DI000O003-005!');
});

test('모듈러 빌더는 모두 기본값으로 명령이 만들어지고 매뉴얼 쪽 근거를 갖는다',()=>{
  for(const [spec,ctxs] of [[xdm,[undefined]],[spx,[undefined]],[vdm,[T2,T3]]])for(const ctx of ctxs)for(const b of spec.builders){
    const r=ce.buildCommand(spec,b,ce.builderDefaults(b),ctx);
    assert.ok(r.text,`${b.id}: ${r.error}`);
    assert.match(b.page,/쪽/);
    assert.ok(b.group,`${b.id}: 묶음 이름 없음`);
  }
  for(const spec of [xdm,spx,vdm])assert.equal(new Set(spec.builders.map(b=>b.id)).size,spec.builders.length);
});

// 0.239 "내 AMX 구성"(장바구니): 담기·중복·순서·코드 생성
test('0.239: 장바구니는 같은 문자열을 한 번만 담고 담은 순서대로 버튼 하나씩 AMX 코드를 만든다',()=>{
  const items=[{label:'월 오버레이',text:'*255OWO001!',source:'07 시뮬레이터'},{label:'입력 연결',text:'*255CI001O001!'}];
  let r=ce.basketAdd([],items);
  assert.equal(r.added,2);assert.equal(r.dup,0);
  r=ce.basketAdd(r.list,[items[0],{text:'*255CI002O002!'}]);
  assert.equal(r.added,1);assert.equal(r.dup,1);assert.equal(r.list.length,3);
  const code=ce.basketCode(xdm,r.list);
  assert.match(code,/BUTTON_EVENT\[dvTP,1\][\s\S]*SEND_STRING dvXDM,"'\*255OWO001!',\$0D"/);
  assert.match(code,/BUTTON_EVENT\[dvTP,3\][\s\S]*'\*255CI002O002!'/);
  assert.match(code,/SET BAUD 115200,N,8,1/);
  // 순서 바꾸기·빼기
  const moved=ce.basketMove(r.list,2,-1);
  assert.deepEqual(moved.map(x=>x.text),['*255OWO001!','*255CI002O002!','*255CI001O001!']);
  assert.equal(ce.basketMove(r.list,0,-1)[0].text,'*255OWO001!','맨 위는 더 못 올라간다');
  assert.deepEqual(ce.basketRemove(r.list,1).map(x=>x.text),['*255OWO001!','*255CI002O002!']);
  // 빈 문자열·잘못된 값은 걸러낸다
  assert.equal(ce.basketClean([null,{text:''},{text:'*255C!'}]).length,1);
});

test('0.239: 장바구니 상한(60개)을 넘기면 담지 않고 알린다, Enter 없는 문장 형식은 $0D를 붙이지 않는다',()=>{
  const many=Array.from({length:ce.BASKET_MAX+3},(_,i)=>({text:`*255CI${String(i+1).padStart(3,'0')}O001!`}));
  const r=ce.basketAdd([],many);
  assert.equal(r.list.length,ce.BASKET_MAX);assert.equal(r.added,ce.BASKET_MAX);assert.equal(r.full,3);
  const code=ce.basketCode(spx,[{label:'문장형',text:'s in 1 av out 2!',enter:false}]);
  assert.match(code,/SEND_STRING dv\w+,"'s in 1 av out 2!'"/);
  assert.doesNotMatch(code.split('BUTTON_EVENT')[1],/\$0D/);
});

test('0.239: 브라우저 저장소가 없어도(Node) 메모리에 담고 꺼낸다',()=>{
  ce.basket.clear('xdm-test');
  const r=ce.basket.add('xdm-test',[{text:'*255CI001O001!'}]);
  assert.equal(r.added,1);assert.equal(ce.basket.get('xdm-test').length,1);
  ce.basket.move('xdm-test',0,1);ce.basket.remove('xdm-test',0);
  assert.equal(ce.basket.get('xdm-test').length,0);
});

// 0.239 AMX 코드 잠금: 비밀번호 변환값 확인(PBKDF2-SHA256), 상태 유지, 원문 미저장
test('0.239: 잠금 변환값은 맞는 비밀번호만 통과시키고 원문을 담지 않는다',async()=>{
  const cfg=await ce.makeLock('test-pass-1234',{iterations:1000});
  assert.equal(cfg.v,1);assert.equal(cfg.iterations,1000);assert.match(cfg.salt,/^[0-9a-f]{32}$/);assert.match(cfg.hash,/^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(cfg).includes('test-pass-1234'));
  assert.equal(await ce.verifyPassword('test-pass-1234',cfg),true);
  assert.equal(await ce.verifyPassword('test-pass-1235',cfg),false);
  assert.equal(await ce.verifyPassword('',cfg),false);
  assert.equal(await ce.verifyPassword('test-pass-1234',null),false,'설정이 없으면 열리지 않는다');
  const again=await ce.makeLock('test-pass-1234',{iterations:1000});
  assert.notEqual(again.salt,cfg.salt);assert.notEqual(again.hash,cfg.hash,'같은 비밀번호도 salt가 달라 변환값이 다르다');
});
test('0.239: 잠금 상태는 설정에 맞을 때만 열리고 다시 잠글 수 있다(Node에서는 메모리)',async()=>{
  const cfg=await ce.makeLock('open-sesame-77',{iterations:1000});
  ce.lock.relock();
  assert.equal(ce.lock.isUnlocked(cfg),false);
  assert.equal(await ce.lock.unlock('wrong-password',cfg),false);
  assert.equal(ce.lock.isUnlocked(cfg),false);
  assert.equal(await ce.lock.unlock('open-sesame-77',cfg),true);
  assert.equal(ce.lock.isUnlocked(cfg),true);
  const other=await ce.makeLock('other-pass-99',{iterations:1000});
  assert.equal(ce.lock.isUnlocked(other),false,'다른 비밀번호 설정이면 열린 상태가 이어지지 않는다');
  ce.lock.relock();
  assert.equal(ce.lock.isUnlocked(cfg),false);
});
test('0.239: 저장소의 AMX_LOCK은 비밀번호 원문 없이 변환값 또는 null이다',()=>{
  const src=require('node:fs').readFileSync(require('node:path').join(__dirname,'..','src','control-example.js'),'utf8');
  const m=src.match(/^\s*const AMX_LOCK=(.*);$/m);
  assert.ok(m,'AMX_LOCK 줄이 있어야 한다');
  if(m[1]!=='null'){const cfg=JSON.parse(m[1]);assert.deepEqual(Object.keys(cfg).sort(),['hash','iterations','salt','v']);assert.ok(cfg.iterations>=100000)}
});

// 0.239 AMX 통신 방식: LAN(TCP) 기본 화면, RS-232 선택. 포트는 매뉴얼 값만 쓰고 없으면 0과 "확인 필요"
test('0.239: LAN 코드는 IP_CLIENT_OPEN과 DATA_EVENT를 만들고 SPX는 매뉴얼의 Telnet 포트 23을 쓴다',()=>{
  assert.equal(spx.controlExample?.lan?.port??spx.lan?.port,23,'SPX 매뉴얼 46쪽 Telnet 포트');
  const code=ce.amxCode(spx,[{label:'연결',text:'*255CI001O001!'}],{mode:'lan',ip:'192.168.10.75'});
  assert.match(code,/dvSPX = 0:3:0/);
  assert.match(code,/CHAR cDeviceIp\[\] = '192\.168\.10\.75'/);
  assert.match(code,/LONG nDevicePort = 23 +\/\/ TCP 포트 — SPX 매뉴얼 46쪽/);
  assert.match(code,/IP_CLIENT_OPEN\(dvSPX\.PORT, cDeviceIp, nDevicePort, IP_TCP\)/);
  assert.match(code,/DATA_EVENT\[dvSPX\][\s\S]*ONLINE[\s\S]*OFFLINE[\s\S]*ONERROR/);
  assert.match(code,/BUTTON_EVENT\[dvTP,1\][\s\S]*SEND_STRING dvSPX,"'\*255CI001O001!',\$0D"/);
  assert.doesNotMatch(code,/SET BAUD/);
  assert.match(code,/DEFINE_EVENT[\s\S]*BUTTON_EVENT/,'BUTTON_EVENT는 DEFINE_EVENT 아래');
});
test('0.239: 포트가 매뉴얼에 없는 제품은 0과 확인 필요 주석, 직접 입력한 포트와 IP가 우선, 잘못된 값은 걸러낸다',()=>{
  const none=ce.amxCode(xdm,[],{mode:'lan'});
  assert.match(none,/LONG nDevicePort = 0 +\/\/ TCP 포트 번호를 입력하세요\(이 제품은 매뉴얼에 없어 알티컴 확인 필요\)/);
  assert.match(none,/'192\.168\.1\.100'.*예시/);
  const own=ce.amxCode(xdm,[],{mode:'lan',ip:'10.1.2.3',port:'4001'});
  assert.match(own,/'10\.1\.2\.3'/);assert.match(own,/LONG nDevicePort = 4001 +\/\/ TCP 포트 \(직접 입력한 값\)/);
  const spxOwn=ce.amxCode(spx,[],{mode:'lan',port:'2323'});
  assert.match(spxOwn,/nDevicePort = 2323/);
  // 코드 주입·범위 밖 값 차단
  const bad=ce.amxCode(xdm,[],{mode:'lan',ip:"10.0.0.1'; evil",port:'99999'});
  assert.doesNotMatch(bad,/evil/);assert.match(bad,/'192\.168\.1\.100'/);assert.match(bad,/nDevicePort = 0/);
  assert.doesNotMatch(ce.amxCode(xdm,[],{mode:'lan',ip:'999.1.1.1'}),/999\.1\.1\.1/);
});
test('0.239: RS-232를 고르면 기존 직렬 코드(SET BAUD)가 나오고, 옵션이 없으면 직렬이 기본(기존 호출 호환)',()=>{
  for(const opts of [undefined,{},{mode:'serial'}]){
    const code=ce.amxCode(xdm,[{text:'*255CI001O001!'}],opts);
    assert.match(code,/dvXDM = 5001:1:0/);assert.match(code,/SET BAUD 115200,N,8,1 485 DISABLE/);assert.doesNotMatch(code,/IP_CLIENT_OPEN/);
    assert.match(code,/DEFINE_EVENT\s+\/\/ 터치 패널 버튼 1번/);
  }
  assert.match(ce.basketCode(xdm,[{text:'*255C!'}],{mode:'lan'}),/IP_CLIENT_OPEN/);
  assert.match(ce.basketCode(xdm,[{text:'*255C!'}]),/SET BAUD/);
});
test('0.239: 통신 방식 상태는 기본 LAN이고 저장소가 없어도 메모리에 기억한다',()=>{
  const s={id:'comm-test'};
  assert.deepEqual(ce.commOf(s),{mode:'lan',ip:'',port:''});
  ce.setComm(s,{mode:'serial',ip:'10.0.0.9',port:'23'});
  assert.deepEqual(ce.commOf(s),{mode:'serial',ip:'10.0.0.9',port:'23'});
  ce.setComm(s,{mode:'lan'});assert.equal(ce.commOf(s).mode,'lan');assert.equal(ce.commOf(s).ip,'10.0.0.9');
});
