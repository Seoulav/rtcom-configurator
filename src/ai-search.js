/* 0.140 RTCOM AI 검색(사내 베타). 공개 사이트에는 버튼이 보이지 않고, 주소 끝에 ?ai=beta를 붙여 한 번 연 브라우저에만 "AI 검색 β" 버튼이 생긴다.
   질문은 Cloudflare Worker(workers/ai-search)로만 가며, 회사 메일 인증(Cloudflare Access)과 허용 명단을 통과해 받은 서명 토큰이 있어야 답한다.
   API 키는 Worker에만 있다. 근거·설정 절차: docs/implementation/AI_SEARCH_BETA.md */
(function(){
  'use strict';
  // Worker를 배포한 뒤 주소를 적는다(예: https://rtcom-ai-api.<계정>.workers.dev). 비어 있으면 창에 "서버 준비 중"만 보인다.
  // 주소를 URL 파라미터로 바꾸지 못하게 코드에 고정한다(토큰이 다른 서버로 새지 않도록).
  // 자동 시험(scripts/e2e-smoke.cjs)은 페이지 스크립트보다 먼저 RTCOM_AI_TEST_CONFIG를 넣어 가짜 서버로 돌린다(같은 사이트 스크립트만 쓸 수 있는 값).
  const CONFIG=Object.assign({api:'',login:''},globalThis.RTCOM_AI_TEST_CONFIG||{});
  const FLAG_KEY='rtcom.ai.beta.v1',TOKEN_KEY='rtcom.ai.token.v1';
  const MODES=[['ask','질의응답·추천','예: 강의실 4K 소스 6개를 프로젝터 2대·TV 4대로 보내는 매트릭스 추천'],['configure','구성안 제안','예: HDMI 입력 24, 출력 HDMI 16 + 70m 떨어진 디스플레이 8대 구성안'],['compare','사양 비교','예: QMS-44UX와 QMS-88UX 비교']];
  const store={get(key){try{return localStorage.getItem(key)}catch(error){return null}},set(key,value){try{localStorage.setItem(key,value)}catch(error){}},remove(key){try{localStorage.removeItem(key)}catch(error){}}};

  // 로그인 창이 opener를 잃었을 때 Worker가 #ai-token=… 으로 돌려보낸다. 라우터보다 먼저 읽고 주소에서 지운다.
  const hashToken=location.hash.match(/^#ai-token=([A-Za-z0-9._%-]+)$/);
  if(hashToken){store.set(FLAG_KEY,'1');store.set(TOKEN_KEY,JSON.stringify({token:decodeURIComponent(hashToken[1])}));history.replaceState(null,'',location.pathname+location.search.replace(/[?&]ai=beta\b/,'')+'#matrix-configurator')}
  const param=new URLSearchParams(location.search).get('ai');
  if(param==='beta')store.set(FLAG_KEY,'1');
  if(param==='off'){store.remove(FLAG_KEY);store.remove(TOKEN_KEY)}
  if(param)history.replaceState(null,'',location.pathname+location.hash);
  if(store.get(FLAG_KEY)!=='1')return;

  const escape=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
  let products=null;
  const loadProducts=()=>products||(products=fetch('data/products/index.json').then(r=>r.json()).then(data=>Object.fromEntries(data.products.map(item=>[item.id,item.model]))).catch(()=>({})));
  let known={};
  const inline=text=>escape(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\[\[([a-z0-9-]+)\]\]/g,(all,id)=>known[id]?`<a class="rt-ai-product" href="#products/${id}">${escape(known[id])}</a>`:escape(id));
  // 답을 안전하게 그린다: 모든 글자를 먼저 이스케이프하고, 제목·목록·표·굵게·제품 링크만 허용한다.
  function render(markdown){
    const out=[],lines=markdown.replace(/\r/g,'').split('\n');let list=null,para=[];
    const flush=()=>{if(para.length){out.push(`<p>${para.map(inline).join('<br>')}</p>`);para=[]}if(list){out.push(`</${list}>`);list=null}};
    for(let i=0;i<lines.length;i++){
      const line=lines[i].trim();
      if(!line){flush();continue}
      if(line.startsWith('|')){
        flush();const rows=[];
        while(i<lines.length&&lines[i].trim().startsWith('|')){const cells=lines[i].trim().replace(/^\||\|$/g,'').split('|').map(cell=>cell.trim());if(!cells.every(cell=>/^:?-{2,}:?$/.test(cell)))rows.push(cells);i++}
        i--;
        if(rows.length)out.push(`<div class="rt-ai-table"><table><thead><tr>${rows[0].map(cell=>`<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map(cell=>`<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      const heading=line.match(/^#{1,4}\s+(.*)$/);
      if(heading){flush();out.push(`<h4>${inline(heading[1])}</h4>`);continue}
      const item=line.match(/^(?:[-*•]|(\d+)[.)])\s+(.*)$/);
      if(item){const kind=item[1]?'ol':'ul';if(para.length){const keep=list;list=null;flush();list=keep}if(list!==kind){if(list)out.push(`</${list}>`);out.push(`<${kind}>`);list=kind}out.push(`<li>${inline(item[2])}</li>`);continue}
      if(list){out.push(`</${list}>`);list=null}
      para.push(line);
    }
    flush();
    return out.join('');
  }

  const root=document.getElementById('rtcom-design');
  if(!root)return;
  const button=document.createElement('button');
  button.type='button';button.className='rt-ai-open';button.setAttribute('aria-haspopup','dialog');
  button.innerHTML='<span aria-hidden="true">✦</span> AI 검색 <span class="rt-ai-beta">β</span>';
  const links=root.querySelector('.rt-top-links');
  links?links.prepend(button):root.prepend(button);

  const panel=document.createElement('aside');
  panel.className='rt-ai-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','RTCOM AI 검색 사내 베타');
  panel.innerHTML=`<header class="rt-ai-head"><div><strong>RTCOM AI 검색</strong><span class="rt-ai-beta">사내 베타</span><small class="rt-ai-who"></small></div><div class="rt-ai-head-actions"><button type="button" class="rt-ai-link" data-ai="logout" hidden>로그아웃</button><button type="button" class="rt-ai-close" data-ai="close" aria-label="닫기">×</button></div></header>
<div class="rt-ai-modes" role="tablist" aria-label="요청 유형">${MODES.map(([id,label],index)=>`<button type="button" role="tab" data-mode="${id}" aria-selected="${index===0}">${label}</button>`).join('')}</div>
<div class="rt-ai-log" aria-live="polite"></div>
<form class="rt-ai-form"><textarea rows="3" maxlength="2000" placeholder="${escape(MODES[0][2])}" aria-label="질문"></textarea><div class="rt-ai-form-row"><small>공개 제품 데이터 기준 · 가격 정보 없음 · 답변은 확인 후 사용</small><button type="submit" class="rt-ai-send">보내기</button></div></form>`;
  root.append(panel);
  const $=selector=>panel.querySelector(selector);
  const log=$('.rt-ai-log'),form=$('.rt-ai-form'),input=$('textarea'),send=$('.rt-ai-send');
  let mode='ask',turns=[],busy=false;

  const session=()=>{try{return JSON.parse(store.get(TOKEN_KEY)||'null')}catch(error){return null}};
  const setUser=info=>{$('.rt-ai-who').textContent=info?.email||'';$('[data-ai="logout"]').hidden=!info};
  const bubble=(kind,html)=>{const node=document.createElement('div');node.className=`rt-ai-msg rt-ai-${kind}`;node.innerHTML=html;log.append(node);log.scrollTop=log.scrollHeight;return node};
  const notice=text=>bubble('notice',escape(text));

  function showLogin(message){
    log.querySelector('.rt-ai-login')?.remove();
    const node=bubble('notice rt-ai-login',`${escape(message||'회사 메일(허용 명단)로 로그인하면 질문할 수 있습니다.')}<br><button type="button" class="rt-ai-send" data-ai="login">회사 메일로 로그인</button>`);
    node.querySelector('[data-ai="login"]').addEventListener('click',()=>{
      const popup=window.open(`${CONFIG.login}/login?origin=${encodeURIComponent(location.origin)}`,'rtcom-ai-login','width=480,height=680');
      if(!popup)location.href=`${CONFIG.login}/login?origin=${encodeURIComponent(location.origin)}`;
    });
  }
  window.addEventListener('message',event=>{
    if(!CONFIG.login||event.origin!==new URL(CONFIG.login).origin||event.data?.type!=='rtcom-ai-token'||typeof event.data.token!=='string')return;
    store.set(TOKEN_KEY,JSON.stringify({token:event.data.token,email:event.data.email,exp:event.data.exp}));
    log.querySelector('.rt-ai-login')?.remove();
    setUser(session());notice(`${event.data.email} 로 로그인되었습니다.`);input.focus();
  });

  async function checkSession(){
    if(!CONFIG.api||!CONFIG.login){notice('AI 서버가 아직 준비되지 않았습니다. 관리자가 Worker 주소를 등록하면 사용할 수 있습니다.');send.disabled=true;return}
    const saved=session();
    if(!saved?.token){showLogin();return}
    try{
      const response=await fetch(`${CONFIG.api}/api/me`,{headers:{authorization:`Bearer ${saved.token}`}});
      if(response.status===401){store.remove(TOKEN_KEY);setUser(null);showLogin('로그인이 만료되었습니다. 다시 로그인해 주세요.');return}
      const info=await response.json();store.set(TOKEN_KEY,JSON.stringify({...saved,...info}));setUser(info);
    }catch(error){notice('AI 서버에 연결하지 못했습니다.')}
  }

  async function ask(question){
    const saved=session();
    if(!saved?.token){showLogin();return}
    busy=true;send.disabled=true;
    bubble('user',`<span class="rt-ai-tag">${escape(MODES.find(item=>item[0]===mode)[1])}</span>${escape(question).replace(/\n/g,'<br>')}`);
    const answer=bubble('assistant','<span class="rt-ai-typing">답을 찾는 중…</span>');
    let text='',frame=0,failed='';
    const paint=()=>{frame=0;answer.innerHTML=render(text)||'<span class="rt-ai-typing">답을 찾는 중…</span>';log.scrollTop=log.scrollHeight};
    try{
      known=await loadProducts();
      const response=await fetch(`${CONFIG.api}/api/ask`,{method:'POST',headers:{authorization:`Bearer ${saved.token}`,'content-type':'application/json'},body:JSON.stringify({mode,question,history:turns.slice(-12)})});
      if(!response.ok){
        const data=await response.json().catch(()=>({}));
        if(response.status===401){store.remove(TOKEN_KEY);setUser(null);answer.remove();showLogin(data.message);return}
        throw new Error(data.message||`오류 ${response.status}`);
      }
      const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
      for(;;){
        const {value,done}=await reader.read();
        buffer+=decoder.decode(value||new Uint8Array(),{stream:!done});
        const lines=buffer.split('\n');buffer=lines.pop();
        for(const line of lines){
          if(!line.trim())continue;
          const event=JSON.parse(line);
          if(event.t==='text'){text+=event.v;if(!frame)frame=requestAnimationFrame(paint)}
          else if(event.t==='error')failed=event.v;
          else if(event.t==='notice')text+=`\n\n**${event.v}**`;
        }
        if(done)break;
      }
      if(frame)cancelAnimationFrame(frame);
      paint();
      if(failed){if(!text)answer.remove();notice(failed)}
      if(text&&!failed)turns.push({role:'user',text:`[${MODES.find(item=>item[0]===mode)[1]}] ${question}`},{role:'assistant',text});
    }catch(error){answer.remove();notice(error.message||'답을 받지 못했습니다.')}
    finally{busy=false;send.disabled=false;input.focus()}
  }

  let opened=false;
  const open=()=>{panel.hidden=false;button.setAttribute('aria-expanded','true');if(!opened){opened=true;setUser(session());checkSession()}input.focus()};
  const close=()=>{panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus()};
  button.addEventListener('click',()=>panel.hidden?open():close());
  panel.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  panel.addEventListener('click',event=>{
    const tab=event.target.closest('[data-mode]');
    if(tab){mode=tab.dataset.mode;panel.querySelectorAll('[data-mode]').forEach(item=>item.setAttribute('aria-selected',String(item===tab)));input.placeholder=MODES.find(item=>item[0]===mode)[2];input.focus();return}
    if(event.target.closest('[data-ai="close"]'))close();
    if(event.target.closest('[data-ai="logout"]')){store.remove(TOKEN_KEY);setUser(null);turns=[];showLogin('로그아웃했습니다.')}
    if(event.target.closest('.rt-ai-product')&&innerWidth<760)close();
  });
  form.addEventListener('submit',event=>{event.preventDefault();const question=input.value.trim();if(!question||busy)return;input.value='';ask(question)});
  input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();form.requestSubmit()}});
  globalThis.RtAiSearch={render};
})();
