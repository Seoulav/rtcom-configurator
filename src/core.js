/* Pure functions shared by the browser app and Node tests. No product approvals are inferred. */
(function (scope) {
  'use strict';
  const catalog = scope.RtCatalog;
  const catalogVersion = '2026-09-18-draft.1';
  const schemaVersion = 3;
  const slotDirections = {'in-a':'input','in-b':'input','out-a':'output','out-b':'output'};
  for (let index=1;index<=54;index++) {slotDirections[`in-${index}`]='input';slotDirections[`out-${index}`]='output';}
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
  // 모델별 [입력 슬롯, 출력 슬롯]. XDM: 국문 매뉴얼 pp.7–11. SPX: 매뉴얼 p.4·카탈로그 I/O 크기·후면 사진(M810, M3236).
  const slotPlans = {
    XDM:{'XDM-12':[3,3],'XDM-20':[5,5],'XDM-36':[9,9],'XDM-72':[18,18],'XDM-144':[36,36],'XDM-216':[54,54]},
    SPX:{'SPX-M810':[1,1],'SPX-M1620':[2,2],'SPX-M3236':[4,3],'SPX-M2472':[3,6],'SPX-M24120':[3,10]},
    // VDM: 국문 매뉴얼 KV07 2.2 Router Frame Specifications(PDF pp.12–19). VDM-288X는 특수 상황실용 커스텀 제작이라 표에 없다.
    VDM:{'VDM-8X':[2,2],'VDM-16X':[4,4],'VDM-32X':[8,8],'VDM-48X':[12,12],'VDM-64X':[16,16],'VDM-80X':[20,20],'VDM-128X':[32,32],'VDM-180X':[45,45]}
  };
  const slotPlan = (family, model) => slotPlans[family]?.[model] || null;
  function slotsFor(state) {
    const plan=slotPlan(state.family,state.model);
    if (plan) return ['input','output'].flatMap((dir,side)=>Array.from({length:plan[side]},(_,index)=>({id:`${dir==='input'?'in':'out'}-${index+1}`,label:`${dir==='input'?'입력':'출력'} 슬롯 ${index+1}`,dir})));
    return [{id:'in-a',label:'입력 A',dir:'input'},{id:'in-b',label:'입력 B',dir:'input'},{id:'out-a',label:'출력 A',dir:'output'},{id:'out-b',label:'출력 B',dir:'output'}];
  }
  const card = (state, id) => [...catalog[state.family].input,...catalog[state.family].output].find(item=>item[0]===id);
  // HDMI 카드 연장용 한 쌍: PSE 쪽에만 전원을 연결하면 CTR100은 전원 불필요(사용자 확인 2026-09-26). 두 제품 모두 DIP 스위치로 TX/RX 설정.
  const psePair = 'XDM-CTR100 PSE + XDM-CTR100';
  function choices(id) {
    return ({'XDM-HI100':[psePair],'XDM-HIS100':[psePair],'XDM-HOS100':[psePair],'XDM-WOS100':[psePair],'XDM-CIS100':['XDM-CTR100 · TX','XDM-CT103'],'XDM-COS100':['XDM-CTR100 · RX','XDM-CR103'],'XDM-FIS100':['XDM-FT101'],'XDM-FOS100':['XDM-FR101'],'SPX-COS12':['SPX-RX']})[id] || [];
  }
  // 카드를 장착할 때 자동으로 연결하는 전송기(RTCom 종합 카탈로그 p.10·12 호환 표기 근거). 사용자는 전송기 단계에서 바꿀 수 있다.
  const defaultLinks = {'SPX-COS12':'SPX-RX','XDM-CIS100':'XDM-CTR100 · TX','XDM-COS100':'XDM-CTR100 · RX','XDM-FIS100':'XDM-FT101','XDM-FOS100':'XDM-FR101'};
  function defaultLink(id, channels) {
    const device = defaultLinks[id];
    return device && choices(id).includes(device) ? {device,count:channels,distance:'30'} : null;
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
    const documented=Boolean(slotPlan(result.family,result.model));
    const legacySlots=documented?{'in-a':'in-1','in-b':'in-2','out-a':'out-1','out-b':'out-2'}:{};
    const allowedSlots=new Set(slotsFor(result).map(item=>item.id));
    // 이전 논리 슬롯(입력 A·B)을 실제 슬롯으로 옮긴다. 실제 슬롯이 1개뿐인 프레임(SPX-M810)의 두 번째 논리 슬롯은 옮길 곳이 없어 제외한다.
    const droppedLegacy=new Set(Object.keys(input.placements).filter(id=>legacySlots[id]&&!allowedSlots.has(legacySlots[id])));
    for (const [id,value] of Object.entries(input.placements)) {
      if (droppedLegacy.has(id)) continue;
      const target=legacySlots[id]||id;
      if (!allowedSlots.has(target) || !family[slotDirections[target]].some(item=>item[0]===value)) fail('지원하지 않는 슬롯 또는 카드입니다.');
      if (!result.model) fail('섀시 없이 카드를 배치할 수 없습니다.');
      result.placements[target]=value;
    }
    for (const [id,link] of Object.entries(input.links)) {
      if (droppedLegacy.has(id)) continue;
      const target=legacySlots[id]||id;
      if (!own(result.placements,target) || !plain(link)) fail('전송기에 연결된 카드가 없습니다.');
      const selected=card(result,result.placements[target]);
      if (!choices(selected[0]).length || (link.device!=='' && !choices(selected[0]).includes(link.device))) fail('카드와 전송기의 연결 방향 또는 허용 관계가 일치하지 않습니다.');
      if (!Number.isInteger(link.count) || link.count<0 || link.count>selected[2] || (!link.device&&link.count!==0)) fail('전송기 수량이 카드 포트 범위를 벗어났습니다.');
      const distances=selected[3]==='CAT'?['10','30','50','100']:['30','100','300','2000'];
      if (!distances.includes(link.distance)) fail('지원하지 않는 거리 입력입니다.');
      result.links[target]={device:link.device,count:link.count,distance:link.distance};
    }
    result.requirements={inputs:[],outputs:[]};
    result.physicalSlots=documented?{status:'manual_documented',slots:slotsFor(result).map(item=>item.id)}:{status:'unknown',slots:[]};
    if (input.portAssignments!==undefined && !plain(input.portAssignments)) fail('포트 배정 데이터 형식이 잘못되었습니다.');
    const incomingPorts={};
    for (const [key,value] of Object.entries(input.portAssignments||{})) {
      const [slot,...rest]=key.split(':');
      incomingPorts[`${legacySlots[slot]||slot}:${rest.join(':')}`]=value;
    }
    result.portAssignments=syncPorts({...result,portAssignments:incomingPorts});
    for (const key of Object.keys(incomingPorts)) if (!own(result.portAssignments,key)) fail('선택한 카드에 존재하지 않는 포트 배정입니다.');
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
    const selectedSlot=legacySlots[input.slot]||input.slot;
    if (!allowedSlots.has(selectedSlot)||!['PDF','CSV','JSON'].includes(input.format)) fail('화면 설정 형식이 잘못되었습니다.');
    result.slot=selectedSlot;result.format=input.format;
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
    const plan=slotPlan(state.family,state.model);
    if (plan&&state.family==='XDM') add('XDM_SLOT_LAYOUT','VALID',`매뉴얼 기준으로 입력 카드 ${plan[0]}장과 출력 카드 ${plan[1]}장을 장착할 수 있습니다.`,'M01 · XDM 국문 매뉴얼 pp.7–11');
    else if (plan) add('SLOT_LAYOUT','VALID',`입력 카드 ${plan[0]}장과 출력 카드 ${plan[1]}장을 장착할 수 있습니다.`,state.family==='VDM'?'VDM 국문 매뉴얼 KV07 PDF pp.12–19':'SPX 매뉴얼 p.4 · SPX 카탈로그 I/O 구성 · 후면 사진(M810, M3236)');
    else add('PHYSICAL_LAYOUT_UNVERIFIED','UNVERIFIED','화면의 입력·출력 위치는 논리 구성입니다. 실제 슬롯 수와 카드 설치 허용표가 필요합니다.','G01 · G02');
    add('ACCESSORIES_UNVERIFIED','UNVERIFIED','기본 포함품, 케이블, 전원 및 필러 수량은 구매 목록에 포함되지 않았습니다.','G08 · G09 · G12');
    if (state.family==='SPX') add('SPX_CARD_ALLOWLIST','UNVERIFIED','SPX 프레임별 출력 카드 허용·혼합 조건과 전송기 판매 SKU를 확인해야 합니다.','G03 · G05');
    if (state.model==='VDM-288X') add('VDM_288X_CUSTOM','UNVERIFIED','VDM-288X는 특수 상황실용으로 커스텀 제작한 모델입니다. 슬롯 수와 배치는 제작 사양서로 확인해야 합니다.','사용자 확인(2026-09-26)');
    if (state.model==='XDM-288') add('XDM_288_SPEC','UNVERIFIED','XDM-288 상세 사양을 확인해야 합니다.','G10');
    for (const [slot,id] of Object.entries(state.placements)) {
      const selected=card(state,id), link=state.links[slot];
      if (link?.device===psePair&&link.count) {
        add('LINK_PSE_PAIR_'+slot,'VALID',`${id} → CTR100 PSE + CTR100 ${link.count}쌍: HDMI 연장. 전원은 PSE 쪽에만 연결하고 CTR100은 전원이 필요 없습니다. 두 제품 모두 DIP 스위치로 TX/RX를 설정합니다.`,'사용자 확인(2026-09-26) · E06');
        continue;
      }
      if (!['CAT','FIBER'].includes(selected[3])) continue;
      if (!choices(id).length) add('LINK_UNKNOWN_'+slot,'UNVERIFIED',`${id}: 개별 카드와 전송기의 호환 관계를 확인해야 합니다.`,'G06');
      else if (!link?.device||!link.count) add('LINK_UNUSED_'+slot,'VALID',`${id}: 원격 연결이 지정되지 않은 예비 포트는 오류가 아닙니다.`);
      else {
        add('LINK_DOCUMENTED_'+slot,'VALID',`${id} → ${link.device}, ${link.count}대: 카탈로그에 연결 관계가 명시되어 있습니다.`,state.family==='SPX'?'E12':'E05 · E07 · E09');
        add('LINK_CONDITIONS_'+slot,'UNVERIFIED',`${id}: 전원과 부속품 조건은 미검증입니다.`,'G08 · G09');
      }
    }
    const spxRx=Object.values(state.links).filter(link=>link.device==='SPX-RX').reduce((sum,link)=>sum+link.count,0);
    if (spxRx) add('SPX_RX_POC','VALID',`SPX-RX ${spxRx}대는 메인프레임이 CAT 케이블로 전원을 공급(POC)하므로 별도 전원 연결이 필요 없습니다.`,'SPX 사양서·카탈로그 p.3 "POC 기능을 통해 메인프레임으로 RX 제품 전력 지원"');
    const ctrCount=Object.values(state.links).filter(link=>link.device?.startsWith('XDM-CTR100 · ')).reduce((sum,link)=>sum+link.count,0);
    if (ctrCount) add('CTR_POWER_REQUIRED','WARNING',`XDM-CTR100 ${ctrCount}대는 전원을 직접 연결해야 합니다. 매트릭스 카드(CIS100·COS100)에 연결하는 구성에서는 XDM-CTR100 PSE를 사용할 수 없습니다. 전원 공급 장비의 현행 모델명과 포트 용량을 확인하세요.`,'사용자 확인(2026-09-26) · 사용자 제공 XDM POE 구성도 · G08');
    const status=issues.some(issue=>issue.level==='ERROR')?'ERROR':issues.some(issue=>issue.level==='UNVERIFIED')?'UNVERIFIED':issues.some(issue=>issue.level==='WARNING')?'WARNING':'VALID';
    return {status,exportStatus:'UNVERIFIED_DRAFT',canFinalize:status==='VALID',summary:requirementSummary(state),issues};
  }
  function bom(input) {
    const state=checkState(input), rows=[];
    const add=(category,model,quantity)=>{const row=rows.find(item=>item.model===model);if(row)row.quantity+=quantity;else rows.push({category,model,quantity})};
    if (state.model) add('메인프레임',state.model,1);
    for (const [slot,id] of Object.entries(state.placements)) add(slotDirections[slot]==='input'?'입력 카드':'출력 카드',id,1);
    let ctrQuantity=0;
    for (const port of Object.values(state.portAssignments)) {
      for (const [device,category] of [[port.tx,'전송기'],[port.rx,'수신기']]) {
        if (!device||!port.quantity) continue;
        if (device===psePair) {add('HDMI 연장 (PSE 쌍)','XDM-CTR100 PSE',port.quantity);add('HDMI 연장 (PSE 쌍)','XDM-CTR100 (PSE 급전, 전원 불필요)',port.quantity);continue}
        add(category,device.split(' · ')[0],port.quantity);
        if (device.startsWith('XDM-CTR100 · ')) ctrQuantity+=port.quantity;
      }
    }
    if (ctrQuantity) add('전원 장비','XDM-CTR100 전원 공급 장비 (제공 구성도 기준 16포트당 1대, 현행 모델명 확인 필요)',Math.ceil(ctrQuantity/16));
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
    if (!plain(data)||![1,2,schemaVersion].includes(data.schemaVersion)) throw new Error('지원하지 않는 파일 버전입니다. 이 앱에서 저장한 JSON을 선택하세요.');
    if (data.catalogVersion!==catalogVersion) throw new Error('카탈로그 버전이 다릅니다. 현재 버전과 검토한 뒤 가져와야 합니다.');
    return checkState(data.state);
  }
  function csv(input) {
    const state=checkState(input);
    const cell=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
    const rows=[['상태','구분','모델','수량','비고'],...bom(state).map(row=>['UNVERIFIED_DRAFT',row.category,row.model,row.quantity,'미검증 검토용 · 케이블/전원/기본 포함품 미확정'])];
    return rows.map(row=>row.map(cell).join(',')).join('\r\n');
  }
  scope.RtCore={initial,checkState,choices,defaultLink,psePair,slotPlan,syncPorts,slotsFor,requirementSummary,validate,bom,document,parse,csv,catalogVersion,schemaVersion,signalTypes};
})(globalThis);
