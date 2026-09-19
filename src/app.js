
  (()=>{
    const root=document.getElementById('rtcom-design');
    const main=root.querySelector('.rt-main');
    const nav=root.querySelector('.rt-nav');
    const assets=Object.fromEntries([...root.querySelector('template').content.querySelectorAll('img')].map(x=>[x.dataset.family,x.src]));
    const families=RtCatalog;
    const labels=['제품군','섀시','요구량·카드','전송기','구성 검토','내보내기'];
    const slots=[{id:'in-a',label:'입력 A',dir:'input'},{id:'in-b',label:'입력 B',dir:'input'},{id:'out-a',label:'출력 A',dir:'output'},{id:'out-b',label:'출력 B',dir:'output'}];
    let state=RtCore.initial();
    const design={tone:'warm',density:'comfortable'};
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function card(id){return [...families[state.family].input,...families[state.family].output].find(c=>c[0]===id)}
    function slotCard(id){return card(state.placements[id])}
    function syncPorts(){state.portAssignments=RtCore.syncPorts(state)}
    function totals(){let input=0,output=0;for(const s of slots){const c=slotCard(s.id);if(c){if(s.dir==='input')input+=c[2];else output+=c[2]}}return {input,output,ext:Object.values(state.links).reduce((sum,l)=>sum+(l.device?l.count:0),0)}}
    function choices(s,c){return RtCore.choices(c[0])}
    function persist(){saveLocal()}
    function heading(k,title,desc){return `<div class="rt-eyebrow">${k}</div><h2>${title}</h2><p class="rt-description">${desc}</p>`}
    function familyView(){return heading('01 / PRODUCT FAMILY','연결의 시작, 제품군을 선택하세요.','사용 환경에 맞는 제품군을 고르고, 섀시와 전송기를 함께 구성합니다.')+`<div class="rt-family-grid">${Object.entries(families).map(([id,f])=>`<button type="button" class="rt-family" data-family="${id}" aria-pressed="${state.family===id}"><span class="rt-family-visual"><img src="${assets[id]}" alt="${id} 제품군"></span><span class="rt-family-body"><span class="rt-family-title">${id}<span class="rt-radio" aria-hidden="true">${state.family===id?'✓':''}</span></span><span class="rt-family-en">${f.name}</span><span class="rt-family-copy">${f.copy}</span><span class="rt-tags">${f.tags.map(t=>`<span class="rt-tag">${t}</span>`).join('')}</span></span></button>`).join('')}</div><div class="rt-bottom-note"><span>제품군별로 카드와 전송기 선택 항목이 달라집니다.</span><span>01 — 06</span></div>`}
    function chassisView(){const f=families[state.family];return heading('02 / CHASSIS','구성의 중심이 될 섀시를 선택하세요.',`${state.family} 제품군 · 메인프레임 선택`)+`<div class="rt-split"><div class="rt-model-list">${f.models.map((m,i)=>`<button class="rt-model" data-model="${m}" type="button" aria-pressed="${state.model===m}"><span><strong>${m}</strong><small>${f.modelNotes[i]}</small></span><span class="rt-radio" aria-hidden="true">${state.model===m?'✓':''}</span></button>`).join('')}</div><div class="rt-preview"><div class="rt-preview-label"><span class="rt-eyebrow">${state.family} SERIES</span><span class="rt-pill">제품군 미리보기</span></div><h3>${state.model||'섀시를 선택해 주세요'}</h3><div class="rt-photo"><img src="${assets[state.family]}" alt="${state.family} 제품군 전체 라인업 사진"></div><p class="rt-caption">${f.name}</p><div class="rt-line"></div><p class="rt-caption">사진은 제품군 라인업입니다.<br>다음 화면의 슬롯은 배치 방식을 보여주는 예시입니다.</p></div></div>`}
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
    function linksView(){const remote=slots.filter(s=>['CAT','FIBER'].includes(slotCard(s.id)?.[3]));return heading('04 / EXTENDERS','전송기를 연결하고, 거리를 지정하세요.','입력측은 송신기 TX, 출력측은 수신기 RX를 연결합니다.')+`<div class="rt-link-list">${remote.length?remote.map(s=>{const c=slotCard(s.id),opts=choices(s,c),l=state.links[s.id]||{device:'',count:0,distance:'30'};return `<section class="rt-link"><div class="rt-link-heading"><span>${s.label} · ${c[0]}</span><span class="rt-caption">${c[2]}포트 중 ${l.device?l.count:0}개 연결</span></div><div class="rt-chain">${s.dir==='input'?`소스 <span>→</span><strong>송신기 TX</strong><span>→</span>${c[0]}`:`${c[0]}<span>→</span><strong>수신기 RX</strong><span>→</span>디스플레이`}</div>${opts.length?`<div class="rt-fields"><label>전송기<select data-link="device" data-owner="${s.id}"><option value="">연결하지 않음</option>${opts.map(o=>`<option ${l.device===o?'selected':''}>${o}</option>`).join('')}</select></label><label>연결 수량<select data-link="count" data-owner="${s.id}" ${l.device?'':'disabled'}>${Array.from({length:c[2]+1},(_,i)=>`<option value="${i}" ${l.count===i?'selected':''}>${i}대</option>`).join('')}</select></label><label>케이블 거리<select data-link="distance" data-owner="${s.id}">${(c[3]==='CAT'?['10','30','50','100']:['30','100','300','2000']).map(d=>`<option value="${d}" ${l.distance===d?'selected':''}>${d} m</option>`).join('')}</select></label></div><p class="rt-link-note">같은 모델을 포트 1번부터 순서대로 배정하는 예시 · 케이블 종류·거리·급전 적합성은 아직 검증하지 않습니다.</p>`:`<div class="rt-notice">${c[3]==='CAT'?(s.dir==='input'?'CT101-U · CT102-U · CT103-U-H · CT104-U':'CR101-U · CR102-U · CR103-U · CR104-U'):(s.dir==='input'?'FT101-U · FT102-U · FT103-U-H':'FR101-U · FR102-U · FR103-U')}<br>해당 카드와의 개별 호환 관계 확인 후 선택을 활성화합니다.</div>`}</section>`}).join(''):`<div class="rt-empty">CAT 또는 광 카드를 선택하면 포트에 연결할 전송기가 표시됩니다.<br><button type="button" class="rt-button" data-jump="2" style="margin-top:14px">입출력 카드 선택으로</button></div>`}</div>${state.family==='SPX'?'<div class="rt-notice">SPX-TX는 전송기 그룹에 포함합니다. 입력 카드 직결 또는 TX/RX를 통한 HDMI 연장 경로는 호환 확인 후 활성화합니다.</div>':''}<p class="rt-board-note">HDMI 포트를 TX/RX 쌍으로 연장하는 선택은 상세 설계에서 추가합니다.</p>`}
    function bom(){return RtCore.bom(state).map(row=>[row.category,row.model,row.quantity])}
    function table(){return `<div class="rt-table-wrap"><table><thead><tr><th>구분</th><th>모델</th><th>수량</th></tr></thead><tbody>${bom().map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`}
    function reviewView(){const t=totals();return heading('05 / REVIEW','선택한 구성을 한눈에 확인하세요.','요구량, 구성 포트, 장비 목록과 검증 결과를 함께 정리합니다.')+`<div class="rt-review-head"><div class="rt-review-stat">선택한 메인프레임<strong>${state.model}</strong></div><div class="rt-review-stat">카드 포트 합계<strong>${t.input} IN / ${t.output} OUT</strong></div><div class="rt-review-stat">연결한 전송기<strong>${t.ext}대</strong></div></div><h3 class="rt-review-title">요구량 대비 구성</h3>${requirementSummaryView()}<h3 class="rt-review-title">장비 목록</h3>${table()}${validationView()}<div class="rt-notice">검토용 초안 · 실제 설치·호환·급전 검증 전<br>부속품과 케이블 구매 목록은 포함하지 않은 구성 예시입니다.</div>`}
    function exportView(){const data=RtCore.document(state);const content=state.format==='PDF'?`<div class="rt-paper-title">Matrix Configuration</div><p class="rt-caption">${state.family} / ${state.model}</p><div class="rt-line"></div>${table()}<p class="rt-board-note">미검증 검토용 초안 · 실제 설치 승인 자료가 아닙니다.</p>`:`<pre>${esc(state.format==='JSON'?JSON.stringify(data,null,2):RtCore.csv(state))}</pre>`;return heading('06 / EXPORT','구성을 저장하고 공유하세요.','연락처 입력 없이 구성 요약과 장비 목록을 내보내는 흐름입니다.')+`<div class="rt-export"><div class="rt-export-options">${[['PDF','구성 요약 · 슬롯·전송기 연결'],['CSV','장비 목록 · 모델별 수량'],['JSON','구성 저장 · 다시 불러오기']].map(([id,n])=>`<button type="button" class="rt-format" data-format="${id}" aria-pressed="${state.format===id}"><div><strong>${id}</strong><span>${n}</span></div><span class="rt-radio" aria-hidden="true">${state.format===id?'✓':''}</span></button>`).join('')}<p class="rt-board-note">내보낸 자료는 미검증 검토용 초안입니다.<br>PDF는 인쇄 창에서 PDF로 저장하세요.</p></div><div class="rt-paper"><div class="rt-preview-label"><span>RTCOM</span><span class="rt-pill">초안 미리보기</span></div>${content}</div></div><button type="button" class="rt-button rt-primary" data-tool="export">${state.format==='PDF'?'검토용 보고서 인쇄 / PDF':'검토용 '+state.format+' 다운로드'}</button>`}
    function applyDesign(){root.style.setProperty('--rt-accent',design.tone==='blue'?'light-dark(#276d94,#87c3e8)':'light-dark(#bd591d,#f4a46b)');root.style.setProperty('--rt-tint',design.tone==='blue'?'light-dark(#edf5fa,#202e3a)':'light-dark(#fcf3eb,#33291f)');root.querySelector('.rt-main').style.paddingTop=design.density==='compact'?'22px':'';root.querySelector('.rt-main').style.paddingBottom=design.density==='compact'?'20px':''}
    function render(){nav.innerHTML=labels.map((label,i)=>`<button type="button" class="rt-step" data-jump="${i}" aria-label="${i+1}단계 ${label}" ${i===state.step?'aria-current="step"':''} ${i>state.maxStep?'disabled':''}><i aria-hidden="true">${i<state.step?'✓':String(i+1).padStart(2,'0')}</i><span class="rt-full-label">${label}</span><span class="rt-short-label" aria-hidden="true">${['제품군','섀시','I/O','전송기','검토','출력'][i]}</span></button>`).join('');main.innerHTML=[familyView,chassisView,cardsView,linksView,reviewView,exportView][state.step]();root.querySelector('.rt-summary').innerHTML=`<strong>${state.family}</strong>${state.model?' / '+state.model:' 제품군'}<br>${state.step>1?'검토용 초안 · 실제 구성 검증 전':'카테고리: 매트릭스'}`;const next=root.querySelector('[data-action=next]');next.disabled=state.step===1&&!state.model;next.querySelector('span').textContent=['섀시 선택','입출력 카드 구성','전송기 연결','구성 검토','출력 미리보기','처음으로'][state.step];root.querySelector('[data-action=back]').hidden=state.step===0;applyDesign();updateToolbar()}
    function changed(){recordHistory();const active=document.activeElement;let focusSelector='';if(active&&root.contains(active)){if(active.dataset.link)focusSelector=`select[data-owner="${active.dataset.owner}"][data-link="${active.dataset.link}"]`;else for(const key of ['family','model','slot','card','format','jump'])if(active.dataset[key]!==undefined){focusSelector=`button[data-${key}="${active.dataset[key]}"]`;break}}render();if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:true});persist()}
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
    root.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||!root.contains(b)||b.disabled)return;if(b.dataset.family){if(state.family!==b.dataset.family){if(!confirmReset())return;state.family=b.dataset.family;state.model=null;state.placements={};state.portAssignments={};state.links={};state.maxStep=0;state.slot='in-a'}changed();return}if(b.dataset.model){if(state.model!==b.dataset.model){if(!confirmReset())return;state.model=b.dataset.model;state.placements={};state.portAssignments={};state.links={};state.maxStep=1}changed();return}if(b.dataset.slot){state.slot=b.dataset.slot;changed();return}if(b.dataset.card){if(state.placements[state.slot]===b.dataset.card)return;state.placements[state.slot]=b.dataset.card;delete state.links[state.slot];syncPorts();changed();return}if(b.dataset.format){state.format=b.dataset.format;changed();return}if(b.dataset.jump!==undefined){const n=Number(b.dataset.jump);if(n<=state.maxStep){state.step=n;changed()}return}if(b.dataset.action==='remove'){delete state.placements[state.slot];delete state.links[state.slot];syncPorts();changed();return}if(b.dataset.action==='back'){state.step=Math.max(0,state.step-1);changed();return}if(b.dataset.action==='next'){state.step=state.step===5?0:state.step+1;state.maxStep=Math.max(state.maxStep,state.step);changed()}});
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
      return `<section class="rt-validation" aria-label="검토 결과"><h3>검토 결과 <span class="rt-pill">${names[result.status]}</span></h3><p>요구량 충족 여부와 제조사 근거의 확인 상태를 구분해서 표시합니다.</p><ul>${result.issues.map(i=>`<li data-level="${i.level}"><strong>${names[i.level]}</strong><span>${esc(i.message)}${i.evidence?` <small>근거: ${esc(i.evidence)}</small>`:''}</span></li>`).join('')}</ul><a href="docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md" target="_blank" rel="noopener">제품 근거 및 확인 필요 사항 보기 ↗</a></section>`;
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
      const rows=slots.filter(s=>slotCard(s.id)).map(s=>{
        const c=slotCard(s.id),l=state.links[s.id];
        return `<tr><td>${s.label}</td><td>${esc(c[0])}</td><td>${c[2]}</td><td>${l?.device?esc(l.device):'미지정'}</td><td>${l?.device?l.count:0}</td><td>${l?.device?esc(l.distance)+' m':'—'}</td></tr>`;
      }).join('');
      const requirementRows=RtCore.requirementSummary(state).map(row=>`<tr><td>${row.direction==='input'?'입력':'출력'}</td><td>${esc(row.signalType)}</td><td>${row.required}</td><td>${row.configured}</td><td>${row.shortage?`부족 ${row.shortage}`:'충족'}</td></tr>`).join('');
      const portRows=Object.values(state.portAssignments).map(port=>`<tr><td>${esc(port.cardId)}</td><td>${esc(port.portId)}</td><td>${port.quantity?'사용':'예비'}</td><td>${esc(port.signalType)}</td><td>${esc(port.assignedDevice||'미지정')}</td><td>${esc(port.tx||port.rx||'미지정')}</td><td>${port.verificationStatus==='DOCUMENTED'?'근거 있음':'미확정'}</td></tr>`).join('');
      document.getElementById('print-report').innerHTML=`<h1>RTCOM Matrix Configuration</h1><p><strong>미검증 검토용 초안 · 설치 및 구매 승인 자료가 아닙니다.</strong></p><p>${esc(state.family)} / ${esc(state.model||'섀시 미선택')} · ${new Date().toLocaleString('ko-KR')}</p><h2>요구량 대비 구성</h2><table><thead><tr><th>방향</th><th>신호</th><th>필요</th><th>구성</th><th>상태</th></tr></thead><tbody>${requirementRows||'<tr><td colspan="5">입력된 요구량이 없습니다.</td></tr>'}</tbody></table><h2>장비 목록</h2>${table()}<h2>개념 배치 및 전송기 연결</h2><p>입력·출력 각 2칸은 실제 슬롯 수 또는 물리 위치를 의미하지 않습니다.</p><table><thead><tr><th>개념 위치</th><th>카드</th><th>포트 수</th><th>전송기 / 역할</th><th>수량</th><th>거리</th></tr></thead><tbody>${rows}</tbody></table><h2>포트 배정</h2><table><thead><tr><th>카드</th><th>포트</th><th>사용</th><th>신호</th><th>대상</th><th>TX/RX</th><th>검증</th></tr></thead><tbody>${portRows}</tbody></table>${validationView()}<p>카탈로그 버전: ${RtCore.catalogVersion} · 케이블·전원·기본 포함품은 별도 확인이 필요합니다.</p>`;
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
