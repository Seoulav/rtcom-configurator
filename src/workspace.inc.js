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
      const names={ERROR:'입력 필요',WARNING:'확인',UNCONFIRMED:'자료 미확정',INFO:'참고'};
      return `<section class="rt-validation" aria-label="검토 결과"><h3>검토 결과 <span class="rt-pill">미검증 초안</span></h3><p>현재 자료로 실제 설치 가능한 구성인지 확정할 수 없습니다.</p><ul>${result.issues.map(i=>`<li><strong>${names[i.level]}</strong><span>${esc(i.message)}${i.evidence?` <small>근거: ${esc(i.evidence)}</small>`:''}</span></li>`).join('')}</ul><a href="docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md" target="_blank" rel="noopener">제품 근거 및 확인 필요 사항 보기 ↗</a></section>`;
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
      document.getElementById('print-report').innerHTML=`<h1>RTCOM Matrix Configuration</h1><p><strong>미검증 검토용 초안 · 설치 및 구매 승인 자료가 아닙니다.</strong></p><p>${esc(state.family)} / ${esc(state.model||'섀시 미선택')} · ${new Date().toLocaleString('ko-KR')}</p><h2>장비 목록</h2>${table()}<h2>개념 배치 및 전송기 연결</h2><p>입력·출력 각 2칸은 실제 슬롯 수 또는 물리 위치를 의미하지 않습니다.</p><table><thead><tr><th>개념 위치</th><th>카드</th><th>포트 수</th><th>전송기 / 역할</th><th>수량</th><th>거리</th></tr></thead><tbody>${rows}</tbody></table>${validationView()}<p>카탈로그 버전: ${RtCore.catalogVersion} · 케이블·전원·기본 포함품은 별도 확인이 필요합니다.</p>`;
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
