// 표기 통일 변환(0.184, 사용자 결정 2026-09-30): 해상도는 Extron 방식(4K/60 @ 4:4:4 · 3840x2160 @ 60Hz · 1080p/60),
// 단위는 붙여 쓰기(60Hz·100m·12V·18Gbps), CAT6A·HDCP 1.x·딥 스위치 표기 통일.
const W='(?:640|720|800|1024|1280|1360|1366|1400|1440|1600|1680|1920|2048|2560|3840|4096)';
const H='(?:480|576|600|720|768|800|900|1024|1050|1080|1200|1440|1600|2160)';
const RATE='(?:\\d{2}(?:\\.\\d+)?(?:\\/\\d{2}(?:\\.\\d+)?)*)';
const CH='(4:[024]:[024])';
const CHROMA=`(?:[ ]?\\(${CH}\\)|[ ]${CH})?`;
const END='(?![0-9]|m\\b|km|ft|[x×])';
const chroma=(a,b)=>(a||b)?' '+(a||b):'';
// 받침 있는 숫자(0·1·3·6·7·8)로 끝나면 조사를 바꾼다. 1·7·8(ㄹ 받침)은 '로' 그대로.
const BAT=new Set(['0','1','3','6','7','8']);
function particle(t){
  return t.replace(/((?:4K|8K|\d{3,4}[pi])\/[\d.\/]*(\d))(를|을|가|는|은|와|과|로|으로)(?=[\s.,)·]|$)/g,(m,tok,d,p)=>{
    const b=BAT.has(d),l=['1','7','8'].includes(d);
    const map={'를':b?'을':'를','을':b?'을':'를','가':b?'이':'가','는':b?'은':'는','은':b?'은':'는','와':b?'과':'와','과':b?'과':'와','로':(b&&!l)?'으로':'로','으로':(b&&!l)?'으로':'로'};
    return tok+map[p];
  });
}
function fix(s){
  let t=s;
  // 0) 특이 표기: 4K60@Hz → 4K/60
  t=t.replace(/\b4K(\d{2})@Hz/g,'4K/$1');
  // 1) 픽셀 + 주사율(+크로마) → 3840x2160 @ 60Hz 4:4:4 (Hz가 없어도 @나 p 다음 숫자면 주사율로 본다)
  t=t.replace(new RegExp(`\\b(${W})[ ]?[x×X][ ]?(${H})([pi]?)(?:[ ]?@[ ]?(${RATE})(?:[ ]?Hz)?|[ ]?(${RATE})[ ]?Hz|(?<=[pi])[ ](${RATE})(?=[ ]))${END}${CHROMA}`,'g'),
    (m,w,h,pi,r1,r2,r3,c1,c2)=>`${w}x${h}${pi==='i'?'i':''} @ ${r1||r2||r3}Hz${chroma(c1,c2)}`);
  // 2) 픽셀만 → 3840x2160
  t=t.replace(new RegExp(`\\b(${W})[ ]?[x×X][ ]?(${H})([pi]?)(?![0-9x×])`,'g'),(m,w,h,pi)=>`${w}x${h}${pi==='i'?'i':''}`);
  // 3) 4K + 주사율(+크로마) → 4K/60 @ 4:4:4
  t=t.replace(new RegExp(`\\b4K[ ]?@?[ ]?(${RATE})(?:[ ]?Hz)?${END}${CHROMA}`,'g'),(m,r,c1,c2)=>`4K/${r}${(c1||c2)?' @ '+(c1||c2):''}`);
  // 4) 1080p·720p + 주사율 → 1080p/60
  t=t.replace(new RegExp(`\\b(1080|720|2160|480|576)([pi])[ ]?@?[ ]?(${RATE})(?:[ ]?Hz)?${END}`,'g'),'$1$2/$3');
  // 5) 남은 "60Hz(4:4:4)" 괄호 → "60Hz 4:4:4"
  t=t.replace(/(\d)Hz\((4:[024]:[024])\)/g,'$1Hz $2');
  // 6) 단위 붙여 쓰기
  t=t.replace(/(\d) (Gbps|Mbps|VDC|VAC|kHz|MHz|Hz|mA)\b/g,'$1$2').replace(/(\d) (V|A|W)\b(?![-/])/g,'$1$2');
  // 7) 소수 표기 정리
  t=t.replace(/CAT6a/g,'CAT6A').replace(/HDCP 1\.X/g,'HDCP 1.x').replace(/\bRS232(C?)\b/g,'RS-232$1').replace(/DIP ?스위치/g,'딥 스위치');
  return particle(t);
}
// JS 소스: 따옴표 안 문자열만 바꾼다(주석은 그대로).
function fixJs(src){
  let out='',i=0;
  while(i<src.length){
    const c=src[i];
    if(c==='/'&&src[i+1]==='/'){const e=src.indexOf('\n',i);const j=e<0?src.length:e;out+=src.slice(i,j);i=j;continue}
    if(c==='/'&&src[i+1]==='*'){const e=src.indexOf('*/',i+2);const j=e<0?src.length:e+2;out+=src.slice(i,j);i=j;continue}
    if(c==="'"||c==='"'||c==='`'){let j=i+1;while(j<src.length&&src[j]!==c){if(src[j]==='\\')j++;else if(c==='`'&&src[j]==='$'&&src[j+1]==='{'){let d=1;j+=2;while(j<src.length&&d){if(src[j]==='{')d++;else if(src[j]==='}')d--;j++}continue}else if(c!=='`'&&src[j]==='\n')break;j++}
      out+=c+fix(src.slice(i+1,j))+(src[j]||'');i=j+1;continue}
    // 정규식 리터럴 안의 따옴표를 문자열로 오인하지 않도록: 간단히 그대로 복사
    out+=c;i++;
  }
  return out;
}
module.exports={fix,fixJs};

// 실행: node scripts/tools/unify_notation.cjs          → 바뀔 곳 개수만 알려 줌(파일은 그대로)
//       node scripts/tools/unify_notation.cjs --apply  → data/products/*.json(화면 문구)과 src/*.js 따옴표 안 문자열에 적용
// 적용 뒤에는 node scripts/build-product-index.cjs 로 제품 색인을 다시 만든다(docs/implementation/NOTATION_UNIFICATION_0.184.md).
if(require.main===module){
  const fs=require('fs'),path=require('path');
  process.chdir(path.resolve(__dirname,'../..'));
  const apply=process.argv.includes('--apply');
  // 화면에 나오지 않는 내부 기록 항목은 건드리지 않는다.
  const SKIP=new Set(['id','file','image','images','imageStatuses','previewImages','preview','resolution','role','provider','status','verificationStatus','verification','source','sources','verificationSummary','packageStatus','itemType','catalogPages','aliases','side','target','relation','language','type','issues']);
  let count=0;
  for(const f of fs.readdirSync('data/products')){
    if(f==='index.json')continue;
    const p=path.join('data/products',f),raw=fs.readFileSync(p,'utf8'),d=JSON.parse(raw);let changed=0;
    const walk=v=>{if(Array.isArray(v))v.forEach((x,i)=>{if(typeof x==='string'){const n=fix(x);if(n!==x){v[i]=n;changed++}}else walk(x)});
      else if(v&&typeof v==='object')for(const k of Object.keys(v)){if(SKIP.has(k))continue;if(typeof v[k]==='string'){const n=fix(v[k]);if(n!==v[k]){v[k]=n;changed++}}else walk(v[k])}};
    walk(d);count+=changed;
    if(apply&&changed)fs.writeFileSync(p,JSON.stringify(d,null,2)+(raw.endsWith('\n')?'\n':''));
  }
  for(const f of ['src/card-specs.js','src/catalog.js','src/app.js','src/products.js','src/core.js']){
    const src=fs.readFileSync(f,'utf8'),n=fixJs(src);
    if(n!==src){count+=n.split('\n').filter((l,i)=>l!==src.split('\n')[i]).length;if(apply)fs.writeFileSync(f,n)}
  }
  console.log(`${apply?'적용':'바뀔 곳'}: ${count}건`);
}
