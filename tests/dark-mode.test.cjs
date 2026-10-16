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
