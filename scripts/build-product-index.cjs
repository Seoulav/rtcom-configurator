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
// AV Portal과 같은 제외 모델(2026-09-26 사용자 결정). HD-104U·HD-108U(추후 실크만 HD-14U·HD-18U로 변경 예정, 사용자 확인 2026-09-27)는 HD-D104U·HD-D108U와 다른 제품이므로 제외하지 않는다.
const EXCLUDED=['HS-88MX','HS-88M-U','HD-D104U','HD-D108U'];
// 공개 저장소에 들어가면 안 되는 내부 정보 단어(2026-09-26 §9 결정).
const FORBIDDEN=/단가|원가|매입|마진|거래처|공급가|견적가|판매가|소비자가|재고|내부\s*메모|\bprice\b|\bcost\b|\bmargin\b/i;
// 제조사 문서 PDF 공개 폴더와 허용 종류·크기(2026-09-28). 휴대폰에서도 열리도록 파일 하나 15MB 이하.
const DOC_DIR='output/design/assets/docs';
const DOC_TYPES=['Catalog','Manual','ProductSheet'];
const DOC_MAX_BYTES=15*1024*1024;
// 여러 제품이 함께 쓰는 공용 문서(0.95, 사용자 결정 2026-09-28 "전체 카탈로그 공개해도 돼"): 전체 카탈로그 46쪽판 한 파일을 Catalog 문서로만 쓰고, page로 제품 쪽을 연다.
const SHARED_DOCS={'rtcom-catalog-2026.pdf':{type:'Catalog',pages:46}};
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
  // 제조사 문서 PDF(사용자 결정 2026-09-28): file이 있으면 공개 배포되므로 형식·존재·크기·표기를 확인한다.
  const published=(product.documents||[]).filter(doc=>'file' in doc);
  const files=new Set();
  for(const doc of published){
    if(!DOC_TYPES.includes(doc.type))fail(`documents.file은 ${DOC_TYPES.join('·')}만 가능: ${doc.type}`);
    if(files.has(doc.file))fail(`documents.file 중복: ${doc.file}`);
    files.add(doc.file);
    // 송신기·수신기 매뉴얼처럼 같은 종류가 둘 이상이면 버튼 이름을 구분할 label(예: "CT103 매뉴얼")이 있어야 한다.
    if(published.filter(other=>other.type===doc.type).length>1&&!String(doc.label||'').trim())fail(`같은 종류(${doc.type}) 문서가 둘 이상이면 label 필요: ${doc.file}`);
    const shared=SHARED_DOCS[doc.file];
    if(shared&&shared.type!==doc.type)fail(`공용 문서 ${doc.file}는 ${shared.type}에만 쓸 수 있음: ${doc.type}`);
    if(!shared&&(!/^[a-z0-9]+(?:[-.][a-z0-9]+)*\.pdf$/.test(doc.file||'')||!String(doc.file).startsWith(`${product.id}-`)))fail(`documents.file 형식(제품 id로 시작, 소문자·숫자·하이픈·점, .pdf): ${doc.file}`);
    if('page' in doc&&(!Number.isInteger(doc.page)||doc.page<1||(shared&&doc.page>shared.pages)))fail(`documents.page는 1${shared?`~${shared.pages}`:' 이상'} 정수여야 함: ${doc.file} ${doc.page}`);
    if(/배포 제외|비공개/.test(doc.note||''))fail(`공개하는 문서의 note에 "배포 제외·비공개"가 남아 있음: ${doc.file}`);
    const full=path.join(DOC_DIR,String(doc.file||''));
    if(!fs.existsSync(full)){fail(`문서 파일 없음: ${doc.file}`);continue}
    const size=fs.statSync(full).size,head=Buffer.alloc(5),fd=fs.openSync(full,'r');fs.readSync(fd,head,0,5,0);fs.closeSync(fd);
    if(head.toString()!=='%PDF-')fail(`PDF 파일이 아님: ${doc.file}`);
    if(size>DOC_MAX_BYTES)fail(`문서 파일이 ${DOC_MAX_BYTES/1024/1024}MB를 넘음: ${doc.file}`);
  }
  const codes=new Set((product.sources||[]).map(source=>source.code));
  for(const row of [...(product.specifications||[]),...(product.io||[]),...(product.features||[])])if(row.source&&!codes.has(row.source))fail(`출처 코드 ${row.source}가 sources에 없음`);
  // 0.36 — 같은 제품의 다른 모델명(예: HD-104U의 새 실크 표기 HD-14U). 검색·옛 주소 이동에 쓴다.
  if('aliases' in product){
    if(!Array.isArray(product.aliases)||!product.aliases.every(name=>typeof name==='string'&&name.trim()))fail('aliases는 비어 있지 않은 문자열 배열이어야 함');
    else for(const name of product.aliases){
      if(name===product.model)fail(`aliases에 model과 같은 이름: ${name}`);
      for(const model of EXCLUDED)if(name===model)fail(`aliases에 제외 모델 ${model}`);
    }
  }
  // 0.33 — 제품정보 글래스 디자인(선택 필드, docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md 3장). 없어도 동작하지만 있으면 형식을 검사한다.
  if('lead' in product){
    if(typeof product.lead!=='string'||!product.lead)fail('lead는 비어 있지 않은 문자열이어야 함');
    else if((()=>{const n=(product.lead.match(/\*\*/g)||[]).length;return n>2||n%2!==0})())fail('lead의 **굵게**는 한 곳까지만, 정확히 여닫혀야 함');
  }
  if('subtitle' in product&&(typeof product.subtitle!=='string'||!product.subtitle))fail('subtitle은 비어 있지 않은 문자열이어야 함');
  if('portMap' in product){
    // portMap은 사진 한 장(객체) 또는 여러 장(배열, 예: 전송기 송신기·수신기 사진)을 받는다(0.42).
    const maps=Array.isArray(product.portMap)?product.portMap:[product.portMap];
    if(!maps.length)fail('portMap 배열이 비어 있음');
    for(const map of maps){
    if(!map||!['Rear','Front','Perspective','Main','Other'].includes(map.image))fail('portMap.image는 Rear·Front·Perspective·Main·Other 중 하나여야 함');
    else if(!(product.images||[]).some(image=>image.role===map.image))fail(`portMap.image(${map.image})에 해당하는 이미지가 images에 없음`);
    // 0.68 portMap.file: 같은 역할(role) 사진이 여러 장일 때 번호를 얹을 사진 파일을 직접 고른다(XDM-FT101/FR101 앞면·뒷면 합성).
    if(map&&'file' in map&&!(product.images||[]).some(image=>image.file===map.file&&image.role===map.image))fail(`portMap.file(${map.file})이 역할 ${map.image}인 images에 없음`);
    if('note' in (map||{})&&(typeof map.note!=='string'||!map.note))fail('portMap.note는 비어 있지 않은 문자열이어야 함');
    if('title' in (map||{})&&(typeof map.title!=='string'||!map.title))fail('portMap.title은 비어 있지 않은 문자열이어야 함');
    // 0.105 portMap.basis: 02 Port Map 제목 옆 기준 문구(기본 "실제 제품 사진 기준"). 사진 대신 그림을 쓰는 제품(XDM-PSU)만 적는다.
    if('basis' in (map||{})&&(typeof map.basis!=='string'||!map.basis))fail('portMap.basis는 비어 있지 않은 문자열이어야 함');
    if('displayWidth' in (map||{})&&(typeof map.displayWidth!=='number'||map.displayWidth<240||map.displayWidth>760))fail('portMap.displayWidth는 240~760 사이 숫자여야 함');
    if(maps.length>1&&!map?.title)fail('portMap이 여러 장이면 각 장에 title(예: "송신기 CT104-U")이 있어야 함');
    // 번호 규칙(사용자 요청 2026-09-27, 모든 제품 동일): HDMI 입력 → HDMI 출력 → 오디오 → 전송 → 제어 → 표시·조작 → 전원(마지막).
    // 번호는 1부터 빈칸 없이 이어지고, 전원 단자는 맨 뒤에 둔다. 송신기·수신기를 한 사진에 담은 장(label "· 송신기"/"· 수신기")은 기기마다 전원을 맨 뒤에 둔다.
    if(map&&Array.isArray(map.items)&&map.items.length){
      const ns=map.items.map(item=>item.n).sort((a,b)=>a-b);
      if(ns.some((n,i)=>n!==i+1))fail(`portMap 번호는 1부터 빈칸 없이 이어져야 함(${map.title||map.image}: ${ns.join(',')})`);
      const isPower=item=>!/LED/i.test(item.label)&&/^(DC|\+12V|AC)|전원/.test(item.label);
      const groups=[...new Set(map.items.map(item=>(item.label.match(/· (송신기|수신기)$/)||[])[1]||''))];
      for(const g of groups){
        const inGroup=map.items.filter(item=>((item.label.match(/· (송신기|수신기)$/)||[])[1]||'')===g).sort((a,b)=>a.n-b.n);
        const firstPower=inGroup.findIndex(isPower);
        if(firstPower>=0&&inGroup.slice(firstPower).some(item=>!isPower(item)))fail(`portMap 전원 단자는 맨 뒤 번호여야 함(${map.title||map.image}${g?' '+g:''})`);
      }
    }
    const photo=(product.images||[]).find(image=>image.role===map?.image&&(!map?.file||image.file===map.file)),[width,height]=String(photo?.resolution||'').split(/[×x]/).map(Number);
    if(!Array.isArray(map?.items)||!map.items.length)fail('portMap.items는 비어 있지 않은 배열이어야 함');
    else for(const item of map.items){
      const vertical=item.side==='left'||item.side==='right';
      if(!width)fail(`portMap 사진(${map?.image})에 resolution(가로×세로)이 없음`);
      if('side' in item&&!['top','bottom','left','right'].includes(item.side))fail(`portMap.items의 side는 top·bottom·left·right 중 하나여야 함(${item.side})`);
      if(typeof item.n!=='number'||typeof item.label!=='string'||typeof item.desc!=='string')fail('portMap.items 항목은 n·label·desc를 갖춰야 함');
      if(vertical){
        // 세로 괄호(0.43): y1~y2(원본 px)가 사진 높이 안이어야 한다. x는 괄호를 붙일 가장자리(선택).
        if(typeof item.y1!=='number'||typeof item.y2!=='number'||item.y1>=item.y2)fail(`portMap.items ${item.label}: side ${item.side}에는 y1<y2가 필요함`);
        else if(item.y1<0||!height||item.y2>height)fail(`portMap.items ${item.label}의 y(${item.y1}~${item.y2})가 사진 높이 ${height}px를 벗어남`);
        if('x' in item&&(typeof item.x!=='number'||item.x<0||item.x>width))fail(`portMap.items ${item.label}의 x(${item.x})가 사진 폭 안이어야 함`);
      }else{
        if(typeof item.x1!=='number'||typeof item.x2!=='number')fail('portMap.items 항목은 x1·x2를 갖춰야 함(세로 괄호가 아닐 때)');
        else if(item.x1>=item.x2)fail(`portMap.items의 x1(${item.x1})은 x2(${item.x2})보다 작아야 함`);
        else if(width&&(item.x1<0||item.x2>width))fail(`portMap.items ${item.label}의 좌표(${item.x1}~${item.x2})가 사진 폭 ${width}px를 벗어남`);
      }
      // y: 괄호를 붙일 사진 속 높이(원본 px). 위아래 두 면이 함께 찍힌 사진에서 면 가장자리에 괄호를 붙일 때 쓴다.
      if('y' in item&&(typeof item.y!=='number'||item.y<0||!height||item.y>height))fail(`portMap.items ${item.label}의 y(${item.y})가 사진 높이 ${height}px 안이어야 함`);
    }
    }
  }
  for(const entry of product.lineup||[])if('rackUnits' in entry&&(typeof entry.rackUnits!=='number'||entry.rackUnits<=0))fail(`lineup[].rackUnits는 양수여야 함(${entry.model})`);
  // dipSwitch: 전면 딥 스위치 번호별 OFF·ON 설명(HDS-21U·HDS-42MU, 0.58). 그림은 count개 스위치를 그리고 rows의 번호만 또렷하게 그린다.
  if('dipSwitch' in product){
    const ds=product.dipSwitch;
    if(!ds||!Number.isInteger(ds.count)||ds.count<1||ds.count>12)fail('dipSwitch.count는 1~12 정수여야 함');
    else{
      if(!codes.has(ds.source))fail(`dipSwitch.source(${ds.source})가 sources에 없음`);
      if('onUp' in ds&&typeof ds.onUp!=='boolean')fail('dipSwitch.onUp은 true/false여야 함');
      for(const key of ['label','apply','note'])if(key in ds&&(typeof ds[key]!=='string'||!ds[key]))fail(`dipSwitch.${key}는 비어 있지 않은 문자열이어야 함`);
      if('color' in ds&&!['red','black'].includes(ds.color))fail('dipSwitch.color는 "red" 또는 "black"이어야 함');
      if('place' in ds&&(typeof ds.place!=='string'||!ds.place))fail('dipSwitch.place는 비어 있지 않은 문자열이어야 함');
      for(const cb of ds.combos||[]){
        if(!Array.isArray(cb.switches)||cb.switches.length<2||cb.switches.some(n=>!Number.isInteger(n)||n<1||n>ds.count))fail(`dipSwitch.combos[].switches는 1~${ds.count} 번호 2개 이상이어야 함`);
        if(typeof cb.title!=='string'||!cb.title)fail('dipSwitch.combos[].title이 비어 있음');
        if(!Array.isArray(cb.items)||!cb.items.length)fail('dipSwitch.combos[].items가 비어 있음');
        else for(const it of cb.items){
          if(!Array.isArray(it.set)||it.set.length!==(cb.switches||[]).length||it.set.some(v=>!['on','off'].includes(v)))fail('dipSwitch.combos[].items[].set은 switches 수만큼 "on"/"off"여야 함');
          if(typeof it.name!=='string'||!it.name||typeof it.text!=='string'||!it.text)fail('dipSwitch.combos[].items[]는 name·text를 갖춰야 함');
        }
      }
      if('order' in ds&&!(Array.isArray(ds.order)&&ds.order.length===2&&ds.order.includes('on')&&ds.order.includes('off')))fail('dipSwitch.order는 ["on","off"] 또는 ["off","on"]이어야 함');
      if(!Array.isArray(ds.rows)||!ds.rows.length)fail('dipSwitch.rows는 비어 있지 않은 배열이어야 함');
      else{
        const seen=new Set();
        for(const row of ds.rows){
          if(!Number.isInteger(row.n)||row.n<1||row.n>ds.count)fail(`dipSwitch.rows[].n(${row.n})은 1~${ds.count} 정수여야 함`);
          if(seen.has(row.n))fail(`dipSwitch.rows[].n(${row.n})이 중복됨`);
          seen.add(row.n);
          if(typeof row.title!=='string'||!row.title)fail(`dipSwitch.rows[].title이 비어 있음(${row.n}번)`);
          for(const side of ['off','on']){
            const st=row[side];
            if(!st||typeof st.text!=='string'||!st.text)fail(`dipSwitch.rows[].${side}.text가 비어 있음(${row.n}번)`);
            else if('name' in st&&(typeof st.name!=='string'||!st.name))fail(`dipSwitch.rows[].${side}.name은 비어 있지 않은 문자열이어야 함(${row.n}번)`);
          }
          if('note' in row&&(typeof row.note!=='string'||!row.note))fail(`dipSwitch.rows[].note는 비어 있지 않은 문자열이어야 함(${row.n}번)`);
        }
      }
    }
  }
  // audioMux: 오디오 병합(MUX)·추출(DEMUX)을 동시에 쓰지 않고 하나를 골라 쓰는 제품(HD-13U, 사용자 확인 2026-09-27)
  if('audioMux' in product){
    const am=product.audioMux;
    if(!am||am.mode!=='select')fail('audioMux.mode는 "select"여야 함');
    else if(!codes.has(am.source))fail(`audioMux.source(${am.source})가 sources에 없음`);
    if(am&&'caption' in am&&(typeof am.caption!=='string'||!am.caption))fail('audioMux.caption은 비어 있지 않은 문자열이어야 함');
    // audioMux.panel: 전면 패널 그림(0.61, HD-13U). 로터리 값·버튼 이름과, LED 이름 목록 안에 확인용 LED(target)가 있어야 한다.
    if(am&&'panel' in am){
      const pn=am.panel;
      if(!pn||!Array.isArray(pn.leds)||!pn.leds.length||pn.leds.some(label=>typeof label!=='string'||!label))fail('audioMux.panel.leds는 비어 있지 않은 문자열 배열이어야 함');
      else if(!pn.leds.includes(pn.target))fail(`audioMux.panel.target(${pn.target})이 leds에 없음`);
      if(pn&&(typeof pn.button!=='string'||!pn.button))fail('audioMux.panel.button은 비어 있지 않은 문자열이어야 함');
      if(pn&&pn.rotary&&(typeof pn.rotary.value!=='string'||!pn.rotary.value))fail('audioMux.panel.rotary.value는 비어 있지 않은 문자열이어야 함');
    }
    if(am&&'modes' in am){
      if(!Array.isArray(am.modes)||am.modes.length!==2)fail('audioMux.modes는 병합·추출 2개여야 함');
      else for(const mode of am.modes){
        if(!['MUX','DEMUX'].includes(mode.name)||typeof mode.title!=='string'||!mode.title)fail('audioMux.modes 항목은 name(MUX|DEMUX)·title을 갖춰야 함');
        if(!Array.isArray(mode.rows)||!mode.rows.length||mode.rows.some(row=>typeof row.label!=='string'||!row.label||typeof row.text!=='string'||!row.text))fail(`audioMux.modes[].rows는 label·text를 갖춘 배열이어야 함(${mode.name})`);
        if('flow' in mode&&(!Array.isArray(mode.flow)||mode.flow.length<2))fail(`audioMux.modes[].flow는 2칸 이상 배열이어야 함(${mode.name})`);
        if('led' in mode&&!['blink','steady'].includes(mode.led))fail(`audioMux.modes[].led는 "blink" 또는 "steady"여야 함(${mode.name})`);
      }
    }
  }
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
    if(!es||!['Rear','Front','Perspective','Main','Other'].includes(es.image))fail('edidSwitch.image는 Rear·Front·Perspective·Main·Other 중 하나여야 함');
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
  const hdmiOutQty=product=>{
    const port=(product.io||[]).find(row=>row.direction==='OUT'&&/HDMI/i.test(row.connector||''));
    const n=port&&parseInt(port.quantity,10);
    return Number.isFinite(n)?n:null;
  };
  // 분배기(Splitter)를 먼저, 셀렉터(Switcher)를 나중에 보여준다(사용자 요청 2026-09-27 "분배기, 셀렉터 순으로 나오게해줘").
  const DIST_TYPES=['Splitter','Switcher'];
  const distType=product=>{const i=DIST_TYPES.findIndex(type=>(product.categories||[]).includes(type));return i<0?DIST_TYPES.length:i};
  const list=products.map(([,product])=>product).sort((a,b)=>{
    const groupDiff=order(a)-order(b);
    if(groupDiff)return groupDiff;
    if(a.group==='distribution'&&b.group==='distribution'){
      const typeDiff=distType(a)-distType(b);
      if(typeDiff)return typeDiff;
      const qa=hdmiOutQty(a),qb=hdmiOutQty(b);
      if(qa!==null&&qb!==null&&qa!==qb)return qa-qb;
    }
    return a.productName.localeCompare(b.productName,'en');
  });
  const card=product=>{const images=product.images||[];return (images.find(image=>image.role==='Main')||images.find(image=>image.role==='Front')||images[0]||{}).file||null};
  const index={
    schema:SCHEMA,
    manufacturer:'RTCOM',
    source:'알티컴 종합 카탈로그 2026 (국문 48쪽)',
    detailPath:'data/products/{id}.json',
    imagePath:'output/design/assets/products/{file}',
    groups:Object.fromEntries([['series','매트릭스 시리즈'],['integrated','일체형 매트릭스'],['distribution','분배기·선택기'],['extender','전송기'],['cable','케이블']]),
    products:list.map(product=>({id:product.id,group:product.group,productName:product.productName,model:product.model,...(product.aliases?{aliases:product.aliases}:{}),itemType:product.itemType,categories:product.categories,english:product.english,korean:product.korean,catalogPages:product.catalogPages||null,packageStatus:product.packageStatus,cardImage:card(product)}))
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
