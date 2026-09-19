/* Pure functions shared by the browser app and Node tests. No product approvals are inferred. */
(function (scope) {
  'use strict';
  const catalog = scope.RtCatalog;
  const catalogVersion = '2026-09-18-draft.1';
  const schemaVersion = 2;
  const slotDirections = {'in-a':'input','in-b':'input','out-a':'output','out-b':'output'};
  const signalTypes = ['HDMI','SDI','DP','CAT','FIBER','OTHER'];
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const initial = () => ({
    step:0,maxStep:0,family:'XDM',model:null,
    requirements:{inputs:[],outputs:[]},
    placements:{},
    physicalSlots:{status:'unknown',slots:[]},
    portAssignments:{},
    links:{},slot:'in-a',format:'PDF'
  });
  const card = (state, id) => [...catalog[state.family].input,...catalog[state.family].output].find(item=>item[0]===id);
  function choices(id) {
    return ({'XDM-CIS100':['XDM-CTR100 · TX','XDM-CT103'],'XDM-COS100':['XDM-CTR100 · RX','XDM-CR103'],'XDM-FIS100':['XDM-FT101'],'XDM-FOS100':['XDM-FR101'],'SPX-COS12':['SPX-RX']})[id] || [];
  }
  function cleanText(value, label, maximum) {
    if (typeof value !== 'string' || value.length > maximum) throw new Error(`${label} 형식이 잘못되었습니다.`);
    return value.trim();
  }
  function cleanRequirement(value, direction, seen) {
    if (!plain(value)) throw new Error('요구량 데이터 형식이 잘못되었습니다.');
    const id=cleanText(value.id,'요구량 식별자',64);
    if (!id || seen.has(id)) throw new Error('요구량 식별자가 없거나 중복되었습니다.');
    seen.add(id);
    if (!signalTypes.includes(value.signalType)) throw new Error('지원하지 않는 요구 신호 형식입니다.');
    if (!Number.isInteger(value.quantity) || value.quantity<1 || value.quantity>999) throw new Error('요구 수량은 1부터 999까지의 정수여야 합니다.');
    const distance=value.distance===null||value.distance===''?null:Number(value.distance);
    if (distance!==null && (!Number.isInteger(distance)||distance<0||distance>2000)) throw new Error('요구 거리는 0m부터 2000m까지 입력할 수 있습니다.');
    return {
      id,direction,signalType:value.signalType,quantity:value.quantity,
      resolution:cleanText(value.resolution||'','해상도',40),
      frameRate:cleanText(value.frameRate||'','프레임레이트',40),
      distance,txRequired:Boolean(value.txRequired),rxRequired:Boolean(value.rxRequired)
    };
  }
  function syncPorts(state) {
    const source=plain(state.portAssignments)?state.portAssignments:{};
    const result={};
    for (const [slot,id] of Object.entries(state.placements||{})) {
      const selected=card(state,id);
      if (!selected) continue;
      const link=state.links?.[slot];
      for (let index=1;index<=selected[2];index++) {
        const key=`${slot}:${index}`;
        const old=plain(source[key])?source[key]:{};
        const linked=Boolean(link?.device && index<=link.count);
        const tx=linked && slotDirections[slot]==='input'?link.device:'';
        const rx=linked && slotDirections[slot]==='output'?link.device:'';
        result[key]={
          cardId:id,portId:String(index),direction:slotDirections[slot],
          signalType:signalTypes.includes(old.signalType)?old.signalType:selected[3],
          assignedDevice:typeof old.assignedDevice==='string'?old.assignedDevice.trim():'',
          tx,rx,quantity:old.quantity===0?0:1,
          verificationStatus:choices(id).length&&linked?'DOCUMENTED':'UNVERIFIED'
        };
      }
    }
    return result;
  }
  function checkState(input) {
    const fail = message => {throw new Error(message)};
    if (!plain(input) || !own(catalog,input.family)) fail('지원하지 않는 제품군입니다.');
    const result=initial(), family=catalog[input.family];
    result.family=input.family;
    if (input.model!==null && !family.models.includes(input.model)) fail('제품군과 섀시 모델이 일치하지 않습니다.');
    result.model=input.model;
    if (!plain(input.placements) || !plain(input.links)) fail('카드 또는 전송기 데이터 형식이 잘못되었습니다.');
    for (const [id,value] of Object.entries(input.placements)) {
      if (!own(slotDirections,id) || !family[slotDirections[id]].some(item=>item[0]===value)) fail('지원하지 않는 논리 위치 또는 카드입니다.');
      if (!result.model) fail('섀시 없이 카드를 배치할 수 없습니다.');
      result.placements[id]=value;
    }
    for (const [id,link] of Object.entries(input.links)) {
      if (!own(result.placements,id) || !plain(link)) fail('전송기에 연결된 카드가 없습니다.');
      const selected=card(result,result.placements[id]);
      if (!choices(selected[0]).length || (link.device!=='' && !choices(selected[0]).includes(link.device))) fail('카드와 전송기의 연결 방향 또는 허용 관계가 일치하지 않습니다.');
      if (!Number.isInteger(link.count) || link.count<0 || link.count>selected[2] || (!link.device&&link.count!==0)) fail('전송기 수량이 카드 포트 범위를 벗어났습니다.');
      const distances=selected[3]==='CAT'?['10','30','50','100']:['30','100','300','2000'];
      if (!distances.includes(link.distance)) fail('지원하지 않는 거리 입력입니다.');
      result.links[id]={device:link.device,count:link.count,distance:link.distance};
    }
    const requirements=plain(input.requirements)?input.requirements:{inputs:[],outputs:[]};
    if (!Array.isArray(requirements.inputs)||!Array.isArray(requirements.outputs)) fail('요구량 목록 형식이 잘못되었습니다.');
    const seen=new Set();
    result.requirements.inputs=requirements.inputs.map(value=>cleanRequirement(value,'input',seen));
    result.requirements.outputs=requirements.outputs.map(value=>cleanRequirement(value,'output',seen));
    const physical=plain(input.physicalSlots)?input.physicalSlots:{status:'unknown',slots:[]};
    if (!['unknown','unverified'].includes(physical.status)||!Array.isArray(physical.slots)||physical.slots.length) fail('확인되지 않은 물리 슬롯 정보는 추정해서 저장할 수 없습니다.');
    result.physicalSlots={status:physical.status,slots:[]};
    if (input.portAssignments!==undefined && !plain(input.portAssignments)) fail('포트 배정 데이터 형식이 잘못되었습니다.');
    result.portAssignments=syncPorts({...result,portAssignments:input.portAssignments||{}});
    for (const key of Object.keys(input.portAssignments||{})) if (!own(result.portAssignments,key)) fail('선택한 카드에 존재하지 않는 포트 배정입니다.');
    for (const [key,value] of Object.entries(result.portAssignments)) {
      const allowed=choices(value.cardId);
      if (value.assignedDevice.length>120) fail('연결 대상 장비 이름이 너무 깁니다.');
      if ((value.tx&&!allowed.includes(value.tx))||(value.rx&&!allowed.includes(value.rx))) fail('포트의 TX/RX와 카드 허용 관계가 일치하지 않습니다.');
      if (value.direction==='input'&&value.rx) fail('입력 포트에는 RX를 배정할 수 없습니다.');
      if (value.direction==='output'&&value.tx) fail('출력 포트에는 TX를 배정할 수 없습니다.');
      result.portAssignments[key]=value;
    }
    for (const field of ['step','maxStep']) {
      if (!Number.isInteger(input[field])||input[field]<0||input[field]>5) fail('단계 정보가 올바르지 않습니다.');
      result[field]=input[field];
    }
    if (result.step>result.maxStep||(!result.model&&result.maxStep>1)) fail('완료 단계 정보가 구성과 일치하지 않습니다.');
    if (!own(slotDirections,input.slot)||!['PDF','CSV','JSON'].includes(input.format)) fail('화면 설정 형식이 잘못되었습니다.');
    result.slot=input.slot;result.format=input.format;
    return result;
  }
  function requirementSummary(state) {
    const rows=[];
    for (const direction of ['input','output']) {
      const requirements=state.requirements?.[direction==='input'?'inputs':'outputs']||[];
      const types=new Set(requirements.map(item=>item.signalType));
      for (const signalType of types) {
        const required=requirements.filter(item=>item.signalType===signalType).reduce((sum,item)=>sum+item.quantity,0);
        const configured=Object.values(state.portAssignments||{}).filter(port=>port.direction===direction&&port.signalType===signalType).reduce((sum,port)=>sum+port.quantity,0);
        rows.push({direction,signalType,required,configured,shortage:Math.max(0,required-configured),surplus:Math.max(0,configured-required)});
      }
    }
    return rows;
  }
  function validate(input) {
    const state=checkState(input);
    const issues=[];
    const add=(code,level,message,evidence='')=>issues.push({code,level,message,evidence});
    if (!state.model) add('CHASSIS_REQUIRED','ERROR','섀시를 선택해 주세요.');
    for (const direction of ['input','output']) if (!Object.entries(state.placements).some(([id])=>slotDirections[id]===direction)) add('MISSING_'+direction.toUpperCase(),'WARNING',`${direction==='input'?'입력':'출력'} 카드가 선택되지 않았습니다.`);
    const requirementCount=state.requirements.inputs.length+state.requirements.outputs.length;
    if (!requirementCount) add('REQUIREMENTS_EMPTY','WARNING','필요한 입력과 출력 수량을 아직 입력하지 않았습니다.');
    for (const row of requirementSummary(state)) {
      const label=`${row.signalType} ${row.direction==='input'?'입력':'출력'}`;
      if (row.shortage) add(`REQUIREMENT_SHORTAGE_${row.direction}_${row.signalType}`,'ERROR',`${label}이 ${row.shortage}개 부족합니다. 필요 ${row.required}개, 구성 ${row.configured}개입니다.`);
      else add(`REQUIREMENT_MET_${row.direction}_${row.signalType}`,'VALID',`${label} 요구량을 충족합니다. 필요 ${row.required}개, 구성 ${row.configured}개입니다.`);
    }
    for (const row of requirementSummary(state)) {
      const requirements=state.requirements[row.direction==='input'?'inputs':'outputs'].filter(item=>item.signalType===row.signalType);
      const ports=Object.values(state.portAssignments).filter(port=>port.direction===row.direction&&port.signalType===row.signalType&&port.quantity);
      const requiredTx=requirements.filter(item=>item.txRequired).reduce((sum,item)=>sum+item.quantity,0);
      const requiredRx=requirements.filter(item=>item.rxRequired).reduce((sum,item)=>sum+item.quantity,0);
      const configuredTx=ports.filter(port=>port.tx).length,configuredRx=ports.filter(port=>port.rx).length;
      if (configuredTx<requiredTx) add(`TX_SHORTAGE_${row.direction}_${row.signalType}`,'ERROR',`${row.signalType} ${row.direction==='input'?'입력':'출력'}에 필요한 TX가 ${requiredTx-configuredTx}대 부족합니다.`);
      if (configuredRx<requiredRx) add(`RX_SHORTAGE_${row.direction}_${row.signalType}`,'ERROR',`${row.signalType} ${row.direction==='input'?'입력':'출력'}에 필요한 RX가 ${requiredRx-configuredRx}대 부족합니다.`);
    }
    add('PHYSICAL_LAYOUT_UNVERIFIED','UNVERIFIED','화면의 입력·출력 위치는 논리 구성입니다. 실제 슬롯 수와 카드 설치 허용표가 필요합니다.','G01 · G02');
    add('ACCESSORIES_UNVERIFIED','UNVERIFIED','기본 포함품, 케이블, 전원 및 필러 수량은 구매 목록에 포함되지 않았습니다.','G08 · G09 · G12');
    if (state.family==='SPX') add('SPX_CARD_ALLOWLIST','UNVERIFIED','SPX 프레임별 출력 카드 허용·혼합 조건과 전송기 판매 SKU를 확인해야 합니다.','G03 · G05');
    if (state.model==='XDM-288') add('XDM_288_SPEC','UNVERIFIED','XDM-288 상세 사양을 확인해야 합니다.','G10');
    for (const [slot,id] of Object.entries(state.placements)) {
      const selected=card(state,id), link=state.links[slot];
      if (!['CAT','FIBER'].includes(selected[3])) continue;
      if (!choices(id).length) add('LINK_UNKNOWN_'+slot,'UNVERIFIED',`${id}: 개별 카드와 전송기의 호환 관계를 확인해야 합니다.`,'G06');
      else if (!link?.device||!link.count) add('LINK_UNUSED_'+slot,'VALID',`${id}: 원격 연결이 지정되지 않은 예비 포트는 오류가 아닙니다.`);
      else {
        add('LINK_DOCUMENTED_'+slot,'VALID',`${id} → ${link.device}, ${link.count}대: 카탈로그에 연결 관계가 명시되어 있습니다.`,state.family==='SPX'?'E12':'E05 · E07 · E09');
        add('LINK_CONDITIONS_'+slot,'UNVERIFIED',`${id}: ${link.distance}m의 신호·케이블·급전 조건은 미검증입니다.`,'G08 · G12');
      }
    }
    const status=issues.some(issue=>issue.level==='ERROR')?'ERROR':issues.some(issue=>issue.level==='UNVERIFIED')?'UNVERIFIED':issues.some(issue=>issue.level==='WARNING')?'WARNING':'VALID';
    return {status,exportStatus:'UNVERIFIED_DRAFT',canFinalize:status==='VALID',summary:requirementSummary(state),issues};
  }
  function bom(input) {
    const state=checkState(input), rows=[];
    const add=(category,model,quantity)=>{const row=rows.find(item=>item.model===model);if(row)row.quantity+=quantity;else rows.push({category,model,quantity})};
    if (state.model) add('메인프레임',state.model,1);
    for (const [slot,id] of Object.entries(state.placements)) add(slotDirections[slot]==='input'?'입력 카드':'출력 카드',id,1);
    for (const port of Object.values(state.portAssignments)) {
      if (port.tx&&port.quantity) add('전송기',port.tx.split(' · ')[0],port.quantity);
      if (port.rx&&port.quantity) add('수신기',port.rx.split(' · ')[0],port.quantity);
    }
    return rows;
  }
  function document(input) {
    const state=checkState(input);
    return {schemaVersion,catalogVersion,status:'UNVERIFIED_DRAFT',savedAt:new Date().toISOString(),state,validation:validate(state),bom:bom(state)};
  }
  function parse(text) {
    if (typeof text!=='string'||text.length>1024*1024) throw new Error('JSON 파일은 1MB 이하여야 합니다.');
    let data;
    try {data=JSON.parse(text)} catch {throw new Error('올바른 JSON 파일이 아닙니다.');}
    if (!plain(data)||![1,schemaVersion].includes(data.schemaVersion)) throw new Error('지원하지 않는 파일 버전입니다. 이 앱에서 저장한 JSON을 선택하세요.');
    if (data.catalogVersion!==catalogVersion) throw new Error('카탈로그 버전이 다릅니다. 현재 버전과 검토한 뒤 가져와야 합니다.');
    return checkState(data.state);
  }
  function csv(input) {
    const state=checkState(input);
    const cell=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
    const rows=[['상태','구분','모델','수량','비고'],...bom(state).map(row=>['UNVERIFIED_DRAFT',row.category,row.model,row.quantity,'미검증 검토용 · 케이블/전원/기본 포함품 미확정'])];
    return rows.map(row=>row.map(cell).join(',')).join('\r\n');
  }
  scope.RtCore={initial,checkState,choices,syncPorts,requirementSummary,validate,bom,document,parse,csv,catalogVersion,schemaVersion,signalTypes};
})(globalThis);
