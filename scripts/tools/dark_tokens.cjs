#!/usr/bin/env node
// 0.238 다크 모드 B단계 ②: 0.232에서 모은 --rt-bg-*/--rt-fg-*/--rt-ln-* 변수에 다크 값을 계산해 붙인다.
// 사용법: node scripts/tools/dark_tokens.cjs          (점검: 바뀔 블록을 출력만 함)
//         node scripts/tools/dark_tokens.cjs --check  (styles.css의 다크 블록이 최신인지 확인, 다르면 exit 1)
//         node scripts/tools/dark_tokens.cjs --apply  (src/styles.css 맨 끝의 다크 블록을 새로 씀)
// 다크 블록은 @media screen and (prefers-color-scheme:dark) 안에만 있으므로 인쇄와 라이트 화면은 바뀌지 않는다.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const CSS=path.join(__dirname,'..','..','src','styles.css');
const START='/* ==== 0.238 다크 값(자동 생성: scripts/tools/dark_tokens.cjs) 시작 ==== */';
const END='/* ==== 0.238 다크 값 끝 ==== */';

const toHsl=(r,g,b,a)=>{
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;
  let s=0,hue=0;
  if(max!==min){
    const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);
    hue=max===r?((g-b)/d+(g<b?6:0)):max===g?((b-r)/d+2):((r-g)/d+4);hue*=60;
  }
  return {r,g,b,a,h:hue,s,l};
};
const parse=hex=>{
  let h=hex.replace('#','');
  if(h.length===3||h.length===4)h=h.split('').map(c=>c+c).join('');
  const a=h.length===8?parseInt(h.slice(6),16)/255:1;
  const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);
  return toHsl(r,g,b,a);
};
const parseAny=lit=>{
  if(lit[0]==='#')return parse(lit);
  const n=lit.match(/[\d.]+%?/g).map(v=>v.endsWith('%')?parseFloat(v)/100:+v);
  return toHsl(n[0]/255,n[1]/255,n[2]/255,n.length>3?n[3]:1);
};
const hsl=(h,s,l)=>{
  const k=n=>(n+h/30)%12,f=n=>l-s*Math.min(l,1-l)*Math.max(-1,Math.min(k(n)-3,9-k(n),1));
  return '#'+[0,8,4].map(n=>Math.round(f(n)*255).toString(16).padStart(2,'0')).join('').toUpperCase();
};
// 옅은 회색과 색조를 가르는 기준. 이 사이트의 옅은 파랑 회색(#f3f6fb 등)은 채도가 높게 계산되지만 실제로는 거의 흰색이므로
// 밝기와 RGB 폭(max-min)을 함께 본다.
const chroma=c=>Math.max(c.r,c.g,c.b)-Math.min(c.r,c.g,c.b);
const LIMIT={bg:.07,fg:.25,ln:.12};
const tinted=(c,kind)=>chroma(c)>LIMIT[kind]&&!(kind==='bg'&&c.l<.88&&chroma(c)<.12);

// 사용자 승인 기준값(2026-10-16 계획): 페이지 #000, 카드 #1C1C1E, 안쪽 #2C2C2E, 글자 #F5F5F7, 보조 #8E8E93, 선 rgba(84,84,88,.42), 강조 글자 #409CFF.
const FIXED={
  'fg-0057d8':'#409CFF','fg-007aff':'#409CFF',
};
function dark(kind,hex){
  const key=`${kind}-${hex}`;
  if(FIXED[key])return FIXED[key];
  return darkOf(kind,parse(hex));
}
function darkOf(kind,c){
  if(kind==='bg'){
    if(c.a<1){
      // 흰 유리 면: 옅은 것(30% 미만)은 색 면 위 하이라이트라 그대로, 짙은 것은 어두운 유리로. 색이 있거나 어두운 반투명 면은 그대로.
      if(c.a<.3||c.l<.85||tinted(c,'bg'))return null;
      return `rgba(44,44,46,${Math.min(.92,Math.max(.58,c.a)).toFixed(2)})`;
    }
    if(c.l<.5)return null; // 이미 어두운 면
    if(tinted(c,'bg')&&c.l<.8)return null; // 강조 버튼·신호 색처럼 채도 높은 면
    if(!tinted(c,'bg')){
      if(c.l>=.985)return '#1C1C1E';
      if(c.l>=.9)return '#2C2C2E';
      return '#3A3A3C';
    }
    // 옅은 색조 면(파랑·보라·노랑·빨강 안내 상자): 같은 색상의 짙은 면.
    return hsl(c.h,.42,c.l>=.9?.16:.22);
  }
  if(kind==='fg'){
    if(c.l>=.6||c.a<1)return null; // 이미 밝은 글자(어두운 면 위에서 쓰던 색), 반투명 글자
    if(!tinted(c,'fg')){
      if(c.l<.28)return '#F5F5F7';
      if(c.l<.42)return '#D1D1D6';
      return '#98989D';
    }
    // 강조·상태 글자: 색상은 지키고 밝게.
    return hsl(c.h,Math.min(.9,Math.max(.55,c.s)),.7);
  }
  // ln
  if(c.a<1){
    if(c.l>=.85)return 'rgba(255,255,255,.12)';
    if(!tinted(c,'ln')&&c.l<.5)return 'rgba(84,84,88,.42)';
    return null;
  }
  if(c.l<.5)return null;
  if(chroma(c)>.2)return null; // 선택·포커스 표시처럼 색이 뚜렷한 선은 다크 면 위에서도 잘 보이므로 그대로
  if(!tinted(c,'ln'))return c.l>=.88?'#38383A':'#48484A';
  return hsl(c.h,.28,.3);
}

const css=fs.readFileSync(CSS,'utf8');
// 표지의 버전 번호가 바뀌어도(병합 직전 번호 재지정) 예전 다크 블록을 찾도록 번호와 상관없이 찾는다.
const BLOCK_RE=/\/\* ==== 0\.\d+ 다크 값\(자동 생성: scripts\/tools\/dark_tokens\.cjs\) 시작 ==== \*\/[\s\S]*?\/\* ==== 0\.\d+ 다크 값 끝 ==== \*\//g;
const found=css.match(BLOCK_RE)||[];
if(found.length>1){console.error(`다크 블록이 ${found.length}개 있습니다. 하나만 남기세요.`);process.exit(1)}
const base=css.replace(BLOCK_RE,'');
const tokenRe=/^\s*--rt-(bg|fg|ln)-([0-9a-f]+):#[0-9a-f]+;$/gm;
const pairs=[];let m;
while((m=tokenRe.exec(base)))pairs.push([m[1],m[2]]);
if(!pairs.length){console.error('0.232 색 변수를 찾지 못했습니다.');process.exit(1)}
const decl=[],kept={bg:0,fg:0,ln:0},changed={bg:0,fg:0,ln:0};
for(const [kind,hex] of pairs){
  const v=dark(kind,hex);
  if(v===null){kept[kind]++;continue}
  changed[kind]++;decl.push(`    --rt-${kind}-${hex}:${v};`);
}

// 변수로 모으지 못한(0.232에서 건너뛴) 직접 적힌 색: 같은 선택자로 다크 값을 덮어쓴다.
const KIND=p=>/^background(-color|-image)?$/.test(p)?'bg':p==='color'?'fg':/^(border|outline)(-(top|right|bottom|left))?(-color)?$/.test(p)?'ln':null;
const LIT=/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|rgba?\([^()]*\)/g;
const mask=v=>{let prev;do{prev=v;v=v.replace(/var\([^()]*(\([^()]*\)[^()]*)*\)/g,m=>'\u0000'.repeat(m.length))}while(v!==prev);return v};
function literalOverrides(src){
  src=src.replace(/\/\*[\s\S]*?\*\//g,'');
  const rules=[],stack=[];let buf='';
  for(const ch of src){
    if(ch==='{'){stack.push(buf.trim());buf=''}
    else if(ch==='}'){const pre=stack.pop();if(pre!==undefined&&!pre.startsWith('@'))rules.push({ctx:stack.slice(),sel:pre,body:buf});buf=''}
    else buf+=ch;
  }
  const out=[];let n=0;
  for(const {ctx,sel,body} of rules){
    if(ctx.some(c=>!/^@media\s*\((max|min)-width/.test(c)))continue; // 인쇄·다크·기타 at-rule 안은 건너뜀
    if(!sel.includes('#rtcom-design')||/rt-rp|print-report|rt-report|::backdrop/.test(sel))continue;
    const decls=[];
    for(const d of body.split(';')){
      const i=d.indexOf(':');if(i<0)continue;
      const prop=d.slice(0,i).trim().toLowerCase(),val=d.slice(i+1).trim(),kind=KIND(prop);
      if(!kind||prop.startsWith('--'))continue;
      const masked=mask(val);let changed=false,res='',last=0,mm;LIT.lastIndex=0;
      while((mm=LIT.exec(masked))){
        const lit=val.slice(mm.index,mm.index+mm[0].length);
        const dv=darkOf(kind,parseAny(lit));
        res+=val.slice(last,mm.index)+(dv===null?lit:(changed=true,dv));last=mm.index+mm[0].length;
      }
      if(changed){decls.push(`${prop}:${res+val.slice(last)}`);n++}
    }
    if(!decls.length)continue;
    const rule=`${sel}{${decls.join(';')}}`;
    out.push(ctx.length?ctx.map(c=>c+'{').join('')+rule+'}'.repeat(ctx.length):rule);
  }
  return {css:out.map(r=>'  '+r).join('\n'),n};
}
const lits=literalOverrides(base);

// 밝은 판으로 남기는 그림(B③에서 그림별로 다크 색을 정하기 전까지): 직접 적힌 SVG 색이 밝은 면을 전제로 하므로
// 다크에서도 흰 판을 깔고, 판 안에서는 색 변수를 라이트 값으로 되돌린다.
const PLATES=['#rtcom-design .rt-pg-svg-wrap>svg','#rtcom-design svg.rt-pg-layout-matrix','#rtcom-design .rt-pg-dip-state svg','#rtcom-design .rt-pg-rotary svg','#rtcom-design svg.rt-layer-svg-wide','#rtcom-design svg.rt-layer-svg-tall','#rtcom-design .rt-flow-zoom-canvas svg'];
const LIGHT_BASE='--rt-bg:#fff;--rt-soft:#f3f6fb;--rt-ink:#1f2532;--rt-muted:#687386;--rt-line:#dfe6f0;--rt-accent:#0057D8;--rt-tint:#edf4ff;'+
  '--pg-paper:#EEF1F6;--pg-ink:#1C1C1E;--pg-ink-2:#3A3A3C;--pg-muted:#6A6A6F;--pg-line:rgba(60,60,67,.12);--pg-line-2:rgba(60,60,67,.20);'+
  '--pg-accent:#007AFF;--pg-accent-2:#0057D8;--pg-accent-tint:rgba(0,122,255,.12);--pg-purple-ink:#8944AB;--pg-purple-tint:rgba(137,68,171,.09);'+
  '--pg-glass-fill:rgba(255,255,255,.62);--pg-glass-stroke:rgba(255,255,255,.7);--pg-field-fill:rgba(118,118,128,.10);--pg-seg-track:rgba(118,118,128,.14);';
const lightTokens=pairs.map(([k,h])=>`--rt-${k}-${h}:#${h};`).join('');
// 구성 보고서 미리보기는 인쇄물과 같아야 하므로 종이 판 전체를 라이트로 둔다(모서리 모양은 원래대로).
const PAPERS=['#rtcom-design .rt-report-paper'];
const plateCss=`  ${PLATES.join(',')}{color-scheme:light;background:#fff;border-radius:12px;${LIGHT_BASE}${lightTokens}}\n  ${PAPERS.join(',')}{color-scheme:light;background:#fff;color:#1d2433;${LIGHT_BASE}${lightTokens}}`;

const block=`${START}
/* 기기 설정이 다크일 때만 적용한다(screen 한정: 인쇄는 항상 라이트). 라이트 화면은 이 블록의 영향을 받지 않는다.
   사진 판넬(--rt-photo, 카드 판넬 사진 받침)과 그림 판·보고서 미리보기는 밝게 유지한다. 손으로 정한 값은 이 도구에 있다. */
@media screen and (prefers-color-scheme:dark){
  :root{color-scheme:dark}
  html{background:#000}
  body{background:radial-gradient(circle at 8% 0,#0b1a33 0,transparent 34%),radial-gradient(circle at 92% 4%,#1f1433 0,transparent 32%),linear-gradient(135deg,#000,#07070a);background-attachment:fixed}
  #rtcom-design{
    color-scheme:dark;
    --rt-bg:#1C1C1E;--rt-soft:#2C2C2E;--rt-ink:#F5F5F7;--rt-muted:#8E8E93;--rt-line:rgba(84,84,88,.42);--rt-accent:#409CFF;--rt-tint:rgba(10,132,255,.18);--rt-cta-ink:#fff;
    --pg-paper:#000;--pg-ink:#F5F5F7;--pg-ink-2:#D1D1D6;--pg-muted:#8E8E93;--pg-line:rgba(84,84,88,.42);--pg-line-2:rgba(84,84,88,.65);
    --pg-accent:#0A84FF;--pg-accent-2:#409CFF;--pg-accent-tint:rgba(10,132,255,.18);--pg-purple-ink:#DA8FFF;--pg-purple-tint:rgba(191,90,242,.16);
    --pg-glass-fill:rgba(44,44,46,.58);--pg-glass-stroke:rgba(255,255,255,.08);--pg-field-fill:rgba(118,118,128,.24);--pg-seg-track:rgba(118,118,128,.32);
    --pg-shadow-card:0 1px 2px rgba(0,0,0,.4),0 18px 48px -20px rgba(0,0,0,.7);
${decl.join('\n')}
  }
  /* 직접 적힌 색 덮어쓰기(자동, 선언 ${lits.n}개) */
${lits.css}
  /* 그림 판(밝게 유지) */
${plateCss}
${EXTRA()}
}
${END}`;

function EXTRA(){
  // 손으로 정한 다크 규칙(변수·자동 덮어쓰기로 정할 수 없는 것).
  return [
    '/* 손 규칙: 신호 배지는 SDI(검정)·HDMI(남색)가 어두운 면에 묻히지 않게 옅은 테두리를 둔다. */',
    '#rtcom-design .rt-sig-badge{box-shadow:0 0 0 1px rgba(255,255,255,.28)}',
    '/* 손 규칙: 카드 판넬 사진(검은 몸체) 받침은 0.178 결정대로 옅은 회색을 유지한다. */',
    '#rtcom-design .rt-palette-tile img,#rtcom-design .rt-link-flow-node img[src*="assets/cards/"]{background:#eef1f5}',
    '#rtcom-design .rt-card-info-plate{background:#f2f5fa}',
  ].map(l=>'  '+l).join('\n');
}

console.log(`직접 적힌 색 덮어쓰기: 선언 ${lits.n}개`);
console.log(`다크 값: 면 ${changed.bg}·글자 ${changed.fg}·선 ${changed.ln}개 연결, 그대로 둔 변수 면 ${kept.bg}·글자 ${kept.fg}·선 ${kept.ln}개`);
if(process.argv.includes('--check')){
  const ok=found.length===1&&found[0]===block;
  console.log(ok?'다크 블록이 최신입니다.':'다크 블록이 도구 결과와 다릅니다. node scripts/tools/dark_tokens.cjs --apply 로 다시 쓰세요.');
  process.exit(ok?0:1);
}
if(!process.argv.includes('--apply')){console.log(block);process.exit(0)}
const next=found.length?css.replace(BLOCK_RE,()=>block):css.replace(/\s*$/,'\n\n')+block+'\n';
fs.writeFileSync(CSS,next);
console.log('src/styles.css에 다크 블록을 썼습니다.');
