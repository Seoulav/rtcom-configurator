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
