/* 0.202 — XDM 화면 연출 시뮬레이터(1차: XDM-WOS100 월 오버레이).
   디스플레이 월 위에 창(입력 영상)을 끌어 놓으면 그 좌표·크기대로 영상을 띄우는 제어 커맨드를 가이드 문법 그대로 만든다.
   근거: 사용자 제공 "RTcom XDM 시리즈 Command Guide 1013"(input_doc/RTCOM/manual/RTcom_Manual_XDM_CommandGuide1013.pdf, 로컬 보관·배포 제외)
     - 44~55쪽 "XDM-WOS100 Wall Overlay Command": *255OW O001-008 W10 H03V02 P4321 [O…X0Y0W0H0 레이어 지우기] I001 O001 X0Y0 W2880 H2160 …!
     - 45~47쪽 Wall Port Connection 그림: 출력 슬롯 1장(포트 4개)이 디스플레이 2×2 블록을 맡고, 블록은 왼쪽→오른쪽, 위→아래로 이어진다.
     - 창 하나는 걸치는 슬롯마다 포트 1개를 쓴다(가이드 예제 1~8·사용자 메모 2026-10-16: 남은 포트 중 가장 작은 번호).
     - 사용자 현장 메모(2026-10-16): 레이어 지우기를 O000 한 토막으로 쓰는 방식(*255OWO009-012W14H01V01P4321O000I001O009X0Y295W1920H1571…!).
   순수 함수(geometry·portMapFor·assignPorts·commandFor·coverageFor·PRESETS)는 Node 테스트(tests/layout-sim.test.cjs)에서도 쓰므로 DOM을 건드리지 않는다.
   mount()·mountAll()은 브라우저에서 제품정보(XDM 시리즈) 화면의 "07 화면 연출 시뮬레이터" 카드 안에만 그린다(src/products.js). */
(function(scope,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  scope.RtLayoutSim=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // 가이드 45쪽 W 파라미터 표(Wall mode & Timing). wall:false는 "Not support"로 적힌 값.
  const TIMINGS=[
    {code:1,label:'720x480p@60',w:720,h:480,wall:false},
    {code:2,label:'720x576p@50',w:720,h:576,wall:false},
    {code:3,label:'1280x720p@29',w:1280,h:720,wall:true},
    {code:4,label:'1280x720p@50',w:1280,h:720,wall:true},
    {code:5,label:'1280x720p@59',w:1280,h:720,wall:true},
    {code:6,label:'1280x720p@60',w:1280,h:720,wall:true},
    {code:7,label:'1920x1080p@29',w:1920,h:1080,wall:true},
    {code:8,label:'1920x1080p@50',w:1920,h:1080,wall:true},
    {code:9,label:'1920x1080p@59',w:1920,h:1080,wall:true},
    {code:10,label:'1920x1080p@60',w:1920,h:1080,wall:true},
    {code:11,label:'3840x2160p@29',w:3840,h:2160,wall:true},
    {code:12,label:'3840x2160p@50',w:3840,h:2160,wall:true},
    {code:13,label:'3840x2160p@59',w:3840,h:2160,wall:true},
    {code:14,label:'3840x2160p@60',w:3840,h:2160,wall:true},
    {code:15,label:'1024x768p@60',w:1024,h:768,wall:false},
    {code:16,label:'1280x1024p@60',w:1280,h:1024,wall:false},
    {code:17,label:'1920x1200p@60',w:1920,h:1200,wall:false}
  ];
  const CLEAR_MODES=[
    {id:'list',label:'가이드 방식(포트 전체 + X0Y0W0H0)'},
    {id:'o000',label:'현장 메모 방식(O000)'},
    {id:'none',label:'넣지 않음'}
  ];
  const WINDOW_COLORS=['#007AFF','#34C759','#FF9F0A','#BF5AF2','#FF375F','#30B0C7','#5E5CE6','#E08A20','#1E9E52','#8E8E93'];
  const MAX_COLS=6,MAX_ROWS=3,MAX_WINDOWS=12;
  const pad3=n=>String(n).padStart(3,'0');
  const pad2=n=>String(n).padStart(2,'0');
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const int=(v,fallback)=>{const n=Math.round(Number(v));return Number.isFinite(n)?n:fallback};
  const timingOf=code=>TIMINGS.find(t=>t.code===code)||TIMINGS[9];

  const DEFAULTS={id:255,cols:3,rows:2,timing:10,startPort:1,priority:'4321',clear:'list',snap:true,windows:[]};
  function normalize(input){
    const s={...DEFAULTS,...(input||{})};
    s.id=clamp(int(s.id,255),1,999);
    s.cols=clamp(int(s.cols,3),1,MAX_COLS);
    s.rows=clamp(int(s.rows,2),1,MAX_ROWS);
    s.timing=timingOf(int(s.timing,10)).code;
    // 월의 첫 출력 포트는 슬롯의 첫 포트(1·5·9…)여야 한다(가이드 예제·사용자 메모 O009-012).
    s.startPort=Math.max(1,Math.round((clamp(int(s.startPort,1),1,213)-1)/4)*4+1);
    s.priority=s.priority==='1234'?'1234':'4321';
    s.clear=CLEAR_MODES.some(m=>m.id===s.clear)?s.clear:'list';
    s.snap=s.snap!==false;
    s.windows=(Array.isArray(s.windows)?s.windows:[]).slice(0,MAX_WINDOWS).map((w,i)=>({
      input:clamp(int(w.input,i+1),1,999),
      label:String(w.label||'').slice(0,24),
      x:Math.max(0,int(w.x,0)),y:Math.max(0,int(w.y,0)),
      w:Math.max(0,int(w.w,0)),h:Math.max(0,int(w.h,0))
    }));
    return s;
  }
  // 월 전체 크기와 슬롯 블록(디스플레이 2×2 = 출력 포트 4개) 계산.
  function geometry(state){
    const s=normalize(state),t=timingOf(s.timing);
    const blockCols=Math.ceil(s.cols/2),blockRows=Math.ceil(s.rows/2),slots=blockCols*blockRows;
    return {cols:s.cols,rows:s.rows,outW:t.w,outH:t.h,width:s.cols*t.w,height:s.rows*t.h,blockCols,blockRows,slots,startPort:s.startPort,endPort:s.startPort+slots*4-1,timing:t};
  }
  const slotIndex=(geo,r,c)=>Math.floor(r/2)*geo.blockCols+Math.floor(c/2);
  // 디스플레이 칸(r,c)이 연결되는 출력 포트: 슬롯 첫 포트 + (블록 안 위치: 왼쪽 위 0, 오른쪽 위 1, 왼쪽 아래 2, 오른쪽 아래 3).
  const cellPort=(geo,r,c)=>geo.startPort+slotIndex(geo,r,c)*4+(r%2)*2+(c%2);
  function portMapFor(state){
    const geo=geometry(state);const map=[];
    for(let r=0;r<geo.rows;r++){const row=[];for(let c=0;c<geo.cols;c++)row.push(cellPort(geo,r,c));map.push(row)}
    return map;
  }
  const rectsOverlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  function slotRect(geo,slot){
    const br=Math.floor(slot/geo.blockCols),bc=slot%geo.blockCols;
    const c0=bc*2,c1=Math.min(geo.cols,c0+2),r0=br*2,r1=Math.min(geo.rows,r0+2);
    return {x:c0*geo.outW,y:r0*geo.outH,w:(c1-c0)*geo.outW,h:(r1-r0)*geo.outH};
  }
  function slotsUnder(geo,win){
    const list=[];
    for(let slot=0;slot<geo.slots;slot++)if(win.w>0&&win.h>0&&rectsOverlap(win,slotRect(geo,slot)))list.push(slot);
    return list;
  }
  // 창마다 걸치는 슬롯에서 아직 쓰지 않은 가장 작은 포트를 하나씩 배정한다(가이드 예제 2·3·8, 사용자 메모 창 2 → O010).
  function assignPorts(state){
    const s=normalize(state),geo=geometry(s);
    const used=new Set();
    return s.windows.map((win,index)=>{
      const slots=slotsUnder(geo,win),ports=[],missing=[];
      for(const slot of slots){
        const first=geo.startPort+slot*4;
        let pick=null;
        for(let p=first;p<first+4;p++)if(!used.has(p)){pick=p;break}
        if(pick===null)missing.push(slot+1);else{used.add(pick);ports.push(pick)}
      }
      return {index,slots,ports,missing};
    });
  }
  function clearSegment(geo,mode){
    if(mode==='o000')return 'O000';
    if(mode==='none')return '';
    let text='';for(let p=geo.startPort;p<=geo.endPort;p++)text+=`O${pad3(p)}`;
    return text+'X0Y0W0H0';
  }
  // 커맨드 문자열과 토막(parts: 화면에서 색을 입히기 위한 구분), 경고 목록.
  function commandFor(state){
    const s=normalize(state),geo=geometry(s),assigned=assignPorts(s);
    const warnings=[];
    if(!geo.timing.wall)warnings.push(`출력 해상도 ${geo.timing.label}(W${pad2(geo.timing.code)})은 가이드에 "Not support"로 적혀 있습니다. 월 모드를 지원하는 해상도를 고르세요.`);
    const parts=[
      {kind:'head',text:`*${s.id}OW`,title:`시작(*) · 장비 ID ${s.id} · OW(월 오버레이 설정)`},
      {kind:'range',text:`O${pad3(geo.startPort)}-${pad3(geo.endPort)}`,title:`월에 쓰는 출력 포트 전체 ${geo.startPort}~${geo.endPort}번(슬롯 ${geo.slots}장)`},
      {kind:'timing',text:`W${pad2(geo.timing.code)}`,title:`월 모드 켬 · 출력 해상도 ${geo.timing.label}`},
      {kind:'grid',text:`H${pad2(geo.cols)}V${pad2(geo.rows)}`,title:`디스플레이 가로 ${geo.cols} × 세로 ${geo.rows}`},
      {kind:'priority',text:`P${s.priority}`,title:s.priority==='4321'?'겹칠 때 포트 4번 영상이 맨 위(4 > 3 > 2 > 1)':'겹칠 때 포트 1번 영상이 맨 위(1 > 2 > 3 > 4)'}
    ];
    const clear=clearSegment(geo,s.clear);
    if(clear)parts.push({kind:'clear',text:clear,title:s.clear==='o000'?'이전 화면 지우기(O000, 현장 메모 방식)':'모든 레이어 지우기(가이드 방식: 포트 전체 + X0Y0W0H0)'});
    s.windows.forEach((win,i)=>{
      const a=assigned[i];
      if(win.w<=0||win.h<=0){warnings.push(`창 ${i+1}(입력 ${win.input}): 너비·높이가 0이라 커맨드에 넣지 않았습니다.`);return}
      if(win.x+win.w>geo.width||win.y+win.h>geo.height)warnings.push(`창 ${i+1}(입력 ${win.input}): 월 바깥(${geo.width}×${geo.height})으로 나갑니다. 좌표나 크기를 줄이세요.`);
      if(a.missing.length)warnings.push(`창 ${i+1}(입력 ${win.input}): 슬롯 ${a.missing.join('·')}의 포트 4개를 다른 창이 모두 쓰고 있어 포트를 배정하지 못했습니다(슬롯 1장에는 창 4개까지).`);
      if(!a.ports.length)return;
      parts.push({kind:'window',window:i,text:`I${pad3(win.input)}${a.ports.map(p=>`O${pad3(p)}`).join('')}X${win.x}Y${win.y}W${win.w}H${win.h}`,
        title:`창 ${i+1}: 입력 ${win.input}${win.label?`(${win.label})`:''} → 출력 포트 ${a.ports.join('·')} · 시작 (${win.x}, ${win.y}) · 크기 ${win.w}×${win.h}`});
    });
    parts.push({kind:'end',text:'!',title:'끝(!) · 전송할 때 Ctrl+Enter(0x0D)'});
    for(let i=0;i<s.windows.length;i++)for(let j=i+1;j<s.windows.length;j++){
      const a=s.windows[i],b=s.windows[j];
      if(a.w>0&&a.h>0&&b.w>0&&b.h>0&&rectsOverlap(a,b)){warnings.push(`창 ${i+1}과 창 ${j+1}이 겹칩니다. 위아래는 우선순위 P${s.priority}(포트 번호 순)로 정해집니다.`);}
    }
    return {command:parts.map(p=>p.text).join(''),parts,warnings,geometry:geo,assigned};
  }
  // 창마다 어느 디스플레이(출력 포트)에 어느 영역이 나오는지(디스플레이 안 좌표 기준).
  function coverageFor(state){
    const s=normalize(state),geo=geometry(s),map=portMapFor(s);
    return s.windows.map((win,i)=>{
      const cells=[];
      for(let r=0;r<geo.rows;r++)for(let c=0;c<geo.cols;c++){
        const cell={x:c*geo.outW,y:r*geo.outH,w:geo.outW,h:geo.outH};
        if(!(win.w>0&&win.h>0&&rectsOverlap(win,cell)))continue;
        const x0=Math.max(win.x,cell.x),y0=Math.max(win.y,cell.y),x1=Math.min(win.x+win.w,cell.x+cell.w),y1=Math.min(win.y+win.h,cell.y+cell.h);
        cells.push({row:r+1,col:c+1,port:map[r][c],x:x0-cell.x,y:y0-cell.y,w:x1-x0,h:y1-y0,full:x1-x0===geo.outW&&y1-y0===geo.outH});
      }
      return {index:i,input:win.input,label:win.label,cells};
    });
  }
  // 프리셋: 가이드 예제(쪽 번호)와 사용자 현장 메모. expected는 가이드·메모에 적힌 커맨드 원문(테스트 기준).
  const PRESETS=[
    {id:'guide-2',name:'가이드 예제 2 · 4×2 월, 가운데 2×2에 입력 1(1080p)',source:'Command Guide 48쪽',
      state:{cols:4,rows:2,timing:10,startPort:1,priority:'4321',clear:'list',windows:[{input:1,label:'',x:1920,y:0,w:3840,h:2160}]},
      expected:'*255OWO001-008W10H04V02P4321O001O002O003O004O005O006O007O008X0Y0W0H0I001O001O005X1920Y0W3840H2160!'},
    {id:'guide-3',name:'가이드 예제 3 · 6×2 월 전체에 입력 1(1080p)',source:'Command Guide 48쪽',
      state:{cols:6,rows:2,timing:10,startPort:1,priority:'4321',clear:'list',windows:[{input:1,label:'',x:0,y:0,w:11520,h:2160}]},
      expected:'*255OWO001-012W10H06V02P4321O001O002O003O004O005O006O007O008O009O010O011O012X0Y0W0H0I001O001O005O009X0Y0W11520H2160!'},
    {id:'guide-1',name:'가이드 예제 1 · 3×2 월을 좌우 2개로(입력 1·2)',source:'Command Guide 47쪽',
      state:{cols:3,rows:2,timing:10,startPort:1,priority:'4321',clear:'list',windows:[{input:1,label:'',x:0,y:0,w:2880,h:2160},{input:2,label:'',x:2880,y:0,w:2880,h:2160}]}},
    {id:'guide-8',name:'가이드 예제 8 · 6×3 월, 위 2단 4K 3개 + 아래 1단 FHD 6개',source:'Command Guide 54~55쪽',
      state:{cols:6,rows:3,timing:10,startPort:1,priority:'4321',clear:'list',windows:[
        {input:1,label:'',x:0,y:0,w:3840,h:2160},{input:2,label:'',x:3840,y:0,w:3840,h:2160},{input:3,label:'',x:7680,y:0,w:3840,h:2160},
        {input:4,label:'',x:0,y:2160,w:1920,h:1080},{input:5,label:'',x:1920,y:2160,w:1920,h:1080},{input:6,label:'',x:3840,y:2160,w:1920,h:1080},
        {input:7,label:'',x:5760,y:2160,w:1920,h:1080},{input:8,label:'',x:7680,y:2160,w:1920,h:1080},{input:9,label:'',x:9600,y:2160,w:1920,h:1080}]}},
    {id:'memo-22x9x2',name:'현장 메모 · 4K 16:9 모니터 1대에 22:9 입력 2개 나란히',source:'사용자 메모 2026-10-16',
      state:{cols:1,rows:1,timing:14,startPort:9,priority:'4321',clear:'o000',windows:[{input:1,label:'',x:0,y:295,w:1920,h:1571},{input:2,label:'',x:1920,y:295,w:1920,h:1571}]},
      expected:'*255OWO009-012W14H01V01P4321O000I001O009X0Y295W1920H1571I002O010X1920Y295W1920H1571!'},
    {id:'memo-16x9',name:'현장 메모 · 4K 모니터 1대에 16:9 입력 3 전체 화면',source:'사용자 메모 2026-10-16',
      state:{cols:1,rows:1,timing:14,startPort:9,priority:'4321',clear:'o000',windows:[{input:3,label:'',x:0,y:0,w:3840,h:2160}]},
      expected:'*255OWO009-012W14H01V01P4321O000I003O009X0Y0W3840H2160!'},
    {id:'memo-22x9',name:'현장 메모 · 4K 모니터 1대에 22:9 입력 7 한 화면',source:'사용자 메모 2026-10-16',
      state:{cols:1,rows:1,timing:14,startPort:9,priority:'4321',clear:'o000',windows:[{input:7,label:'',x:0,y:295,w:3840,h:1571}]},
      expected:'*255OWO009-012W14H01V01P4321O000I007O009X0Y295W3840H1571!'}
  ];

  // ---------------- 브라우저 UI ----------------
  const STORE_KEY='rtcom.layoutSim.v1';
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const load=()=>{try{const raw=localStorage.getItem(STORE_KEY);return raw?normalize(JSON.parse(raw)):null}catch(e){return null}};
  const save=s=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(s))}catch(e){}};
  const colorOf=i=>WINDOW_COLORS[i%WINDOW_COLORS.length];

  function mount(root){
    if(!root||root.dataset.layoutSimMounted)return;
    root.dataset.layoutSimMounted='1';
    let state=load()||normalize({...PRESETS[2].state});
    let selected=state.windows.length?0:-1;
    const option=(v,label,cur,disabled)=>`<option value="${esc(v)}"${String(v)===String(cur)?' selected':''}${disabled?' disabled':''}>${esc(label)}</option>`;
    const render=()=>{
      const result=commandFor(state),geo=result.geometry,map=portMapFor(state),cover=coverageFor(state);
      const startOptions=[];for(let p=1;p<=61;p+=4)startOptions.push(option(p,`${p}번부터 (슬롯 ${Math.floor(p/4)+1})`,state.startPort));
      root.innerHTML=`
      <div class="rt-ls-controls">
        <label>가로 디스플레이<select data-ls="cols">${Array.from({length:MAX_COLS},(_,i)=>option(i+1,`${i+1}`,state.cols)).join('')}</select></label>
        <label>세로 디스플레이<select data-ls="rows">${Array.from({length:MAX_ROWS},(_,i)=>option(i+1,`${i+1}`,state.rows)).join('')}</select></label>
        <label>출력 해상도<select data-ls="timing">${TIMINGS.map(t=>option(t.code,`W${pad2(t.code)} · ${t.label}${t.wall?'':' (미지원)'}`,state.timing,!t.wall)).join('')}</select></label>
        <label>시작 출력 포트<select data-ls="startPort">${startOptions.join('')}</select></label>
        <label>겹침 우선순위<select data-ls="priority">${option('4321','P4321 · 포트 4번이 맨 위',state.priority)}${option('1234','P1234 · 포트 1번이 맨 위',state.priority)}</select></label>
        <label>레이어 지우기<select data-ls="clear">${CLEAR_MODES.map(m=>option(m.id,m.label,state.clear)).join('')}</select></label>
        <label>장비 ID<input type="number" min="1" max="999" data-ls="id" value="${state.id}"></label>
        <label class="rt-ls-check"><input type="checkbox" data-ls="snap"${state.snap?' checked':''}> 디스플레이 경계·½에 맞춤</label>
        <label>프리셋<select data-ls-preset><option value="">불러오기…</option>${PRESETS.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
        <button type="button" class="rt-pg-btn rt-pg-primary" data-ls-add${state.windows.length>=MAX_WINDOWS?' disabled':''}>+ 창 추가</button>
      </div>
      <p class="rt-ls-summary">월 전체 <b>${geo.width}×${geo.height}</b>px · 출력 ${geo.timing.label} × ${geo.cols}×${geo.rows} · 출력 포트 ${geo.startPort}~${geo.endPort}번(WOS100 ${geo.slots}장) · 창 ${state.windows.length}개</p>
      <div class="rt-ls-stage">
        <div class="rt-ls-canvas" data-ls-canvas style="aspect-ratio:${geo.width} / ${geo.height};--rt-ls-cols:${geo.cols};--rt-ls-rows:${geo.rows}" role="application" aria-label="디스플레이 월 캔버스. 창을 끌어 옮기고 오른쪽 아래 모서리로 크기를 바꿉니다. 선택한 창은 방향키로 10px, Shift와 함께 100px 움직입니다.">
          ${map.map((row,r)=>row.map((port,c)=>`<div class="rt-ls-cell" style="left:${(c/geo.cols)*100}%;top:${(r/geo.rows)*100}%;width:${100/geo.cols}%;height:${100/geo.rows}%"><span>출력 ${port}</span><small>${r+1}행 ${c+1}열</small></div>`).join('')).join('')}
          ${state.windows.map((win,i)=>{const a=result.assigned[i];return `<div class="rt-ls-win${i===selected?' is-selected':''}" data-ls-win="${i}" tabindex="0" style="left:${(win.x/geo.width)*100}%;top:${(win.y/geo.height)*100}%;width:${(win.w/geo.width)*100}%;height:${(win.h/geo.height)*100}%;--rt-ls-color:${colorOf(i)}" aria-label="창 ${i+1} 입력 ${win.input}"><span class="rt-ls-win-tag">입력 ${win.input}${win.label?` · ${esc(win.label)}`:''}</span><span class="rt-ls-win-meta">${win.w}×${win.h} @ ${win.x},${win.y}${a.ports.length?` · 포트 ${a.ports.join('·')}`:''}</span><i class="rt-ls-resize" data-ls-resize aria-hidden="true"></i></div>`}).join('')}
        </div>
      </div>
      <div class="rt-ls-table-wrap"><table class="rt-ls-table"><thead><tr><th>창</th><th>입력</th><th>이름</th><th>X</th><th>Y</th><th>너비</th><th>높이</th><th>출력 포트</th><th></th></tr></thead><tbody>
        ${state.windows.length?state.windows.map((win,i)=>`<tr data-ls-row="${i}"${i===selected?' class="is-selected"':''}><td><i class="rt-ls-dot" style="background:${colorOf(i)}"></i>${i+1}</td>
          <td><input type="number" min="1" max="999" data-ls-win-field="input" data-ls-win-index="${i}" value="${win.input}" aria-label="창 ${i+1} 입력 번호"></td>
          <td><input type="text" maxlength="24" placeholder="예: PC" data-ls-win-field="label" data-ls-win-index="${i}" value="${esc(win.label)}" aria-label="창 ${i+1} 이름"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="x" data-ls-win-index="${i}" value="${win.x}" aria-label="창 ${i+1} X"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="y" data-ls-win-index="${i}" value="${win.y}" aria-label="창 ${i+1} Y"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="w" data-ls-win-index="${i}" value="${win.w}" aria-label="창 ${i+1} 너비"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="h" data-ls-win-index="${i}" value="${win.h}" aria-label="창 ${i+1} 높이"></td>
          <td class="rt-ls-ports">${result.assigned[i].ports.length?result.assigned[i].ports.map(p=>`O${pad3(p)}`).join(' '):'—'}</td>
          <td><button type="button" class="rt-ls-del" data-ls-del="${i}" aria-label="창 ${i+1} 삭제">×</button></td></tr>`).join(''):'<tr><td colspan="9" class="rt-ls-empty">아직 창이 없습니다. "+ 창 추가"를 누르거나 프리셋을 불러오세요.</td></tr>'}
      </tbody></table></div>
      <div class="rt-ls-cmd-head"><h3>커맨드</h3><button type="button" class="rt-pg-btn" data-ls-copy>복사</button><span class="rt-ls-copied" data-ls-copied aria-live="polite"></span></div>
      <pre class="rt-ls-cmd" data-ls-cmd>${result.parts.map(p=>`<span class="rt-ls-tok rt-ls-tok-${p.kind}"${p.kind==='window'?` style="--rt-ls-color:${colorOf(p.window)}"`:''} title="${esc(p.title)}">${esc(p.text)}</span>`).join('')}</pre>
      <p class="rt-pg-hint">RS-232 또는 LAN으로 보낼 때 끝에 Ctrl+Enter(0x0D)를 붙입니다. 성공하면 장비가 <code>*${state.id}sOW…!</code>로 응답합니다. 토막 위에 마우스를 올리면 뜻이 보입니다.</p>
      ${result.warnings.length?`<ul class="rt-ls-warn">${result.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:''}
      <details class="rt-pg-flow-desc" open><summary>화면별 표출 영역</summary><ul>${cover.length?cover.map(cv=>`<li><i class="rt-ls-dot" style="background:${colorOf(cv.index)}"></i><b>창 ${cv.index+1} · 입력 ${cv.input}${cv.label?`(${esc(cv.label)})`:''}</b>: ${cv.cells.length?cv.cells.map(cell=>`출력 ${cell.port}(${cell.row}행 ${cell.col}열) ${cell.full?'전체':`${cell.w}×${cell.h} @ ${cell.x},${cell.y}`}`).join(' · '):'표시되는 디스플레이 없음'}</li>`).join(''):'<li>창을 추가하면 디스플레이마다 어느 영역이 나오는지 여기에 적힙니다.</li>'}</ul></details>
      <p class="rt-pg-hint">근거: 알티컴 XDM 시리즈 Command Guide(WOS100 Wall Overlay Command, 44~55쪽)와 서울영상테크 현장 메모(2026-10-16). 출력 슬롯 1장(포트 4개)이 디스플레이 2×2를 맡고, 창 하나는 걸치는 슬롯마다 남은 포트 중 가장 작은 번호를 씁니다. 창은 슬롯 1장에 4개까지 둘 수 있습니다. 실제 포트 연결이 다르면 커맨드의 O 번호를 현장에 맞게 바꾸세요.</p>`;
    };
    const update=(patch,keepSelection=true)=>{state=normalize({...state,...patch});if(!keepSelection||selected>=state.windows.length)selected=state.windows.length?state.windows.length-1:-1;save(state);render()};
    const setWindow=(i,patch)=>{const windows=state.windows.map((w,k)=>k===i?{...w,...patch}:w);update({windows})};
    const snapValue=(value,step,threshold)=>{const near=Math.round(value/step)*step;return Math.abs(near-value)<=threshold?near:value};
    const applySnap=(win,geo,mode)=>{
      if(!state.snap)return win;
      const stepX=geo.outW/2,stepY=geo.outH/2,th=Math.max(24,Math.round(geo.outW*0.025));
      if(mode==='move'){
        let x=snapValue(win.x,stepX,th),y=snapValue(win.y,stepY,th);
        const right=snapValue(win.x+win.w,stepX,th),bottom=snapValue(win.y+win.h,stepY,th);
        if(x===win.x&&right!==win.x+win.w)x=right-win.w;
        if(y===win.y&&bottom!==win.y+win.h)y=bottom-win.h;
        return {...win,x,y};
      }
      return {...win,w:snapValue(win.x+win.w,stepX,th)-win.x,h:snapValue(win.y+win.h,stepY,th)-win.y};
    };
    root.addEventListener('change',event=>{
      const ctl=event.target.closest('[data-ls]');
      if(ctl){const key=ctl.dataset.ls;update({[key]:ctl.type==='checkbox'?ctl.checked:ctl.value});return}
      const preset=event.target.closest('[data-ls-preset]');
      if(preset&&preset.value){const p=PRESETS.find(x=>x.id===preset.value);if(p){state=normalize({...state,...p.state});selected=state.windows.length?0:-1;save(state);render()}return}
      const field=event.target.closest('[data-ls-win-field]');
      if(field){const i=Number(field.dataset.lsWinIndex);selected=i;setWindow(i,{[field.dataset.lsWinField]:field.type==='number'?Number(field.value):field.value})}
    });
    root.addEventListener('click',event=>{
      if(event.target.closest('[data-ls-add]')){
        const geo=geometry(state),w=Math.min(geo.outW,geo.width),h=Math.min(geo.outH,geo.height);
        const n=state.windows.length;
        const win={input:n+1,label:'',x:Math.min(geo.width-w,(n%geo.cols)*geo.outW),y:Math.min(geo.height-h,Math.floor(n/geo.cols)%geo.rows*geo.outH),w,h};
        selected=n;update({windows:[...state.windows,win]});return;
      }
      const del=event.target.closest('[data-ls-del]');
      if(del){const i=Number(del.dataset.lsDel);const windows=state.windows.filter((_,k)=>k!==i);selected=Math.min(i,windows.length-1);update({windows},false);return}
      if(event.target.closest('[data-ls-copy]')){
        const text=commandFor(state).command,note=root.querySelector('[data-ls-copied]');
        const done=()=>{if(note){note.textContent='복사했습니다';setTimeout(()=>{note.textContent=''},1800)}};
        if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done,()=>{if(note)note.textContent='복사하지 못했습니다. 커맨드를 직접 선택해 복사하세요.'});
        else{const range=document.createRange();range.selectNodeContents(root.querySelector('[data-ls-cmd]'));const sel=getSelection();sel.removeAllRanges();sel.addRange(range);done()}
        return;
      }
      const row=event.target.closest('[data-ls-row]');
      if(row&&!event.target.closest('input,button')){selected=Number(row.dataset.lsRow);render()}
    });
    // 끌어 옮기기·크기 조절(포인터 이벤트: 마우스·터치·펜 공통). 좌표는 캔버스 비율로 월 픽셀에 맞춘다.
    let drag=null;
    root.addEventListener('pointerdown',event=>{
      const winEl=event.target.closest('[data-ls-win]');if(!winEl||event.button>0)return;
      const canvas=root.querySelector('[data-ls-canvas]'),rect=canvas.getBoundingClientRect(),geo=geometry(state);
      const i=Number(winEl.dataset.lsWin);selected=i;
      drag={index:i,mode:event.target.closest('[data-ls-resize]')?'resize':'move',startX:event.clientX,startY:event.clientY,origin:{...state.windows[i]},scaleX:geo.width/rect.width,scaleY:geo.height/rect.height,geo,el:winEl,moved:false};
      winEl.setPointerCapture(event.pointerId);
      root.querySelectorAll('.rt-ls-win.is-selected').forEach(el=>el.classList.remove('is-selected'));winEl.classList.add('is-selected');
      event.preventDefault();
    });
    root.addEventListener('pointermove',event=>{
      if(!drag)return;
      const dx=Math.round((event.clientX-drag.startX)*drag.scaleX),dy=Math.round((event.clientY-drag.startY)*drag.scaleY);
      if(Math.abs(dx)+Math.abs(dy)>0)drag.moved=true;
      const o=drag.origin,geo=drag.geo;let win;
      if(drag.mode==='move')win={...o,x:clamp(o.x+dx,0,Math.max(0,geo.width-o.w)),y:clamp(o.y+dy,0,Math.max(0,geo.height-o.h))};
      else win={...o,w:clamp(o.w+dx,0,geo.width-o.x),h:clamp(o.h+dy,0,geo.height-o.y)};
      win=applySnap(win,geo,drag.mode);
      drag.current=win;
      drag.el.style.left=`${(win.x/geo.width)*100}%`;drag.el.style.top=`${(win.y/geo.height)*100}%`;drag.el.style.width=`${(win.w/geo.width)*100}%`;drag.el.style.height=`${(win.h/geo.height)*100}%`;
      const meta=drag.el.querySelector('.rt-ls-win-meta');if(meta)meta.textContent=`${win.w}×${win.h} @ ${win.x},${win.y}`;
    });
    const endDrag=()=>{if(!drag)return;const d=drag;drag=null;if(d.moved&&d.current)setWindow(d.index,d.current);else render()};
    root.addEventListener('pointerup',endDrag);root.addEventListener('pointercancel',endDrag);
    root.addEventListener('keydown',event=>{
      const winEl=event.target.closest('[data-ls-win]');if(!winEl)return;
      const i=Number(winEl.dataset.lsWin),step=event.shiftKey?100:10,geo=geometry(state),w=state.windows[i];if(!w)return;
      const move={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];
      if(move){event.preventDefault();selected=i;setWindow(i,{x:clamp(w.x+move[0],0,Math.max(0,geo.width-w.w)),y:clamp(w.y+move[1],0,Math.max(0,geo.height-w.h))});root.querySelector(`[data-ls-win="${i}"]`)?.focus()}
      else if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();const windows=state.windows.filter((_,k)=>k!==i);selected=Math.min(i,windows.length-1);update({windows},false)}
    });
    render();
  }
  function mountAll(scopeEl){(scopeEl||document).querySelectorAll('[data-layout-sim-root]').forEach(mount)}

  return {TIMINGS,CLEAR_MODES,PRESETS,MAX_COLS,MAX_ROWS,MAX_WINDOWS,normalize,geometry,portMapFor,assignPorts,commandFor,coverageFor,mount,mountAll};
});
