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
