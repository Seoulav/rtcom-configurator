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
      `SEND_COMMAND ${dev},'SET BAUD ${baud},N,8,1 485 DISABLE'   // ${baud}bps, 데이터·패리티·스톱 비트는 현장 확인`
    ];
    commands.forEach((c,i)=>{
      const item=typeof c==='string'?{label:'',text:c}:c;
      lines.push(``,`// 터치 패널 버튼 ${i+1}번${item.label?` · ${item.label}`:''} (CR = $0D)`,`BUTTON_EVENT[dvTP,${i+1}]`,`{`,`  PUSH:`,`  {`,`    SEND_STRING ${dev},"'${item.text}',$0D"`,`  }`,`}`);
    });
    return lines.join('\n');
  }
  const tokens=parts=>parts.map(p=>`<span class="rt-ce-tok rt-ce-tok-${p.kind}" title="${esc(p.title)}">${esc(p.text)}</span>`).join('');
  const range=(n,from=1)=>Array.from({length:n},(_,i)=>from+i);

  function mount(root,spec){
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
  function mountAll(body){
    body.querySelectorAll('[data-control-example]').forEach(el=>{
      try{mount(el,JSON.parse(el.dataset.controlExample))}catch{el.textContent='커맨드 예시를 불러오지 못했습니다.'}
    });
  }
  return {switchCommand,volumeCommand,muteCommand,volumeCode,dbOf,toHex,amxCode,mount,mountAll};
});
