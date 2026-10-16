/* 0.224 — XDM 화면 연출 시뮬레이터(1차: XDM-WOS100 월 오버레이). 0.225 — 2차: XDM-HOS100 한 화면 멀티뷰(OQ 커맨드).
   HOS100(25~29쪽 "[OQ] Output Quad view Setting Command"): 카드 1장의 포트 1~4가 창 1~4가 되어 그 카드의 1번 포트(합성 출력)에 한 화면으로 나온다.
     - 사용자 배치 L00: *255OQ O001 M14 L00 P4321 O001 X0000 Y0000 W0960 H0540 O002 … !  (좌표·크기는 4자리, 출력 해상도 안의 픽셀, W0/H0은 창 끄기)
     - PIP 사용자 배치 L09: *255OQ O001 M14 L09 X1920 Y1080 W1920 H1080 !  (창 1 전체 + 창 2 위치·크기)
     - 고정 레이아웃 L01~L08·L10~L12: *255OQ O001 M14 L05 !  / 끄기 *255OQ O001 M00 !
     - 창 n에 나올 입력은 매트릭스 스위칭 *255C I001 O001, I002 O002 … ! 로 포트 n에 연결한다(12쪽).
     - 레이어 포트 제한(사용자 확인 2026-10-12, 0.205·0.209): 레이어 4개면 2~4번 포트는 1번과 같은 화면, 2개(PIP·PBP)면 1·2번이 짝(2번 불가)이고 3·4번은 따로 스위칭.
     - L13(4포트 PIP 사용자 배치)은 가이드 25쪽 형식에 좌표 묶음이 2개만 적혀 있어 해석이 갈리므로 넣지 않았다.
   디스플레이 월 위에 창(입력 영상)을 끌어 놓으면 그 좌표·크기대로 영상을 띄우는 제어 커맨드를 가이드 문법 그대로 만든다.
   근거: 사용자 제공 "RTcom XDM 시리즈 Command Guide 1013"(input_doc/RTCOM/manual/RTcom_Manual_XDM_CommandGuide1013.pdf, 로컬 보관·배포 제외)
     - 44~55쪽 "XDM-WOS100 Wall Overlay Command": *255OW O001-008 W10 H03V02 P4321 [O…X0Y0W0H0 레이어 지우기] I001 O001 X0Y0 W2880 H2160 …!
     - 45~47쪽 Wall Port Connection 그림: 출력 슬롯 1장(포트 4개)이 디스플레이 2×2 블록을 맡고, 블록은 왼쪽→오른쪽, 위→아래로 이어진다.
     - 창 하나는 걸치는 슬롯마다 포트 1개를 쓴다(가이드 예제 1~8·사용자 메모 2026-10-16: 남은 포트 중 가장 작은 번호).
     - 56~59쪽 LED 예제의 "O000 : 이전 화면 Clear" 한 토막 방식도 레이어 지우기 선택지로 둔다.
   포트 배치(mapping) 두 가지:
     - 'card'(기본): 카드 1장 = 디스플레이 1대(OUT 1). 알티컴 확인(사용자 전달 2026-10-13, 0.210·0.214 구성도): 레이어를 쓰면 WOS100 카드 4포트가 모두 같은 화면을 내므로
       디스플레이마다 카드 1장을 두고, 그 카드의 포트 1~4를 그 디스플레이 위 창(레이어) 자원으로 쓴다(디스플레이 1대에 창 4개까지).
     - 'guide': 가이드 46~47쪽 Wall Port Connection 그림대로 카드 1장(포트 4개) = 디스플레이 2×2 블록. 가이드 예제 1~8이 이 배치로 적혀 있다.
     두 배치가 서로 달라 어느 쪽이 맞는지는 알티컴 확인 대기(docs/handoff/OPEN_ITEMS.md).
   현장 설정 값(특정 현장의 좌표·EDID 번호)은 0.209 사용자 결정대로 넣지 않는다. 비율 예시는 22:9 레터박스를 계산한 일반 값이다.
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
    {id:'list',label:'포트 전체 + X0Y0W0H0 (가이드 오버레이 예제)'},
    {id:'o000',label:'O000 한 토막 (가이드 LED 예제)'},
    {id:'none',label:'넣지 않음'}
  ];
  const MAPPINGS=[
    {id:'card',label:'카드 1장 = 디스플레이 1대 · OUT 1 (알티컴 확인)'},
    {id:'guide',label:'카드 1장 = 디스플레이 2×2 (가이드 연결 그림)'}
  ];
  const GUIDE_PDF='output/design/assets/docs/xdm-command-guide.pdf'; // 0.209 공개본. 인쇄 쪽 번호 + 1 = PDF 쪽(docs/implementation/XDM_COMMAND_GUIDE_0.209.md)
  // HOS100 OQ 레이아웃(가이드 27쪽 표). cells: 미리보기 칸 [창 번호, x%, y%, w%, h%](고정 레이아웃은 가이드 그림을 보고 대략 잡은 배치), free: 끌 수 있는 창 번호.
  const HOS_LAYOUTS=[
    {code:'L00',name:'사용자 배치 · 창 1~4 위치·크기 지정',layers:4,free:[1,2,3,4]},
    {code:'L09',name:'PIP 사용자 배치 · 창 1 전체 + 창 2 위치·크기 지정',layers:2,free:[2],cells:[[1,0,0,100,100]]},
    {code:'L05',name:'쿼드뷰(4분할)',layers:4,cells:[[1,0,0,50,50],[2,50,0,50,50],[3,0,50,50,50],[4,50,50,50,50]]},
    {code:'L06',name:'위 1 · 아래 3',layers:4,cells:[[1,16.67,0,66.66,66.67],[2,0,66.67,33.33,33.33],[3,33.33,66.67,33.34,33.33],[4,66.67,66.67,33.33,33.33]]},
    {code:'L07',name:'왼쪽 1 · 오른쪽 3',layers:4,cells:[[1,0,16.67,66.67,66.66],[2,66.67,0,33.33,33.33],[3,66.67,33.33,33.33,33.34],[4,66.67,66.67,33.33,33.33]]},
    {code:'L08',name:'1·2번 PIP 고정',layers:2,cells:[[1,0,0,100,100],[2,72.5,70,27.5,30]]},
    {code:'L10',name:'1·2번 PBP 전체',layers:2,cells:[[1,0,0,50,100],[2,50,0,50,100]]},
    {code:'L11',name:'1·2번 PBP 16:9',layers:2,cells:[[1,0,25,50,50],[2,50,25,50,50]]},
    {code:'L12',name:'1~4번 PIP 고정',layers:4,cells:[[1,0,0,100,100],[2,2,70,27,28],[3,36.5,70,27,28],[4,71,70,27,28]]},
    {code:'L01',name:'창 1 전체 화면',layers:1,cells:[[1,0,0,100,100]]},
    {code:'L02',name:'창 2 전체 화면',layers:1,cells:[[2,0,0,100,100]]},
    {code:'L03',name:'창 3 전체 화면',layers:1,cells:[[3,0,0,100,100]]},
    {code:'L04',name:'창 4 전체 화면',layers:1,cells:[[4,0,0,100,100]]}
  ];
  const WINDOW_COLORS=['#007AFF','#34C759','#FF9F0A','#BF5AF2','#FF375F','#30B0C7','#5E5CE6','#E08A20','#1E9E52','#8E8E93'];
  const MAX_COLS=6,MAX_ROWS=3,MAX_WINDOWS=12;
  const pad3=n=>String(n).padStart(3,'0');
  const pad4=n=>String(n).padStart(4,'0');
  const pad2=n=>String(n).padStart(2,'0');
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const int=(v,fallback)=>{const n=Math.round(Number(v));return Number.isFinite(n)?n:fallback};
  const timingOf=code=>TIMINGS.find(t=>t.code===code)||TIMINGS[9];

  const DEFAULTS={id:255,cols:2,rows:2,timing:14,startPort:1,priority:'4321',clear:'list',mapping:'card',snap:true,windows:[]};
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
    s.mapping=s.mapping==='guide'?'guide':'card';
    s.snap=s.snap!==false;
    s.windows=(Array.isArray(s.windows)?s.windows:[]).slice(0,MAX_WINDOWS).map((w,i)=>({
      input:clamp(int(w.input,i+1),1,999),
      label:String(w.label||'').slice(0,24),
      x:Math.max(0,int(w.x,0)),y:Math.max(0,int(w.y,0)),
      w:Math.max(0,int(w.w,0)),h:Math.max(0,int(w.h,0))
    }));
    return s;
  }
  // ---- XDM-HOS100 한 화면 멀티뷰(OQ) ----
  const HOS_DEFAULTS={id:255,timing:14,startPort:1,layout:'L00',priority:'4321',snap:true,
    windows:[{input:1,label:'',x:0,y:0,w:1920,h:1080},{input:2,label:'',x:1920,y:0,w:1920,h:1080},{input:3,label:'',x:0,y:1080,w:1920,h:1080},{input:4,label:'',x:1920,y:1080,w:1920,h:1080}]};
  const hosLayout=code=>HOS_LAYOUTS.find(l=>l.code===code)||HOS_LAYOUTS[0];
  function normalizeHos(input){
    const s={...HOS_DEFAULTS,...(input||{})};
    s.id=clamp(int(s.id,255),1,999);
    s.timing=timingOf(int(s.timing,14)).code;
    s.startPort=Math.max(1,Math.round((clamp(int(s.startPort,1),1,213)-1)/4)*4+1);
    s.layout=hosLayout(s.layout).code;
    s.priority=s.priority==='1234'?'1234':'4321';
    s.snap=s.snap!==false;
    const base=Array.isArray(s.windows)?s.windows:[];
    s.windows=HOS_DEFAULTS.windows.map((d,i)=>{const w=base[i]||{};return {input:clamp(int(w.input,i+1),1,999),label:String(w.label||'').slice(0,24),x:Math.max(0,int(w.x,d.x)),y:Math.max(0,int(w.y,d.y)),w:Math.max(0,int(w.w,d.w)),h:Math.max(0,int(w.h,d.h))}});
    return s;
  }
  // 레이아웃별로 화면에 보이는 창(1~4). 고정 레이아웃은 cells 비율을 출력 해상도 픽셀로 바꾸고, L00·L09는 사용자 좌표를 쓴다.
  function hosWindows(state){
    const s=normalizeHos(state),t=timingOf(s.timing),L=hosLayout(s.layout);
    if(L.code==='L00')return s.windows.map((w,i)=>({n:i+1,...w,free:true}));
    const fixed=(L.cells||[]).map(([n,x,y,w,h])=>({n,...s.windows[n-1],x:Math.round(t.w*x/100),y:Math.round(t.h*y/100),w:Math.round(t.w*w/100),h:Math.round(t.h*h/100),free:false}));
    if(L.code==='L09')fixed.push({n:2,...s.windows[1],free:true});
    return fixed;
  }
  // 포트 1~4 상태(0.205·0.209 사용자 확인): 레이어 4개 → 1번 합성, 2~4번 1번과 같은 화면 / 2개 → 1번 합성, 2번 불가, 3·4번 따로 스위칭 / 1개 → 전체 화면 스위칭.
  function hosPortStatus(layers){
    if(layers>=3)return ['합성 출력','1번과 같은 화면','1번과 같은 화면','1번과 같은 화면'];
    if(layers===2)return ['합성 출력','사용 불가','따로 스위칭','따로 스위칭'];
    return ['전체 화면','스위칭','스위칭','스위칭'];
  }
  function hosCommandFor(state){
    const s=normalizeHos(state),t=timingOf(s.timing),L=hosLayout(s.layout),wins=hosWindows(s);
    const warnings=[];
    const used=L.code==='L00'?s.windows.map((w,i)=>({n:i+1,...w})).filter(w=>w.w>0&&w.h>0):wins;
    const usedN=[...new Set(used.map(w=>w.n))].sort();
    // 1) 입력 → 카드 포트 스위칭(창 n = 포트 n)
    const pairs=usedN.map(n=>`I${pad3(s.windows[n-1].input)}O${pad3(s.startPort+n-1)}`);
    const switching=pairs.length?`*${s.id}C${pairs.join(',')}!`:'';
    // 2) 레이아웃
    const head=[{kind:'head',text:`*${s.id}OQ`,title:`시작(*) · 장비 ID ${s.id} · OQ(멀티뷰 설정)`},{kind:'range',text:`O${pad3(s.startPort)}`,title:`합성 화면이 나오는 카드 1번 포트(출력 ${s.startPort}번)`},{kind:'timing',text:`M${pad2(t.code)}`,title:`멀티뷰 켬 · 출력 해상도 ${t.label}`},{kind:'grid',text:L.code,title:L.name}];
    const parts=[...head];
    if(L.code==='L00'){
      parts.push({kind:'priority',text:`P${s.priority}`,title:s.priority==='4321'?'겹칠 때 창 4가 맨 위(4 > 3 > 2 > 1)':'겹칠 때 창 1이 맨 위(1 > 2 > 3 > 4)'});
      s.windows.forEach((w,i)=>{
        const port=s.startPort+i;
        if(w.w>0&&w.h>0&&(w.x+w.w>t.w||w.y+w.h>t.h))warnings.push(`창 ${i+1}(입력 ${w.input}): 출력 해상도 ${t.w}×${t.h} 밖으로 나갑니다.`);
        parts.push({kind:'window',window:i,text:`O${pad3(port)}X${pad4(w.x)}Y${pad4(w.y)}W${pad4(w.w)}H${pad4(w.h)}`,title:w.w>0&&w.h>0?`창 ${i+1}(포트 ${port}): 입력 ${w.input}${w.label?`(${w.label})`:''} · 시작 (${w.x}, ${w.y}) · 크기 ${w.w}×${w.h}`:`창 ${i+1}(포트 ${port}): 끔(W0 H0)`});
      });
    }else if(L.code==='L09'){
      const w=s.windows[1];
      if(w.w>0&&w.h>0&&(w.x+w.w>t.w||w.y+w.h>t.h))warnings.push(`창 2(입력 ${w.input}): 출력 해상도 ${t.w}×${t.h} 밖으로 나갑니다.`);
      if(w.w<=0||w.h<=0)warnings.push('창 2의 너비·높이가 0이라 PIP가 보이지 않습니다.');
      parts.push({kind:'window',window:1,text:`X${pad4(w.x)}Y${pad4(w.y)}W${pad4(w.w)}H${pad4(w.h)}`,title:`창 2(PIP, 포트 ${s.startPort+1}): 입력 ${w.input} · 시작 (${w.x}, ${w.y}) · 크기 ${w.w}×${w.h}`});
    }
    parts.push({kind:'end',text:'!',title:'끝(!) · 전송할 때 Ctrl+Enter(0x0D)'});
    if(L.code==='L00'){
      for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=s.windows[i],b=s.windows[j];if(a.w>0&&a.h>0&&b.w>0&&b.h>0&&rectsOverlap(a,b))warnings.push(`창 ${i+1}과 창 ${j+1}이 겹칩니다. 위아래는 우선순위 P${s.priority}로 정해집니다.`)}
      if(!used.length)warnings.push('켜진 창이 없습니다(모두 W0 H0).');
    }
    const layers=L.code==='L00'?used.length:L.layers;
    return {command:parts.map(p=>p.text).join(''),parts,switching,off:`*${s.id}OQO${pad3(s.startPort)}M00!`,warnings,layout:L,timing:t,windows:wins,layers,ports:hosPortStatus(layers)};
  }
  // HOS100 L00 "맨 위로": 창 n은 포트 n에 고정이므로 맨 위 자리(P4321이면 4번, P1234면 1번)와 데이터를 맞바꾼다(입력 연결도 함께 바뀜).
  function hosBringToFront(state,index){
    const s=normalizeHos(state);if(s.layout!=='L00'||index<0||index>3)return s;
    const top=s.priority==='4321'?3:0;if(top===index)return s;
    const windows=s.windows.slice();[windows[top],windows[index]]=[windows[index],windows[top]];
    return {...s,windows};
  }
  const HOS_PRESETS=[
    {id:'hos-guide-stairs',name:'가이드 예제 · 계단식 사용자 배치(창 4개, 4K/60)',source:'Command Guide 28쪽',
      state:{timing:14,startPort:1,layout:'L00',priority:'4321',windows:[{input:1,x:0,y:0,w:960,h:540},{input:2,x:960,y:540,w:960,h:540},{input:3,x:1920,y:1080,w:960,h:540},{input:4,x:2880,y:1620,w:960,h:540}]},
      expected:'*255OQO001M14L00P4321O001X0000Y0000W0960H0540O002X0960Y0540W0960H0540O003X1920Y1080W0960H0540O004X2880Y1620W0960H0540!'},
    {id:'hos-guide-pip',name:'가이드 예제 · PIP 사용자 배치(창 2를 오른쪽 아래 1/4에)',source:'Command Guide 28쪽',
      state:{timing:14,startPort:1,layout:'L09',priority:'4321',windows:[{input:1,x:0,y:0,w:3840,h:2160},{input:2,x:1920,y:1080,w:1920,h:1080}]},
      expected:'*255OQO001M14L09X1920Y1080W1920H1080!'},
    {id:'hos-guide-quad',name:'가이드 예제 · 쿼드뷰 L05(3840x2160p@59)',source:'Command Guide 28쪽',
      state:{timing:13,startPort:1,layout:'L05',priority:'4321'},expected:'*255OQO001M13L05!'},
    {id:'hos-guide-pip4',name:'가이드 예제 · 1~4번 PIP 고정 L12(4K/60)',source:'Command Guide 28쪽',
      state:{timing:14,startPort:1,layout:'L12',priority:'4321'},expected:'*255OQO001M14L12!'},
    {id:'hos-2x2-user',name:'사용자 배치 · 4분할을 창 좌표로(1920×1080 네 칸)',source:'기본값',
      state:{timing:14,startPort:1,layout:'L00',priority:'4321',windows:HOS_DEFAULTS.windows}}
  ];

  // 월 전체 크기와 카드(슬롯) 수 계산. card: 디스플레이 1대 = 카드 1장, guide: 디스플레이 2×2 블록 = 카드 1장.
  function geometry(state){
    const s=normalize(state),t=timingOf(s.timing);
    const guide=s.mapping==='guide';
    const blockCols=guide?Math.ceil(s.cols/2):s.cols,blockRows=guide?Math.ceil(s.rows/2):s.rows,slots=blockCols*blockRows;
    return {cols:s.cols,rows:s.rows,outW:t.w,outH:t.h,width:s.cols*t.w,height:s.rows*t.h,mapping:s.mapping,blockCols,blockRows,slots,startPort:s.startPort,endPort:s.startPort+slots*4-1,timing:t};
  }
  const slotIndex=(geo,r,c)=>geo.mapping==='guide'?Math.floor(r/2)*geo.blockCols+Math.floor(c/2):r*geo.cols+c;
  // 디스플레이 칸(r,c)이 연결되는 출력 포트. card: 그 카드의 OUT 1. guide: 카드 첫 포트 + 블록 안 위치(왼쪽 위 0, 오른쪽 위 1, 왼쪽 아래 2, 오른쪽 아래 3).
  const cellPort=(geo,r,c)=>geo.startPort+slotIndex(geo,r,c)*4+(geo.mapping==='guide'?(r%2)*2+(c%2):0);
  function portMapFor(state){
    const geo=geometry(state);const map=[];
    for(let r=0;r<geo.rows;r++){const row=[];for(let c=0;c<geo.cols;c++)row.push(cellPort(geo,r,c));map.push(row)}
    return map;
  }
  const rectsOverlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  function slotRect(geo,slot){
    const br=Math.floor(slot/geo.blockCols),bc=slot%geo.blockCols;
    if(geo.mapping!=='guide')return {x:bc*geo.outW,y:br*geo.outH,w:geo.outW,h:geo.outH};
    const c0=bc*2,c1=Math.min(geo.cols,c0+2),r0=br*2,r1=Math.min(geo.rows,r0+2);
    return {x:c0*geo.outW,y:r0*geo.outH,w:(c1-c0)*geo.outW,h:(r1-r0)*geo.outH};
  }
  function slotsUnder(geo,win){
    const list=[];
    for(let slot=0;slot<geo.slots;slot++)if(win.w>0&&win.h>0&&rectsOverlap(win,slotRect(geo,slot)))list.push(slot);
    return list;
  }
  // 창마다 걸치는 카드에서 아직 쓰지 않은 가장 작은 포트를 하나씩 배정한다(가이드 예제 1·2·3·8: I002 O002O005, O001O005 …).
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
      {kind:'range',text:`O${pad3(geo.startPort)}-${pad3(geo.endPort)}`,title:`월에 쓰는 출력 포트 전체 ${geo.startPort}~${geo.endPort}번(WOS100 ${geo.slots}장)`},
      {kind:'timing',text:`W${pad2(geo.timing.code)}`,title:`월 모드 켬 · 출력 해상도 ${geo.timing.label}`},
      {kind:'grid',text:`H${pad2(geo.cols)}V${pad2(geo.rows)}`,title:`디스플레이 가로 ${geo.cols} × 세로 ${geo.rows}`},
      {kind:'priority',text:`P${s.priority}`,title:s.priority==='4321'?'겹칠 때 포트 4번 영상이 맨 위(4 > 3 > 2 > 1)':'겹칠 때 포트 1번 영상이 맨 위(1 > 2 > 3 > 4)'}
    ];
    const clear=clearSegment(geo,s.clear);
    if(clear)parts.push({kind:'clear',text:clear,title:s.clear==='o000'?'이전 화면 지우기(O000, 가이드 LED 예제 방식)':'모든 레이어 지우기(가이드 오버레이 예제 방식: 포트 전체 + X0Y0W0H0)'});
    s.windows.forEach((win,i)=>{
      const a=assigned[i];
      if(win.w<=0||win.h<=0){warnings.push(`창 ${i+1}(입력 ${win.input}): 너비·높이가 0이라 커맨드에 넣지 않았습니다.`);return}
      if(win.x+win.w>geo.width||win.y+win.h>geo.height)warnings.push(`창 ${i+1}(입력 ${win.input}): 월 바깥(${geo.width}×${geo.height})으로 나갑니다. 좌표나 크기를 줄이세요.`);
      if(a.missing.length)warnings.push(`창 ${i+1}(입력 ${win.input}): 카드 ${a.missing.join('·')}의 포트 4개를 다른 창이 모두 쓰고 있어 포트를 배정하지 못했습니다(카드 1장에는 창 4개까지).`);
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
  // 겹침 순서(가이드 31·46쪽 Pxxxx): P4321이면 포트 4번 창이 맨 위, P1234면 1번 창이 맨 위. 창이 쓰는 포트 중 가장 큰 번호로 비교한다.
  // 돌려주는 배열은 위에서 아래 순서의 창 번호(0부터)이다. 포트가 없는 창(크기 0·포트 부족)은 맨 아래.
  function stackOrder(state){
    const s=normalize(state),assigned=assignPorts(s);
    const key=i=>assigned[i].ports.length?Math.max(...assigned[i].ports):-1;
    return s.windows.map((_,i)=>i).sort((a,b)=>{const ka=key(a),kb=key(b);if(ka<0||kb<0)return kb-ka;return s.priority==='4321'?kb-ka||b-a:ka-kb||a-b});
  }
  // "맨 위로": 포트는 창 순서대로 작은 번호부터 배정되므로, P4321이면 창을 맨 뒤로(가장 큰 포트), P1234면 맨 앞으로 옮긴다.
  function bringToFront(state,index){
    const s=normalize(state);if(index<0||index>=s.windows.length)return s;
    const win=s.windows[index],rest=s.windows.filter((_,i)=>i!==index);
    return {...s,windows:s.priority==='4321'?[...rest,win]:[win,...rest]};
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
  // 프리셋: 알티컴 확인 배치(card)의 기본 예시, 가이드 예제(guide 배치, 쪽 번호), 비율 계산 예시. expected는 가이드에 적힌 커맨드 원문 또는 규칙으로 계산한 값(테스트 기준).
  const PRESETS=[
    {id:'card-2x2-pip',name:'기본 · 4K 디스플레이 4대(2×2, 카드 4장) 전체 입력 1 + 오른쪽 아래 PIP 입력 2',source:'알티컴 확인 배치(0.214 구성도)',
      state:{mapping:'card',cols:2,rows:2,timing:14,startPort:1,priority:'4321',clear:'list',windows:[{input:1,label:'',x:0,y:0,w:7680,h:4320},{input:2,label:'',x:5760,y:3240,w:1920,h:1080}]},
      expected:'*255OWO001-016W14H02V02P4321O001O002O003O004O005O006O007O008O009O010O011O012O013O014O015O016X0Y0W0H0I001O001O005O009O013X0Y0W7680H4320I002O014X5760Y3240W1920H1080!'},
    {id:'card-1x1-22x9x2',name:'비율 예시 · 4K 디스플레이 1대에 22:9 입력 2개 나란히(레터박스 계산)',source:'폭 1920씩 둘, 높이는 22:9 한 화면 높이(3840×9/22≈1571)에 맞춰 위아래 295 여백',
      state:{mapping:'card',cols:1,rows:1,timing:14,startPort:1,priority:'4321',clear:'o000',windows:[{input:1,label:'',x:0,y:295,w:1920,h:1571},{input:2,label:'',x:1920,y:295,w:1920,h:1571}]},
      expected:'*255OWO001-004W14H01V01P4321O000I001O001X0Y295W1920H1571I002O002X1920Y295W1920H1571!'},
    {id:'card-1x1-22x9',name:'비율 예시 · 4K 디스플레이 1대에 22:9 입력 1개(3840×1571, 위아래 295 여백)',source:'22:9 레터박스 계산: 3840×9/22≈1571, (2160−1571)/2≈295',
      state:{mapping:'card',cols:1,rows:1,timing:14,startPort:1,priority:'4321',clear:'o000',windows:[{input:1,label:'',x:0,y:295,w:3840,h:1571}]},
      expected:'*255OWO001-004W14H01V01P4321O000I001O001X0Y295W3840H1571!'},
    {id:'guide-2',name:'가이드 예제 2 · 4×2 월(1080p), 가운데 2×2에 입력 1',source:'Command Guide 48쪽 · 가이드 연결 그림 배치',
      state:{mapping:'guide',cols:4,rows:2,timing:10,startPort:1,priority:'4321',clear:'list',windows:[{input:1,label:'',x:1920,y:0,w:3840,h:2160}]},
      expected:'*255OWO001-008W10H04V02P4321O001O002O003O004O005O006O007O008X0Y0W0H0I001O001O005X1920Y0W3840H2160!'},
    {id:'guide-3',name:'가이드 예제 3 · 6×2 월(1080p) 전체에 입력 1',source:'Command Guide 48쪽 · 가이드 연결 그림 배치',
      state:{mapping:'guide',cols:6,rows:2,timing:10,startPort:1,priority:'4321',clear:'list',windows:[{input:1,label:'',x:0,y:0,w:11520,h:2160}]},
      expected:'*255OWO001-012W10H06V02P4321O001O002O003O004O005O006O007O008O009O010O011O012X0Y0W0H0I001O001O005O009X0Y0W11520H2160!'},
    {id:'guide-1',name:'가이드 예제 1 · 3×2 월(1080p)을 좌우 2개로(입력 1·2)',source:'Command Guide 47쪽 · 가이드 연결 그림 배치',
      state:{mapping:'guide',cols:3,rows:2,timing:10,startPort:1,priority:'4321',clear:'list',windows:[{input:1,label:'',x:0,y:0,w:2880,h:2160},{input:2,label:'',x:2880,y:0,w:2880,h:2160}]}},
    {id:'guide-8',name:'가이드 예제 8 · 6×3 월(1080p), 위 2단 4K 3개 + 아래 1단 FHD 6개',source:'Command Guide 54~55쪽 · 가이드 연결 그림 배치',
      state:{mapping:'guide',cols:6,rows:3,timing:10,startPort:1,priority:'4321',clear:'list',windows:[
        {input:1,label:'',x:0,y:0,w:3840,h:2160},{input:2,label:'',x:3840,y:0,w:3840,h:2160},{input:3,label:'',x:7680,y:0,w:3840,h:2160},
        {input:4,label:'',x:0,y:2160,w:1920,h:1080},{input:5,label:'',x:1920,y:2160,w:1920,h:1080},{input:6,label:'',x:3840,y:2160,w:1920,h:1080},
        {input:7,label:'',x:5760,y:2160,w:1920,h:1080},{input:8,label:'',x:7680,y:2160,w:1920,h:1080},{input:9,label:'',x:9600,y:2160,w:1920,h:1080}]}}
  ];

  // ---------------- 브라우저 UI ----------------
  const STORE_KEY='rtcom.layoutSim.v1';
  const CARD_KEY='rtcom.layoutSim.card.v1',HOS_KEY='rtcom.layoutSim.hos.v1';
  const loadKey=(key,norm)=>{try{const raw=localStorage.getItem(key);return raw?norm(JSON.parse(raw)):null}catch(e){return null}};
  const saveKey=(key,value)=>{try{localStorage.setItem(key,typeof value==='string'?value:JSON.stringify(value))}catch(e){}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const load=()=>{try{const raw=localStorage.getItem(STORE_KEY);return raw?normalize(JSON.parse(raw)):null}catch(e){return null}};
  const save=s=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(s))}catch(e){}};
  const colorOf=i=>WINDOW_COLORS[i%WINDOW_COLORS.length];

  function mount(root){
    if(!root||root.dataset.layoutSimMounted)return;
    root.dataset.layoutSimMounted='1';
    let state=load()||normalize({...PRESETS[0].state});
    let hos=loadKey(HOS_KEY,normalizeHos)||normalizeHos({});
    let card=loadKey(CARD_KEY,v=>v==='HOS100'?'HOS100':'WOS100')||'WOS100';
    let selected=state.windows.length?0:-1;
    const option=(v,label,cur,disabled)=>`<option value="${esc(v)}"${String(v)===String(cur)?' selected':''}${disabled?' disabled':''}>${esc(label)}</option>`;
    const cardSeg=()=>`<div class="rt-ls-cardseg"><span class="rt-pg-seg" role="group" aria-label="출력 카드 선택"><button type="button" class="${card==='WOS100'?'rt-pg-on':''}" data-ls-card="WOS100" aria-pressed="${card==='WOS100'}">XDM-WOS100 · 월 오버레이(OW)</button><button type="button" class="${card==='HOS100'?'rt-pg-on':''}" data-ls-card="HOS100" aria-pressed="${card==='HOS100'}">XDM-HOS100 · 한 화면 멀티뷰(OQ)</button></span></div>`;
    const tokens=parts=>parts.map(p=>`<span class="rt-ls-tok rt-ls-tok-${p.kind}"${p.kind==='window'?` style="--rt-ls-color:${colorOf(p.window)}"`:''} title="${esc(p.title)}">${esc(p.text)}</span>`).join('');
    // ---- HOS100 화면 ----
    const renderHos=()=>{
      const r=hosCommandFor(hos),t=r.timing,L=r.layout;
      const startOptions=[];for(let p=1;p<=61;p+=4)startOptions.push(option(p,`${p}번부터 (슬롯 ${Math.floor(p/4)+1}, 포트 ${p}~${p+3})`,hos.startPort));
      const editable=L.code==='L00'?[0,1,2,3]:L.code==='L09'?[0,1]:[];
      root.innerHTML=`${cardSeg()}
      <div class="rt-ls-controls">
        <label>레이아웃<select data-ls-hos="layout">${HOS_LAYOUTS.map(l=>option(l.code,`${l.code} · ${l.name}`,hos.layout)).join('')}</select></label>
        <label>출력 해상도<select data-ls-hos="timing">${TIMINGS.map(x=>option(x.code,`M${pad2(x.code)} · ${x.label}`,hos.timing)).join('')}</select></label>
        <label>카드 시작 포트<select data-ls-hos="startPort">${startOptions.join('')}</select></label>
        ${L.code==='L00'?`<label>겹침 우선순위<select data-ls-hos="priority">${option('4321','P4321 · 창 4가 맨 위',hos.priority)}${option('1234','P1234 · 창 1이 맨 위',hos.priority)}</select></label>`:''}
        <label>장비 ID<input type="number" min="1" max="999" data-ls-hos="id" value="${hos.id}"></label>
        ${(L.free||[]).length?`<label class="rt-ls-check"><input type="checkbox" data-ls-hos="snap"${hos.snap?' checked':''}> ½·¼ 지점에 맞춤</label>`:''}
        <label>프리셋<select data-ls-hos-preset><option value="">불러오기…</option>${HOS_PRESETS.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
      </div>
      <p class="rt-ls-summary">출력 <b>${t.w}×${t.h}</b>px · 합성 화면은 출력 ${hos.startPort}번(카드 1번 포트) · 창 1~4 = 포트 ${hos.startPort}~${hos.startPort+3} · 레이어 ${r.layers}개${(L.free||[]).length?'':' · 고정 레이아웃(끌 수 없음, 배치는 가이드 그림을 보고 대략 그림)'}</p>
      <div class="rt-ls-stage"><div class="rt-ls-canvas" data-ls-canvas style="aspect-ratio:${t.w} / ${t.h}" role="application" aria-label="HOS100 출력 화면. 사용자 배치·PIP에서 창을 끌어 옮기고 오른쪽 아래 모서리로 크기를 바꿉니다.">
        <div class="rt-ls-cell" style="left:0;top:0;width:100%;height:100%"><span>출력 ${hos.startPort}</span><small>${t.label}</small></div>
        ${(()=>{const zOf=i=>{const w=r.windows[i];return L.code==='L00'?(hos.priority==='4321'?w.n:5-w.n):i+1};
          return r.windows.map((w,i)=>w.w>0&&w.h>0?`<div class="rt-ls-win${w.free?'':' is-fixed'}${w.n-1===selected&&w.free?' is-selected':''}" data-ls-win="${w.n-1}"${w.free?' tabindex="0"':''} style="left:${(w.x/t.w)*100}%;top:${(w.y/t.h)*100}%;width:${(w.w/t.w)*100}%;height:${(w.h/t.h)*100}%;z-index:${zOf(i)};--rt-ls-color:${colorOf(w.n-1)}" aria-label="창 ${w.n} 입력 ${w.input}"><span class="rt-ls-win-tag">창 ${w.n} · 입력 ${w.input}${w.label?` · ${esc(w.label)}`:''}</span><span class="rt-ls-win-meta">${w.w}×${w.h} @ ${w.x},${w.y} · 포트 ${hos.startPort+w.n-1}</span>${w.free?'<i class="rt-ls-resize" data-ls-resize aria-hidden="true"></i>':''}</div>`:'').join('')})()}
      </div></div>
      <div class="rt-ls-table-wrap"><table class="rt-ls-table"><thead><tr><th>창</th><th>포트</th><th>입력</th><th>이름</th><th>X</th><th>Y</th><th>너비</th><th>높이</th><th>포트 상태</th>${L.code==='L00'?'<th>겹침</th>':''}</tr></thead><tbody>
        ${hos.windows.map((w,i)=>{const on=editable.includes(i)&&!(L.code==='L09'&&i===0);const shown=r.windows.find(x=>x.n===i+1);const topIdx=hos.priority==='4321'?3:0;const rank=hos.priority==='4321'?4-i:i+1;return `<tr data-ls-row="${i}"${i===selected?' class="is-selected"':''}><td><i class="rt-ls-dot" style="background:${colorOf(i)}"></i>${i+1}</td><td class="rt-ls-ports">O${pad3(hos.startPort+i)}</td>
          <td><input type="number" min="1" max="999" data-ls-hos-win="input" data-ls-win-index="${i}" value="${w.input}" aria-label="창 ${i+1} 입력 번호"></td>
          <td><input type="text" maxlength="24" placeholder="예: PC" data-ls-hos-win="label" data-ls-win-index="${i}" value="${esc(w.label)}" aria-label="창 ${i+1} 이름"></td>
          ${['x','y','w','h'].map(k=>`<td>${on?`<input type="number" min="0" step="10" data-ls-hos-win="${k}" data-ls-win-index="${i}" value="${w[k]}" aria-label="창 ${i+1} ${k.toUpperCase()}">`:`<span class="rt-ls-fixedval">${shown?shown[k]:'—'}</span>`}</td>`).join('')}
          <td class="rt-ls-portstat">${r.ports[i]}</td>${L.code==='L00'?`<td class="rt-ls-stack">${i===topIdx?'<b>맨 위</b>':`위에서 ${rank}번째 <button type="button" class="rt-ls-top" data-ls-hos-top="${i}" title="이 창의 입력·좌표를 맨 위 자리(포트 ${hos.startPort+topIdx})로 옮깁니다">맨 위로</button>`}</td>`:''}</tr>`}).join('')}
      </tbody></table></div>
      <div class="rt-ls-cmd-head"><h3>커맨드</h3><button type="button" class="rt-pg-btn" data-ls-copy>복사</button><span class="rt-ls-copied" data-ls-copied aria-live="polite"></span></div>
      <pre class="rt-ls-cmd" data-ls-cmd>${r.switching?`<span class="rt-ls-cmdline"><small>① 입력 → 포트 연결</small>${esc(r.switching)}</span>
`:''}<span class="rt-ls-cmdline"><small>② 멀티뷰 레이아웃</small>${tokens(r.parts)}</span>
<span class="rt-ls-cmdline rt-ls-cmdline-off"><small>멀티뷰 끄기(일반 스위칭으로)</small>${esc(r.off)}</span></pre>
      <p class="rt-pg-hint">①은 창 n에 나올 입력을 카드의 포트 n에 연결하는 스위칭 커맨드(가이드 12쪽)이고, ②가 화면 배치입니다. 각 줄 끝에 Ctrl+Enter(0x0D)를 붙여 보냅니다. 복사 버튼은 ①·② 두 줄을 복사합니다.${L.code==='L00'?` 겹침 순서는 <code>P${hos.priority}</code>(${hos.priority==='4321'?'창 4가 맨 위':'창 1이 맨 위'})이며, "맨 위로"는 그 창의 입력·좌표를 맨 위 자리로 옮깁니다(입력 연결 커맨드도 함께 바뀜).`:L.code==='L09'?' PIP(창 2)는 항상 창 1 위에 나옵니다.':''}</p>
      ${r.warnings.length?`<ul class="rt-ls-warn">${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:''}
      <p class="rt-pg-hint">근거: 알티컴 <a href="${GUIDE_PDF}#page=26" target="_blank" rel="noopener">XDM 시리즈 Command Guide 25쪽부터([OQ] Quad view 커맨드)</a>, 레이아웃 14종은 27쪽 표. 좌표·크기는 출력 해상도 안의 픽셀이며 4자리로 적습니다(W0000·H0000은 창 끄기). 포트 상태(레이어 4개면 2~4번은 1번과 같은 화면, 2개면 2번 사용 불가·3·4번 따로 스위칭)는 서울영상테크 확인(2026-10-12)입니다. L13(1~4번 PIP 사용자 배치)은 가이드의 좌표 묶음 수가 분명하지 않아 넣지 않았습니다.</p>`;
    };
    const render=()=>{
      if(card==='HOS100'){renderHos();return}
      const result=commandFor(state),geo=result.geometry,map=portMapFor(state),cover=coverageFor(state);
      const startOptions=[];for(let p=1;p<=61;p+=4)startOptions.push(option(p,`${p}번부터 (슬롯 ${Math.floor(p/4)+1})`,state.startPort));
      root.innerHTML=`${cardSeg()}
      <div class="rt-ls-controls">
        <label>가로 디스플레이<select data-ls="cols">${Array.from({length:MAX_COLS},(_,i)=>option(i+1,`${i+1}`,state.cols)).join('')}</select></label>
        <label>세로 디스플레이<select data-ls="rows">${Array.from({length:MAX_ROWS},(_,i)=>option(i+1,`${i+1}`,state.rows)).join('')}</select></label>
        <label>출력 해상도<select data-ls="timing">${TIMINGS.map(t=>option(t.code,`W${pad2(t.code)} · ${t.label}${t.wall?'':' (미지원)'}`,state.timing,!t.wall)).join('')}</select></label>
        <label>시작 출력 포트<select data-ls="startPort">${startOptions.join('')}</select></label>
        <label>겹침 우선순위<select data-ls="priority">${option('4321','P4321 · 포트 4번이 맨 위',state.priority)}${option('1234','P1234 · 포트 1번이 맨 위',state.priority)}</select></label>
        <label>포트 배치<select data-ls="mapping">${MAPPINGS.map(m=>option(m.id,m.label,state.mapping)).join('')}</select></label>
        <label>레이어 지우기<select data-ls="clear">${CLEAR_MODES.map(m=>option(m.id,m.label,state.clear)).join('')}</select></label>
        <label>장비 ID<input type="number" min="1" max="999" data-ls="id" value="${state.id}"></label>
        <label class="rt-ls-check"><input type="checkbox" data-ls="snap"${state.snap?' checked':''}> 디스플레이 경계·½에 맞춤</label>
        <label>프리셋<select data-ls-preset><option value="">불러오기…</option>${PRESETS.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
        <button type="button" class="rt-pg-btn rt-pg-primary" data-ls-add${state.windows.length>=MAX_WINDOWS?' disabled':''}>+ 창 추가</button>
      </div>
      <p class="rt-ls-summary">월 전체 <b>${geo.width}×${geo.height}</b>px · 출력 ${geo.timing.label} × ${geo.cols}×${geo.rows} · 출력 포트 ${geo.startPort}~${geo.endPort}번(WOS100 ${geo.slots}장) · 창 ${state.windows.length}개${state.mapping==='guide'?' · <b>가이드 연결 그림 배치</b>':''}</p>
      <div class="rt-ls-stage">
        <div class="rt-ls-canvas" data-ls-canvas style="aspect-ratio:${geo.width} / ${geo.height};--rt-ls-cols:${geo.cols};--rt-ls-rows:${geo.rows}" role="application" aria-label="디스플레이 월 캔버스. 창을 끌어 옮기고 오른쪽 아래 모서리로 크기를 바꿉니다. 선택한 창은 방향키로 10px, Shift와 함께 100px 움직입니다.">
          ${map.map((row,r)=>row.map((port,c)=>`<div class="rt-ls-cell" style="left:${(c/geo.cols)*100}%;top:${(r/geo.rows)*100}%;width:${100/geo.cols}%;height:${100/geo.rows}%"><span>출력 ${port}</span><small>${r+1}행 ${c+1}열</small></div>`).join('')).join('')}
          ${(()=>{
            // 캔버스 겹침은 실제 장비 순서(stackOrder: P와 포트 번호)대로 보여 준다. 가려진 창은 표의 "맨 위로"로 올리거나 숫자로 고친다.
            const order=stackOrder(state);
            const zOf=i=>order.length-order.indexOf(i);
            return state.windows.map((win,i)=>{const a=result.assigned[i];return `<div class="rt-ls-win${i===selected?' is-selected':''}" data-ls-win="${i}" tabindex="0" style="left:${(win.x/geo.width)*100}%;top:${(win.y/geo.height)*100}%;width:${(win.w/geo.width)*100}%;height:${(win.h/geo.height)*100}%;z-index:${zOf(i)};--rt-ls-color:${colorOf(i)}" aria-label="창 ${i+1} 입력 ${win.input}"><span class="rt-ls-win-tag">입력 ${win.input}${win.label?` · ${esc(win.label)}`:''}</span><span class="rt-ls-win-meta">${win.w}×${win.h} @ ${win.x},${win.y}${a.ports.length?` · 포트 ${a.ports.join('·')}`:''}</span><i class="rt-ls-resize" data-ls-resize aria-hidden="true"></i></div>`}).join('')})()}
        </div>
      </div>
      <div class="rt-ls-table-wrap"><table class="rt-ls-table"><thead><tr><th>창</th><th>입력</th><th>이름</th><th>X</th><th>Y</th><th>너비</th><th>높이</th><th>출력 포트</th><th>겹침</th><th></th></tr></thead><tbody>
        ${state.windows.length?(()=>{const order=stackOrder(state);return state.windows.map((win,i)=>`<tr data-ls-row="${i}"${i===selected?' class="is-selected"':''}><td><i class="rt-ls-dot" style="background:${colorOf(i)}"></i>${i+1}</td>
          <td><input type="number" min="1" max="999" data-ls-win-field="input" data-ls-win-index="${i}" value="${win.input}" aria-label="창 ${i+1} 입력 번호"></td>
          <td><input type="text" maxlength="24" placeholder="예: PC" data-ls-win-field="label" data-ls-win-index="${i}" value="${esc(win.label)}" aria-label="창 ${i+1} 이름"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="x" data-ls-win-index="${i}" value="${win.x}" aria-label="창 ${i+1} X"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="y" data-ls-win-index="${i}" value="${win.y}" aria-label="창 ${i+1} Y"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="w" data-ls-win-index="${i}" value="${win.w}" aria-label="창 ${i+1} 너비"></td>
          <td><input type="number" min="0" step="10" data-ls-win-field="h" data-ls-win-index="${i}" value="${win.h}" aria-label="창 ${i+1} 높이"></td>
          <td class="rt-ls-ports">${result.assigned[i].ports.length?result.assigned[i].ports.map(p=>`O${pad3(p)}`).join(' '):'—'}</td>
          <td class="rt-ls-stack">${order.indexOf(i)===0?'<b>맨 위</b>':`위에서 ${order.indexOf(i)+1}번째`}${order.indexOf(i)===0?'':` <button type="button" class="rt-ls-top" data-ls-top="${i}" title="이 창이 맨 위 포트를 받도록 순서를 바꿉니다">맨 위로</button>`}</td>
          <td><button type="button" class="rt-ls-del" data-ls-del="${i}" aria-label="창 ${i+1} 삭제">×</button></td></tr>`).join('')})():'<tr><td colspan="10" class="rt-ls-empty">아직 창이 없습니다. "+ 창 추가"를 누르거나 프리셋을 불러오세요.</td></tr>'}
      </tbody></table></div>
      <div class="rt-ls-cmd-head"><h3>커맨드</h3><button type="button" class="rt-pg-btn" data-ls-copy>복사</button><span class="rt-ls-copied" data-ls-copied aria-live="polite"></span></div>
      <pre class="rt-ls-cmd" data-ls-cmd>${result.parts.map(p=>`<span class="rt-ls-tok rt-ls-tok-${p.kind}"${p.kind==='window'?` style="--rt-ls-color:${colorOf(p.window)}"`:''} title="${esc(p.title)}">${esc(p.text)}</span>`).join('')}</pre>
      <p class="rt-pg-hint">RS-232 또는 LAN으로 보낼 때 끝에 Ctrl+Enter(0x0D)를 붙입니다. 성공하면 장비가 <code>*${state.id}sOW…!</code>로 응답합니다. 토막 위에 마우스를 올리면 뜻이 보입니다. 겹침 순서는 우선순위 <code>P${state.priority}</code>와 창이 받은 포트 번호로 정해지며(${state.priority==='4321'?'큰 포트 번호가 위':'작은 포트 번호가 위'}), 표의 "맨 위로"를 누르면 그 창이 맨 위 포트를 받도록 순서를 바꿉니다. 캔버스도 같은 순서로 겹쳐 보입니다.</p>
      ${result.warnings.length?`<ul class="rt-ls-warn">${result.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:''}
      <details class="rt-pg-flow-desc" open><summary>화면별 표출 영역</summary><ul>${cover.length?cover.map(cv=>`<li><i class="rt-ls-dot" style="background:${colorOf(cv.index)}"></i><b>창 ${cv.index+1} · 입력 ${cv.input}${cv.label?`(${esc(cv.label)})`:''}</b>: ${cv.cells.length?cv.cells.map(cell=>`출력 ${cell.port}(${cell.row}행 ${cell.col}열) ${cell.full?'전체':`${cell.w}×${cell.h} @ ${cell.x},${cell.y}`}`).join(' · '):'표시되는 디스플레이 없음'}</li>`).join(''):'<li>창을 추가하면 디스플레이마다 어느 영역이 나오는지 여기에 적힙니다.</li>'}</ul></details>
      <p class="rt-pg-hint">근거: 알티컴 <a href="${GUIDE_PDF}#page=45" target="_blank" rel="noopener">XDM 시리즈 Command Guide 44쪽부터(WOS100 Wall Overlay Command)</a>. 창 하나는 걸치는 카드마다 남은 포트 중 가장 작은 번호를 쓰고, 카드 1장에는 창 4개까지 둘 수 있습니다.<br>포트 배치 <b>"카드 1장 = 디스플레이 1대"</b>는 알티컴 확인(레이어를 쓰면 WOS100 카드 4포트가 모두 같은 화면, 0.210)과 레이어 구성도(0.214)를 따른 기본값이고, <b>"카드 1장 = 디스플레이 2×2"</b>는 가이드 46~47쪽 연결 그림과 예제 1~8의 배치입니다. 두 배치가 서로 달라 어느 쪽이 실제 장비와 맞는지 알티컴 확인을 기다리고 있습니다. 실제 포트 연결이 다르면 커맨드의 O 번호를 현장에 맞게 바꾸세요.</p>`;
    };
    const updateHos=patch=>{hos=normalizeHos({...hos,...patch});saveKey(HOS_KEY,hos);render()};
    const setHosWindow=(i,patch)=>{updateHos({windows:hos.windows.map((w,k)=>k===i?{...w,...patch}:w)})};
    const update=(patch,keepSelection=true)=>{state=normalize({...state,...patch});if(!keepSelection||selected>=state.windows.length)selected=state.windows.length?state.windows.length-1:-1;save(state);render()};
    const setWindow=(i,patch)=>{const windows=state.windows.map((w,k)=>k===i?{...w,...patch}:w);update({windows})};
    const snapValue=(value,step,threshold)=>{const near=Math.round(value/step)*step;return Math.abs(near-value)<=threshold?near:value};
    const applySnap=(win,geo,mode)=>{
      if(!(card==='HOS100'?hos.snap:state.snap))return win;
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
      const hctl=event.target.closest('[data-ls-hos]');
      if(hctl){const key=hctl.dataset.lsHos;updateHos({[key]:hctl.type==='checkbox'?hctl.checked:hctl.value});return}
      const hpreset=event.target.closest('[data-ls-hos-preset]');
      if(hpreset&&hpreset.value){const p=HOS_PRESETS.find(x=>x.id===hpreset.value);if(p){hos=normalizeHos({...hos,...p.state});selected=0;saveKey(HOS_KEY,hos);render()}return}
      const hfield=event.target.closest('[data-ls-hos-win]');
      if(hfield){const i=Number(hfield.dataset.lsWinIndex);selected=i;setHosWindow(i,{[hfield.dataset.lsHosWin]:hfield.type==='number'?Number(hfield.value):hfield.value});return}
      const ctl=event.target.closest('[data-ls]');
      if(ctl){const key=ctl.dataset.ls;update({[key]:ctl.type==='checkbox'?ctl.checked:ctl.value});return}
      const preset=event.target.closest('[data-ls-preset]');
      if(preset&&preset.value){const p=PRESETS.find(x=>x.id===preset.value);if(p){state=normalize({...state,...p.state});selected=state.windows.length?0:-1;save(state);render()}return}
      const field=event.target.closest('[data-ls-win-field]');
      if(field){const i=Number(field.dataset.lsWinIndex);selected=i;setWindow(i,{[field.dataset.lsWinField]:field.type==='number'?Number(field.value):field.value})}
    });
    root.addEventListener('click',event=>{
      const cardBtn=event.target.closest('[data-ls-card]');
      if(cardBtn){card=cardBtn.dataset.lsCard==='HOS100'?'HOS100':'WOS100';saveKey(CARD_KEY,card);selected=0;render();return}
      if(event.target.closest('[data-ls-add]')){
        const geo=geometry(state),w=Math.min(geo.outW,geo.width),h=Math.min(geo.outH,geo.height);
        const n=state.windows.length;
        const win={input:n+1,label:'',x:Math.min(geo.width-w,(n%geo.cols)*geo.outW),y:Math.min(geo.height-h,Math.floor(n/geo.cols)%geo.rows*geo.outH),w,h};
        selected=n;update({windows:[...state.windows,win]});return;
      }
      const topBtn=event.target.closest('[data-ls-top]');
      if(topBtn){const i=Number(topBtn.dataset.lsTop);const next=bringToFront(state,i);selected=next.windows.indexOf(state.windows[i]);state=next;save(state);render();return}
      const hosTop=event.target.closest('[data-ls-hos-top]');
      if(hosTop){const i=Number(hosTop.dataset.lsHosTop);hos=hosBringToFront(hos,i);selected=hos.priority==='4321'?3:0;saveKey(HOS_KEY,hos);render();return}
      const del=event.target.closest('[data-ls-del]');
      if(del){const i=Number(del.dataset.lsDel);const windows=state.windows.filter((_,k)=>k!==i);selected=Math.min(i,windows.length-1);update({windows},false);return}
      if(event.target.closest('[data-ls-copy]')){
        const text=card==='HOS100'?(r=>[r.switching,r.command].filter(Boolean).join('\n'))(hosCommandFor(hos)):commandFor(state).command,note=root.querySelector('[data-ls-copied]');
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
      const winEl=event.target.closest('[data-ls-win]');if(!winEl||event.button>0||winEl.classList.contains('is-fixed'))return;
      const canvas=root.querySelector('[data-ls-canvas]'),rect=canvas.getBoundingClientRect();
      const i=Number(winEl.dataset.lsWin);selected=i;
      const hosMode=card==='HOS100';
      const t=timingOf(hos.timing);
      const geo=hosMode?{width:t.w,height:t.h,outW:t.w/2,outH:t.h/2}:geometry(state);
      drag={hos:hosMode,index:i,mode:event.target.closest('[data-ls-resize]')?'resize':'move',startX:event.clientX,startY:event.clientY,origin:{...(hosMode?hos.windows[i]:state.windows[i])},scaleX:geo.width/rect.width,scaleY:geo.height/rect.height,geo,el:winEl,moved:false};
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
    const endDrag=()=>{if(!drag)return;const d=drag;drag=null;if(d.moved&&d.current){if(d.hos)setHosWindow(d.index,d.current);else setWindow(d.index,d.current)}else render()};
    root.addEventListener('pointerup',endDrag);root.addEventListener('pointercancel',endDrag);
    root.addEventListener('keydown',event=>{
      const winEl=event.target.closest('[data-ls-win]');if(!winEl)return;
      const hosMode=card==='HOS100',t=timingOf(hos.timing);
      const i=Number(winEl.dataset.lsWin),step=event.shiftKey?100:10,geo=hosMode?{width:t.w,height:t.h}:geometry(state),w=hosMode?hos.windows[i]:state.windows[i];if(!w)return;
      const move={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];
      if(move){event.preventDefault();selected=i;const patch={x:clamp(w.x+move[0],0,Math.max(0,geo.width-w.w)),y:clamp(w.y+move[1],0,Math.max(0,geo.height-w.h))};if(hosMode)setHosWindow(i,patch);else setWindow(i,patch);root.querySelector(`[data-ls-win="${i}"]`)?.focus()}
      else if(!hosMode&&(event.key==='Delete'||event.key==='Backspace')){event.preventDefault();const windows=state.windows.filter((_,k)=>k!==i);selected=Math.min(i,windows.length-1);update({windows},false)}
    });
    render();
  }
  function mountAll(scopeEl){(scopeEl||document).querySelectorAll('[data-layout-sim-root]').forEach(mount)}

  return {TIMINGS,CLEAR_MODES,MAPPINGS,PRESETS,HOS_LAYOUTS,HOS_PRESETS,GUIDE_PDF,MAX_COLS,MAX_ROWS,MAX_WINDOWS,normalize,geometry,portMapFor,assignPorts,commandFor,coverageFor,stackOrder,bringToFront,normalizeHos,hosWindows,hosCommandFor,hosPortStatus,hosBringToFront,mount,mountAll};
});
