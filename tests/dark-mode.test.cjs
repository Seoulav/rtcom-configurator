// 0.238 다크 모드 B단계 ②: 다크 값 블록이 최신이고, 화면(screen)·다크 조건 안에만 있으며, 라이트·인쇄 값을 건드리지 않는지 확인한다.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'src','styles.css'),'utf8');
const START='/* ==== 0.238 다크 값(자동 생성: scripts/tools/dark_tokens.cjs) 시작 ==== */';
const END='/* ==== 0.238 다크 값 끝 ==== */';
const block=css.slice(css.indexOf(START),css.indexOf(END)+END.length);

test('다크 블록이 생성 도구 결과와 같음(--check)',()=>{
  const out=execFileSync(process.execPath,[path.join(root,'scripts','tools','dark_tokens.cjs'),'--check'],{encoding:'utf8'});
  assert.match(out,/다크 블록이 최신입니다/);
});

test('다크 블록은 파일에 하나뿐이고 screen + prefers-color-scheme:dark 안에만 있음(인쇄는 항상 라이트)',()=>{
  assert.equal(css.split(START).length,2);
  assert.equal((css.match(/==== 0\.\d+ 다크 값\(자동 생성/g)||[]).length,1,'번호가 다른 예전 다크 블록이 남아 있으면 안 됨');
  assert.ok(block.includes('@media screen and (prefers-color-scheme:dark){'));
  const body=block.slice(block.indexOf('*/')+2);
  assert.ok(!/@media print/.test(body),'다크 블록 안에 인쇄 규칙이 없어야 함');
  assert.ok(!/rt-rp|#print-report/.test(body),'보고서 인쇄 규칙을 덮어쓰지 않아야 함');
});

test('0.232 색 변수의 라이트 값은 이름과 같은 원래 색 그대로',()=>{
  const tokenArea=css.slice(0,css.indexOf(START));
  const tokens=[...tokenArea.matchAll(/--rt-(bg|fg|ln)-([0-9a-f]+):(#[0-9a-f]+);/g)];
  assert.ok(tokens.length>=180,`변수 ${tokens.length}개`);
  for(const [,,hex,value] of tokens)assert.equal(value,`#${hex}`);
});

test('다크 기준값: 카드 #1C1C1E, 글자 #F5F5F7, 보조 #8E8E93, 강조 글자 #409CFF, 페이지 #000',()=>{
  for(const v of ['--rt-bg:#1C1C1E','--rt-ink:#F5F5F7','--rt-muted:#8E8E93','--rt-accent:#409CFF','--pg-paper:#000','--pg-glass-fill:rgba(44,44,46,.58)','--rt-bg-fff:#1C1C1E','--rt-fg-0057d8:#409CFF'])assert.ok(block.includes(v),v);
  assert.ok(block.includes('html{background:#000}'));
});

test('사진 판넬·그림 판·보고서 미리보기는 다크에서도 밝게 유지',()=>{
  assert.ok(!/--rt-photo:/.test(block),'--rt-photo(사진 판넬)는 다크 값을 두지 않음');
  for(const sel of ['.rt-pg-svg-wrap>svg','svg.rt-layer-svg-wide','.rt-flow-zoom-canvas svg','.rt-report-paper','.rt-card-info-plate{background:#f2f5fa}'])assert.ok(block.includes(sel),sel);
  assert.match(block,/\.rt-report-paper\{color-scheme:light;background:#fff;/);
});

test('0.275 다크 모드 ③ 1차: Signal Flow 그림은 흰 판에서 빼고 그림 색 바꿈표로 칠한다',()=>{
  const src=fs.readFileSync(path.join(root,'src','products.js'),'utf8');
  assert.match(src,/<svg class="rt-pg-flow-svg" viewBox=/,'diagramWrap이 Signal Flow 그림에 표시 클래스를 붙인다');
  assert.ok(block.includes('.rt-pg-svg-wrap>svg:not(.rt-pg-flow-svg)'),'Port Map 등 나머지 그림은 흰 판 유지');
  assert.ok(block.includes('.rt-flow-zoom-canvas svg:not(.rt-pg-flow-svg)'));
  for(const rule of [
    'svg.rt-pg-flow-svg rect[fill="#fff" i]','{fill:#3A3A3C}',
    'svg.rt-pg-flow-svg text[fill="#1f2532" i]','{fill:#F5F5F7}',
    'svg.rt-pg-flow-svg text[fill="#687386" i]','{fill:#AEAEB2}',
    'svg.rt-pg-flow-svg rect[fill="#eef2f8" i]','{fill:#2C2C2E}',
    '.rt-flow-zoom-canvas:has(svg.rt-pg-flow-svg){background:#1C1C1E}',
  ])assert.ok(block.includes(rule),rule);
  // 흰 글자(색 배지 위)는 바꾸지 않는다.
  assert.ok(!block.includes('svg.rt-pg-flow-svg text[fill="#fff" i]'));
  // 라이트 화면에는 이 클래스를 쓰는 규칙이 없다(다크 블록 밖).
  const outside=css.replace(block,'');
  assert.ok(!outside.includes('rt-pg-flow-svg'),'다크 블록 밖에 rt-pg-flow-svg 규칙이 없어야 함');
});

test('0.276 다크 모드 ③ 2차: EDID 로터리·딥 스위치·오디오 설정·오토 셀렉팅 그림도 흰 판 대신 바꿈표',()=>{
  const src=fs.readFileSync(path.join(root,'src','products.js'),'utf8');
  assert.equal((src.match(/<svg class="rt-pg-dark-svg" /g)||[]).length,6,'rotary·SET·LED·딥 스위치·오토 셀렉팅 단계·출력 그림 6곳');
  for(const sel of ['.rt-pg-dip-state svg:not(.rt-pg-dark-svg)','.rt-pg-rotary svg:not(.rt-pg-dark-svg)'])assert.ok(block.includes(sel),sel);
  for(const rule of [
    'svg.rt-pg-dark-svg text[fill="#8a8a8e" i]','svg.rt-pg-dark-svg rect[fill="#fff" i]',
    '.rt-pg-dip-state svg.rt-pg-dark-svg rect[fill="#2c2c2e" i]{fill:#48484A}',
    'svg.rt-pg-dark-svg text[fill="#d70015" i]{fill:#FF6961}','svg.rt-pg-dark-svg text[fill="#6a6a6f" i]{fill:#AEAEB2}',
  ])assert.ok(block.includes(rule),rule);
  // 로터리 가운데 손잡이(#e9f2ff)는 실물처럼 밝게 둔다.
  assert.ok(!block.includes('circle[fill="#e9f2ff" i]'));
  assert.ok(!css.replace(block,'').includes('rt-pg-dark-svg'),'다크 블록 밖에 rt-pg-dark-svg 규칙이 없어야 함');
});
