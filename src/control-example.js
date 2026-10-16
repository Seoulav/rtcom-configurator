/* 0.229 — 제품정보 "AMX 통합 제어 커맨드 예시" 카드(HDS-42MU 먼저, 이어서 HDS-21U·일체형·모듈러 매트릭스로 확장).
   입력·출력 번호나 볼륨을 고르면 RS-232 커맨드(문자열·HEX)와 AMX NetLinx 예제 코드가 바로 만들어진다.
   근거: 사용자 제공 HDS-42MU 사용자 매뉴얼 9쪽 "RS-232C Control"(output/design/assets/docs/hds-42mu-manual.pdf)
     - 통신속도 9600bps, 형식 * + 제품 ID(000) + C + Ixx(입력) + Oxx(출력) + ! + Enter(0x0D)
     - 입력 선택: *000CI02O02!+0x0D (입력 2번 → 출력 2번)
     - 볼륨: *000Vxx!+0x0D, 50이 0dB, 1 오르면 +0.5dB·1 내려가면 -0.5dB (예: *000V54! = 0dB에서 2dB)
   HDS-21U 매뉴얼 9쪽 표에는 0dB(50) 옆에 Mute(0) 칸이 있어 volume.muteCode가 있는 제품만 뮤트 커맨드(*000V00!)를 보여 준다.
   매뉴얼에 없는 값(데이터 비트·패리티·스톱 비트, 뮤트 명령(muteCode가 없는 제품), 볼륨 허용 범위)은 만들어 넣지 않는다.
   AMX NetLinx 코드는 위 문자열을 SEND_STRING으로 보내는 일반 문법 예시이며, 장치 번호(5001:1:0)와 버튼 번호는 현장에 맞게 바꿔야 한다.
   순수 함수(switchCommand·volumeCommand·volumeCode·toHex·amxCode)는 Node 테스트(tests/control-example.test.cjs)에서도 쓰므로 DOM을 건드리지 않는다.
   mountAll(body)는 제품정보 상세 화면 안의 [data-control-example] 자리에만 그린다(src/products.js, 데이터는 제품 JSON의 controlExample). */
(function(scope,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  scope.RtControlExample=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const pad2=n=>String(n).padStart(2,'0');
  const esc=text=>String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  // 문자열을 토큰(시작·제품 ID·명령·입력·출력·종료)으로 나눠 색을 입히고 의미를 title로 보여 준다.
  function switchParts(spec,input,output){
    return [
      {kind:'start',text:'*',title:'Start · 명령 시작'},
      {kind:'id',text:spec.productId,title:'Product ID · 제품 ID'},
      {kind:'cmd',text:'C',title:'Command · 입력 선택 명령'},
      {kind:'in',text:`I${pad2(input)}`,title:`Input No. · 입력 ${input}번`},
      {kind:'out',text:`O${pad2(output)}`,title:`Output No. · 출력 ${output}번`},
      {kind:'end',text:'!',title:'End · 명령 끝(이어서 Enter 0x0D)'}
    ];
  }
  function volumeParts(spec,code){
    return [
      {kind:'start',text:'*',title:'Start · 명령 시작'},
      {kind:'id',text:spec.productId,title:'Product ID · 제품 ID'},
      {kind:'vol',text:`V${pad2(code)}`,title:`Volume · ${dbText(dbOf(spec,code))}`},
      {kind:'end',text:'!',title:'End · 명령 끝(이어서 Enter 0x0D)'}
    ];
  }
  const textOf=parts=>parts.map(p=>p.text).join('');
  const volumeSpec=spec=>({zero:spec.volume?.zeroCode??50,step:spec.volume?.stepDb??0.5,min:spec.volume?.minCode??0,max:spec.volume?.maxCode??99,mute:spec.volume?.muteCode});
  function volumeCode(spec,db){const v=volumeSpec(spec);return clamp(Math.round(v.zero+db/v.step),v.min,v.max)}
  function dbOf(spec,code){const v=volumeSpec(spec);return (code-v.zero)*v.step}
  function dbText(db){return `${db>0?'+':''}${db.toFixed(1)}dB`}
  // 뮤트: 매뉴얼 표의 Mute 칸 값(HDS-21U는 0)을 그대로 Vxx에 넣는다. muteCode가 없는 제품은 null.
  function muteCommand(spec){
    const m=volumeSpec(spec).mute;
    if(m===undefined||m===null)return null;
    const parts=[
      {kind:'start',text:'*',title:'Start · 명령 시작'},
      {kind:'id',text:spec.productId,title:'Product ID · 제품 ID'},
      {kind:'vol',text:`V${pad2(m)}`,title:'Volume · 뮤트(매뉴얼 표 Mute 칸 값)'},
      {kind:'end',text:'!',title:'End · 명령 끝(이어서 Enter 0x0D)'}
    ];
    return {text:textOf(parts),parts,code:m};
  }
  function switchCommand(spec,input,output){
    const i=clamp(Math.round(input),1,spec.inputs),o=clamp(Math.round(output),1,spec.outputs);
    const parts=switchParts(spec,i,o);
    return {text:textOf(parts),parts,input:i,output:o};
  }
  function volumeCommand(spec,db){
    const code=volumeCode(spec,db),parts=volumeParts(spec,code);
    return {text:textOf(parts),parts,code,db:dbOf(spec,code)};
  }
  // 문자열 뒤에 Enter(0x0D)를 붙인 바이트열을 "2A 30 30 30 …" 형태의 HEX로 보여 준다.
  function toHex(text){
    return [...text].map(ch=>ch.charCodeAt(0).toString(16).toUpperCase().padStart(2,'0')).concat('0D').join(' ');
  }
  // AMX NetLinx: 직렬 포트 설정 한 줄 + 명령마다 터치 패널 버튼 하나씩 SEND_STRING. commands는 문자열 또는 {label,text}.
  // 데이터 비트·패리티는 매뉴얼에 없어 일반값(8N1)으로 적고 현장 확인을 안내한다.
  function amxCode(spec,commands){
    const dev=spec.amxDevice||'dvSwitcher',baud=spec.serial?.baud||9600;
    const lines=[
      `DEFINE_DEVICE`,
      `${dev} = 5001:1:0   // RS-232 포트 장치 번호는 현장에 맞게 변경`,
      ``,
      `DEFINE_START`,
      `SEND_COMMAND ${dev},'SET BAUD ${baud},${spec.serial?.parity||'N'},${spec.serial?.dataBits||8},${spec.serial?.stopBits||1} 485 DISABLE'   // ${spec.serial?.confirmed?`${baud}bps ${spec.serial.confirmed}`:`${baud}bps, 데이터·패리티·스톱 비트는 현장 확인`}`
    ];
    commands.forEach((c,i)=>{
      const item=typeof c==='string'?{label:'',text:c}:c;
      lines.push(``,`// 터치 패널 버튼 ${i+1}번${item.label?` · ${item.label}`:''} (CR = $0D)`,`BUTTON_EVENT[dvTP,${i+1}]`,`{`,`  PUSH:`,`  {`,`    SEND_STRING ${dev},"'${item.text}',$0D"`,`  }`,`}`);
    });
    return lines.join('\n');
  }
  // ---- 매트릭스 제품(QMS-44UX·QMS-88UX, spec.kind === 'matrix') ----
  // 근거: 사용자 매뉴얼 QMS-44UX 25·28쪽, QMS-88UX 14·28·31·36·37쪽. 형식은 * + 제품 ID + 명령 + 데이터 + ! + Enter(CR 0x0D).
  //   연결 C: Ixx Oyy 쌍을 콤마로 이어 한 번에 여러 개, 같은 입력의 출력은 하이픈 범위(예: *255CI01O01-10!)
  //   44UX 1 Input All Output A: *01AI01!, 88UX 연결 해제 D: *255DI04O01!, 88UX 프리셋 PC·PS·PR 01~20: *255PC01!
  // routes는 [입력 번호, 출력 번호](1부터, spec.inputCodes·outputCodes의 순서) 목록이다.
  const mStart=()=>({kind:'start',text:'*',title:'Start · 명령 시작'});
  const mId=spec=>({kind:'id',text:spec.productId,title:`Product ID · 제품 ID ${spec.productId}`});
  const mEnd=()=>({kind:'end',text:'!',title:'End · 명령 끝(이어서 Enter 0x0D)'});
  const inCode=(spec,i)=>spec.inputCodes[i-1],outCode=(spec,o)=>spec.outputCodes[o-1];
  function uniqueRoutes(spec,routes){
    const seen=new Set(),list=[];
    for(const r of routes||[]){
      const i=Math.round(r[0]),o=Math.round(r[1]);
      if(i<1||i>spec.inputCodes.length||o<1||o>spec.outputCodes.length)continue;
      const k=`${i},${o}`;if(seen.has(k))continue;seen.add(k);list.push([i,o]);
    }
    return list;
  }
  // 같은 입력은 처음 나온 순서대로 묶고, 그 입력의 출력은 오름차순으로 정렬해 3개 이상 이어진 구간만 범위(O01-08)로 줄인다.
  function routeItems(spec,list){
    const order=[],byIn=new Map();
    for(const [i,o] of list){if(!byIn.has(i)){byIn.set(i,[]);order.push(i)}byIn.get(i).push(o)}
    const items=[];
    for(const i of order){
      const outs=byIn.get(i).sort((x,y)=>x-y);
      let k=0;
      while(k<outs.length){
        let e=k;while(e+1<outs.length&&outs[e+1]===outs[e]+1)e++;
        if(e-k+1>=3)items.push({i,from:outs[k],to:outs[e]});
        else for(let n=k;n<=e;n++)items.push({i,from:outs[n],to:outs[n]});
        k=e+1;
      }
    }
    return items;
  }
  function routeCommand(spec,routes,action){
    const list=uniqueRoutes(spec,routes);
    if(!list.length)return null;
    const act=action==='D'&&spec.commands?.disconnect?'D':'C';
    const ins=new Set(list.map(r=>r[0]));
    // 1 Input All Output(A): 한 입력이 모든 출력에 이어질 때(해당 명령이 있는 제품만)
    if(act==='C'&&spec.commands?.oneToAll&&ins.size===1&&list.length===spec.outputCodes.length){
      const i=list[0][0];
      const parts=[mStart(),mId(spec),{kind:'cmd',text:'A',title:'Command · 한 입력을 모든 출력에 연결'},{kind:'in',text:`I${inCode(spec,i)}`,title:`Input No. · 입력 ${inCode(spec,i)}`},mEnd()];
      return {text:textOf(parts),parts,action:'A',count:list.length,routes:list};
    }
    const parts=[mStart(),mId(spec),{kind:'cmd',text:act,title:act==='C'?'Command · 영상 연결':'Command · 영상 연결 해제'}];
    routeItems(spec,list).forEach((it,n)=>{
      if(n)parts.push({kind:'sep',text:',',title:'구분 기호'});
      parts.push({kind:'in',text:`I${inCode(spec,it.i)}`,title:`Input No. · 입력 ${inCode(spec,it.i)}`});
      parts.push({kind:'out',text:it.from===it.to?`O${outCode(spec,it.from)}`:`O${outCode(spec,it.from)}-${outCode(spec,it.to)}`,title:it.from===it.to?`Output No. · 출력 ${outCode(spec,it.from)}`:`Output No. · 출력 ${outCode(spec,it.from)}~${outCode(spec,it.to)}(범위)`});
    });
    parts.push(mEnd());
    return {text:textOf(parts),parts,action:act,count:list.length,routes:list};
  }
  const PRESET_CODES={call:['PC','Preset Call · 저장한 프리셋 불러오기'],save:['PS','Preset Save · 현재 구성을 프리셋에 저장'],clear:['PR','Preset Clear · 프리셋 삭제']};
  function presetCommand(spec,kind,n){
    const def=PRESET_CODES[kind],max=spec.commands?.preset?.max;
    if(!def||!max)return null;
    const num=clamp(Math.round(n),1,max);
    const parts=[mStart(),mId(spec),{kind:'cmd',text:def[0],title:def[1]},{kind:'vol',text:pad2(num),title:`Preset Number · 프리셋 ${num}번(01~${pad2(max)})`},mEnd()];
    return {text:textOf(parts),parts,number:num};
  }
  const tokens=parts=>parts.map(p=>`<span class="rt-ce-tok rt-ce-tok-${p.kind}" title="${esc(p.title)}">${esc(p.text)}</span>`).join('');
  const range=(n,from=1)=>Array.from({length:n},(_,i)=>from+i);

  function mount(root,spec){
    if(spec.kind==='matrix')return mountMatrix(root,spec);
    let st={input:2,output:2,db:2};
    const key=`rtcom.controlExample.${spec.id||'x'}`;
    try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&typeof v==='object')st={...st,...v}}catch{}
    const save=()=>{try{localStorage.setItem(key,JSON.stringify(st))}catch{}};
    st.input=clamp(Number(st.input)||1,1,spec.inputs);st.output=clamp(Number(st.output)||1,1,spec.outputs);
    const v=volumeSpec(spec);
    const dbMin=dbOf(spec,v.min),dbMax=dbOf(spec,v.max);
    function render(){
      const sel=switchCommand(spec,st.input,st.output);
      const vol=volumeCommand(spec,Number(st.db)||0),mute=muteCommand(spec);
      // 라우팅 표: 가로는 출력, 세로는 입력. 칸마다 그 경로의 명령어를 바로 보여 주고, 누르면 아래 상세가 그 칸으로 바뀐다.
      const grid=`<div class="rt-ce-grid" role="group" aria-label="입력·출력 라우팅 표" style="--rt-ce-cols:${spec.outputs}">
        <span class="rt-ce-corner">입력 / 출력</span>${range(spec.outputs).map(o=>`<b class="rt-ce-colhead">OUT ${o}</b>`).join('')}
        ${range(spec.inputs).map(i=>`<b class="rt-ce-rowhead">IN ${i}</b>${range(spec.outputs).map(o=>{const c=switchCommand(spec,i,o),on=i===st.input&&o===st.output;return `<button type="button" class="rt-ce-cell${on?' is-sel':''}" data-ce-cell="${i},${o}" aria-pressed="${on}"><small>IN ${i} → OUT ${o}</small><code>${esc(c.text)}</code></button>`}).join('')}`).join('')}
      </div>`;
      const all=range(spec.inputs).flatMap(i=>range(spec.outputs).map(o=>switchCommand(spec,i,o).text));
      root.innerHTML=`
      <div class="rt-ce-block"><div class="rt-ce-head"><h3>입력 → 출력 라우팅 (${spec.inputs}×${spec.outputs} = ${all.length}가지)</h3><button type="button" class="rt-pg-btn" data-ce-copy="all">전체 ${all.length}개 복사</button><span class="rt-ce-copied" data-ce-note="all" aria-live="polite"></span></div>
        <div class="rt-ce-controls"><label>입력<select data-ce-field="input">${range(spec.inputs).map(n=>`<option value="${n}"${n===st.input?' selected':''}>입력 ${n}번</option>`).join('')}</select></label><label>출력<select data-ce-field="output">${range(spec.outputs).map(n=>`<option value="${n}"${n===st.output?' selected':''}>출력 ${n}번</option>`).join('')}</select></label></div>
        ${grid}
        <pre data-ce-text="all" hidden>${esc(all.join('\n'))}</pre></div>
      <div class="rt-ce-block"><div class="rt-ce-head"><h3>선택한 경로 · IN ${sel.input} → OUT ${sel.output}</h3><button type="button" class="rt-pg-btn" data-ce-copy="sw">복사</button><span class="rt-ce-copied" data-ce-note="sw" aria-live="polite"></span></div>
        <pre class="rt-ce-cmd" data-ce-text="sw"><span class="rt-ce-line"><small>입력 ${sel.input}번 → 출력 ${sel.output}번</small>${tokens(sel.parts)}<span class="rt-ce-cr" title="Enter · 0x0D">⏎</span></span></pre>
        <p class="rt-ce-hex">HEX <code>${esc(toHex(sel.text))}</code></p></div>
      <div class="rt-ce-controls"><label>오디오 볼륨(dB)<input type="number" data-ce-field="db" value="${st.db}" min="${dbMin}" max="${dbMax}" step="${v.step}"></label></div>
      <div class="rt-ce-block"><div class="rt-ce-head"><h3>볼륨 커맨드</h3><button type="button" class="rt-pg-btn" data-ce-copy="vol">복사</button><span class="rt-ce-copied" data-ce-note="vol" aria-live="polite"></span></div>
        <pre class="rt-ce-cmd" data-ce-text="vol"><span class="rt-ce-line"><small>${esc(dbText(vol.db))} (코드 ${pad2(vol.code)})</small>${tokens(vol.parts)}<span class="rt-ce-cr" title="Enter · 0x0D">⏎</span></span></pre>
        <p class="rt-ce-hex">HEX <code>${esc(toHex(vol.text))}</code> · 코드 ${v.zero}가 0dB, 1 오를 때마다 ${v.step}dB 증가</p></div>
      ${mute?`<div class="rt-ce-block"><div class="rt-ce-head"><h3>뮤트 커맨드</h3><button type="button" class="rt-pg-btn" data-ce-copy="mute">복사</button><span class="rt-ce-copied" data-ce-note="mute" aria-live="polite"></span></div>
        <pre class="rt-ce-cmd" data-ce-text="mute"><span class="rt-ce-line"><small>뮤트 (볼륨 코드 ${pad2(mute.code)})</small>${tokens(mute.parts)}<span class="rt-ce-cr" title="Enter · 0x0D">⏎</span></span></pre>
        <p class="rt-ce-hex">HEX <code>${esc(toHex(mute.text))}</code> · 매뉴얼 표의 Mute 칸 값(${mute.code})을 볼륨 자리에 넣은 값입니다. 뮤트 해제 방법은 매뉴얼에 없어 장비에서 확인이 필요합니다.</p></div>`:''}
      <div class="rt-ce-block"><div class="rt-ce-head"><h3>AMX NetLinx 예제 (${mute?'경로 · 볼륨 · 뮤트':'선택한 경로 + 볼륨'})</h3><button type="button" class="rt-pg-btn" data-ce-copy="amx">복사</button><span class="rt-ce-copied" data-ce-note="amx" aria-live="polite"></span></div>
        <pre class="rt-ce-cmd rt-ce-code" data-ce-text="amx">${esc(amxCode(spec,[{label:`IN ${sel.input} → OUT ${sel.output}`,text:sel.text},{label:dbText(vol.db),text:vol.text},...(mute?[{label:'뮤트',text:mute.text}]:[])]))}</pre></div>
      <p class="rt-pg-hint">※ 근거: ${esc(spec.source)}. 통신 속도 ${spec.serial?.baud||9600}bps, 문장 끝에 Enter(0x0D)를 붙입니다. 제품 ID는 매뉴얼 예시의 ${esc(spec.productId)}입니다. 표의 모든 칸은 매뉴얼 예시(<code>${esc(spec.manualExample||'*000CI02O02!')}</code>)에서 번호만 바꾼 값입니다.</p>
      <p class="rt-pg-hint">※ 매뉴얼에 적혀 있지 않아 넣지 않은 것: 데이터 비트·패리티·스톱 비트(코드의 8N1은 일반값), ${mute?'':'뮤트 명령, '}볼륨 허용 범위(코드 ${pad2(v.min)}~${pad2(v.max)}는 두 자리 형식에서 계산한 값). AMX 장치 번호와 버튼 번호는 현장에 맞게 바꾸세요.</p>`;
    }
    root.addEventListener('change',event=>{
      const field=event.target.closest('[data-ce-field]');if(!field)return;
      const name=field.dataset.ceField;
      if(name==='db')st.db=clamp(Number(field.value)||0,dbMin,dbMax);
      else if(name==='input')st.input=clamp(Number(field.value)||1,1,spec.inputs);
      else if(name==='output')st.output=clamp(Number(field.value)||1,1,spec.outputs);
      else return;
      save();render();
    });
    root.addEventListener('click',event=>{
      const cell=event.target.closest('[data-ce-cell]');
      if(!cell)return;
      const [i,o]=cell.dataset.ceCell.split(',').map(Number);
      st.input=i;st.output=o;save();render();
      root.querySelector(`[data-ce-cell="${i},${o}"]`)?.focus({preventScroll:true});
    });
    root.addEventListener('click',event=>{
      const btn=event.target.closest('[data-ce-copy]');if(!btn)return;
      const key=btn.dataset.ceCopy,pre=root.querySelector(`[data-ce-text="${key}"]`),note=root.querySelector(`[data-ce-note="${key}"]`);
      const text=key==='amx'||key==='all'?pre.textContent:[...pre.querySelectorAll('.rt-ce-line')].map(line=>[...line.querySelectorAll('.rt-ce-tok')].map(t=>t.textContent).join('')).join('\n');
      const done=()=>{if(note){note.textContent='복사했습니다';setTimeout(()=>{note.textContent=''},1800)}};
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done,()=>{if(note)note.textContent='복사하지 못했습니다. 직접 선택해 복사하세요.'});
      else{pre.hidden=false;const r=document.createRange();r.selectNodeContents(pre);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);done()}
    });
    render();
  }
  function mountMatrix(root,spec){
    const key=`rtcom.controlExample.${spec.id||'x'}`;
    const manual=(spec.defaultRoutes||[[4,1],[2,2]]).map(r=>[...r]);
    let st={routes:manual,action:'C',preset:1};
    try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&Array.isArray(v.routes))st={...st,...v}}catch{}
    const save=()=>{try{localStorage.setItem(key,JSON.stringify(st))}catch{}};
    st.routes=uniqueRoutes(spec,st.routes);
    if(st.action==='D'&&!spec.commands?.disconnect)st.action='C';
    const nIn=spec.inputCodes.length,nOut=spec.outputCodes.length,presetMax=spec.commands?.preset?.max||0;
    const has=(i,o)=>st.routes.some(r=>r[0]===i&&r[1]===o);
    function render(){
      const cmd=routeCommand(spec,st.routes,st.action);
      const grid=`<div class="rt-ce-grid rt-ce-grid-matrix" role="group" aria-label="입력·출력 라우팅 표" style="--rt-ce-cols:${nOut}">
        <span class="rt-ce-corner">입력 / 출력</span>${range(nOut).map(o=>`<b class="rt-ce-colhead">${esc(spec.outputCodes[o-1])}</b>`).join('')}
        ${range(nIn).map(i=>`<b class="rt-ce-rowhead">IN ${esc(spec.inputCodes[i-1])}</b>${range(nOut).map(o=>{const on=has(i,o);return `<button type="button" class="rt-ce-cell rt-ce-cell-mini${on?' is-sel':''}" data-ce-cell="${i},${o}" aria-pressed="${on}" aria-label="입력 ${esc(spec.inputCodes[i-1])} → 출력 ${esc(spec.outputCodes[o-1])}" title="I${esc(spec.inputCodes[i-1])}O${esc(spec.outputCodes[o-1])}">${on?'●':''}</button>`}).join('')}`).join('')}
      </div>`;
      const act=spec.commands?.disconnect?`<label>동작<select data-ce-field="action"><option value="C"${st.action==='C'?' selected':''}>연결 (C)</option><option value="D"${st.action==='D'?' selected':''}>연결 해제 (D)</option></select></label>`:'';
      const all=`<label>한 입력을 모든 출력에<select data-ce-field="allIn">${range(nIn).map(i=>`<option value="${i}">입력 ${esc(spec.inputCodes[i-1])}</option>`).join('')}</select></label><button type="button" class="rt-pg-btn" data-ce-act="all">모든 출력에 연결</button>`;
      const chips=st.routes.length?st.routes.map(r=>`I${esc(spec.inputCodes[r[0]-1])}→O${esc(spec.outputCodes[r[1]-1])}`).join(' · '):'선택한 경로가 없습니다. 표의 칸을 눌러 경로를 고르세요.';
      const presetBlocks=presetMax?['call','save','clear'].map(k=>{const c=presetCommand(spec,k,st.preset);const nm={call:'프리셋 불러오기',save:'프리셋 저장',clear:'프리셋 삭제'}[k];return `<div class="rt-ce-block"><div class="rt-ce-head"><h3>${nm} (${c.parts[2].text})</h3><button type="button" class="rt-pg-btn" data-ce-copy="preset-${k}">복사</button><span class="rt-ce-copied" data-ce-note="preset-${k}" aria-live="polite"></span></div>
        <pre class="rt-ce-cmd" data-ce-text="preset-${k}"><span class="rt-ce-line"><small>프리셋 ${c.number}번</small>${tokens(c.parts)}<span class="rt-ce-cr" title="Enter · 0x0D">⏎</span></span></pre>
        <p class="rt-ce-hex">HEX <code>${esc(toHex(c.text))}</code></p></div>`}).join(''):'';
      const amxList=[];
      if(cmd)amxList.push({label:`${cmd.action==='D'?'연결 해제':cmd.action==='A'?'한 입력 → 모든 출력':'연결'} ${cmd.count}개 경로`,text:cmd.text});
      if(presetMax)amxList.push({label:`프리셋 ${st.preset}번 불러오기`,text:presetCommand(spec,'call',st.preset).text});
      root.innerHTML=`
      <div class="rt-ce-block"><div class="rt-ce-head"><h3>입력 → 출력 라우팅 (${nIn}×${nOut})</h3><span class="rt-ce-copied" aria-live="polite"></span></div>
        <p class="rt-ce-hint-inline">칸을 눌러 경로를 켜고 끕니다. 여러 경로를 고르면 명령 한 줄로 합쳐집니다.</p>
        <div class="rt-ce-controls">${act}${all}<button type="button" class="rt-pg-btn" data-ce-act="clear">선택 지우기</button><button type="button" class="rt-pg-btn" data-ce-act="example">매뉴얼 예시</button></div>
        ${grid}
        <p class="rt-ce-chips">${chips}</p></div>
      <div class="rt-ce-block"><div class="rt-ce-head"><h3>${st.action==='D'?'연결 해제':'연결'} 커맨드${cmd?` · ${cmd.count}개 경로`:''}</h3><button type="button" class="rt-pg-btn" data-ce-copy="route"${cmd?'':' disabled'}>복사</button><span class="rt-ce-copied" data-ce-note="route" aria-live="polite"></span></div>
        ${cmd?`<pre class="rt-ce-cmd" data-ce-text="route"><span class="rt-ce-line"><small>${cmd.action==='A'?'한 입력을 모든 출력에(A)':cmd.action==='D'?'선택한 경로 연결 해제(D)':'선택한 경로 연결(C)'}</small>${tokens(cmd.parts)}<span class="rt-ce-cr" title="Enter · 0x0D">⏎</span></span></pre>
        <p class="rt-ce-hex">HEX <code>${esc(toHex(cmd.text))}</code></p>`:'<pre class="rt-ce-cmd" data-ce-text="route"><span class="rt-ce-line"><small>경로를 선택하면 커맨드가 만들어집니다.</small></span></pre>'}</div>
      ${presetMax?`<div class="rt-ce-controls"><label>프리셋 번호<input type="number" data-ce-field="preset" value="${st.preset}" min="1" max="${presetMax}" step="1"></label></div>${presetBlocks}`:''}
      <div class="rt-ce-block"><div class="rt-ce-head"><h3>AMX NetLinx 예제 (${presetMax?'경로 · 프리셋 불러오기':'선택한 경로'})</h3><button type="button" class="rt-pg-btn" data-ce-copy="amx"${amxList.length?'':' disabled'}>복사</button><span class="rt-ce-copied" data-ce-note="amx" aria-live="polite"></span></div>
        <pre class="rt-ce-cmd rt-ce-code" data-ce-text="amx">${amxList.length?esc(amxCode(spec,amxList)):'경로를 선택하면 코드가 만들어집니다.'}</pre></div>
      <p class="rt-pg-hint">※ 근거: ${esc(spec.source)}. 통신 ${spec.serial?.baud}bps ${esc(spec.serial?.confirmed||'')}. 문장 끝에 Enter(CR 0x0D)를 붙입니다. 제품 ID는 매뉴얼 예시의 ${esc(spec.productId)}입니다(${esc(spec.productIdNote||'')}).</p>
      <p class="rt-pg-hint">※ ${esc(spec.limits||'')} AMX 장치 번호와 버튼 번호는 현장에 맞게 바꾸세요.</p>`;
    }
    root.addEventListener('change',event=>{
      const f=event.target.closest('[data-ce-field]');if(!f)return;
      const name=f.dataset.ceField;
      if(name==='action')st.action=f.value==='D'?'D':'C';
      else if(name==='preset')st.preset=clamp(Number(f.value)||1,1,presetMax||1);
      else return;
      save();render();
    });
    root.addEventListener('click',event=>{
      const cell=event.target.closest('[data-ce-cell]');
      if(cell){
        const [i,o]=cell.dataset.ceCell.split(',').map(Number);
        st.routes=has(i,o)?st.routes.filter(r=>!(r[0]===i&&r[1]===o)):[...st.routes,[i,o]];
        save();render();root.querySelector(`[data-ce-cell="${i},${o}"]`)?.focus({preventScroll:true});return;
      }
      const act=event.target.closest('[data-ce-act]');
      if(act){
        const k=act.dataset.ceAct;
        if(k==='clear')st.routes=[];
        else if(k==='example')st.routes=manual.map(r=>[...r]);
        else if(k==='all'){const i=Number(root.querySelector('[data-ce-field="allIn"]')?.value)||1;st.routes=range(nOut).map(o=>[i,o])}
        save();render();return;
      }
      const btn=event.target.closest('[data-ce-copy]');if(!btn)return;
      const k=btn.dataset.ceCopy,pre=root.querySelector(`[data-ce-text="${k}"]`),note=root.querySelector(`[data-ce-note="${k}"]`);
      if(!pre)return;
      const text=k==='amx'?pre.textContent:[...pre.querySelectorAll('.rt-ce-line')].map(line=>[...line.querySelectorAll('.rt-ce-tok')].map(t=>t.textContent).join('')).join('\n');
      const done=()=>{if(note){note.textContent='복사했습니다';setTimeout(()=>{note.textContent=''},1800)}};
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(done,()=>{if(note)note.textContent='복사하지 못했습니다. 직접 선택해 복사하세요.'});
      else{const r=document.createRange();r.selectNodeContents(pre);const sl=getSelection();sl.removeAllRanges();sl.addRange(r);done()}
    });
    render();
  }
  function mountAll(body){
    body.querySelectorAll('[data-control-example]').forEach(el=>{
      try{mount(el,JSON.parse(el.dataset.controlExample))}catch{el.textContent='커맨드 예시를 불러오지 못했습니다.'}
    });
  }
  return {routeCommand,presetCommand,switchCommand,volumeCommand,muteCommand,volumeCode,dbOf,toHex,amxCode,mount,mountAll};
});
