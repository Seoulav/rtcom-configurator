const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const W=require('../src/vdm-wall.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const texts=(raw,key='lines')=>W.commandsFor(raw)[key].map(l=>l.text);

test('0.246: 비디오 월 커맨드는 VDM 매뉴얼 85~88쪽 예시와 글자까지 같다(제품 ID만 999 → 255)',()=>{
  // 85·86쪽: 4x3 월(출력 1~12)과 1:1 복원, 2x2 월(출력 1~4)
  assert.deepEqual(texts({walls:1,h:4,v:3,start:1}),['*255W11O0112H04V03!']);
  assert.deepEqual(texts({walls:1,h:4,v:3,start:1},'reset'),['*255W11O0112H01V01!']);
  assert.deepEqual(texts({walls:1,h:2,v:2,start:1}),['*255W11O0104H02V02!']);
  // 87쪽 예 2: 출력 12개로 2x2 월 3개
  assert.deepEqual(texts({walls:3,h:2,v:2,start:1}),['*255W21H02V02O0101O0202O0703O0804H02V02O0301O0402O0903O1004H02V02O0501O0602O1103O1204!']);
  // 88쪽: 베젤 보정 출력 1~12(좌·우·상·하 20)와 출력 4만(8)
  assert.deepEqual(texts({walls:1,h:4,v:3,start:1,withBezel:true,bezel:{l:20,r:20,u:20,d:20}}),['*255W11O0112H04V03!','*255B02O0112D20202020!']);
  assert.deepEqual(texts({walls:1,h:1,v:1,start:4,withBezel:true,bezel:{l:8,r:8,u:8,d:8}}),['*255W11O0404H01V01!','*255B01O04D08080808!']);
});

test('0.246: 월 N개의 출력 번호는 가로로 나란히 놓은 배열을 왼쪽 위부터 가로로 센 번호이고 칸 번호는 월 안의 왼쪽 위부터 가로 순서다',()=>{
  const cells=W.cellsOf(W.normalize({walls:3,h:2,v:2,start:1}));
  assert.deepEqual(cells.map(w=>w.map(c=>c[0])),[[1,2,7,8],[3,4,9,10],[5,6,11,12]]);
  assert.deepEqual(cells[0].map(c=>c[1]),[1,2,3,4]);
  // 시작 출력을 옮기면 번호가 같이 밀린다(출력 5부터)
  assert.equal(texts({walls:1,h:2,v:2,start:5})[0],'*255W11O0508H02V02!');
  const two=texts({walls:2,h:3,v:1,start:9})[0];
  assert.equal(two,'*255W21H03V01O0901O1002O1103H03V01O1201O1302O1403!');
});

test('0.246: 번호 자릿수·범위·오류 처리',()=>{
  assert.ok(W.commandsFor({walls:1,h:2,v:2,start:98}).warnings.some(w=>/3자리/.test(w)));
  const wide=W.commandsFor({walls:1,h:2,v:2,start:101,pad:3});
  assert.equal(wide.lines[0].text,'*255W11O101104H02V02!');
  assert.ok(!wide.warnings.some(w=>/예가 없어/.test(w)),'3자리 번호는 알티컴 회신(O001, O128)으로 확정되어 "예가 없다" 경고가 없다');
  const over=W.commandsFor({walls:4,h:16,v:16,start:1});
  assert.ok(over.error&&/256번을 넘습니다/.test(over.error)&&over.lines.length===0);
  const bad=W.normalize({walls:9,h:0,v:'x',start:999,pad:7,id:'abcd',bezel:{l:200,r:-5}});
  assert.equal(bad.walls,4);assert.equal(bad.h,1);assert.equal(bad.v,2);assert.equal(bad.start,256);assert.equal(bad.pad,2);assert.equal(bad.id,'255');
  assert.equal(bad.bezel.l,99);assert.equal(bad.bezel.r,0);
});

test('0.246: 프리셋 3개는 매뉴얼 예제 명령이고 그림 SVG는 칸마다 출력 번호를 그린다',()=>{
  assert.deepEqual(W.PRESETS.map(p=>texts({...p.state})[0]),['*255W11O0104H02V02!','*255W11O0112H04V03!','*255W21H02V02O0101O0202O0703O0804H02V02O0301O0402O0903O1004H02V02O0501O0602O1103O1204!']);
  const svg=W.wallSvg({walls:3,h:2,v:2,start:1});
  assert.equal((svg.match(/class="rt-vw-cell"/g)||[]).length,12);
  for(const n of [1,2,3,4,5,6,7,8,9,10,11,12])assert.ok(svg.includes(`>${n}</text>`),`출력 ${n}`);
});

test('0.262: 월 끄기는 알티컴 회신대로 W 데이터 2를 0으로 한 W10(월 여러 개는 W20)이고 3자리 번호는 O001·O128로 적는다',()=>{
  assert.deepEqual(texts({walls:1,h:4,v:3,start:1},'off'),['*255W10O0112H04V03!']);
  assert.deepEqual(texts({walls:1,h:2,v:2,start:5},'off'),['*255W10O0508H02V02!']);
  assert.deepEqual(texts({walls:3,h:2,v:2,start:1},'off'),['*255W20H02V02O0101O0202O0703O0804H02V02O0301O0402O0903O1004H02V02O0501O0602O1103O1204!']);
  const wide=W.commandsFor({walls:1,h:2,v:2,start:1,pad:3});
  assert.equal(wide.lines[0].text,'*255W11O001004H02V02!');assert.equal(wide.off[0].text,'*255W10O001004H02V02!');
  const last=W.commandsFor({walls:1,h:1,v:1,start:128,pad:3});
  assert.equal(last.lines[0].text,'*255W11O128128H01V01!','O128은 3자리 그대로');
  assert.ok(W.commandsFor({walls:2,h:2,v:1,start:1}).warnings.some(w=>/W20/.test(w)),'월이 둘 이상일 때의 끄기는 유추한 형식임을 알린다');
  assert.ok(!W.commandsFor({walls:1,h:2,v:2,start:1}).warnings.some(w=>/W20/.test(w)));
  assert.equal(W.commandsFor({walls:4,h:16,v:16,start:1}).off.length,0);
});

test('0.246·0.262: 화면에는 알티컴 회신(제품 ID·월 끄기·3자리 번호)과 확인할 점을 남기고 사이트 번들·배포 목록·제품 화면에 연결한다',()=>{
  assert.match(W.FIELD_NOTE,/알티컴 회신/);assert.match(W.FIELD_NOTE,/999/);assert.match(W.FIELD_NOTE,/W10/);assert.match(W.FIELD_NOTE,/O001, O128/);
  assert.doesNotMatch(W.FIELD_NOTE,/확인 대기/);
  const src=read('src/vdm-wall.js');
  assert.match(src,/KV07/);assert.match(src,/85쪽/);assert.match(src,/88쪽/);
  assert.match(read('index.html'),/<script src="src\/vdm-wall\.js"><\/script>/);
  assert.match(read('scripts/package-site.cjs'),/'src\/vdm-wall\.js'/);
  const products=read('src/products.js');
  assert.match(products,/data-sim-tab="wall"/);assert.match(products,/data-vdm-wall-root/);assert.match(products,/RtVdmWall\?\.mountAll\(body\)/);
});
