/* 0.245 VDM-QOS4S-U 쿼드뷰 시뮬레이터(제품정보 VDM 시리즈 "07 쿼드뷰 시뮬레이터" 카드와 카드 상세 팝업).
   근거: VDM 국문 사용자 매뉴얼 KV07(output/design/assets/docs/vdm-manual.pdf)
     - 43쪽 VDM-QOS4S-U 사양: HDMI 2포트, 입력 신호 "VDM 매트릭스 입력 중 4개", 최대 3840x2160@30Hz
     - 63쪽 설정 화면 "7) Multiview": 출력 번호·Timing·화면 레이아웃(Format C1~C4 도해 8종)을 고르고 Enter
     - 82·83쪽 OQ 커맨드: *255OQO01T00!(타이밍), *255OQO01L05!(레이아웃), L1~L4 채널 1~4 단독 · L5 쿼드뷰 · L6 왼쪽 1+오른쪽 3 · L7 좌우 · L8 위 1+아래 3
   레이아웃 도해 비율은 63쪽 화면의 Format 그림을 따른다(L6은 C1이 가로 약 75%, L8은 C1이 세로 약 75%, L7은 좌우 반반).
   매뉴얼에 없는 것: C1~C4가 카드의 어느 출력 포트에 대응하는지, OQ 출력 번호가 카드 포트와 어떻게 대응하는지.
   63쪽 설정 화면은 카드가 쓰는 포트를 "S2 : 5, 6, 7, 8"처럼 4개로 보여 줄 뿐이라, 입력 연결(C) 명령의 출력 번호는
   사용자가 정한 "카드 첫 출력 포트"부터 C1~C4를 순서대로 둔 예시로만 만든다(화면에도 같은 안내를 적고 알티컴 확인 대기로 둔다).
   순수 함수(layoutOf·commandsFor 등)는 Node 테스트(tests/quad-view.test.cjs)에서도 쓰므로 DOM을 건드리지 않는다.
   mountAll(scopeEl)은 [data-quad-view-root] 자리에만 그린다. 그림은 src/products.js의 globalThis.RtMonitorLayoutSvg(QMS 화면 구성 모드와 같은 모니터 그림)를 쓴다. */
(function(scope,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  scope.RtQuadView=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const esc=text=>String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const padN=(n,w)=>String(n).padStart(w,'0');
  const KEY='rtcom.quadView.v1';
  const DEFAULT_ID='255';
  // 채널 색은 QMS 화면 구성 모드 도해(LAYOUT_COLORS)의 앞 4개와 같다.
  const COLORS=['#2f7cf6','#f08c1a','#1fb45a','#9b51e0'];
  // 매뉴얼 63쪽 Format 그림 8개와 82·83쪽 L1~L8. cells는 [채널 번호, x, y, 폭, 높이](0~100)이다.
  const LAYOUTS=[
    {n:1,name:'채널 1 전체',en:'Channel 1 View',desc:'C1 한 입력을 전체 화면으로',cells:[[1,0,0,100,100]]},
    {n:2,name:'채널 2 전체',en:'Channel 2 View',desc:'C2 한 입력을 전체 화면으로',cells:[[2,0,0,100,100]]},
    {n:3,name:'채널 3 전체',en:'Channel 3 View',desc:'C3 한 입력을 전체 화면으로',cells:[[3,0,0,100,100]]},
    {n:4,name:'채널 4 전체',en:'Channel 4 View',desc:'C4 한 입력을 전체 화면으로',cells:[[4,0,0,100,100]]},
    {n:5,name:'쿼드뷰',en:'Quad view',desc:'입력 4개를 4분할로 나란히',cells:[[1,0,0,50,50],[2,50,0,50,50],[3,0,50,50,50],[4,50,50,50,50]]},
    {n:6,name:'왼쪽 1 · 오른쪽 3',en:'One Input on the left and three Inputs on the right',desc:'왼쪽 큰 화면 1개와 오른쪽 작은 화면 3개',cells:[[1,0,0,75,100],[2,75,0,25,33.33],[3,75,33.33,25,33.34],[4,75,66.67,25,33.33]]},
    {n:7,name:'좌우 2분할',en:'Side by Side',desc:'입력 2개를 좌우로 나란히',cells:[[1,0,0,50,100],[2,50,0,50,100]]},
    {n:8,name:'위 1 · 아래 3',en:'One Input on the top and three Inputs on the bottom',desc:'위 큰 화면 1개와 아래 작은 화면 3개',cells:[[1,0,0,100,75],[2,0,75,33.33,25],[3,33.33,75,33.34,25],[4,66.67,75,33.33,25]]}
  ].map(l=>({...l,code:`L${padN(l.n,2)}`,channels:[...new Set(l.cells.map(c=>c[0]))].sort((a,b)=>a-b)}));
  // 매뉴얼 82쪽 OQ 타이밍 표 T00~T24.
  const TIMINGS=[['T00','Auto'],['T01','480p (60Hz)'],['T02','576p (50Hz)'],['T03','720p (50Hz)'],['T04','720p (59Hz)'],['T05','720p (60Hz)'],['T06','1080i (50Hz)'],['T07','1080i (59Hz)'],['T08','1080i (60Hz)'],['T09','1080p (50Hz)'],['T10','1080p (59Hz)'],['T11','1080p (60Hz)'],['T12','SVGA (800x600@60Hz)'],['T13','SVGA (800x600@75Hz)'],['T14','XGA (1024x768@60Hz)'],['T15','XGA (1024x768@75Hz)'],['T16','XGA (1024x768@85Hz)'],['T17','SXGA (1280x1024@60Hz)'],['T18','SXGA (1280x1024@75Hz)'],['T19','SXGA (1280x1024@85Hz)'],['T20','UXGA (1600x1200@60Hz)'],['T21','1360x768@60Hz'],['T22','1366x768@60Hz'],['T23','1440x900@60Hz'],['T24','1920x1200@60Hz']].map(([code,label])=>({code,label}));
  const FIELD_NOTE='C1~C4가 연결되는 출력 포트 번호와 OQ 출력 번호가 카드 포트와 어떻게 대응하는지는 매뉴얼에 적혀 있지 않아 알티컴 확인 대기 중입니다. 입력 연결(C) 명령은 "카드 첫 출력 포트"부터 C1~C4를 순서대로 둔 예시이니, 현장 설정 화면(매뉴얼 63쪽의 "슬롯 S2 : 5, 6, 7, 8" 표시)의 포트에 맞춰 바꾸세요.';

  const layoutOf=code=>LAYOUTS.find(l=>l.code===code||l.n===Number(code))||LAYOUTS[4];
  const timingOf=code=>TIMINGS.find(t=>t.code===code)||TIMINGS[0];
  function normalize(raw){
    const s=raw&&typeof raw==='object'?raw:{};
    const num=(v,lo,hi,d)=>{const n=Math.round(Number(v));return Number.isFinite(n)?clamp(n,lo,hi):d};
    const inputs=[0,1,2,3].map(i=>num(Array.isArray(s.inputs)?s.inputs[i]:undefined,1,256,i+1));
    return {
      out:num(s.out,1,256,1),
      pad:Number(s.pad)===3?3:2,
      layout:layoutOf(s.layout).code,
      timing:timingOf(s.timing).code,
      inputs,
      firstPort:num(s.firstPort,1,253,5),
      withRoute:s.withRoute!==false,
      id:/^\d{1,3}$/.test(String(s.id??''))?String(s.id):DEFAULT_ID
    };
  }
  // 명령 문자열: 입력 연결 *255CI01O05!, 타이밍 *255OQO01T00!, 레이아웃 *255OQO01L05!(매뉴얼 82·83쪽 예시와 같은 형식, 끝에 Enter 0x0D).
  function commandsFor(raw){
    const s=normalize(raw),L=layoutOf(s.layout),T=timingOf(s.timing),w=s.pad;
    const lines=[],warnings=[];
    const over=[s.out,...(s.withRoute?[...L.channels.map(c=>s.inputs[c-1]),s.firstPort+L.channels.length-1]:[])].some(n=>n>99);
    if(w===2&&over)warnings.push('번호가 99를 넘으면 "번호 자릿수"를 3자리로 바꾸세요(VDM-128X·256X).');
    if(s.withRoute){
      for(const c of L.channels){
        const inp=s.inputs[c-1],port=s.firstPort+c-1;
        lines.push({kind:'route',label:`입력 연결 · C${c} ← 입력 ${inp}(출력 ${port}번)`,text:`*${s.id}CI${padN(inp,w)}O${padN(port,w)}!`,channel:c});
      }
    }
    lines.push({kind:'timing',label:`출력 타이밍 · ${T.code} ${T.label}`,text:`*${s.id}OQO${padN(s.out,w)}${T.code}!`});
    lines.push({kind:'layout',label:`레이아웃 · ${L.code} ${L.name}`,text:`*${s.id}OQO${padN(s.out,w)}${L.code}!`});
    return {state:s,layout:L,timing:T,lines,warnings};
  }
  // 도해: 칸 번호 자리에 입력 번호(IN n)를 적고, 칸 색은 채널(C1~C4)로 구분한다.
  function figureHtml(layout,opts={}){
    const make=globalThis.RtMonitorLayoutSvg;
    if(typeof make!=='function')return '';
    const labels=opts.inputs?Object.fromEntries(layout.channels.map(c=>[c,`IN${opts.inputs[c-1]}`])):Object.fromEntries(layout.channels.map(c=>[c,`C${c}`]));
    return make(layout.cells,{labels,cellClass:'rt-qv-cell',label:opts.aria?`aria-label="${esc(`${layout.code} ${layout.name}`)}"`:''});
  }
  // 정적 도해 카드 8장(카드 상세 팝업·시뮬레이터 레이아웃 선택에 같이 쓴다).
  function layoutCardsHtml(opts={}){
    const cur=opts.selected;
    return LAYOUTS.map(l=>{
      const body=`<span class="rt-hos-fig">${figureHtml(l,opts)}</span><span class="rt-hos-meta"><strong>${l.code} · ${esc(l.name)}</strong><span class="rt-hos-layers">입력 ${l.channels.length}개</span></span><span class="rt-qv-desc">${esc(l.desc)}</span>`;
      return opts.button
        ?`<li class="rt-hos-layout rt-qv-layout${cur===l.code?' is-on':''}"><button type="button" data-qv-layout="${l.code}" aria-pressed="${cur===l.code}">${body}</button></li>`
        :`<li class="rt-hos-layout rt-qv-layout">${body}</li>`;
    }).join('');
  }
  const channelLegendHtml=(layout,inputs)=>`<ul class="rt-qv-legend" aria-label="채널과 입력">${layout.channels.map(c=>`<li><i style="background:${COLORS[c-1]}"></i>C${c}${inputs?` ← 입력 ${inputs[c-1]}`:''}</li>`).join('')}</ul>`;

  function load(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return normalize(null)}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
  function ceInfo(scopeEl){
    // 같은 화면의 AMX 카드([data-control-example])에서 제품 ID(255)와 장바구니 id(vdm)를 읽는다. 없으면 기본값을 쓴다.
    try{const el=(scopeEl||document).querySelector('[data-control-example]');if(el){const spec=JSON.parse(el.dataset.controlExample);return {id:String(spec.productId||DEFAULT_ID),basketId:spec.id||'vdm'}}}catch{}
    return {id:DEFAULT_ID,basketId:'vdm'};
  }
  function mount(root,scopeEl){
    if(!root||root.dataset.quadViewMounted)return;
    root.dataset.quadViewMounted='1';
    const info=ceInfo(scopeEl);
    let st={...load(),id:info.id};
    const option=(v,label,cur)=>`<option value="${esc(v)}"${String(v)===String(cur)?' selected':''}>${esc(label)}</option>`;
    const canBasket=()=>!!(globalThis.RtControlExample&&globalThis.RtControlExample.basket);
    let lastLines=[];
    let advOpen=false; // "고급 설정" 펼침 상태(화면을 다시 그려도 유지)
    // 0.247(사용자 지적 2026-10-17 "07 부분은 좀 이해가 안되 xdm처럼 개선해줘"): 8장 큰 카드 + 입력칸 여러 개 + 명령이 한꺼번에 길게 이어져 알기 어려웠다.
    // XDM 시뮬레이터처럼 "① 모양 고르기 → ② 칸마다 넣을 입력 → ③ 커맨드" 3단계로 나누고, 작은 그림 8개 + 큰 미리보기 1개로 줄이고, 잘 안 쓰는 설정은 "고급 설정"으로 접는다.
    const thumbsHtml=selected=>LAYOUTS.map(l=>`<li class="rt-qv-thumb${selected===l.code?' is-on':''}"><button type="button" data-qv-layout="${l.code}" aria-pressed="${selected===l.code}" aria-label="${esc(`${l.code} ${l.name}`)}"><span class="rt-qv-thumbfig">${figureHtml(l,{inputs:st.inputs})}</span><b>${l.code}</b><small>${esc(l.name)}</small></button></li>`).join('');
    const render=()=>{
      // 다시 그리기 직전에 화면의 실제 펼침 상태를 읽는다(toggle 이벤트는 늦게 오므로 그것만 믿으면 방금 연 상자가 닫힌 채로 다시 그려질 수 있다).
      const curAdv=root.querySelector('[data-qv-adv]');if(curAdv)advOpen=curAdv.open;
      const r=commandsFor(st),L=r.layout;
      lastLines=r.lines;
      root.innerHTML=`<ol class="rt-sim-steps" aria-label="사용 순서"><li><b>1</b>모양 고르기</li><li><b>2</b>칸마다 넣을 입력 정하기</li><li><b>3</b>커맨드 복사 또는 AMX 구성에 담기</li></ol>
      <h4 class="rt-sim-h"><span>1</span>모양을 고르세요 <small>누르면 아래 그림과 커맨드가 바뀝니다</small></h4>
      <ul class="rt-qv-thumbs" aria-label="쿼드뷰 레이아웃 8종">${thumbsHtml(L.code)}</ul>
      <div class="rt-qv-stage"><div class="rt-qv-preview" aria-live="polite"><p class="rt-qv-pname"><b>${L.code} · ${esc(L.name)}</b> <span>${esc(L.desc)}</span></p>${figureHtml(L,{inputs:st.inputs,aria:true})}${channelLegendHtml(L,st.inputs)}</div>
      <div class="rt-qv-side">
        <h4 class="rt-sim-h"><span>2</span>칸마다 넣을 입력 <small>입력 번호(1~256)</small></h4>
        <div class="rt-qv-inputs">${L.channels.map(c=>`<label class="rt-qv-inrow"><i style="background:${COLORS[c-1]}"></i><span>C${c} 칸</span><input type="number" min="1" max="256" data-qv-in="${c-1}" value="${st.inputs[c-1]}" aria-label="C${c} 칸에 넣을 입력 번호"></label>`).join('')}</div>
        <div class="rt-ls-controls rt-qv-controls"><label>출력 해상도(타이밍)<select data-qv="timing">${TIMINGS.map(t=>option(t.code,`${t.code} · ${t.label}`,st.timing)).join('')}</select></label></div>
        <details class="rt-qv-adv" data-qv-adv${advOpen?' open':''}><summary>고급 설정 <small>출력 번호 · 번호 자릿수 · 입력 연결 명령</small></summary>
          <div class="rt-ls-controls rt-qv-controls">
            <label>쿼드뷰 출력 번호<input type="number" min="1" max="256" data-qv="out" value="${st.out}"></label>
            <label>번호 자릿수<select data-qv="pad">${option(2,'2자리(대부분의 VDM)',st.pad)}${option(3,'3자리(VDM-128X·256X)',st.pad)}</select></label>
            <label class="rt-ls-check"><input type="checkbox" data-qv="withRoute"${st.withRoute?' checked':''}> 입력 연결(C) 명령도 만들기</label>
            ${st.withRoute?`<label>카드 첫 출력 포트<input type="number" min="1" max="253" data-qv="firstPort" value="${st.firstPort}"></label>`:''}
          </div></details>
      </div></div>
      <h4 class="rt-sim-h"><span>3</span>커맨드 <small>${r.lines.length}줄 · 위에서 아래 순서로 보냅니다</small></h4>
      <div class="rt-ls-cmd-head"><button type="button" class="rt-pg-btn" data-qv-copy>전부 복사</button>${canBasket()?'<button type="button" class="rt-pg-btn rt-pg-primary" data-qv-amx title="이 커맨드를 아래 AMX 통합 제어 카드의 &quot;내 AMX 구성&quot;에 담습니다">AMX 구성에 담기</button>':''}<span class="rt-ls-copied" data-qv-note aria-live="polite"></span></div>
      <pre class="rt-ls-cmd" data-qv-cmd>${r.lines.map((l,i)=>`<span class="rt-ls-cmdline"><small>${i+1}. ${esc(l.label)}</small>${esc(l.text)}</span>`).join('\n')}</pre>
      <p class="rt-pg-hint">한 줄씩 보내고 각 줄 끝에 Enter(0x0D)를 붙입니다. 입력 연결(C)은 칸에 입력을 넣는 명령, 타이밍(OQ)은 출력 해상도, 레이아웃(OQ)은 위에서 고른 모양입니다. 제품 ID(${esc(st.id)})는 아래 AMX 카드와 같고, 번호 자릿수는 고급 설정에서 따로 고릅니다. 매뉴얼 63쪽 설정 화면의 Timing·Format과 같은 항목입니다.</p>
      ${r.warnings.length?`<ul class="rt-ls-warn">${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:''}
      <p class="rt-pg-hint rt-qv-field">※ ${esc(FIELD_NOTE)}</p>`;
    };
    const flash=text=>{const n=root.querySelector('[data-qv-note]');if(n){n.textContent=text;setTimeout(()=>{if(n.isConnected)n.textContent=''},2500)}};
    root.addEventListener('click',event=>{
      const lay=event.target.closest('[data-qv-layout]');
      if(lay){st={...st,layout:lay.dataset.qvLayout};save(st);render();root.querySelector(`[data-qv-layout="${st.layout}"]`)?.focus({preventScroll:true});return}
      if(event.target.closest('[data-qv-copy]')){
        const text=lastLines.map(l=>l.text).join('\n');
        if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>flash('복사했습니다'),()=>flash('복사하지 못했습니다. 직접 선택해 복사하세요.'));
        else{const pre=root.querySelector('[data-qv-cmd]');const rg=document.createRange();rg.selectNodeContents(pre);const sl=getSelection();sl.removeAllRanges();sl.addRange(rg);flash('선택했습니다. 복사하세요.')}
        return;
      }
      if(event.target.closest('[data-qv-amx]')&&canBasket()){
        const items=lastLines.map(l=>({label:l.label.slice(0,80),text:l.text,enter:true,source:'쿼드뷰'}));
        const res=globalThis.RtControlExample.basket.add(info.basketId,items);
        flash(res.added?`구성에 ${res.added}줄을 담았습니다(지금 ${res.list.length}개)`:res.full?'구성이 가득 찼습니다(최대 60개)':'이미 담겨 있습니다');
      }
    });
    root.addEventListener('toggle',event=>{const d=event.target;if(d&&d.matches&&d.matches('[data-qv-adv]'))advOpen=d.open},true);
    root.addEventListener('change',event=>{
      const f=event.target.closest('[data-qv]'),inp=event.target.closest('[data-qv-in]');
      if(inp){const next=[...st.inputs];next[Number(inp.dataset.qvIn)]=inp.value;st=normalize({...st,inputs:next});save(st);render();return}
      if(!f)return;
      const key=f.dataset.qv;
      st=normalize({...st,[key]:f.type==='checkbox'?f.checked:f.value});save(st);render();
    });
    render();
  }
  function mountAll(scopeEl){(scopeEl||document).querySelectorAll('[data-quad-view-root]').forEach(el=>mount(el,scopeEl))}
  return {LAYOUTS,TIMINGS,FIELD_NOTE,COLORS,layoutOf,timingOf,normalize,commandsFor,figureHtml,layoutCardsHtml,channelLegendHtml,mount,mountAll};
});
