/* 0.246 VDM 비디오 월 시뮬레이터(제품정보 VDM 시리즈 "07 분할 화면 시뮬레이터"의 "비디오 월" 탭).
   근거: VDM 국문 사용자 매뉴얼 KV07(output/design/assets/docs/vdm-manual.pdf, 쪽은 인쇄 쪽 번호)
     - 44쪽 VDM-HOS4S-UW(Video Wall HDMI Output 보드) 사양: HDMI 4포트, 최대 1920x1080@60Hz
     - 85쪽 Video Wall 분할: *255W11O0112H04V03!(전체 확대) · *255W11O0112H01V01!(1:1 출력)
     - 86쪽 Wall Mode: "W" 명령(1CH = W11 시작·끝 출력 + 가로·세로 분할, All CH = W21), 예 *999W11O0104H02V02!
     - 87쪽 예 2: 출력 보드 여러 장으로 월 여러 개를 만들 때 W21 — 12개 출력으로 2x2 월 3개:
         *999W21H02V02O0101O0202O0703O0804H02V02O0301O0402O0903O1004H02V02O0501O0602O1103O1204!
       O 뒤 숫자는 "출력 번호 + 월 안의 칸 번호(왼쪽 위부터 가로 순서)"이고, 출력은 월 N개를 가로로 나란히 놓은 디스플레이 배열을 왼쪽 위부터 가로로 센 번호다.
     - 88쪽 Wall Bezel Correction: *255B02O0112D20202020!(출력 1~12, 좌·우·상·하 20) · *255B01O04D08080808!(출력 4만 8)
   매뉴얼에 없는 것: 제품 ID(매뉴얼 예는 999, 이 사이트의 VDM 명령은 255), W 데이터 2의 "0 = Wall Off" 형식 예, 3자리 번호(VDM-128X·256X) 형식.
   그래서 월 풀기는 매뉴얼 예(85쪽)대로 1:1 복원(H01V01) 명령만 만들고, 3자리 번호는 같은 규칙으로 이은 예시로만 둔다(화면에도 알티컴 확인 대기로 적는다).
   순수 함수(normalize·commandsFor)는 Node 테스트(tests/vdm-wall.test.cjs)에서도 쓰므로 DOM을 건드리지 않는다.
   mountAll(scopeEl)은 [data-vdm-wall-root] 자리에만 그리고, 같은 카드의 탭 버튼([data-sim-tab])도 연결한다. */
(function(scope,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  scope.RtVdmWall=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const esc=text=>String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const padN=(n,w)=>String(n).padStart(w,'0');
  const KEY='rtcom.vdmWall.v1';
  const DEFAULT_ID='255';
  const MAX_OUT=256;
  const FIELD_NOTE='매뉴얼의 월 명령 예시는 제품 ID를 999로 적었지만 이 사이트의 VDM 명령은 255를 쓰므로 같은 255로 만들었습니다. "월 끄기"(W 데이터 2의 0)는 형식 예시가 없어 만들지 않고 매뉴얼 예(85쪽)대로 1:1 복원 명령(H01V01)만 보여 줍니다. 3자리 번호(VDM-128X·256X)는 매뉴얼에 월 명령 예가 없어 같은 규칙으로 이은 예시입니다. 모두 알티컴 확인 대기 중입니다.';
  // 매뉴얼 예제를 그대로 불러오는 프리셋: 2x2 월(출력 1~4, 86쪽) · 4x3 월(출력 1~12, 85·86쪽) · 2x2 월 3개(출력 1~12, 87쪽)
  const PRESETS=[
    {id:'w2x2',name:'2×2 월 · 출력 1~4(매뉴얼 86쪽)',state:{walls:1,h:2,v:2,start:1}},
    {id:'w4x3',name:'4×3 월 · 출력 1~12(매뉴얼 85·86쪽)',state:{walls:1,h:4,v:3,start:1}},
    {id:'w3x2x2',name:'2×2 월 3개 · 출력 1~12(매뉴얼 87쪽)',state:{walls:3,h:2,v:2,start:1}}
  ];
  function normalize(raw){
    const s=raw&&typeof raw==='object'?raw:{};
    const num=(v,lo,hi,d)=>{const n=Math.round(Number(v));return Number.isFinite(n)?clamp(n,lo,hi):d};
    const b=s.bezel&&typeof s.bezel==='object'?s.bezel:{};
    const out={
      walls:num(s.walls,1,4,1),h:num(s.h,1,16,2),v:num(s.v,1,16,2),
      start:num(s.start,1,MAX_OUT,1),pad:Number(s.pad)===3?3:2,
      withBezel:s.withBezel===true,
      bezel:{l:num(b.l,0,99,8),r:num(b.r,0,99,8),u:num(b.u,0,99,8),d:num(b.d,0,99,8)},
      id:/^\d{1,3}$/.test(String(s.id??''))?String(s.id):DEFAULT_ID
    };
    return out;
  }
  // 월 안의 칸마다 [출력 번호, 칸 번호]를 만든다. 월 N개를 가로로 나란히 놓은 배열(가로 N×H칸, 세로 V칸)의 출력 번호는 왼쪽 위부터 가로로 센다(매뉴얼 87쪽 예 2).
  function cellsOf(s){
    const {walls:N,h:H,v:V,start}=s,W=N*H,list=[];
    for(let k=0;k<N;k++){
      const cells=[];
      for(let r=0;r<V;r++)for(let c=0;c<H;c++)cells.push([start+r*W+k*H+c,r*H+c+1]);
      list.push(cells);
    }
    return list;
  }
  function commandsFor(raw){
    const s=normalize(raw),w=s.pad,N=s.walls,H=s.h,V=s.v;
    const total=N*H*V,end=s.start+total-1;
    const warnings=[],lines=[],reset=[];
    if(end>MAX_OUT)return {state:s,total,end,lines,reset,warnings,error:`출력이 ${MAX_OUT}번을 넘습니다(시작 ${s.start}번 + ${total}개 = ${end}번). 월 개수·칸 수나 시작 출력을 줄이세요.`};
    if(w===2&&end>99)warnings.push('출력 번호가 99를 넘으면 "번호 자릿수"를 3자리로 바꾸세요(VDM-128X·256X).');
    if(w===3)warnings.push('3자리 번호의 월 명령 형식은 매뉴얼에 예가 없어 같은 규칙으로 이은 예시입니다.');
    const o=n=>padN(n,w),hv=`H${padN(H,2)}V${padN(V,2)}`;
    if(N===1){
      lines.push({kind:'wall',label:`월 만들기 · ${H}×${V}(출력 ${s.start}~${end}번)`,text:`*${s.id}W11O${o(s.start)}${o(end)}${hv}!`});
    }else{
      const body=cellsOf(s).map(cells=>hv+cells.map(([out,pos])=>`O${o(out)}${padN(pos,w)}`).join('')).join('');
      lines.push({kind:'wall',label:`월 ${N}개 만들기 · 각 ${H}×${V}(출력 ${s.start}~${end}번)`,text:`*${s.id}W21${body}!`});
    }
    if(s.withBezel){
      const b=s.bezel,d=`D${padN(b.l,2)}${padN(b.r,2)}${padN(b.u,2)}${padN(b.d,2)}`;
      lines.push(total>1
        ?{kind:'bezel',label:`베젤 보정 · 출력 ${s.start}~${end}번(좌 ${b.l} · 우 ${b.r} · 상 ${b.u} · 하 ${b.d})`,text:`*${s.id}B02O${o(s.start)}${o(end)}${d}!`}
        :{kind:'bezel',label:`베젤 보정 · 출력 ${s.start}번(좌 ${b.l} · 우 ${b.r} · 상 ${b.u} · 하 ${b.d})`,text:`*${s.id}B01O${o(s.start)}${d}!`});
    }
    reset.push({kind:'reset',label:`월 풀기 · 출력 ${s.start}~${end}번 1:1 복원`,text:`*${s.id}W11O${o(s.start)}${o(end)}H01V01!`});
    return {state:s,total,end,lines,reset,warnings};
  }
  let svgSeq=0;
  // 디스플레이 배열 그림: 월마다 영상 한 장(하늘·산)이 베젤을 건너 이어지고, 칸마다 출력 번호를 적는다. QMS 06 비디오 월 그림과 같은 모양이다.
  function wallSvg(raw){
    const s=normalize(raw),{walls:N,h:H,v:V}=s,id=`vw${++svgSeq}`;
    const DW=64,DH=36,BZ=3,GAP=2,PAD=4,WGAP=14,fw=DW+BZ*2,fh=DH+BZ*2;
    const wallW=H*fw+(H-1)*GAP,wallH=V*fh+(V-1)*GAP;
    const W=PAD*2+N*wallW+(N-1)*WGAP,HH=PAD*2+wallH;
    const big=Math.max(N*H,V)>6,br=big?4.2:5.2,bf=big?5.4:7;
    const cells=cellsOf(s);
    let defs='',body='';
    for(let k=0;k<N;k++){
      const ox=PAD+k*(wallW+WGAP),oy=PAD;
      let frames='',screens='',badges='';
      cells[k].forEach(([out,pos])=>{
        const r=Math.floor((pos-1)/H),c=(pos-1)%H;
        const fx=ox+c*(fw+GAP),fy=oy+r*(fh+GAP);
        frames+=`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="2.5" fill="#1f2532"/>`;
        screens+=`<rect x="${fx+BZ}" y="${fy+BZ}" width="${DW}" height="${DH}"/>`;
        badges+=`<circle cx="${fx+BZ+br+2}" cy="${fy+BZ+br+2}" r="${br}" fill="#fff" fill-opacity=".92"/><text x="${fx+BZ+br+2}" y="${fy+BZ+br+2.2}" font-size="${out>99?bf-1.4:bf}" font-weight="800" fill="#1f2532" text-anchor="middle" dominant-baseline="central">${out}</text>`;
      });
      const x0=ox+BZ,y0=oy+BZ,x1=ox+wallW-BZ,y1=oy+wallH-BZ,iw=x1-x0,ih=y1-y0;
      const ridgePts=[[0,0.62],[0.16,0.27],[0.30,0.5],[0.47,0.16],[0.64,0.5],[0.81,0.3],[1,0.54]];
      const ridge=`M${ridgePts.map(([a,b])=>`${(x0+iw*a).toFixed(1)} ${(y0+ih*b).toFixed(1)}`).join('L')}V${y1}H${x0}Z`;
      const hill=`M${x0} ${y0+ih*0.84}C${x0+iw*0.18} ${y0+ih*0.6},${x0+iw*0.32} ${y0+ih*0.68},${x0+iw*0.46} ${y0+ih*0.58}S${x0+iw*0.78} ${y0+ih*0.7},${x1} ${y0+ih*0.6}V${y1}H${x0}Z`;
      const hill2=`M${x0} ${y0+ih*0.9}C${x0+iw*0.3} ${y0+ih*0.7},${x0+iw*0.55} ${y0+ih*0.86},${x0+iw*0.75} ${y0+ih*0.72}S${x1-iw*0.05} ${y0+ih*0.8},${x1} ${y0+ih*0.76}V${y1}H${x0}Z`;
      // 월이 둘 이상이면 월마다 다른 영상(낮·노을·밤)으로 칠해 서로 다른 소스임을 보인다.
      const scenes=[{sky:['#5aa9ff','#cfe6ff'],land:['#34a853','#1e7a3c'],far:'#5f86c9'},{sky:['#ff9a62','#ffe0b8'],land:['#8a5a3c','#5c3a24'],far:'#c98a62'},{sky:['#4b4fb0','#a9a6e8'],land:['#2f4a7a','#1c2d4f'],far:'#6a6fc2'},{sky:['#2db3a0','#c8f2ea'],land:['#2e7d5b','#1c4f3a'],far:'#5aa597'}];
      const sc=scenes[k%scenes.length];
      defs+=`<linearGradient id="${id}s${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sc.sky[0]}"/><stop offset="1" stop-color="${sc.sky[1]}"/></linearGradient><clipPath id="${id}c${k}">${screens}</clipPath>`;
      body+=`${frames}${screens.replace(/<rect /g,'<rect class="rt-vw-cell" fill="#0b0d12" ')}<g clip-path="url(#${id}c${k})"><rect x="${x0}" y="${y0}" width="${iw}" height="${ih}" fill="url(#${id}s${k})"/><circle cx="${x0+iw*0.76}" cy="${y0+ih*0.13}" r="${Math.min(iw,ih)*0.08}" fill="#ffd66b"/><path d="${ridge}" fill="${sc.far}"/><path d="${hill}" fill="${sc.land[0]}"/><path d="${hill2}" fill="${sc.land[1]}"/></g>${badges}`;
    }
    return `<svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="${esc(`가로 ${H} × 세로 ${V} 비디오 월 ${N}개`)}"><defs>${defs}</defs>${body}</svg>`;
  }
  function load(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return normalize(null)}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
  function ceInfo(scopeEl){
    try{const el=(scopeEl||document).querySelector('[data-control-example]');if(el){const spec=JSON.parse(el.dataset.controlExample);return {id:String(spec.productId||DEFAULT_ID),basketId:spec.id||'vdm'}}}catch{}
    return {id:DEFAULT_ID,basketId:'vdm'};
  }
  function mount(root,scopeEl){
    if(!root||root.dataset.vdmWallMounted)return;
    root.dataset.vdmWallMounted='1';
    const info=ceInfo(scopeEl);
    let st={...load(),id:info.id};
    const option=(v,label,cur)=>`<option value="${esc(v)}"${String(v)===String(cur)?' selected':''}>${esc(label)}</option>`;
    const canBasket=()=>!!(globalThis.RtControlExample&&globalThis.RtControlExample.basket);
    let last={lines:[],reset:[]};
    const block=(title,list,which,extra='')=>`<div class="rt-ls-cmd-head"><h3>${esc(title)}</h3><button type="button" class="rt-pg-btn" data-vw-copy="${which}">복사</button>${canBasket()?`<button type="button" class="rt-pg-btn${which==='build'?' rt-pg-primary':''}" data-vw-amx="${which}" title="이 커맨드를 아래 AMX 통합 제어 카드의 &quot;내 AMX 구성&quot;에 담습니다">AMX 구성에 담기</button>`:''}${extra}</div>
      <pre class="rt-ls-cmd" data-vw-cmd="${which}">${list.map((l,i)=>`<span class="rt-ls-cmdline"><small>${i+1}. ${esc(l.label)}</small>${esc(l.text)}</span>`).join('\n')}</pre>`;
    const render=()=>{
      const r=commandsFor(st);
      last={lines:r.lines,reset:r.reset};
      const walls=st.walls;
      root.innerHTML=`<div class="rt-ls-controls rt-vw-controls">
        <label>프리셋<select data-vw-preset><option value="">불러오기…</option>${PRESETS.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
        <label>월 개수<input type="number" min="1" max="4" data-vw="walls" value="${st.walls}"></label>
        <label>가로 칸 수(H)<input type="number" min="1" max="16" data-vw="h" value="${st.h}"></label>
        <label>세로 칸 수(V)<input type="number" min="1" max="16" data-vw="v" value="${st.v}"></label>
        <label>시작 출력<input type="number" min="1" max="${MAX_OUT}" data-vw="start" value="${st.start}"></label>
        <label>번호 자릿수<select data-vw="pad">${option(2,'2자리(대부분의 VDM)',st.pad)}${option(3,'3자리(VDM-128X·256X)',st.pad)}</select></label>
        <label class="rt-ls-check"><input type="checkbox" data-vw="withBezel"${st.withBezel?' checked':''}> 베젤 보정(B) 명령도 만들기</label>
        ${st.withBezel?['l','r','u','d'].map((k,i)=>`<label>베젤 ${['좌','우','상','하'][i]}<input type="number" min="0" max="99" data-vw-bz="${k}" value="${st.bezel[k]}"></label>`).join(''):''}
      </div>
      ${r.error?`<p class="rt-ls-warn rt-vw-error" role="alert">${esc(r.error)}</p>`:`<p class="rt-ls-summary">${walls===1?`가로 <b>${st.h}</b> × 세로 <b>${st.v}</b> 월 1개`:`가로 <b>${st.h}</b> × 세로 <b>${st.v}</b> 월 <b>${walls}</b>개를 가로로 나란히`} · 출력 <b>${st.start}~${r.end}</b>번 ${r.total}대 · 칸의 숫자는 출력 번호입니다(왼쪽 위부터 가로로 차례).</p>
      <div class="rt-vw-fig" aria-live="polite">${wallSvg(st)}</div>
      ${block('비디오 월 커맨드',r.lines,'build')}
      ${block('월 풀기 · 1:1 복원',r.reset,'reset')}
      <p class="rt-ls-copied rt-vw-note" data-vw-note aria-live="polite"></p>
      <p class="rt-pg-hint">순서대로 한 줄씩 보내고 각 줄 끝에 Enter(0x0D)를 붙입니다. 비디오 월은 VDM-HOS4S-UW 출력 카드(HDMI 4포트, 최대 1920x1080 @ 60Hz, 매뉴얼 44쪽)를 쓰며, 월 하나의 가로·세로 칸 수는 2~16이고 1은 1:1 복원에 씁니다. 제품 ID(${esc(st.id)})는 아래 AMX 카드와 같고, 번호 자릿수는 위에서 따로 고릅니다.</p>
      ${r.warnings.length?`<ul class="rt-ls-warn">${r.warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}`}
      <p class="rt-pg-hint rt-qv-field">※ ${esc(FIELD_NOTE)}</p>`;
    };
    const flash=text=>{const n=root.querySelector('[data-vw-note]');if(n){n.textContent=text;setTimeout(()=>{if(n.isConnected)n.textContent=''},2500)}};
    root.addEventListener('click',event=>{
      const cp=event.target.closest('[data-vw-copy]'),am=event.target.closest('[data-vw-amx]');
      if(cp){
        const list=last[cp.dataset.vwCopy==='reset'?'reset':'lines'],text=list.map(l=>l.text).join('\n');
        if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>flash('복사했습니다'),()=>flash('복사하지 못했습니다. 직접 선택해 복사하세요.'));
        else{const pre=root.querySelector(`[data-vw-cmd="${cp.dataset.vwCopy}"]`);const rg=document.createRange();rg.selectNodeContents(pre);const sl=getSelection();sl.removeAllRanges();sl.addRange(rg);flash('선택했습니다. 복사하세요.')}
        return;
      }
      if(am&&canBasket()){
        const list=last[am.dataset.vwAmx==='reset'?'reset':'lines'];
        const res=globalThis.RtControlExample.basket.add(info.basketId,list.map(l=>({label:l.label.slice(0,80),text:l.text,enter:true,source:'비디오 월'})));
        flash(res.added?`구성에 ${res.added}줄을 담았습니다(지금 ${res.list.length}개)`:res.full?'구성이 가득 찼습니다(최대 60개)':'이미 담겨 있습니다');
      }
    });
    root.addEventListener('change',event=>{
      const pre=event.target.closest('[data-vw-preset]');
      if(pre){const p=PRESETS.find(x=>x.id===pre.value);if(p){st=normalize({...st,...p.state,id:st.id});save(st);render()}return}
      const bz=event.target.closest('[data-vw-bz]');
      if(bz){st=normalize({...st,bezel:{...st.bezel,[bz.dataset.vwBz]:bz.value}});save(st);render();return}
      const f=event.target.closest('[data-vw]');
      if(!f)return;
      st=normalize({...st,[f.dataset.vw]:f.type==='checkbox'?f.checked:f.value});save(st);render();
    });
    render();
  }
  // 같은 카드의 탭 버튼([data-sim-tab] = quad|wall)을 연결한다: 누른 탭의 패널([data-sim-panel])만 보이게 한다.
  function wireTabs(section){
    if(!section||section.dataset.simTabsWired)return;
    section.dataset.simTabsWired='1';
    section.addEventListener('click',event=>{
      const btn=event.target.closest('[data-sim-tab]');
      if(!btn||!section.contains(btn))return;
      const tab=btn.dataset.simTab;
      section.querySelectorAll('[data-sim-tab]').forEach(b=>{const on=b===btn;b.classList.toggle('rt-pg-on',on);b.setAttribute('aria-pressed',String(on))});
      section.querySelectorAll('[data-sim-panel]').forEach(p=>{p.hidden=p.dataset.simPanel!==tab});
    });
  }
  function mountAll(scopeEl){
    const scope=scopeEl||document;
    scope.querySelectorAll('[data-vdm-wall-root]').forEach(el=>{mount(el,scopeEl);wireTabs(el.closest('#rt-quad-sim'))});
  }
  return {PRESETS,FIELD_NOTE,normalize,cellsOf,commandsFor,wallSvg,mount,mountAll};
});
