// 0.278 SVT 공통 디자인 토큰 파일(src/svt-tokens.css): 여러 사이트가 같은 색·글꼴 기준을 쓰도록 공통 값을 한 파일에 모으고,
// 이 사이트의 CSS와 다크 블록은 var(--svt-*)로만 읽는다(사용자 요청 2026-11-24 "2번 3번 진행해", 0.277 보고의 다음 단계 제안 3번).
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const tokens=read('src/svt-tokens.css'),css=read('src/styles.css'),html=read('index.html');
const defined=new Set([...tokens.matchAll(/(--svt-[a-z0-9-]+):/g)].map(m=>m[1]));

test('0.278 공통 토큰 파일은 :root 한 곳에 SVT 공통 값을 정의한다',()=>{
  assert.match(tokens,/^:root\{/m);
  for(const [name,value] of [
    ['--svt-accent','#0057D8'],['--svt-accent-ui','#007AFF'],['--svt-muted','#6A6A6F'],['--svt-ink','#1C1C1E'],['--svt-paper','#EEF1F6'],
    ['--svt-cta','linear-gradient(135deg,#3370e6,#6d5cf0)'],['--svt-cta-shadow','#4f62ea33'],['--svt-brand-mark','linear-gradient(150deg,#0A84FF,#5E5CE6 55%,#BF5AF2)'],
    ['--svt-dark-page','#000'],['--svt-dark-card','#1C1C1E'],['--svt-dark-ink','#F5F5F7'],['--svt-dark-accent','#409CFF'],['--svt-dark-photo','#E6E6E6'],
    ['--svt-sig-hdmi','#E5242B'],['--svt-sig-dp','#C55A11'],['--svt-sig-sdi','#000000'],['--svt-sig-cat','#00B050'],['--svt-sig-fiber','#00B0F0'],
  ])assert.ok(tokens.includes(`${name}:${value};`),name);
  assert.match(tokens,/--svt-font-sans:"Pretendard Variable",Pretendard,/);
});

test('0.278 index.html은 공통 토큰 파일을 styles.css보다 먼저 불러오고, 배포 목록에도 들어 있다',()=>{
  const tokenAt=html.indexOf('href="src/svt-tokens.css"'),styleAt=html.indexOf('href="src/styles.css"');
  assert.ok(tokenAt>0&&tokenAt<styleAt,'svt-tokens.css → styles.css 순서');
  assert.ok(read('scripts/package-site.cjs').includes("'src/svt-tokens.css','src/styles.css'"));
});

test('0.278 사이트 CSS가 읽는 var(--svt-*)는 모두 토큰 파일에 정의되어 있고, 공통 값은 CSS에 직접 적지 않는다',()=>{
  const used=new Set([...css.matchAll(/var\((--svt-[a-z0-9-]+)\)/g)].map(m=>m[1]));
  assert.ok(used.size>=20,'사용 토큰 '+used.size);
  for(const name of used)assert.ok(defined.has(name),name+' 정의 없음');
  for(const literal of ['linear-gradient(135deg,#3370e6,#6d5cf0)','#4f62ea33','linear-gradient(150deg,#0A84FF,#5E5CE6 55%,#BF5AF2)'])assert.ok(!css.includes(literal),literal);
  for(const rule of ['--rt-accent:var(--svt-accent)','--rt-cta:var(--svt-cta)','--pg-muted:var(--svt-muted)','--pg-accent:var(--svt-accent-ui)','--pg-sans:var(--svt-font-sans)','font-family:var(--svt-font-sans)'])assert.ok(css.includes(rule),rule);
});
