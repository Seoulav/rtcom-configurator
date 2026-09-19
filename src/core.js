/* Pure functions shared by the browser app and Node tests. No product approvals are inferred. */
(function (scope) {
  'use strict';
  const catalog = scope.RtCatalog;
  const catalogVersion = '2026-09-18-draft.1';
  const slotDirections = {'in-a':'input','in-b':'input','out-a':'output','out-b':'output'};
  const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const initial = () => ({step:0,maxStep:0,family:'XDM',model:null,placements:{},links:{},slot:'in-a',format:'PDF'});
  const card = (state, id) => [...catalog[state.family].input,...catalog[state.family].output].find(c=>c[0]===id);
  function choices(id) {
    return ({'XDM-CIS100':['XDM-CTR100 · TX','XDM-CT103'],'XDM-COS100':['XDM-CTR100 · RX','XDM-CR103'],'XDM-FIS100':['XDM-FT101'],'XDM-FOS100':['XDM-FR101'],'SPX-COS12':['SPX-RX']})[id] || [];
  }
  function checkState(input) {
    const fail = message => {throw new Error(message)};
    if (!plain(input) || !own(catalog,input.family)) fail('지원하지 않는 제품군입니다.');
    const result = initial(), f = catalog[input.family];
    result.family = input.family;
    if (input.model !== null && !f.models.includes(input.model)) fail('제품군과 섀시 모델이 일치하지 않습니다.');
    result.model = input.model;
    if (!plain(input.placements) || !plain(input.links)) fail('카드 또는 전송기 데이터 형식이 잘못되었습니다.');
    for (const [id, value] of Object.entries(input.placements)) {
      if (!own(slotDirections,id) || !f[slotDirections[id]].some(c=>c[0]===value)) fail('지원하지 않는 슬롯 또는 카드입니다.');
      if (!result.model) fail('섀시 없이 카드를 배치할 수 없습니다.');
      result.placements[id] = value;
    }
    for (const [id, link] of Object.entries(input.links)) {
      if (!own(result.placements,id) || !plain(link)) fail('전송기에 연결된 카드가 없습니다.');
      const c = card(result,result.placements[id]);
      if (!choices(c[0]).length || (link.device !== '' && !choices(c[0]).includes(link.device))) fail('카드와 전송기의 연결 방향 또는 허용 관계가 일치하지 않습니다.');
      if (!Number.isInteger(link.count) || link.count < 0 || link.count > c[2] || (!link.device && link.count !== 0)) fail('전송기 수량이 카드 포트 범위를 벗어났습니다.');
      const distances = c[3] === 'CAT' ? ['10','30','50','100'] : ['30','100','300','2000'];
      if (!distances.includes(link.distance)) fail('지원하지 않는 거리 입력입니다.');
      result.links[id] = {device:link.device,count:link.count,distance:link.distance};
    }
    for (const field of ['step','maxStep']) {
      if (!Number.isInteger(input[field]) || input[field]<0 || input[field]>5) fail('단계 정보가 올바르지 않습니다.');
      result[field] = input[field];
    }
    if (result.step > result.maxStep || (!result.model && result.maxStep>1)) fail('완료 단계 정보가 구성과 일치하지 않습니다.');
    if (!own(slotDirections,input.slot) || !['PDF','CSV','JSON'].includes(input.format)) fail('화면 설정 형식이 잘못되었습니다.');
    result.slot=input.slot; result.format=input.format;
    return result;
  }
  function validate(state) {
    const issues = [];
    const add = (code,level,message,evidence) => issues.push({code,level,message,evidence});
    if (!state.model) add('CHASSIS_REQUIRED','ERROR','섀시를 선택해 주세요.','');
    for (const dir of ['input','output']) if (!Object.entries(state.placements).some(([id])=>slotDirections[id]===dir)) add('MISSING_'+dir.toUpperCase(),'WARNING',`${dir==='input'?'입력':'출력'} 카드가 선택되지 않았습니다.`,'');
    add('PHYSICAL_LAYOUT_UNCONFIRMED','UNCONFIRMED','입력·출력 각 2칸은 개념 배치입니다. 실제 슬롯 수와 카드 설치 허용표가 필요합니다.','G01 · G02');
    add('ACCESSORIES_UNCONFIRMED','UNCONFIRMED','기본 포함품, 케이블, 전원 및 필러 수량은 구매 목록에 포함되지 않았습니다.','G08 · G09 · G12');
    if (state.family==='SPX') add('SPX_CARD_ALLOWLIST','UNCONFIRMED','SPX 프레임별 출력 카드 허용·혼합 조건과 전송기 판매 SKU를 확인해야 합니다.','G03 · G05');
    if (state.model==='XDM-288') add('XDM_288_SPEC','UNCONFIRMED','XDM-288 상세 사양을 확인해야 합니다.','G10');
    for (const [slot,id] of Object.entries(state.placements)) {
      const c=card(state,id), l=state.links[slot];
      if (!['CAT','FIBER'].includes(c[3])) continue;
      if (!choices(id).length) add('LINK_UNKNOWN_'+slot,'UNCONFIRMED',`${id}: 개별 카드와 전송기의 호환 관계를 확인해야 합니다.`,'G06');
      else if (!l?.device || !l.count) add('LINK_UNUSED_'+slot,'INFO',`${id}: 원격 연결이 지정되지 않았습니다. 포트는 미사용 상태입니다.`,'');
      else {
        add('LINK_DOCUMENTED_'+slot,'INFO',`${id} → ${l.device}, ${l.count}대: 카탈로그에 연결 관계가 명시되어 있습니다. 전체 경로 승인과는 구분됩니다.`,state.family==='SPX'?'E12':'E05 · E07 · E09');
        add('LINK_CONDITIONS_'+slot,'UNCONFIRMED',`${id}: ${l.distance}m의 신호·케이블·급전 조건은 미검증입니다.`,'G08 · G12');
      }
    }
    return {status:'UNVERIFIED_DRAFT',canFinalize:false,issues};
  }
  function bom(state) {
    const rows=[];
    const add=(category,model,quantity)=>{const row=rows.find(r=>r.model===model);if(row)row.quantity+=quantity;else rows.push({category,model,quantity})};
    if(state.model)add('메인프레임',state.model,1);
    for(const [slot,id] of Object.entries(state.placements)) {
      add(slotDirections[slot]==='input'?'입력 카드':'출력 카드',id,1);
      const l=state.links[slot];if(l?.device&&l.count)add('전송기',l.device.split(' · ')[0],l.count);
    }
    return rows;
  }
  function document(state) {
    return {schemaVersion:1,catalogVersion,status:'UNVERIFIED_DRAFT',savedAt:new Date().toISOString(),state:checkState(state),validation:validate(state),bom:bom(state)};
  }
  function parse(text) {
    if(typeof text!=='string' || text.length>1024*1024)throw new Error('JSON 파일은 1MB 이하여야 합니다.');
    let data;try{data=JSON.parse(text)}catch{throw new Error('올바른 JSON 파일이 아닙니다.')}
    if(!plain(data)||data.schemaVersion!==1)throw new Error('지원하지 않는 파일 버전입니다. 이 앱에서 저장한 JSON을 선택하세요.');
    if(data.catalogVersion!==catalogVersion)throw new Error('카탈로그 버전이 다릅니다. 현재 버전과 검토한 뒤 가져와야 합니다.');
    return checkState(data.state);
  }
  function csv(state) {
    const cell=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
    const rows=[['상태','구분','모델','수량','비고'],...bom(state).map(r=>['UNVERIFIED_DRAFT',r.category,r.model,r.quantity,'미검증 검토용 · 케이블/전원/기본 포함품 미확정'])];
    return rows.map(r=>r.map(cell).join(',')).join('\r\n');
  }
  scope.RtCore={initial,checkState,choices,validate,bom,document,parse,csv,catalogVersion};
})(globalThis);
