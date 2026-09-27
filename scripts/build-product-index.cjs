// 0.19 — data/products/<id>.json(상세)에서 목록 파일 data/products/index.json을 만든다.
// 비공개 AV Portal은 이 목록과 상세 파일을 읽기만 한다(docs/handoff/AV_PORTAL_RTCOM_PRODUCT_DATA.md).
// 사용법: node scripts/build-product-index.cjs          → index.json 갱신
//         node scripts/build-product-index.cjs --check  → 검증만(파일이 최신이 아니면 exit 1)
const fs=require('node:fs');
const path=require('node:path');

const DIR='data/products';
const IMAGE_DIR='output/design/assets/products';
const SCHEMA='rtcom.products.v1';
const GROUPS=['series','integrated','distribution','extender','cable'];
// AV Portal과 같은 제외 모델(2026-09-26 사용자 결정). HD-14U(구 HD-104U)·HD-18U(구 HD-108U)는 HD-D104U·HD-D108U와 다른 제품이므로 제외하지 않는다.
const EXCLUDED=['HS-88MX','HS-88M-U','HD-D104U','HD-D108U'];
// 공개 저장소에 들어가면 안 되는 내부 정보 단어(2026-09-26 §9 결정).
const FORBIDDEN=/단가|원가|매입|마진|거래처|공급가|견적가|판매가|소비자가|재고|내부\s*메모|\bprice\b|\bcost\b|\bmargin\b/i;
const REQUIRED=['id','group','manufacturer','productName','model','itemType','categories','english','korean','verificationSummary','packageStatus','overview','images','documents','features','specifications','io','sources','issues'];

function validate(product,file,ids){
  const errors=[];
  const fail=message=>errors.push(`${file}: ${message}`);
  for(const key of REQUIRED)if(!(key in product))fail(`필수 필드 없음: ${key}`);
  if(`${product.id}.json`!==path.basename(file))fail(`id(${product.id})와 파일명이 다름`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id||''))fail('id 형식(소문자·숫자·하이픈)');
  if(!GROUPS.includes(product.group))fail(`group 값: ${product.group}`);
  if(product.manufacturer!=='RTCOM')fail('manufacturer는 RTCOM');
  if(!['PRODUCT','SERIES'].includes(product.itemType))fail(`itemType 값: ${product.itemType}`);
  if((product.group==='series')!==(product.itemType==='SERIES'))fail('series 그룹과 SERIES 유형이 맞지 않음');
  if(!['VERIFIED','REVIEW REQUIRED'].includes(product.packageStatus))fail(`packageStatus 값: ${product.packageStatus}`);
  const hasReview=[...(product.specifications||[]),...(product.io||[])].some(row=>row.verification==='REVIEW REQUIRED')||(product.issues||[]).some(issue=>issue.status==='REVIEW REQUIRED');
  if(hasReview&&product.packageStatus!=='REVIEW REQUIRED')fail('검토 필요 항목이 있으면 packageStatus는 REVIEW REQUIRED');
  const names=`${product.productName} ${product.model}`;
  for(const model of EXCLUDED)if(new RegExp(`(^|[^A-Z0-9-])${model}($|[^A-Z0-9-])`).test(names))fail(`제외 모델 ${model}`);
  const text=JSON.stringify(product);
  const forbidden=text.match(FORBIDDEN);
  if(forbidden)fail(`내부 정보로 보이는 단어: ${forbidden[0]}`);
  for(const image of product.images||[])if(!fs.existsSync(path.join(IMAGE_DIR,image.file||'')))fail(`이미지 없음: ${image.file}`);
  for(const link of product.related||[])if(!ids.has(link.target))fail(`related 대상 없음: ${link.target}`);
  const codes=new Set((product.sources||[]).map(source=>source.code));
  for(const row of [...(product.specifications||[]),...(product.io||[]),...(product.features||[])])if(row.source&&!codes.has(row.source))fail(`출처 코드 ${row.source}가 sources에 없음`);
  // 0.33 — 제품정보 글래스 디자인(선택 필드, docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md 3장). 없어도 동작하지만 있으면 형식을 검사한다.
  if('lead' in product){
    if(typeof product.lead!=='string'||!product.lead)fail('lead는 비어 있지 않은 문자열이어야 함');
    else if((()=>{const n=(product.lead.match(/\*\*/g)||[]).length;return n>2||n%2!==0})())fail('lead의 **굵게**는 한 곳까지만, 정확히 여닫혀야 함');
  }
  if('subtitle' in product&&(typeof product.subtitle!=='string'||!product.subtitle))fail('subtitle은 비어 있지 않은 문자열이어야 함');
  if('portMap' in product){
    const map=product.portMap;
    if(!map||!['Rear','Front'].includes(map.image))fail('portMap.image는 Rear 또는 Front여야 함');
    else if(!(product.images||[]).some(image=>image.role===map.image))fail(`portMap.image(${map.image})에 해당하는 이미지가 images에 없음`);
    if(!Array.isArray(map?.items)||!map.items.length)fail('portMap.items는 비어 있지 않은 배열이어야 함');
    else for(const item of map.items){
      if(typeof item.n!=='number'||typeof item.label!=='string'||typeof item.desc!=='string'||typeof item.x1!=='number'||typeof item.x2!=='number')fail('portMap.items 항목은 n·label·desc·x1·x2를 모두 갖춰야 함');
      else if(item.x1>=item.x2)fail(`portMap.items의 x1(${item.x1})은 x2(${item.x2})보다 작아야 함`);
      {const photo=(product.images||[]).find(image=>image.role===map?.image),width=Number(String(photo?.resolution||'').split(/[×x]/)[0]);
       if(!width)fail(`portMap 사진(${map?.image})에 resolution(가로×세로)이 없음`);
       else if(item.x1<0||item.x2>width)fail(`portMap.items ${item.label}의 좌표(${item.x1}~${item.x2})가 사진 폭 ${width}px를 벗어남`);}
      if('side' in item&&!['top','bottom'].includes(item.side))fail(`portMap.items의 side는 top 또는 bottom이어야 함(${item.side})`);
    }
  }
  for(const entry of product.lineup||[])if('rackUnits' in entry&&(typeof entry.rackUnits!=='number'||entry.rackUnits<=0))fail(`lineup[].rackUnits는 양수여야 함(${entry.model})`);
  if('videoModes' in product){
    const vm=product.videoModes;
    if(!vm||!Array.isArray(vm.modes)||!vm.modes.length)fail('videoModes.modes는 비어 있지 않은 배열이어야 함');
    else{
      if(vm.source&&!codes.has(vm.source))fail(`videoModes.source(${vm.source})가 sources에 없음`);
      for(const mode of vm.modes){
        if(typeof mode.name!=='string'||!mode.name||typeof mode.summary!=='string'||!mode.summary)fail('videoModes.modes 항목은 name·summary를 갖춰야 함');
        if('layouts' in mode&&(!Array.isArray(mode.layouts)||!mode.layouts.length))fail(`videoModes.modes[].layouts는 비어 있지 않은 배열이어야 함(${mode.name})`);
      }
    }
  }
  // 0.35 — 전면 로터리 스위치 등 단일 컨트롤 표시(선택 필드). 사진 위 x1·y1·x2·y2 영역과 코드표를 검사한다.
  if('edidSwitch' in product){
    const es=product.edidSwitch;
    if(!es||!['Rear','Front'].includes(es.image))fail('edidSwitch.image는 Rear 또는 Front여야 함');
    else if(!(product.images||[]).some(image=>image.role===es.image))fail(`edidSwitch.image(${es.image})에 해당하는 이미지가 images에 없음`);
    if(!es||typeof es.label!=='string'||!es.label)fail('edidSwitch.label은 비어 있지 않은 문자열이어야 함');
    if(!es||[es.x1,es.y1,es.x2,es.y2].some(value=>typeof value!=='number'))fail('edidSwitch는 x1·y1·x2·y2를 모두 숫자로 갖춰야 함');
    else if(es.x1>=es.x2||es.y1>=es.y2)fail('edidSwitch는 x1<x2, y1<y2 여야 함');
    if(es&&'source' in es&&es.source&&!codes.has(es.source))fail(`edidSwitch.source(${es.source})가 sources에 없음`);
    if(es&&(!Array.isArray(es.table)||!es.table.length))fail('edidSwitch.table은 비어 있지 않은 배열이어야 함');
    else for(const row of es?.table||[])if(typeof row.code!=='string'||!row.code||typeof row.function!=='string'||!row.function)fail('edidSwitch.table 항목은 code·function을 모두 갖춰야 함');
    if(es&&'steps' in es){
      if(!Array.isArray(es.steps)||!es.steps.length)fail('edidSwitch.steps는 비어 있지 않은 배열이어야 함');
      else for(const step of es.steps){
        if(typeof step.title!=='string'||!step.title)fail('edidSwitch.steps 항목은 title을 갖춰야 함');
        if(!Array.isArray(step.items)||!step.items.length||step.items.some(text=>typeof text!=='string'||!text))fail(`edidSwitch.steps[].items는 비어 있지 않은 문자열 배열이어야 함(${step.title})`);
      }
    }
  }
  return errors;
}

function build(){
  const files=fs.readdirSync(DIR).filter(name=>name.endsWith('.json')&&name!=='index.json').sort();
  const products=files.map(name=>[name,JSON.parse(fs.readFileSync(path.join(DIR,name),'utf8'))]);
  const ids=new Set(products.map(([,product])=>product.id));
  const errors=products.flatMap(([name,product])=>validate(product,path.join(DIR,name),ids));
  const order=product=>GROUPS.indexOf(product.group);
  const list=products.map(([,product])=>product).sort((a,b)=>order(a)-order(b)||a.productName.localeCompare(b.productName,'en'));
  const card=product=>{const images=product.images||[];return (images.find(image=>image.role==='Main')||images.find(image=>image.role==='Front')||images[0]||{}).file||null};
  const index={
    schema:SCHEMA,
    manufacturer:'RTCOM',
    source:'알티컴 종합 카탈로그 2026 (국문 48쪽)',
    detailPath:'data/products/{id}.json',
    imagePath:'output/design/assets/products/{file}',
    groups:Object.fromEntries([['series','매트릭스 시리즈'],['integrated','일체형 매트릭스'],['distribution','분배기·선택기'],['extender','전송기'],['cable','케이블']]),
    products:list.map(product=>({id:product.id,group:product.group,productName:product.productName,model:product.model,itemType:product.itemType,categories:product.categories,english:product.english,korean:product.korean,catalogPages:product.catalogPages||null,packageStatus:product.packageStatus,cardImage:card(product)}))
  };
  return {index,errors,text:`${JSON.stringify(index,null,2)}\n`};
}

module.exports={build,validate,EXCLUDED,FORBIDDEN};
if(require.main===module){
  const {index,errors,text}=build();
  if(errors.length){console.error(errors.join('\n'));process.exit(1)}
  const target=path.join(DIR,'index.json');
  if(process.argv.includes('--check')){
    const current=fs.existsSync(target)?fs.readFileSync(target,'utf8'):'';
    if(current!==text){console.error('data/products/index.json이 최신이 아닙니다. node scripts/build-product-index.cjs 로 갱신하세요.');process.exit(1)}
    console.log(`제품 ${index.products.length}개 검증 통과`);
  }else{fs.writeFileSync(target,text);console.log(`data/products/index.json 갱신 — 제품 ${index.products.length}개`)}
}
