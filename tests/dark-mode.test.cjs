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
  // 0.278: 손으로 정한 다크 기준값은 공통 토큰(src/svt-tokens.css)의 --svt-dark-*를 읽는다.
  const tokens=fs.readFileSync(path.join(root,'src','svt-tokens.css'),'utf8');
  for(const [name,value] of [['dark-card','#1C1C1E'],['dark-ink','#F5F5F7'],['dark-muted','#8E8E93'],['dark-accent','#409CFF'],['dark-page','#000']])assert.ok(tokens.includes(`--svt-${name}:${value};`),name);
  for(const v of ['--rt-bg:var(--svt-dark-card)','--rt-ink:var(--svt-dark-ink)','--rt-muted:var(--svt-dark-muted)','--rt-accent:var(--svt-dark-accent)','--pg-paper:var(--svt-dark-page)','--pg-glass-fill:rgba(44,44,46,.58)','--rt-bg-fff:#1C1C1E','--rt-fg-0057d8:#409CFF'])assert.ok(block.includes(v),v);
  assert.ok(block.includes('html{background:var(--svt-dark-page)}'));
});

test('사진 판넬·그림 판·보고서 미리보기는 다크에서도 밝게 유지',()=>{
  // 0.278부터 제품 실물 사진 받침(--rt-photo)은 다크에서 옅은 회색(--svt-dark-photo #E6E6E6)이고 사진 밝기는 90%다(사용자 요청 2026-11-24).
  assert.ok(block.includes('--rt-photo:var(--svt-dark-photo)'),'--rt-photo 다크 값');
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
  // 0.277 3차에서 시리즈 02 신호 구성(<svg class="rt-pg-dark-svg" viewBox)이 더해져 7곳이 된다.
  assert.equal((src.match(/<svg class="rt-pg-dark-svg" /g)||[]).length,7,'rotary·SET·LED·딥 스위치·오토 셀렉팅 단계·출력 그림 6곳 + 시리즈 신호 구성(0.277)');
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

test('0.277 다크 모드 ③ 3차: 06 화면 구성 모드·시리즈 02 신호 구성·WOS100 레이어 그림도 흰 판 대신 바꿈표',()=>{
  const src=fs.readFileSync(path.join(root,'src','products.js'),'utf8');
  const app=fs.readFileSync(path.join(root,'src','app.js'),'utf8');
  assert.ok(src.includes('<svg class="rt-pg-layout-matrix rt-pg-dark-svg" '),'06 화면 구성 모드 크로스포인트 그림');
  assert.ok(/<svg class="rt-pg-dark-svg" viewBox="0 0 \$\{W\} \$\{H\}" width="100%" role="img" aria-label="신호 구성">/.test(src),'시리즈 02 신호 구성 그림');
  for(const cls of ['rt-layer-svg-wide','rt-layer-svg-tall'])assert.ok(app.includes(`<svg class="${cls} rt-pg-dark-svg" `),cls);
  // 흰 판(PLATES)은 rt-pg-dark-svg가 아닌 그림에만 남는다(Port Map 실물 사진 그림 등).
  for(const sel of ['.rt-pg-svg-wrap>svg:not(.rt-pg-flow-svg):not(.rt-pg-dark-svg)','svg.rt-pg-layout-matrix:not(.rt-pg-dark-svg)','svg.rt-layer-svg-wide:not(.rt-pg-dark-svg)','svg.rt-layer-svg-tall:not(.rt-pg-dark-svg)'])assert.ok(block.includes(sel),sel);
  assert.ok(block.includes('svg.rt-pg-dark-svg text[fill="#3a3a3c" i]{fill:#AEAEB2}'),'연동 전송기 점선 칩 이름');
  assert.ok(block.includes('svg.rt-pg-dark-svg text[fill="#56627a" i]{fill:#AEAEB2}'),'WOS100 레이어 회색 설명');
  assert.ok(block.includes('svg.rt-pg-dark-svg text[fill="#1c4f8a" i]{fill:#8FB4FF}'),'WOS100 레이어 동기 안내');
  assert.ok(!block.includes('svg.rt-pg-dark-svg rect[fill="#3a3a3c" i]'),'점선 칩 이름 규칙은 글자에만');
});

test('0.278 제품 실물 사진: 다크에서 받침은 옅은 회색(--svt-dark-photo), 사진은 밝기 90%. 목록 썸네일은 사진 칸 안에 맞춘다',()=>{
  const port='.rt-pg-svg-wrap>svg:not(.rt-pg-flow-svg):not(.rt-pg-dark-svg)';
  assert.ok(block.includes(`#rtcom-design .rt-pg-gridcard .rt-pg-photo,#rtcom-design .rt-pg-diagram-photo,#rtcom-design ${port}{background:var(--svt-dark-photo)}`));
  for(const sel of ['.rt-pg-gridcard .rt-pg-photo img','.rt-pg-diagram-photo img','.rt-pg-face img','.rt-pg-edid-photo img',`${port} image`,'.rt-photo-stage img','.rt-photo-tabs img','.rt-photo-lens'])assert.ok(block.includes(`#rtcom-design ${sel}`),sel);
  assert.match(block,/\.rt-photo-lens\{filter:brightness\(\.9\)\}/);
  assert.ok(!css.replace(block,'').includes('brightness(.9)'),'사진 밝기 조정은 다크 블록 안에만');
  assert.ok(css.includes('#rtcom-design .rt-pg-gridcard .rt-pg-photo img{width:100%;height:100%;min-height:0;object-fit:contain}'),'썸네일이 칸 밖으로 넘치지 않음');
  // 카드 판넬 사진(0.178)은 그대로
  assert.ok(block.includes('.rt-palette-tile img,#rtcom-design .rt-link-flow-node img[src*="assets/cards/"]{background:#eef1f5}'));
});
