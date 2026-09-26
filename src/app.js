
  (()=>{
    const root=document.getElementById('rtcom-design');
    const main=root.querySelector('.rt-main');
    const nav=root.querySelector('.rt-nav');
    const assets=Object.fromEntries([...root.querySelector('template').content.querySelectorAll('img')].map(x=>[x.dataset.family,x.src]));
    const families=RtCatalog;
    const labels=['제품군','섀시','카드 슬롯','전송기','구성 검토','내보내기'];
    const slots=[{id:'in-a',label:'입력 A',dir:'input'},{id:'in-b',label:'입력 B',dir:'input'},{id:'out-a',label:'출력 A',dir:'output'},{id:'out-b',label:'출력 B',dir:'output'}];
    const currentSlots=()=>RtCore.slotsFor(state);
    let state=RtCore.initial();
    let modalSlot=null;
    let changedSlot=null;
    // XDM 연동 전송기 정보(RTCom 종합 카탈로그 p.10~12). 키는 저장 파일·BOM에 쓰이는 전송기 이름과 같다.
    const extenderInfo={
      'XDM-CTR100 · TX':{model:'XDM-CTR100',role:'HDBaseT 3.0 송·수신기 · DIP 스위치 TX 설정',image:'output/design/assets/extenders/xdm-ctr100.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 입력·출력 각 1 · RS-232+ · 오디오 출력','전원: CTR100에 직접 연결 (매트릭스 카드 구성에서는 PSE 사용 불가)'],pair:'XDM-CIS100',page:10,recommended:true},
      'XDM-CTR100 · RX':{model:'XDM-CTR100',role:'HDBaseT 3.0 송·수신기 · DIP 스위치 RX 설정',image:'output/design/assets/extenders/xdm-ctr100.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 입력·출력 각 1 · RS-232+ · 오디오 출력','전원: CTR100에 직접 연결 (매트릭스 카드 구성에서는 PSE 사용 불가)'],pair:'XDM-COS100',page:10,recommended:true},
      'XDM-CT103':{model:'XDM-CT103',role:'HDBaseT 3.0 1 Gang 벽부형 송신기',image:'output/design/assets/extenders/xdm-ct103.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 1 · 오디오 입력 1','XDM 슬롯 POE로 별도 전원 없이 사용'],pair:'XDM-CIS100',page:11},
      'XDM-CR103':{model:'XDM-CR103',role:'HDBaseT 3.0 1 Gang 벽부형 수신기',image:'output/design/assets/extenders/xdm-cr103.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 1 · 오디오 1','XDM 슬롯 POE로 별도 전원 없이 사용'],pair:'XDM-COS100',page:11},
      'XDM-FT101':{model:'XDM-FT101',role:'4K 광 송신기',image:'output/design/assets/extenders/xdm-ft101.webp',specs:['4K60 4:4:4 · HDMI 2.0','싱글모드 2km · 멀티모드 300m (LC 1)','오디오 삽입 · RS-232+'],pair:'XDM-FIS100',page:12,recommended:true},
      [RtCore.psePair]:{model:'CTR100 PSE + CTR100',role:'HDMI 연장 한 쌍 (HDBaseT 3.0)',images:['output/design/assets/extenders/xdm-ctr100-pse.webp','output/design/assets/extenders/xdm-ctr100.webp'],specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','전원: PSE 쪽에만 연결 · CTR100은 전원 불필요','두 제품 모두 DIP 스위치로 TX/RX 설정'],page:10},
      'XDM-FR101':{model:'XDM-FR101',role:'4K 광 수신기',image:'output/design/assets/extenders/xdm-fr101.webp',specs:['4K60 4:4:4 · HDMI 2.0','싱글모드 2km · 멀티모드 300m (LC 1)','오디오 추출 · RS-232+'],pair:'XDM-FOS100',page:12,recommended:true}
    };
    const extenderLineup=[
      {model:'XDM-CTR100',role:'HDBaseT 3.0 송·수신기 (DIP 스위치 TX/RX)',image:'output/design/assets/extenders/xdm-ctr100.webp',pair:'XDM-CIS100 · XDM-COS100',note:'DIP 스위치로 TX/RX를 설정합니다. TX는 CIS100, RX는 COS100과 연동하며 이때는 CTR100에 전원을 직접 연결합니다. PSE와 한 쌍이면 전원 불필요',page:10},
      {model:'XDM-CTR100 PSE',role:'POE 전원 공급형 송·수신기 (DIP 스위치 TX/RX)',image:'output/design/assets/extenders/xdm-ctr100-pse.webp',pair:'XDM-CTR100 (HDMI 카드 연장 · 1:1 연장)',note:'CTR100과 한 쌍으로 쓰면 PSE 쪽에만 전원을 연결하고 CTR100은 전원이 필요 없습니다. HDMI 입력·출력 카드 연장에 사용하며, HDBaseT 카드(CIS100·COS100) 구성에는 사용할 수 없습니다.',page:10},
      {model:'XDM-CT103',role:'1 Gang 벽부형 송신기',image:'output/design/assets/extenders/xdm-ct103.webp',pair:'XDM-CIS100',note:'XDM 슬롯 POE로 전원 공급',page:11},
      {model:'XDM-CR103',role:'1 Gang 벽부형 수신기',image:'output/design/assets/extenders/xdm-cr103.webp',pair:'XDM-COS100',note:'XDM 슬롯 POE로 전원 공급',page:11},
      {model:'XDM-FT101',role:'4K 광 송신기',image:'output/design/assets/extenders/xdm-ft101.webp',pair:'XDM-FIS100',note:'싱글모드 2km · 멀티모드 300m',page:12},
      {model:'XDM-FR101',role:'4K 광 수신기',image:'output/design/assets/extenders/xdm-fr101.webp',pair:'XDM-FOS100',note:'싱글모드 2km · 멀티모드 300m',page:12}
    ];
    const blankPlate='output/design/assets/cards/XDM-BLANK.webp';
    const frameFronts={'XDM-12':'output/design/assets/frames/xdm-12-front.webp','XDM-20':'output/design/assets/frames/xdm-20-front.webp','XDM-36':'output/design/assets/frames/xdm-36-front.webp','XDM-72':'output/design/assets/frames/xdm-72-front.webp','XDM-144':'output/design/assets/frames/xdm-144-front.webp','XDM-216':'output/design/assets/frames/xdm-216-front.webp'};
    // 국문 매뉴얼(KV08) 후면 사진과 사진 속 입력·출력 카드 영역(사진 픽셀 좌표: 왼쪽, 위, 오른쪽, 아래). 카드 고정 나사 간격으로 측정했다.
    // 업체의 빈 프레임 후면 사진을 받으면 src와 좌표만 바꾼다. XDM-216은 후면 사진이 없어 그림으로 표시한다.
    const rearPhotos={
      'XDM-12':{src:'output/design/assets/frames/xdm-12-rear.webp',page:8,size:[589,223],input:[8,32,294,119],output:[300,32,584,119]},
      'XDM-20':{src:'output/design/assets/frames/xdm-20-rear.webp',page:9,size:[525,478],input:[12,40,141,292],output:[273,40,410,292]},
      'XDM-36':{src:'output/design/assets/frames/xdm-36-rear.webp',page:9,size:[452,419],input:[9,34,214,252],output:[214,34,419,252]},
      'XDM-72':{src:'output/design/assets/frames/xdm-72-rear.webp',page:10,size:[400,644],input:[5,46,372,242],output:[5,284,372,484]},
      'XDM-144':{src:'output/design/assets/frames/xdm-144-rear.webp',page:11,size:[366,1035],input:[8,44,336,392],output:[8,494,336,845]}
    };
    const design={tone:'warm',density:'comfortable'};
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function card(id){return [...families[state.family].input,...families[state.family].output].find(c=>c[0]===id)}
    function slotCard(id){return card(state.placements[id])}
    function syncPorts(){state.portAssignments=RtCore.syncPorts(state)}
    function totals(){let input=0,output=0;for(const s of currentSlots()){const c=slotCard(s.id);if(c){if(s.dir==='input')input+=c[2];else output+=c[2]}}return {input,output,ext:Object.values(state.links).reduce((sum,l)=>sum+(l.device?l.count:0),0)}}
    function cardAsset(id){return state.family==='XDM'&&id?`output/design/assets/cards/${id}.webp`:assets[state.family]}
    const cardTips={
      'XDM-HI100':'HDMI 소스 4채널을 입력하는 기본 카드입니다.','XDM-HIS100':'HDMI 입력을 스케일링해야 하는 구성에 검토합니다.','XDM-DPI100':'DisplayPort 소스 4채널 입력용입니다.','XDM-CIS100':'HDBaseT 3.0 기반 원격 신호 4채널 입력용입니다.','XDM-FIS100':'광 전송 기반의 원거리 신호 4채널 입력용입니다.','XDM-SIS100':'12G-SDI 방송 신호 4채널 입력용입니다.',
      'XDM-HOS100':'HDMI 4채널 출력 또는 정사분할(Quad View) 화면 구성에 활용할 수 있습니다.','XDM-DPOS100':'DisplayPort 디스플레이 4채널 출력용입니다.','XDM-COS100':'HDBaseT 3.0 기반 원격 출력 4채널용입니다.','XDM-FOS100':'광 전송 기반의 원거리 출력 4채널용입니다.','XDM-SOS100':'12G-SDI 방송 신호 4채널 출력용입니다.','XDM-WOS100':'4개 레이어를 조합해 월 프로세서처럼 화면 연출에 활용할 수 있습니다.'
    };
    function cardTip(id){return cardTips[id]||'카드 용도와 설치 조건을 검토한 뒤 선택하세요.'}
    function cardBadge(id){return id==='XDM-WOS100'?'<em>4 LAYER</em>':id==='XDM-HOS100'?'<em>QUAD VIEW</em>':''}
    function choices(s,c){return RtCore.choices(c[0])}
    function persist(){saveLocal()}
    function heading(k,title,desc){return `<div class="rt-eyebrow">${k}</div><h2>${title}</h2><p class="rt-description">${desc}</p>`}
    function familyView(){return heading('01 / PRODUCT FAMILY','연결의 시작, 제품군을 선택하세요.','사용 환경에 맞는 제품군을 고르고, 섀시와 전송기를 함께 구성합니다.')+`<div class="rt-family-grid">${Object.entries(families).map(([id,f])=>`<button type="button" class="rt-family" data-family="${id}" aria-pressed="${state.family===id}"><span class="rt-family-visual"><img src="${assets[id]}" alt="${id} 제품군"></span><span class="rt-family-body"><span class="rt-family-title">${id}<span class="rt-radio" aria-hidden="true">${state.family===id?'✓':''}</span></span><span class="rt-family-en">${f.name}</span><span class="rt-family-copy">${f.copy}</span><span class="rt-tags">${f.tags.map(t=>`<span class="rt-tag">${t}</span>`).join('')}</span></span></button>`).join('')}</div><div class="rt-bottom-note"><span>제품군별로 카드와 전송기 선택 항목이 달라집니다.</span><span>01 — 06</span></div>`}
    function legacyCardsView(){const selectedSlot=slots.find(s=>s.id===state.slot);const t=totals();return heading('03 / INPUT & OUTPUT','슬롯을 눌러 입출력 카드를 구성하세요.',`${state.model} · 카드 선택 방식 미리보기`)+`<div class="rt-editor"><div class="rt-board"><div class="rt-board-top"><span>후면 슬롯 편집</span><span class="rt-pill">개념 도식</span></div><div class="rt-slots">${slots.map(s=>{const c=slotCard(s.id);return `<button type="button" class="rt-slot ${c?'rt-filled':''}" data-slot="${s.id}" aria-pressed="${state.slot===s.id}"><span class="rt-slot-no">${s.label}</span><span><span class="rt-slot-name">${c?c[0]:'카드 추가'}</span><span class="rt-slot-detail">${c?`${c[1]} · ${c[2]} 포트`:s.dir==='input'?'INPUT CARD':'OUTPUT CARD'}</span></span><span class="rt-slot-plus" aria-hidden="true">${c?'↗':'+'}</span></button>`}).join('')}</div><div class="rt-counts"><span><b>${t.input}</b>입력 포트</span><span><b>${t.output}</b>출력 포트</span></div><p class="rt-board-note">입력·출력 각 2칸은 조작 예시입니다. 실제 섀시의 슬롯 수·위치와 카드 설치 가능 여부는 확정 전입니다.</p></div><aside class="rt-picker" aria-label="카드 선택"><div class="rt-picker-head"><span>${selectedSlot.label} · 카드 선택</span></div><div class="rt-picker-list">${families[state.family][selectedSlot.dir].map(c=>`<button type="button" class="rt-choice" data-card="${c[0]}" aria-pressed="${state.placements[state.slot]===c[0]}"><strong>${c[0]}</strong><small>${c[1]} · ${c[2]} 포트</small></button>`).join('')}</div><button type="button" class="rt-button rt-quiet" data-action="remove" ${slotCard(state.slot)?'':'disabled'}>이 슬롯 비우기</button></aside></div>`}
    function requirementEditor(){
      const group=(direction,label)=>{
        const key=direction==='input'?'inputs':'outputs',items=state.requirements[key];
        return `<section class="rt-requirement-group"><div class="rt-section-head"><h3>${label} 요구량</h3><button type="button" class="rt-button" data-requirement-add="${direction}">+ 요구 추가</button></div>${items.length?items.map(item=>`<div class="rt-requirement-row"><label>신호<select data-requirement-field="signalType" data-owner="${item.id}">${RtCore.signalTypes.map(type=>`<option ${item.signalType===type?'selected':''}>${type}</option>`).join('')}</select></label><label>수량<input type="number" min="1" max="999" value="${item.quantity}" data-requirement-field="quantity" data-owner="${item.id}"></label><label>해상도<input value="${esc(item.resolution)}" maxlength="40" placeholder="예: 3840×2160" data-requirement-field="resolution" data-owner="${item.id}"></label><label>프레임레이트<input value="${esc(item.frameRate)}" maxlength="40" placeholder="예: 60Hz" data-requirement-field="frameRate" data-owner="${item.id}"></label><label>거리(m)<input type="number" min="0" max="2000" value="${item.distance??''}" data-requirement-field="distance" data-owner="${item.id}"></label><label class="rt-check"><input type="checkbox" ${item.txRequired?'checked':''} data-requirement-field="txRequired" data-owner="${item.id}">TX 필요</label><label class="rt-check"><input type="checkbox" ${item.rxRequired?'checked':''} data-requirement-field="rxRequired" data-owner="${item.id}">RX 필요</label><button type="button" class="rt-button rt-danger" data-requirement-remove="${item.id}">삭제</button></div>`).join(''):'<p class="rt-empty-line">아직 입력한 요구량이 없습니다.</p>'}</section>`;
      };
      return `<div class="rt-requirements"><div class="rt-section-head"><div><h3>1. 필요한 입출력 정의</h3><p>먼저 필요한 신호와 수량을 입력하면 현재 카드 구성과 자동으로 비교합니다.</p></div><span class="rt-pill">구조화된 요구사항</span></div><div class="rt-requirement-grid">${group('input','입력')}${group('output','출력')}</div>${requirementSummaryView()}</div>`;
    }
    function requirementSummaryView(){
      const rows=RtCore.requirementSummary(state);
      if(!rows.length)return '<div class="rt-capacity-empty">요구량을 추가하면 부족 수량과 충족 상태가 여기에 표시됩니다.</div>';
      return `<div class="rt-capacity" aria-live="polite">${rows.map(row=>`<div class="rt-capacity-item ${row.shortage?'rt-shortage':'rt-met'}"><strong>${row.signalType} ${row.direction==='input'?'입력':'출력'}</strong><span>필요 ${row.required} · 구성 ${row.configured}</span><b>${row.shortage?`부족 ${row.shortage}`:'충족'}</b></div>`).join('')}</div>`;
    }
    function portEditor(){
      const selected=slotCard(state.slot);
      if(!selected)return '';
      const ports=Object.entries(state.portAssignments).filter(([key])=>key.startsWith(state.slot+':'));
      return `<section class="rt-port-editor"><div class="rt-section-head"><div><h3>3. ${selected[0]} 포트 배정</h3><p>논리 포트별 신호와 연결 대상을 기록합니다. 물리 슬롯 위치를 의미하지 않습니다.</p></div><span class="rt-pill">${ports.length} PORTS</span></div><div class="rt-table-wrap"><table class="rt-port-table"><thead><tr><th>포트</th><th>사용</th><th>신호</th><th>연결 대상 장비</th><th>TX / RX</th><th>검증</th></tr></thead><tbody>${ports.map(([key,port])=>`<tr><td>${port.portId}</td><td><input type="checkbox" ${port.quantity?'checked':''} data-port-field="quantity" data-owner="${key}" aria-label="${port.portId}번 포트 사용"></td><td><select data-port-field="signalType" data-owner="${key}">${RtCore.signalTypes.map(type=>`<option ${port.signalType===type?'selected':''}>${type}</option>`).join('')}</select></td><td><input value="${esc(port.assignedDevice)}" maxlength="120" placeholder="예: 카메라 1" data-port-field="assignedDevice" data-owner="${key}"></td><td>${esc(port.tx||port.rx||'미지정')}</td><td>${port.verificationStatus==='DOCUMENTED'?'근거 있음':'미확정'}</td></tr>`).join('')}</tbody></table></div></section>`;
    }
    function chassisVisual(){
      const t=totals();
      return `<section class="rt-chassis-stage" aria-label="${esc(state.model)} 논리 구성"><div class="rt-chassis-title"><div><span class="rt-eyebrow">SELECTED FRAME</span><h3>${esc(state.model)}</h3><p>${esc(families[state.family].name)} · 제품군 참고 이미지</p></div><div class="rt-chassis-totals"><span><b>${t.input}</b> IN</span><span><b>${t.output}</b> OUT</span></div></div><div class="rt-chassis-photo"><img src="${assets[state.family]}" alt="${state.family} 제품군 참고 이미지"><span>선택 모델의 실제 후면 도면이 아닌 제품군 참고 이미지입니다.</span></div><div class="rt-logical-panel"><div class="rt-panel-label"><strong>논리 카드 배치</strong><span>실제 슬롯 번호·개수 미확정</span></div><div class="rt-visual-slots">${slots.map(s=>{const c=slotCard(s.id);return `<button type="button" class="rt-visual-slot ${c?'rt-has-card':''}" data-slot="${s.id}" aria-pressed="${state.slot===s.id}"><small>${s.label}</small><strong>${c?c[0]:'EMPTY'}</strong><span>${c?`${c[3]} · ${c[2]} PORTS`:'눌러서 카드 선택'}</span></button>`}).join('')}</div></div><p class="rt-stage-warning">이 영역은 구성 흐름을 위한 논리 도식입니다. 제조사 후면 도면과 카드 허용표를 확보하기 전에는 물리 설치 위치로 사용하지 마세요.</p></section>`;
    }
    function cardsView(){
      const selectedSlot=slots.find(s=>s.id===state.slot),t=totals();
      return heading('03 / REQUIREMENTS & CARDS','요구량을 정의하고 논리 카드를 구성하세요.',`${state.model} · 요구량과 구성 포트를 실시간으로 비교합니다.`)+requirementEditor()+chassisVisual()+`<div class="rt-section-head rt-card-heading"><div><h3>2. 논리 카드 세부 선택</h3><p>위 프레임 도식에서 위치를 누르거나 아래 목록에서 카드를 선택하세요.</p></div><span class="rt-pill">물리 슬롯 미확정</span></div><div class="rt-editor"><div class="rt-board"><div class="rt-board-top"><span>선택 위치 요약</span><span class="rt-pill">개념 도식</span></div><div class="rt-slots">${slots.map(s=>{const c=slotCard(s.id);return `<button type="button" class="rt-slot ${c?'rt-filled':''}" data-slot="${s.id}" aria-pressed="${state.slot===s.id}"><span class="rt-slot-no">${s.label}</span><span><span class="rt-slot-name">${c?c[0]:'카드 추가'}</span><span class="rt-slot-detail">${c?`${c[1]} · ${c[2]} 포트`:s.dir==='input'?'INPUT CARD':'OUTPUT CARD'}</span></span><span class="rt-slot-plus" aria-hidden="true">${c?'↗':'+'}</span></button>`}).join('')}</div><div class="rt-counts"><span><b>${t.input}</b>입력 포트</span><span><b>${t.output}</b>출력 포트</span></div><p class="rt-board-note">실제 섀시의 슬롯 수·위치와 카드 설치 가능 여부는 제조사 자료 확인 전입니다.</p></div><aside class="rt-picker" aria-label="카드 선택"><div class="rt-picker-head"><span>${selectedSlot.label} · 카드 선택</span></div><div class="rt-picker-list">${families[state.family][selectedSlot.dir].map(c=>`<button type="button" class="rt-choice" data-card="${c[0]}" aria-pressed="${state.placements[state.slot]===c[0]}"><strong>${c[0]}</strong><small>${c[1]} · ${c[2]} 포트</small></button>`).join('')}</div><button type="button" class="rt-button rt-quiet" data-action="remove" ${slotCard(state.slot)?'':'disabled'}>이 논리 위치 비우기</button></aside></div>${portEditor()}`;
    }
    function cardsViewV2(){
      const slotList=currentSlots();
      if(!slotList.some(item=>item.id===state.slot))state.slot=slotList[0].id;
      const selectedSlot=slotList.find(item=>item.id===state.slot),selectedCard=slotCard(state.slot),t=totals();
      const inputCards=slotList.filter(item=>item.dir==='input'&&slotCard(item.id)).length;
      const outputCards=slotList.filter(item=>item.dir==='output'&&slotCard(item.id)).length;
      const confirmed=state.family==='XDM'&&state.model==='XDM-12';
      return heading('03 / CARD SLOTS','프레임의 빈 슬롯을 눌러 카드를 장착하세요.',`${state.model} · ${confirmed?'입력 3장 / 출력 3장 · 카드당 4채널':'슬롯 구성 검토용 초안'}`)+`<div class="rt-configurator-stage"><section class="rt-frame-area"><div class="rt-frame-header"><div><span class="rt-eyebrow">SELECTED FRAME</span><h3>${esc(state.model)}</h3><p>${confirmed?'사용자 확인 슬롯 구성':'제조사 슬롯 도면 확인 필요'}</p></div><div class="rt-frame-count"><span><b>${inputCards}</b> / ${slotList.filter(item=>item.dir==='input').length} INPUT</span><span><b>${outputCards}</b> / ${slotList.filter(item=>item.dir==='output').length} OUTPUT</span></div></div><div class="rt-frame-product"><img src="${assets[state.family]}" alt="${state.family} 제품군 참고 이미지"><span>${esc(state.model)} 선택</span></div><div class="rt-chassis-shell"><div class="rt-shell-label"><strong>${esc(state.model)} CARD BAY</strong><span>${confirmed?'3 INPUT + 3 OUTPUT':'구성 검토용'}</span></div><div class="rt-slot-bank">${slotList.map(slot=>{const c=slotCard(slot.id);return `<button type="button" class="rt-hardware-slot ${c?'rt-installed':''}" data-slot="${slot.id}" aria-pressed="${state.slot===slot.id}"><span class="rt-hardware-slot-label">${slot.label}</span>${c?`<img src="${cardAsset(c[0])}" alt="${c[0]} 카드"><strong>${c[0]}</strong><small>${c[2]} CHANNEL</small>`:'<span class="rt-empty-slot"><b>+</b> EMPTY</span>'}</button>`}).join('')}</div></div><div class="rt-channel-summary"><span>입력 카드 <b>${inputCards}장</b> · <b>${t.input}채널</b></span><span>출력 카드 <b>${outputCards}장</b> · <b>${t.output}채널</b></span></div></section><aside class="rt-card-drawer"><div class="rt-drawer-head"><div><span class="rt-eyebrow">${selectedSlot.dir==='input'?'INPUT':'OUTPUT'} CARD</span><h3>${selectedSlot.label} 카드 선택</h3></div>${selectedCard?'<span class="rt-selected-dot">장착됨</span>':''}</div><div class="rt-card-options">${families[state.family][selectedSlot.dir].map(c=>`<button type="button" class="rt-card-option" data-card="${c[0]}" aria-pressed="${state.placements[state.slot]===c[0]}"><span class="rt-add-icon">${state.placements[state.slot]===c[0]?'✓':'+'}</span><span class="rt-card-option-copy"><strong>${c[0]}</strong><small>${c[1]} · ${c[2]}채널</small></span><img src="${cardAsset(c[0])}" alt="${c[0]} 카드 이미지"></button>`).join('')}</div><button type="button" class="rt-button rt-remove-card" data-action="remove" ${selectedCard?'':'disabled'}>이 슬롯의 카드 제거</button></aside></div><div class="rt-stage-note">${confirmed?'카드 이미지는 제공된 RTCOM 카탈로그에서 가져왔습니다. XDM-12의 입력 3장·출력 3장 구성은 사용자 확인 기준입니다.':'현재 프레임의 실제 슬롯 수와 배치는 제조사 자료 확인 후 확정해야 합니다.'}</div>`;
    }
    function documentedSlotCount(model){const list=RtCore.slotsFor({family:state.family,model});return list[0]?.id==='in-1'?list.filter(item=>item.dir==='input').length:0}
    function rackLayout(model){if(!documentedSlotCount(model)||model==='XDM-12')return 'h';return ['XDM-72','XDM-144','XDM-216'].includes(model)?'vt':'vs'}
    function chassisViewV2(){
      const f=families[state.family];
      const xdmFeature=state.family==='XDM'?'<div class="rt-xdm-feature-note"><span>EDID · LED TIP</span><strong>커스텀 해상도도 설계할 수 있습니다.</strong><p>개선 펌웨어 기준으로 비표준 입력을 원본 패스스루(LED) 또는 4K 업스케일(모니터) 경로로 나눠 검토합니다. 출고용 EDID 주입 조건은 제조사 확인이 필요합니다.</p></div>':'';
      const tile=(m,i)=>{
        const count=documentedSlotCount(m),front=frameFronts[m],selected=state.model===m;
        const specs=count?`<span><b>${count}</b>입력 슬롯</span><span><b>${count}</b>출력 슬롯</span><span><b>${count*4}×${count*4}</b>최대 채널</span>`:'<span class="rt-chassis-unknown">슬롯 구성 제조사 확인 필요</span>';
        return `<button type="button" class="rt-chassis-card ${front?'':'rt-chassis-card-generic'}" data-model="${m}" aria-pressed="${selected}"><span class="rt-chassis-visual"><img src="${front||assets[state.family]}" alt="${front?`${m} 전면 사진`:`${state.family} 제품군 사진`}" loading="lazy"></span><span class="rt-chassis-body"><span class="rt-chassis-name"><strong>${m}</strong><span class="rt-radio" aria-hidden="true">${selected?'✓':''}</span></span><small>${esc(f.modelNotes[i]||'')}</small><span class="rt-chassis-specs">${specs}</span></span></button>`;
      };
      return heading('02 / CHASSIS','구성의 중심이 될 섀시를 선택하세요.',`${state.family} 제품군 · 메인프레임 ${f.models.length}종`)+`<div class="rt-chassis-grid">${f.models.map(tile).join('')}</div>${xdmFeature}`;
    }
    function cardChoiceModal(){
      if(!modalSlot)return '';
      const slot=currentSlots().find(item=>item.id===modalSlot);
      if(!slot)return '';
      const installed=state.placements[slot.id];
      const tips=slot.dir==='output'&&state.family==='XDM'?'<div class="rt-output-tips"><div class="rt-pro-tip rt-quad-tip"><span>4분할</span><div><strong>XDM-HOS100 · QUAD VIEW</strong><p>일반 HDMI 4채널 출력 또는 정사분할 화면 구성에 활용할 수 있습니다.</p></div></div><div class="rt-pro-tip"><span>활용 TIP</span><div><strong>XDM-WOS100 · 4 LAYER</strong><p>4개 레이어를 조합해 월 프로세서처럼 화면을 연출할 수 있습니다.</p></div></div></div>':'';
      const choice=c=>`<button type="button" class="rt-card-choice" data-card="${c[0]}" aria-pressed="${installed===c[0]}"><span class="rt-card-choice-plate"><img src="${cardAsset(c[0])}" alt="${c[0]} 카드 후면 판넬"></span><span class="rt-card-choice-copy"><strong>${c[0]}${cardBadge(c[0])}</strong><small>${esc(c[1])} · ${c[2]}채널</small><span>${esc(cardTip(c[0]))}</span></span><span class="rt-card-choice-state" aria-hidden="true">${installed===c[0]?'장착됨':'선택'}</span></button>`;
      return `<dialog class="rt-card-modal" aria-labelledby="rt-card-modal-title"><div class="rt-card-modal-head"><div><span class="rt-eyebrow">${slot.dir==='input'?'INPUT':'OUTPUT'} CARD · ${esc(state.model)}</span><h3 id="rt-card-modal-title">${esc(slot.label)} 카드 선택</h3></div><button type="button" class="rt-card-modal-close" data-modal-close aria-label="카드 선택 닫기">×</button></div>${tips}<div class="rt-card-choice-list">${families[state.family][slot.dir].map(choice).join('')}</div><div class="rt-card-modal-foot"><button type="button" class="rt-button rt-quiet" data-action="remove" ${installed?'':'disabled'}>이 슬롯 비우기</button><button type="button" class="rt-button" data-modal-close>닫기</button></div></dialog>`;
    }
    function configurationSummary(){
      const slotList=currentSlots(),t=totals(),rows=dir=>{
        const counts={};for(const slot of slotList.filter(item=>item.dir===dir)){const c=slotCard(slot.id);if(c)counts[c[0]]=(counts[c[0]]||0)+1}
        const entries=Object.entries(counts);
        return entries.length?`<ul>${entries.map(([id,qty])=>{const c=card(id);return `<li><img src="${cardAsset(id)}" alt=""><span><strong>${id}</strong><small>${esc(c[1])}</small></span><b>× ${qty}</b></li>`}).join('')}</ul>`:'<p class="rt-summary-empty">아직 장착한 카드가 없습니다.</p>';
      };
      const capacity=dir=>slotList.filter(item=>item.dir===dir).length*4,meter=(label,value,max)=>`<div class="rt-summary-meter"><span>${label}<b>${value} / ${max}채널</b></span><i style="--rt-fill:${max?Math.min(100,Math.round(value/max*100)):0}%"></i></div>`;
      const cards=slotList.filter(item=>slotCard(item.id)).length;
      return `<aside class="rt-config-summary" aria-label="구성 요약"><span class="rt-eyebrow">MY CONFIGURATION</span><h3>${esc(state.model)}</h3><p>${state.family} · 입력 ${slotList.filter(item=>item.dir==='input').length} / 출력 ${slotList.filter(item=>item.dir==='output').length} 슬롯</p>${meter('입력',t.input,capacity('input'))}${meter('출력',t.output,capacity('output'))}<h4>입력 카드</h4>${rows('input')}<h4>출력 카드</h4>${rows('output')}<div class="rt-summary-total"><span>장착 카드</span><b>${cards}장</b></div><p class="rt-summary-note">다음 단계에서 HDBaseT·광 카드에 연결할 전송기를 고릅니다.</p></aside>`;
    }
    function cardsViewV4(){
      const slotList=currentSlots(),model=state.model,layout=rackLayout(model),count=documentedSlotCount(model);
      const inputSlots=slotList.filter(item=>item.dir==='input'),outputSlots=slotList.filter(item=>item.dir==='output');
      const inputCards=inputSlots.filter(item=>slotCard(item.id)).length,outputCards=outputSlots.filter(item=>slotCard(item.id)).length;
      const columns=layout==='vt'?18:layout==='vs'?count:1;
      const shortLabel=slot=>slot.id.replace(/^in-/,'IN ').replace(/^out-/,'OUT ').toUpperCase();
      const changed=changedSlot;changedSlot=null;
      const slotButton=slot=>{const c=slotCard(slot.id),blank=!c&&state.family==='XDM';return `<button type="button" class="rt-rack-slot ${c?'rt-rack-slot-filled':''} ${blank?'rt-rack-slot-blank':''} ${changed===slot.id?'rt-rack-slot-changed':''}" data-slot="${slot.id}" aria-label="${esc(slot.label)}, ${c?`${c[0]} 장착됨 · 눌러서 변경`:'비어 있음 · 눌러서 카드 선택'}" title="${esc(slot.label)}${c?` · ${c[0]}`:''}"><span class="rt-rack-slot-no" aria-hidden="true">${shortLabel(slot)}</span>${c?`<img class="rt-faceplate" src="${cardAsset(c[0])}" alt="">`:`${blank?`<img class="rt-faceplate rt-blank-plate" src="${blankPlate}" alt="">`:''}<span class="rt-rack-slot-add" aria-hidden="true">+</span>`}</button>`};
      const bank=(dir,items)=>`<section class="rt-rack-bank rt-rack-bank-${dir}" aria-label="${dir==='input'?'입력':'출력'} 카드 슬롯"><div class="rt-rack-bank-title"><strong>${dir==='input'?'INPUT':'OUTPUT'}</strong><span>${items.filter(item=>slotCard(item.id)).length} / ${items.length}</span></div><div class="rt-rack-grid">${items.map(slotButton).join('')}</div></section>`;
      const photo=rearPhotos[model];
      const zone=(dir,items)=>{const [x0,y0,x1,y1]=photo[dir],[w,h]=photo.size,rows=Math.ceil(items.length/columns);return `<section class="rt-rack-zone rt-rack-zone-${dir}" aria-label="${dir==='input'?'입력':'출력'} 카드 슬롯" style="left:${(x0/w*100).toFixed(3)}%;top:${(y0/h*100).toFixed(3)}%;width:${((x1-x0)/w*100).toFixed(3)}%;height:${((y1-y0)/h*100).toFixed(3)}%;--rt-rack-zone-rows:${rows}"><div class="rt-rack-grid">${items.map(slotButton).join('')}</div></section>`};
      const photoRack=photo?`<figure class="rt-rack-photo rt-rack-${layout}" style="--rt-rack-columns:${columns};--rt-photo-ratio:${(photo.size[0]/photo.size[1]).toFixed(4)}"><img class="rt-rack-photo-image" src="${photo.src}" alt="${esc(model)} 후면 사진"><div class="rt-rack-photo-zones">${zone('input',inputSlots)}${zone('output',outputSlots)}</div><figcaption>후면 사진 · 국문 매뉴얼 p.${photo.page} · 선택한 카드만 표시</figcaption></figure>`:'';
      const layoutText=count?`${layout==='vt'?'상단':'왼쪽'} 입력 ${count}슬롯 / ${layout==='vt'?'하단':'오른쪽'} 출력 ${count}슬롯 · 카드당 4채널`:'슬롯 구성 검토용 논리 도식';
      return heading('03 / CARD SLOTS','후면의 빈 슬롯을 눌러 카드를 장착하세요.',`${esc(model)} · ${layoutText}`)+`<div class="rt-config-stage"><section class="rt-rack-canvas"><div class="rt-rack-toolbar"><div><span class="rt-eyebrow">REAR VIEW</span><h3>${esc(model)}</h3></div><div class="rt-frame-count"><span><b>${inputCards}</b> / ${inputSlots.length} INPUT</span><span><b>${outputCards}</b> / ${outputSlots.length} OUTPUT</span></div></div><div class="rt-rack-scroll">${photoRack||`<div class="rt-rack rt-rack-${layout}" style="--rt-rack-columns:${columns};--rt-rack-rows:${Math.max(1,Math.ceil(inputSlots.length/columns))*2};--rt-bank-slots:${count}"><span class="rt-rack-ear" aria-hidden="true"></span><div class="rt-rack-body">${bank('input',inputSlots)}${bank('output',outputSlots)}<div class="rt-rack-psu" aria-hidden="true"><strong>RTCOM</strong><span>${esc(model)}</span><i></i><small>CONTROL</small><i></i><small>POWER</small></div></div><span class="rt-rack-ear" aria-hidden="true"></span></div>`}</div>${photo||layout!=='h'?'<p class="rt-rack-scroll-hint">좌우로 밀어서 후면 전체를 볼 수 있습니다.</p>':''}${count?'':'<p class="rt-stage-warning">이 프레임은 제조사 후면 도면과 카드 허용표를 확보하기 전까지 논리 도식으로 표시합니다. 물리 설치 위치로 사용하지 마세요.</p>'}${count&&!photo?'<p class="rt-rack-note">이 프레임은 매뉴얼에 후면 사진이 없어 슬롯 배치를 그림으로 표시합니다.</p>':''}</section>${configurationSummary()}</div>${cardChoiceModal()}`;
    }
    function powerNotice(){
      const count=Object.values(state.links).filter(link=>link.device?.startsWith('XDM-CTR100 · ')).reduce((sum,link)=>sum+link.count,0);
      return count?`<div class="rt-power-notice"><span>필수 전원 연결</span><div><strong>XDM-CTR100 ${count}대에 전원 직접 연결</strong><p>매트릭스 카드(CIS100·COS100)에 연결하는 CTR100은 전원을 직접 연결해야 하며, 이 구성에서는 XDM-CTR100 PSE를 사용할 수 없습니다. 전원 공급 장비를 BOM에 자동 추가했습니다(제공 구성도 기준 16포트당 1대). 현행 모델명과 포트 용량은 제조사 확인이 필요합니다.</p></div></div>`:'';
    }
    function linksViewV3(){
      const remote=currentSlots().filter(slot=>['CAT','FIBER'].includes(slotCard(slot.id)?.[3]));
      const hdmiExtend=currentSlots().filter(slot=>{const c=slotCard(slot.id);return c&&c[3]==='HDMI'&&choices(slot,c).includes(RtCore.psePair)});
      const tile=(slot,option,link)=>{const info=extenderInfo[option],selected=link.device===option;return `<button type="button" class="rt-ext-option ${info?'':'rt-ext-option-plain'}" data-link-device="${esc(option)}" data-owner="${slot.id}" aria-pressed="${selected}">${info?`<span class="rt-ext-option-image ${info.images?'rt-ext-option-image-pair':''}">${(info.images||[info.image]).map(src=>`<img src="${src}" alt="" loading="lazy">`).join('')}</span>`:''}<span class="rt-ext-option-copy"><strong>${esc(info?.model||option)}${info?.recommended?'<em>기본 연동</em>':''}</strong><small>${esc(info?.role||'호환 전송 장비')}</small>${info?`<span>${info.specs.map(esc).join('<br>')}</span>`:''}</span><span class="rt-ext-option-state" aria-hidden="true">${selected?'✓ 연결됨':'선택'}</span></button>`};
      const none=(slot,link)=>`<button type="button" class="rt-ext-option rt-ext-option-none" data-link-device="" data-owner="${slot.id}" aria-pressed="${!link.device}"><span class="rt-ext-option-copy"><strong>연결하지 않음</strong><small>이 카드의 포트를 다른 장비와 직접 연결</small></span><span class="rt-ext-option-state" aria-hidden="true">${link.device?'선택':'✓ 선택됨'}</span></button>`;
      const block=slot=>{const c=slotCard(slot.id),opts=choices(slot,c),link=state.links[slot.id]||{device:'',count:0,distance:'30'};return `<section class="rt-link-card"><div class="rt-link-card-head">${state.family==='XDM'?`<img src="${cardAsset(c[0])}" alt="">`:''}<div><span class="rt-eyebrow">${slotCard(slot.id)[3]==='HDMI'?(slot.dir==='input'?'HDMI INPUT · 원격 소스 → HDBaseT 연장 → 카드':'HDMI OUTPUT · 카드 → HDBaseT 연장 → 원격 디스플레이'):(slot.dir==='input'?'INPUT · 소스 → 송신기(TX) → 카드':'OUTPUT · 카드 → 수신기(RX) → 디스플레이')}</span><h3>${esc(slot.label)} · ${esc(c[0])}</h3></div><label class="rt-link-count">연결 채널<select data-link="count" data-owner="${slot.id}" ${link.device?'':'disabled'}>${Array.from({length:c[2]+1},(_,i)=>`<option value="${i}" ${link.count===i?'selected':''}>${i} / ${c[2]}채널</option>`).join('')}</select></label></div>${opts.length?`<div class="rt-ext-options" role="group" aria-label="${esc(slot.label)} 전송 장비 선택">${opts.map(option=>tile(slot,option,link)).join('')}${none(slot,link)}</div>`:'<div class="rt-notice">이 카드와 전송 장비의 직접 호환 관계는 아직 확인되지 않았습니다.</div>'}</section>`};
      const lineup=state.family==='XDM'?`<section class="rt-ext-lineup" aria-labelledby="rt-ext-lineup-title"><div class="rt-ext-lineup-head"><div><span class="rt-eyebrow">XDM EXTENDER LINEUP</span><h3 id="rt-ext-lineup-title">XDM 연동 전송기</h3></div><p>HDBaseT 카드(CIS100·COS100)와 광 카드(FIS100·FOS100)에 연결하는 전송기입니다. 근거: RTCom 종합 카탈로그 p.10~12</p></div><div class="rt-ext-lineup-grid">${extenderLineup.map(item=>`<article class="rt-ext-lineup-card"><span class="rt-ext-option-image"><img src="${item.image}" alt="${esc(item.model)} 제품 사진" loading="lazy"></span><strong>${esc(item.model)}</strong><small>${esc(item.role)}</small><span class="rt-ext-pair">연동 · ${esc(item.pair)}</span><p>${esc(item.note)}</p><em>카탈로그 p.${item.page}</em></article>`).join('')}</div></section>`:'';
      const empty=`<div class="rt-empty rt-link-empty"><strong>현재 구성에는 HDBaseT·광 카드가 없습니다.</strong><p>XDM-CIS100·COS100(HDBaseT) 또는 XDM-FIS100·FOS100(광) 카드를 장착하면 CTR100·FT101·FR101이 자동으로 연결되고 여기서 바꿀 수 있습니다.</p><button type="button" class="rt-button" data-jump="2">카드 슬롯으로 돌아가기</button></div>`;
      const hdmiSection=hdmiExtend.length?`<section class="rt-hdmi-extend" aria-labelledby="rt-hdmi-extend-title"><div class="rt-ext-lineup-head"><div><span class="rt-eyebrow">HDMI EXTENSION · 선택</span><h3 id="rt-hdmi-extend-title">HDMI 카드 연장</h3></div><p>HDMI 입력·출력 포트를 멀리 연결해야 하면 CTR100 PSE와 CTR100을 한 쌍으로 씁니다. 전원은 PSE 쪽에만 연결하고, 두 제품 모두 DIP 스위치로 TX/RX를 설정합니다.</p></div><div class="rt-link-list">${hdmiExtend.map(block).join('')}</div></section>`:'';
      return heading('04 / EXTENDERS','카드에 연결할 전송 장비를 확인하세요.',remote.length?`HDBaseT·광 카드 ${remote.length}장에 기본 전송기를 연결했습니다. 필요하면 벽부형이나 채널 수를 바꾸세요.`:'HDBaseT·광 카드를 장착하면 연동 전송기가 자동으로 연결됩니다.')+`<div class="rt-link-list">${remote.length?remote.map(block).join(''):empty}</div>${powerNotice()}${hdmiSection}${lineup}`;
    }
    function linksViewV2(){
      const remote=currentSlots().filter(slot=>['CAT','FIBER'].includes(slotCard(slot.id)?.[3]));
      return heading('04 / EXTENDERS','필요한 카드에 전송 장비를 연결하세요.','거리 입력 없이 전송 장비 종류와 연결 채널 수만 선택합니다.')+`<div class="rt-link-list">${remote.length?remote.map(slot=>{const c=slotCard(slot.id),opts=choices(slot,c),link=state.links[slot.id]||{device:'',count:0,distance:'30'};return `<section class="rt-link"><div class="rt-link-heading"><span>${slot.label} · ${c[0]}</span><span class="rt-caption">4채널 중 ${link.device?link.count:0}채널 연결</span></div>${opts.length?`<div class="rt-fields rt-fields-simple"><label>전송 장비<select data-link="device" data-owner="${slot.id}"><option value="">연결하지 않음</option>${opts.map(option=>`<option ${link.device===option?'selected':''}>${option}</option>`).join('')}</select></label><label>연결 채널<select data-link="count" data-owner="${slot.id}" ${link.device?'':'disabled'}>${Array.from({length:5},(_,i)=>`<option value="${i}" ${link.count===i?'selected':''}>${i}채널</option>`).join('')}</select></label></div>`:`<div class="rt-notice">이 카드와 전송 장비의 직접 호환 관계는 아직 확인되지 않았습니다.</div>`}</section>`}).join(''):'<div class="rt-empty">CAT 또는 광 카드를 장착하면 선택 가능한 전송 장비가 표시됩니다.</div>'}</div>${powerNotice()}`;
    }
    function linksView(){const remote=slots.filter(s=>['CAT','FIBER'].includes(slotCard(s.id)?.[3]));return heading('04 / EXTENDERS','전송기를 연결하고, 거리를 지정하세요.','입력측은 송신기 TX, 출력측은 수신기 RX를 연결합니다.')+`<div class="rt-link-list">${remote.length?remote.map(s=>{const c=slotCard(s.id),opts=choices(s,c),l=state.links[s.id]||{device:'',count:0,distance:'30'};return `<section class="rt-link"><div class="rt-link-heading"><span>${s.label} · ${c[0]}</span><span class="rt-caption">${c[2]}포트 중 ${l.device?l.count:0}개 연결</span></div><div class="rt-chain">${s.dir==='input'?`소스 <span>→</span><strong>송신기 TX</strong><span>→</span>${c[0]}`:`${c[0]}<span>→</span><strong>수신기 RX</strong><span>→</span>디스플레이`}</div>${opts.length?`<div class="rt-fields"><label>전송기<select data-link="device" data-owner="${s.id}"><option value="">연결하지 않음</option>${opts.map(o=>`<option ${l.device===o?'selected':''}>${o}</option>`).join('')}</select></label><label>연결 수량<select data-link="count" data-owner="${s.id}" ${l.device?'':'disabled'}>${Array.from({length:c[2]+1},(_,i)=>`<option value="${i}" ${l.count===i?'selected':''}>${i}대</option>`).join('')}</select></label><label>케이블 거리<select data-link="distance" data-owner="${s.id}">${(c[3]==='CAT'?['10','30','50','100']:['30','100','300','2000']).map(d=>`<option value="${d}" ${l.distance===d?'selected':''}>${d} m</option>`).join('')}</select></label></div><p class="rt-link-note">같은 모델을 포트 1번부터 순서대로 배정하는 예시 · 케이블 종류·거리·급전 적합성은 아직 검증하지 않습니다.</p>`:`<div class="rt-notice">${c[3]==='CAT'?(s.dir==='input'?'CT101-U · CT102-U · CT103-U-H · CT104-U':'CR101-U · CR102-U · CR103-U · CR104-U'):(s.dir==='input'?'FT101-U · FT102-U · FT103-U-H':'FR101-U · FR102-U · FR103-U')}<br>해당 카드와의 개별 호환 관계 확인 후 선택을 활성화합니다.</div>`}</section>`}).join(''):`<div class="rt-empty">CAT 또는 광 카드를 선택하면 포트에 연결할 전송기가 표시됩니다.<br><button type="button" class="rt-button" data-jump="2" style="margin-top:14px">입출력 카드 선택으로</button></div>`}</div>${state.family==='SPX'?'<div class="rt-notice">SPX-TX는 전송기 그룹에 포함합니다. 입력 카드 직결 또는 TX/RX를 통한 HDMI 연장 경로는 호환 확인 후 활성화합니다.</div>':''}<p class="rt-board-note">HDMI 포트를 TX/RX 쌍으로 연장하는 선택은 상세 설계에서 추가합니다.</p>`}
    function bom(){return RtCore.bom(state).map(row=>[row.category,row.model,row.quantity])}
    function table(){return `<div class="rt-table-wrap"><table><thead><tr><th>구분</th><th>모델</th><th>수량</th></tr></thead><tbody>${bom().map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`}
    function reviewView(){const t=totals();return heading('05 / REVIEW','선택한 구성을 한눈에 확인하세요.','요구량, 구성 포트, 장비 목록과 검증 결과를 함께 정리합니다.')+`<div class="rt-review-head"><div class="rt-review-stat">선택한 메인프레임<strong>${state.model}</strong></div><div class="rt-review-stat">카드 포트 합계<strong>${t.input} IN / ${t.output} OUT</strong></div><div class="rt-review-stat">연결한 전송기<strong>${t.ext}대</strong></div></div><h3 class="rt-review-title">요구량 대비 구성</h3>${requirementSummaryView()}<h3 class="rt-review-title">장비 목록</h3>${table()}${validationView()}<div class="rt-notice">검토용 초안 · 실제 설치·호환·급전 검증 전<br>부속품과 케이블 구매 목록은 포함하지 않은 구성 예시입니다.</div>`}
    function reviewViewV2(){const t=totals(),slotList=currentSlots(),inputCards=slotList.filter(slot=>slot.dir==='input'&&slotCard(slot.id)).length,outputCards=slotList.filter(slot=>slot.dir==='output'&&slotCard(slot.id)).length;return heading('05 / REVIEW','장착한 카드 구성을 확인하세요.','프레임, 입력 카드, 출력 카드와 전송 장비 수량을 검토합니다.')+`<div class="rt-review-head"><div class="rt-review-stat">선택 프레임<strong>${state.model}</strong></div><div class="rt-review-stat">장착 카드<strong>${inputCards} IN / ${outputCards} OUT</strong></div><div class="rt-review-stat">구성 채널<strong>${t.input} IN / ${t.output} OUT</strong></div></div><h3 class="rt-review-title">장비 목록</h3>${table()}${validationView()}<div class="rt-notice">${state.family==='XDM'&&slotList[0].id==='in-1'?`${state.model}은 입력 카드 ${slotList.filter(slot=>slot.dir==='input').length}장과 출력 카드 ${slotList.filter(slot=>slot.dir==='output').length}장, 카드당 4채널을 기준으로 검토합니다.`:'현재 모델은 슬롯 구조 확인이 더 필요합니다.'}</div>`}
    function exportView(){const data=RtCore.document(state);const content=state.format==='PDF'?`<div class="rt-paper-title">Matrix Configuration</div><p class="rt-caption">${state.family} / ${state.model}</p><div class="rt-line"></div>${table()}<p class="rt-board-note">미검증 검토용 초안 · 실제 설치 승인 자료가 아닙니다.</p>`:`<pre>${esc(state.format==='JSON'?JSON.stringify(data,null,2):RtCore.csv(state))}</pre>`;return heading('06 / EXPORT','구성을 저장하고 공유하세요.','연락처 입력 없이 구성 요약과 장비 목록을 내보내는 흐름입니다.')+`<div class="rt-export"><div class="rt-export-options">${[['PDF','구성 요약 · 슬롯·전송기 연결'],['CSV','장비 목록 · 모델별 수량'],['JSON','구성 저장 · 다시 불러오기']].map(([id,n])=>`<button type="button" class="rt-format" data-format="${id}" aria-pressed="${state.format===id}"><div><strong>${id}</strong><span>${n}</span></div><span class="rt-radio" aria-hidden="true">${state.format===id?'✓':''}</span></button>`).join('')}<p class="rt-board-note">내보낸 자료는 미검증 검토용 초안입니다.<br>PDF는 인쇄 창에서 PDF로 저장하세요.</p></div><div class="rt-paper"><div class="rt-preview-label"><span>RTCOM</span><span class="rt-pill">초안 미리보기</span></div>${content}</div></div><button type="button" class="rt-button rt-primary" data-tool="export">${state.format==='PDF'?'검토용 보고서 인쇄 / PDF':'검토용 '+state.format+' 다운로드'}</button>`}
    function applyDesign(){root.style.setProperty('--rt-accent',design.tone==='blue'?'light-dark(#276d94,#87c3e8)':'light-dark(#bd591d,#f4a46b)');root.style.setProperty('--rt-tint',design.tone==='blue'?'light-dark(#edf5fa,#202e3a)':'light-dark(#fcf3eb,#33291f)');root.querySelector('.rt-main').style.paddingTop=design.density==='compact'?'22px':'';root.querySelector('.rt-main').style.paddingBottom=design.density==='compact'?'20px':''}
    function render(){nav.innerHTML=labels.map((label,i)=>`<button type="button" class="rt-step" data-jump="${i}" aria-label="${i+1}단계 ${label}" ${i===state.step?'aria-current="step"':''} ${i>state.maxStep?'disabled':''}><i aria-hidden="true">${i<state.step?'✓':String(i+1).padStart(2,'0')}</i><span class="rt-full-label">${label}</span><span class="rt-short-label" aria-hidden="true">${['제품군','섀시','카드','전송기','검토','출력'][i]}</span></button>`).join('');if(state.step!==2)modalSlot=null;main.innerHTML=[familyView,chassisViewV2,cardsViewV4,linksViewV3,reviewViewV2,exportView][state.step]();openCardModal();root.querySelector('.rt-summary').innerHTML=`<strong>${state.family}</strong>${state.model?' / '+state.model:' 제품군'}<br>${state.step>1?'카드 구성 검토 중':'카테고리: 매트릭스'}`;const next=root.querySelector('[data-action=next]');next.disabled=state.step===1&&!state.model;next.querySelector('span').textContent=['섀시 선택','카드 슬롯 구성','전송기 연결','구성 검토','출력 미리보기','처음으로'][state.step];root.querySelector('[data-action=back]').hidden=state.step===0;applyDesign();updateToolbar()}
    function changed(){recordHistory();const active=document.activeElement;let focusSelector='';if(active&&root.contains(active)){if(active.dataset.link)focusSelector=`select[data-owner="${active.dataset.owner}"][data-link="${active.dataset.link}"]`;else if(active.dataset.linkDevice!==undefined)focusSelector=`button[data-owner="${active.dataset.owner}"][data-link-device="${active.dataset.linkDevice}"]`;else for(const key of ['family','model','slot','card','format','jump'])if(active.dataset[key]!==undefined){focusSelector=`button[data-${key}="${active.dataset[key]}"]`;break}}render();if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:true});persist()}
    let focusSlotAfterRender=null;
    function focusSlot(id){if(id)root.querySelector(`button[data-slot="${id}"]`)?.focus({preventScroll:true})}
    function openCardModal(){
      const dialog=main.querySelector('.rt-card-modal');
      if(!dialog){if(focusSlotAfterRender){const id=focusSlotAfterRender;focusSlotAfterRender=null;requestAnimationFrame(()=>focusSlot(id))}return}
      dialog.addEventListener('cancel',event=>{event.preventDefault();closeCardModal()});
      dialog.addEventListener('click',event=>{if(event.target===dialog)closeCardModal()});
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
      requestAnimationFrame(()=>(dialog.querySelector('.rt-card-choice[aria-pressed="true"]')||dialog.querySelector('.rt-card-choice'))?.focus());
    }
    function closeCardModal(id=modalSlot){
      modalSlot=null;
      const dialog=main.querySelector('.rt-card-modal');
      if(dialog){if(dialog.open&&typeof dialog.close==='function')dialog.close();dialog.remove()}
      focusSlot(id);
    }
    root.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button||!root.contains(button)||button.disabled)return;
      if(button.dataset.requirementAdd){
        const direction=button.dataset.requirementAdd,key=direction==='input'?'inputs':'outputs';
        state.requirements[key].push({id:`req-${direction}-${Date.now()}`,direction,signalType:'HDMI',quantity:1,resolution:'',frameRate:'',distance:null,txRequired:false,rxRequired:false});
        changed();return;
      }
      if(button.dataset.requirementRemove){
        for(const key of ['inputs','outputs'])state.requirements[key]=state.requirements[key].filter(item=>item.id!==button.dataset.requirementRemove);
        changed();
      }
    });
    root.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||!root.contains(b)||b.disabled)return;if(b.dataset.family){if(state.family!==b.dataset.family){if(!confirmReset())return;state.family=b.dataset.family;state.model=null;state.placements={};state.portAssignments={};state.links={};state.maxStep=0;state.slot='in-a'}changed();return}if(b.dataset.model){if(state.model!==b.dataset.model){if(!confirmReset())return;state.model=b.dataset.model;state.placements={};state.portAssignments={};state.links={};state.maxStep=1;state.slot=currentSlots()[0].id}changed();return}if(b.dataset.slot){state.slot=b.dataset.slot;modalSlot=b.dataset.slot;changed();return}if(b.dataset.modalClose!==undefined){closeCardModal();return}if(b.dataset.linkDevice!==undefined){const id=b.dataset.owner,old=state.links[id]||{device:'',count:0,distance:'30'},slot=currentSlots().find(item=>item.id===id),c=slot&&slotCard(slot.id);if(!c||(b.dataset.linkDevice&&!choices(slot,c).includes(b.dataset.linkDevice)))return;if(old.device===b.dataset.linkDevice)return;old.device=b.dataset.linkDevice;old.count=old.device?(old.count||c[2]):0;state.links[id]=old;syncPorts();changed();return}if(b.dataset.card){const reopen=modalSlot;modalSlot=null;if(state.placements[state.slot]===b.dataset.card){closeCardModal(reopen);return}focusSlotAfterRender=reopen;changedSlot=state.slot;state.placements[state.slot]=b.dataset.card;const autoLink=RtCore.defaultLink(b.dataset.card,card(b.dataset.card)[2]);if(autoLink)state.links[state.slot]=autoLink;else delete state.links[state.slot];syncPorts();changed();return}if(b.dataset.format){state.format=b.dataset.format;changed();return}if(b.dataset.jump!==undefined){const n=Number(b.dataset.jump);if(n<=state.maxStep){state.step=n;changed()}return}if(b.dataset.action==='remove'){focusSlotAfterRender=modalSlot;changedSlot=state.slot;modalSlot=null;delete state.placements[state.slot];delete state.links[state.slot];syncPorts();changed();return}if(b.dataset.action==='back'){state.step=Math.max(0,state.step-1);changed();return}if(b.dataset.action==='next'){state.step=state.step===5?0:state.step+1;state.maxStep=Math.max(state.maxStep,state.step);changed()}});
    root.addEventListener('change',event=>{const select=event.target;if(!select.dataset.link)return;const id=select.dataset.owner;const old=state.links[id]||{device:'',count:0,distance:'30'};if(select.dataset.link==='device'){old.device=select.value;old.count=select.value?Math.max(old.count,1):0}else if(select.dataset.link==='count'){old.count=Number(select.value)}else old.distance=select.value;state.links[id]=old;syncPorts();changed()});
    function updateRequirementField(target){
      const field=target.dataset.requirementField;
      if(!field)return false;
      const item=[...state.requirements.inputs,...state.requirements.outputs].find(value=>value.id===target.dataset.owner);
      if(!item)return false;
      if(field==='quantity')item.quantity=Math.min(999,Math.max(1,Number(target.value)||1));
      else if(field==='distance')item.distance=target.value===''?null:Math.min(2000,Math.max(0,Number(target.value)||0));
      else if(field==='txRequired'||field==='rxRequired')item[field]=target.checked;
      else item[field]=target.value;
      return true;
    }
    function updatePortField(target){
      const field=target.dataset.portField,key=target.dataset.owner;
      if(!field||!state.portAssignments[key])return false;
      if(field==='quantity')state.portAssignments[key].quantity=target.checked?1:0;
      else state.portAssignments[key][field]=target.value;
      return true;
    }
    root.addEventListener('input',event=>{if(updateRequirementField(event.target)||updatePortField(event.target))persist()});
    root.addEventListener('change',event=>{if(updateRequirementField(event.target)||updatePortField(event.target))changed()});
    root.addEventListener('focusout',event=>{if(event.target.matches('input[data-requirement-field],input[data-port-field]'))changed()});
    const storageKey='rtcom.configuration.v1';
    let history=[],historyIndex=-1;
    const status=root.querySelector('#save-status');
    function announce(message){status.textContent=message}
    function confirmReset(){return !Object.keys(state.placements).length || window.confirm('제품군 또는 섀시를 변경하면 카드와 전송기 선택이 초기화됩니다. 변경할까요? 실행 취소로 복원할 수 있습니다.')}
    function snapshot(){return JSON.stringify(state)}
    function recordHistory(){
      const value=snapshot();
      if(history[historyIndex]===value)return;
      history=history.slice(0,historyIndex+1);
      history.push(value);
      if(history.length>100)history.shift();
      historyIndex=history.length-1;
    }
    function updateToolbar(){
      root.querySelector('[data-tool="undo"]').disabled=historyIndex<=0;
      root.querySelector('[data-tool="redo"]').disabled=historyIndex>=history.length-1;
    }
    function saveLocal(){
      try{localStorage.setItem(storageKey,JSON.stringify(RtCore.document(state)));announce('이 브라우저에 자동 저장됨 · '+new Date().toLocaleTimeString('ko-KR'))}
      catch{announce('자동 저장을 사용할 수 없습니다. JSON 백업으로 구성을 보관하세요.')}
    }
    function validationView(){
      const result=RtCore.validate(state);
      const names={ERROR:'오류',WARNING:'경고',UNVERIFIED:'미확정',VALID:'충족'};
      return `<section class="rt-validation" aria-label="검토 결과"><h3>검토 결과 <span class="rt-pill">${names[result.status]}</span></h3><p>슬롯 구성과 카드·전송 장비의 확인 상태를 표시합니다.</p><ul>${result.issues.map(i=>`<li data-level="${i.level}"><strong>${names[i.level]}</strong><span>${esc(i.message)}${i.evidence?` <small>근거: ${esc(i.evidence)}</small>`:''}</span></li>`).join('')}</ul><a href="docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md" target="_blank" rel="noopener">제품 근거 및 확인 필요 사항 보기 ↗</a></section>`;
    }
    function download(text,type,extension){
      const blob=new Blob([text],{type});
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=`RTCOM-${state.model||state.family}-draft.${extension}`;
      document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      announce(`${extension.toUpperCase()} 검토용 초안 다운로드를 요청했습니다.`);
    }
    function report(){
      const rows=currentSlots().filter(s=>slotCard(s.id)).map(s=>{
        const c=slotCard(s.id),l=state.links[s.id];
        return `<tr><td>${s.label}</td><td>${esc(c[0])}</td><td>${c[2]}</td><td>${l?.device?esc(l.device):'미지정'}</td><td>${l?.device?l.count:0}</td></tr>`;
      }).join('');
      document.getElementById('print-report').innerHTML=`<h1>RTCOM Matrix Configuration</h1><p><strong>미검증 검토용 초안 · 설치 및 구매 승인 자료가 아닙니다.</strong></p><p>${esc(state.family)} / ${esc(state.model||'섀시 미선택')} · ${new Date().toLocaleString('ko-KR')}</p><h2>장비 목록</h2>${table()}<h2>카드 슬롯 구성</h2><table><thead><tr><th>슬롯</th><th>카드</th><th>채널</th><th>전송 장비</th><th>연결 채널</th></tr></thead><tbody>${rows||'<tr><td colspan="5">장착한 카드가 없습니다.</td></tr>'}</tbody></table>${validationView()}<p>카탈로그 버전: ${RtCore.catalogVersion} · 케이블·전원·기본 포함품은 별도 확인이 필요합니다.</p>`;
    }
    window.addEventListener('beforeprint',report);
    root.addEventListener('click',event=>{
      const button=event.target.closest('[data-tool]');
      if(!button||button.disabled)return;
      const action=button.dataset.tool;
      if(action==='undo'||action==='redo'){
        const next=historyIndex+(action==='undo'?-1:1);
        if(next<0||next>=history.length)return;
        historyIndex=next;state=JSON.parse(history[next]);render();saveLocal();return;
      }
      if(action==='reset'){
        if(!window.confirm('새 구성을 시작할까요? 현재 구성은 실행 취소로 복원할 수 있습니다.'))return;
        state=RtCore.initial();changed();return;
      }
      if(action==='backup'){download(JSON.stringify(RtCore.document(state),null,2),'application/json;charset=utf-8','json');return}
      if(action==='import'){root.querySelector('#import-file').click();return}
      if(action==='export'){
        if(state.format==='JSON')download(JSON.stringify(RtCore.document(state),null,2),'application/json;charset=utf-8','json');
        else if(state.format==='CSV')download('\uFEFF'+RtCore.csv(state),'text/csv;charset=utf-8','csv');
        else {report();window.print()}
      }
    });
    root.querySelector('#import-file').addEventListener('change',async event=>{
      const file=event.target.files[0];event.target.value='';if(!file)return;
      try{
        if(file.size>1024*1024)throw new Error('JSON 파일은 1MB 이하여야 합니다.');
        const candidate=RtCore.parse(await file.text());
        if(Object.keys(state.placements).length&&!window.confirm('파일의 구성으로 현재 작업을 바꿀까요? 실행 취소로 복원할 수 있습니다.'))return;
        state=candidate;changed();announce('JSON 구성을 불러왔습니다. 검토 결과를 현재 기준으로 다시 계산했습니다.');
      }catch(error){announce('불러오기 실패: '+error.message)}
    });
    function initialize(){
      let message='이 브라우저에 자동 저장됩니다. 다른 기기로 옮길 때는 JSON 백업을 사용하세요.';
      try{
        const saved=localStorage.getItem(storageKey);
        if(saved){state=RtCore.parse(saved);message='이 브라우저에 저장된 구성을 복원했습니다.'}
      }catch(error){message='저장된 구성을 복원하지 못했습니다. '+error.message+' JSON 백업이 있으면 불러오세요.'}
      recordHistory();render();announce(message);
    }

    initialize();
  })();
