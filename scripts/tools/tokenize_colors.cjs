// 0.231 다크 모드 준비 1단계: src/styles.css의 면·글자·선 색을 --rt-* 변수로 모은다(라이트 화면은 그대로).
// 사용법: node scripts/tools/tokenize_colors.cjs          → 점검만(바뀔 곳·토큰 수를 출력)
//         node scripts/tools/tokenize_colors.cjs --apply  → src/styles.css에 적용
//         node scripts/tools/tokenize_colors.cjs --verify → 변수를 원래 색으로 되돌려 "토큰 블록을 뺀 CSS = 원본"인지 증명
// 변환은 색 글자만 var(--rt-…)로 바꾸고 변수 값은 원래 색 그대로라서, 변수를 되돌리면 원본과 같아야 한다.
const fs=require('node:fs');
const FILE='src/styles.css';
const START='/* ==== 0.231 색 토큰(자동 생성: scripts/tools/tokenize_colors.cjs) 시작 ==== */';
const END='/* ==== 0.231 색 토큰 끝 ==== */';
const read=()=>fs.readFileSync(FILE,'utf8');
// 인쇄 블록 범위
function printSpans(s){const out=[],re=/@media\s+print\b[^{]*\{/g;let m;while((m=re.exec(s))){let d=0,j=m.index+m[0].length-1;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(d===0)break}}out.push([m.index,j+1]);re.lastIndex=j+1}return out}
// 위치가 속한 규칙의 선택자
function selectorOf(s,pos){let d=0,k=pos;while(k>0){k--;if(s[k]==='}')d++;else if(s[k]==='{'){if(d===0)break;d--}}const a=Math.max(s.lastIndexOf('}',k-1),s.lastIndexOf('{',k-1),s.lastIndexOf(';',k-1))+1;return s.slice(a,k).trim()}
const hexToRgb=h=>{h=h.slice(1);if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
const hexAlpha=h=>{h=h.slice(1);if(h.length===4)return parseInt(h[3]+h[3],16)/255;if(h.length===8)return parseInt(h.slice(6,8),16)/255;return 1};
const lum=h=>{const [r,g,b]=hexToRgb(h).map(v=>v/255);return .2126*r+.7152*g+.0722*b};
const sat=h=>{const [r,g,b]=hexToRgb(h).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx===0?0:(mx-mn)/mx};
// 어떤 속성의 어떤 색을 토큰으로 만들지
function kindFor(prop,hex){
  const L=lum(hex),A=hexAlpha(hex);
  if(prop==='background'||prop==='background-color'){
    if(A<1)return /^#(?:fff|ffffff)/i.test(hex)?'bg':null;    // 반투명은 흰색 유리 면만
    if(L>=0.80)return 'bg';                                    // 밝은 면·옅은 색 바탕
    return null;                                               // 어두운 면·강조색·신호색은 그대로
  }
  if(prop==='color'){
    if(A<1)return null;
    if(/^#(?:fff|ffffff)$/i.test(hex))return null;             // 강조색 위 흰 글자
    if(L>=0.90)return null;                                    // 어두운 면 위 밝은 글자
    return 'fg';
  }
  if(/^border(?:-(?:top|right|bottom|left))?(?:-color)?$/.test(prop)||prop==='outline'||prop==='outline-color'){
    if(A<1)return /^#(?:fff|ffffff)/i.test(hex)?'ln':null;
    if(L>=0.78&&sat(hex)<0.35)return 'ln';                     // 옅은 회색 선
    return null;
  }
  if(prop==='box-shadow'){
    if(A<1)return null;
    if(L>=0.75&&sat(hex)<0.30)return 'ln';                     // 1px 고리처럼 쓰는 옅은 회색
    return null;
  }
  return null;
}
const nameOf=(kind,hex)=>`--rt-${kind}-${hex.slice(1).toLowerCase()}`;
function transform(s){
  const sp=printSpans(s),tokens=new Map(),stats={skipSel:0,replaced:0};
  const declRe=/([a-z-]+)(\s*:\s*)([^;{}]*)/g;
  let out='',last=0,m;
  while((m=declRe.exec(s))){
    const pos=m.index,prop=m[1];
    if(prop.startsWith('--'))continue;
    if(sp.some(([a,b])=>pos>=a&&pos<b))continue;
    const val=m[3];
    if(!/#[0-9a-fA-F]{3,8}\b/.test(val))continue;
    const sel=selectorOf(s,pos);
    // 변수는 #rtcom-design 안쪽에서만 상속된다. 선택자가 모두 #rtcom-design로 시작하지 않으면 그대로 둔다.
    const parts=sel.split(',').map(x=>x.trim());
    const inRoot=parts.length>0&&parts.every(x=>x.startsWith('#rtcom-design'));
    if(!inRoot){stats.skipSel++;continue}
    if(/rt-rp|print-report|::backdrop/.test(sel))continue;     // 인쇄 보고서와 ::backdrop(상속 불확실)은 그대로
    if(/(^|\s)\.rt-report(\s|$|[.:#\[])/.test(sel))continue;   // 보고서 본문
    const nv=val.replace(/#[0-9a-fA-F]{3,8}\b/g,hex=>{
      const kind=kindFor(prop,hex);if(!kind)return hex;
      const name=nameOf(kind,hex);tokens.set(name,hex.toLowerCase());stats.replaced++;return `var(${name})`});
    if(nv!==val){out+=s.slice(last,m.index+m[1].length+m[2].length)+nv;last=m.index+m[0].length}
  }
  out+=s.slice(last);
  return {css:out,tokens,stats};
}
function block(tokens){
  const names=[...tokens.keys()].sort();
  const lines=names.map(n=>`${n}:${tokens.get(n)}`);
  return `${START}\n/* 값은 모두 변환 전 색 그대로다(라이트 화면 변화 없음). 다크 값은 다음 단계에서 이 이름들에 연결한다. bg=밝은 면, fg=글자, ln=선. */\n#rtcom-design{\n  ${lines.join(';\n  ')}\n}\n${END}\n`;
}
const css=read();
const base=css.includes(START)?css.slice(0,css.indexOf(START))+css.slice(css.indexOf(END)+END.length+1):css;
const mode=process.argv[2]||'';
if(mode==='--verify'){
  // 변수를 원래 색으로 되돌리고 토큰 블록을 빼면 변환 전 CSS와 같아야 한다.
  const origPath=process.argv[3];const orig=fs.readFileSync(origPath,'utf8');
  const tokenMap=new Map();const bs=css.indexOf(START),be=css.indexOf(END);
  if(bs<0){console.log('토큰 블록 없음');process.exit(1)}
  for(const mm of css.slice(bs,be).matchAll(/(--rt-(?:bg|fg|ln)-[0-9a-f]+):(#[0-9a-fA-F]+)/g))tokenMap.set(mm[1],mm[2]);
  const withoutBlock=css.slice(0,bs)+css.slice(be+END.length+1);
  const restored=withoutBlock.replace(/var\((--rt-(?:bg|fg|ln)-[0-9a-f]+)\)/g,(x,n)=>tokenMap.has(n)?tokenMap.get(n):x);
  // 원본의 hex 대소문자는 달라질 수 있어 색 글자는 소문자로 맞춰 비교한다.
  const norm=t=>t.replace(/#[0-9a-fA-F]{3,8}\b/g,h=>h.toLowerCase());
  const same=norm(restored)===norm(orig);
  console.log(same?`증명 통과: 변수 ${tokenMap.size}개를 되돌리면 원본 CSS와 완전히 같음`:'증명 실패: 되돌린 CSS가 원본과 다름');
  if(!same){const a=norm(restored),b=norm(orig);let i=0;while(i<a.length&&a[i]===b[i])i++;console.log('첫 차이 위치',i,JSON.stringify(a.slice(i-60,i+60)),'|',JSON.stringify(b.slice(i-60,i+60)))}
  process.exit(same?0:1);
}
const {css:tcss,tokens,stats}=transform(base);
console.log(`토큰 ${tokens.size}개, 바뀐 색 ${stats.replaced}곳, 변수가 닿지 않는 선택자라 건너뛴 선언 ${stats.skipSel}개`);
const byKind={bg:0,fg:0,ln:0};for(const n of tokens.keys())byKind[n.split('-')[3]]++;console.log('종류별 토큰:',JSON.stringify(byKind));
if(mode==='--apply'){
  // 토큰 블록은 첫 번째 #rtcom-design{...} 정의 규칙 바로 뒤에 둔다.
  const anchor=tcss.indexOf('\n#rtcom-design{--rt-bg:#fff;');
  if(anchor<0){console.error('삽입 위치(29줄 규칙)를 찾지 못함');process.exit(1)}
  const end=tcss.indexOf('\n',anchor+1);
  fs.writeFileSync(FILE,tcss.slice(0,end+1)+block(tokens)+tcss.slice(end+1));
  console.log('적용 완료');
}else console.log('(점검만 함, 파일은 그대로)');
