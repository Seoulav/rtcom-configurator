// 0.142 AI 검색(사내 베타)용 공개 자료 묶음. 공개 제품정보(data/products)와 구성기 카탈로그(src/catalog.js·card-specs.js·core.js)만
// 글로 줄여 dist/data/ai-context.json에 넣는다. 사진 좌표(portMap)·출처 표기·검토 기록처럼 답에 필요 없는 항목은 뺀다.
// 단가·노하우 등 회사 내부 정보는 이 저장소에 없으므로 여기에도 들어가지 않는다(docs/implementation/AI_SEARCH_BETA.md).
// 같은 데이터면 글자 하나까지 같은 결과가 나와야 Claude 프롬프트 캐시가 계속 맞는다(정렬 고정, 날짜·난수 금지).
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const clean=value=>String(value??'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
const join=(items,separator='; ')=>items.map(clean).filter(Boolean).join(separator);

function loadConfigurator(){
  const sandbox={};sandbox.globalThis=sandbox;vm.createContext(sandbox);
  for(const file of ['src/catalog.js','src/card-specs.js','src/core.js'])vm.runInContext(read(file),sandbox,{filename:file});
  return {catalog:sandbox.RtCatalog,specs:sandbox.RtCardSpecs,core:sandbox.RtCore};
}

function productText(product){
  const lines=[`## [[${product.id}]] ${clean(product.model)} — ${clean(product.productName)}`];
  const add=(label,value)=>{if(clean(value))lines.push(`- ${label}: ${clean(value)}`)};
  add('분류',join(product.categories||[],' / '));
  add('부제',product.subtitle);
  add('한 줄 설명',product.korean);
  add('요약',product.lead);
  add('개요',product.overview);
  add('주요 기능',join((product.features||[]).map(item=>item.text)));
  add('입출력',join((product.io||[]).map(item=>`${item.connector} ${item.direction} ${item.quantity}${item.signal&&item.signal!==item.connector?` (${item.signal})`:''}${item.condition?` [${item.condition}]`:''}`)));
  add('사양',join((product.specifications||[]).map(item=>`${item.name}: ${item.value}${item.unit?` ${item.unit}`:''}${item.condition?` (${item.condition})`:''}`)));
  add('라인업',join((product.lineup||[]).map(item=>`${item.model}${item.kind?` ${item.kind}`:''} ${item.summary||''}`)));
  if(product.videoModes)add('화면 구성 모드',join(product.videoModes.modes.map(mode=>`${mode.name}: ${mode.summary}${mode.detail?` (${mode.detail})`:''}${mode.layouts?` 레이아웃 ${mode.layouts.join(', ')}`:''}`)));
  for(const dip of [].concat(product.dipSwitch||[]))add(dip.label||'딥 스위치',join((dip.rows||[]).map(row=>`${row.n}번 ${row.title}: OFF=${row.off?.name||''}, ON=${row.on?.name||''}`)));
  for(const edid of [].concat(product.edidSwitch||[]))add(edid.label||'EDID',`${clean(edid.default)} / 코드표 ${join((edid.table||[]).map(row=>`${row.code}=${row.function}`),', ')}`);
  add('관련 제품',join((product.related||[]).map(item=>`${item.relation} [[${item.target}]]${item.note?` ${item.note}`:''}`)));
  return lines.join('\n');
}

function configuratorText({catalog,specs,core}){
  const lines=['# 매트릭스 구성기 카탈로그','프레임마다 입력 슬롯·출력 슬롯 수가 정해져 있고, 카드 1장이 슬롯 1칸을 차지한다. 빈 슬롯은 블랭크 커버로 막는다.'];
  for(const family of Object.keys(catalog).sort((a,b)=>['XDM','SPX','VDM'].indexOf(a)-['XDM','SPX','VDM'].indexOf(b))){
    const item=catalog[family];
    lines.push(`## ${family} (${item.name}) [[${family.toLowerCase()}]]`);
    item.models.forEach((model,index)=>{
      const slots=core.slotsFor({family,model});
      const input=slots.filter(slot=>slot.dir==='input').length,output=slots.filter(slot=>slot.dir==='output').length;
      // VDM-288X는 특수 상황실용 커스텀 제작이라 슬롯 표가 없다(src/core.js slotPlans).
      const plan=model==='VDM-288X'?'슬롯 표 없음(커스텀 제작)':`입력 슬롯 ${input} · 출력 슬롯 ${output}`;
      lines.push(`- 프레임 ${model}: ${clean(item.modelNotes[index])} · ${plan}`);
    });
    for(const [direction,cards] of [['입력 카드',item.input],['출력 카드',item.output]])for(const [id,desc,ports,signal] of cards){
      const spec=specs[id],links=core.choices(id);
      lines.push(`- ${direction} ${id}: ${clean(desc)} · 카드당 ${ports}포트 · ${signal}${links.length?` · 연동 전송기 ${links.join(' / ')}`:''}${spec&&spec.specs?.length?` · 사양 ${join(spec.specs.map(([name,value])=>`${name} ${value}`))}`:''}`);
    }
  }
  lines.push(`구성기 카탈로그 버전: ${core.catalogVersion}`);
  return lines.join('\n');
}

function buildAiContext(){
  const index=JSON.parse(read('data/products/index.json'));
  const products=index.products.map(item=>JSON.parse(read(`data/products/${item.id}.json`)));
  const text=['# 알티컴(RTCOM) 공개 제품 데이터','아래는 공개 제품정보 사이트(https://seoulav.github.io/rtcom-configurator/)의 데이터다. 제품 링크는 [[제품id]]로 표기한다.','',
    products.map(productText).join('\n\n'),'',configuratorText(loadConfigurator())].join('\n');
  return {schema:'rtcom.ai-context.v1',products:products.map(item=>({id:item.id,model:clean(item.model)})),sha256:crypto.createHash('sha256').update(text).digest('hex'),text};
}

module.exports={buildAiContext};

if(require.main===module){
  const context=buildAiContext();
  const target=process.argv[2];
  if(target){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(context));}
  console.log(`AI context: ${context.products.length} products, ${context.text.length} chars, sha256 ${context.sha256.slice(0,12)}${target?` → ${target}`:''}`);
}
