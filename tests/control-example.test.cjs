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
