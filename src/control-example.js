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
  function toHex(text,cr=true){
    const bytes=[...text].map(ch=>ch.charCodeAt(0).toString(16).toUpperCase().padStart(2,'0'));
    return (cr===false?bytes:bytes.concat('0D')).join(' ');
  }
  // AMX NetLinx: 통신 설정 + 명령마다 터치 패널 버튼 하나씩 SEND_STRING. commands는 문자열 또는 {label,text,enter}.
  // opts.mode: 'serial'(RS-232, 기본) | 'lan'(TCP/IP). 0.239 사용자 확인 2026-10-16 "amx로 알티컴 제어시 rs232는 잘 사용안하고 lan제어를 많이해" → 화면은 LAN이 기본이다.
  //   LAN: IP_CLIENT_OPEN(dev.PORT, IP, 포트, IP_TCP)로 장비에 TCP 연결한 뒤 같은 커맨드 문자열을 SEND_STRING으로 보낸다(NetLinx 표준 문법).
  //   포트는 매뉴얼에 적힌 값(spec.lan.port, SPX 매뉴얼 46쪽 Telnet 23)만 기본으로 쓰고, 없으면 0과 "확인 필요" 주석을 적는다. 값을 만들어 넣지 않는다.
  //   IP는 형식이 맞는 값만 쓰고(코드 주입 방지), 비어 있으면 예시 주소(192.168.1.100)를 적고 현장에서 바꾸도록 주석을 단다. 기본 대역은 192.168.1.xxx(사용자 확인 2026-10-16, SPX 매뉴얼 예시 192.168.1.72도 같은 대역).
  // 직렬은 데이터 비트·패리티가 매뉴얼에 없으면 일반값(8N1)으로 적고 현장 확인을 안내한다.
  const IPV4=/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const portOf=(spec,opts)=>{const n=Number(String(opts?.port??'').trim());if(Number.isInteger(n)&&n>=1&&n<=65535)return n;const d=Number(spec.lan?.port);return Number.isInteger(d)&&d>=1&&d<=65535?d:0};
  function amxCode(spec,commands,opts={}){
    const dev=spec.amxDevice||'dvSwitcher',baud=spec.serial?.baud||9600,lan=opts.mode==='lan';
    const lines=lan?(()=>{
      const ip=IPV4.test(String(opts.ip||'').trim())?String(opts.ip).trim():'192.168.1.100',ipGiven=ip!=='192.168.1.100'||IPV4.test(String(opts.ip||'').trim());
      const port=portOf(spec,opts),fromSpec=!String(opts.port??'').trim()&&port>0;
      return [
        `DEFINE_DEVICE`,
        `${dev} = 0:3:0   // LAN(TCP) 연결용 가상 장치, 포트 번호는 현장에 맞게 변경`,
        `dvTP = 10001:1:0   // 터치 패널 장치 번호는 현장에 맞게 변경`,
        ``,
        `DEFINE_CONSTANT`,
        `CHAR cDeviceIp[] = '${ip}'   // 장비 IP 주소${ipGiven?'':'(예시, 기본 대역은 192.168.1.xxx — 현장 IP로 변경)'}`,
        `LONG nDevicePort = ${port}   // TCP 포트${port?(fromSpec?` — ${spec.lan?.source||'매뉴얼 값'}`:' (직접 입력한 값)'):' 번호를 입력하세요(이 제품은 매뉴얼에 없어 알티컴 확인 필요)'}`,
        ``,
        `DEFINE_START`,
        `IP_CLIENT_OPEN(${dev}.PORT, cDeviceIp, nDevicePort, IP_TCP)   // 장비에 TCP 연결${spec.lan?.connections===1?'(장비는 동시 접속 1개: 다른 PC·컨트롤러가 이미 접속 중이면 연결되지 않음)':''}`,
        ``,
        `DEFINE_EVENT`,
        `DATA_EVENT[${dev}]`,
        `{`,
        `  ONLINE:  { }   // 연결됨`,
        `  OFFLINE: { }   // 연결이 끊김${spec.lan?.autoDisconnect===false?'(장비는 연결을 자동으로 끊지 않음, 케이블·전원·다른 접속이 원인)':''} → 필요하면 IP_CLIENT_OPEN을 다시 호출`,
        `  ONERROR: { }   // 연결 오류 → IP 주소·포트·LAN 케이블 확인`,
        `}`
      ];
    })():[
      `DEFINE_DEVICE`,
      `${dev} = 5001:1:0   // RS-232 포트 장치 번호는 현장에 맞게 변경`,
      `dvTP = 10001:1:0   // 터치 패널 장치 번호는 현장에 맞게 변경`,
      ``,
      `DEFINE_START`,
      `SEND_COMMAND ${dev},'SET BAUD ${baud},${spec.serial?.parity||'N'},${spec.serial?.dataBits||8},${spec.serial?.stopBits||1} 485 DISABLE'   // ${spec.serial?.confirmed?`${baud}bps ${spec.serial.confirmed}`:`${baud}bps, 데이터·패리티·스톱 비트는 현장 확인`}`,
      ``,
      `DEFINE_EVENT`
    ];
    commands.forEach((c,i)=>{
      const item=typeof c==='string'?{label:'',text:c}:c;
      const enter=item.enter!==false;
      lines.push(``,`// 터치 패널 버튼 ${i+1}번${item.label?` · ${item.label}`:''}${enter?' (CR = $0D)':''}`,`BUTTON_EVENT[dvTP,${i+1}]`,`{`,`  PUSH:`,`  {`,`    SEND_STRING ${dev},"'${item.text}'${enter?',$0D':''}"`,`  }`,`}`);
    });
    return lines.join('\n');
  }
  // ---- 0.239 "내 AMX 구성"(장바구니): 07 화면 연출 시뮬레이터와 설정 명령에서 만든 커맨드를 담아 한 개의 AMX 코드로 묶는다 ----
  // 항목은 {label,text,enter,source}. 같은 문자열은 한 번만 담고, 최대 60개. 저장은 이 브라우저에만(rtcom.amxBasket.<시리즈 id>.v1).
  // 장바구니 코드는 amxCode와 같은 규칙(명령마다 터치 패널 버튼 하나, 담은 순서대로)이라 새 문법을 만들어 넣지 않는다.
  const BASKET_MAX=60;
  function basketClean(list,limit=BASKET_MAX){
    return (Array.isArray(list)?list:[]).filter(x=>x&&typeof x.text==='string'&&x.text).slice(0,limit)
      .map(x=>({label:String(x.label||'').slice(0,80),text:x.text,enter:x.enter!==false,source:String(x.source||'').slice(0,24)}));
  }
  function basketAdd(list,items){
    const cur=basketClean(list);let added=0,dup=0,full=0;
    for(const it of basketClean(items,Infinity)){
      if(cur.some(c=>c.text===it.text&&c.enter===it.enter)){dup++;continue}
      if(cur.length>=BASKET_MAX){full++;continue}
      cur.push(it);added++;
    }
    return {list:cur,added,dup,full};
  }
  function basketRemove(list,index){const cur=basketClean(list);if(index>=0&&index<cur.length)cur.splice(index,1);return cur}
  function basketMove(list,index,delta){
    const cur=basketClean(list),to=index+delta;
    if(index<0||index>=cur.length||to<0||to>=cur.length)return cur;
    [cur[index],cur[to]]=[cur[to],cur[index]];return cur;
  }
  const basketCode=(spec,list,opts)=>amxCode(spec,basketClean(list),opts);
  const basketNote=r=>r.added?`구성에 담았습니다(지금 ${r.list.length}개)`:r.full?`구성이 가득 찼습니다(최대 ${BASKET_MAX}개)`:'이미 담겨 있습니다';
  const memoryBasket={};
  const basketKey=id=>`rtcom.amxBasket.${id}.v1`;
  const basket={
    get(id){
      try{const raw=localStorage.getItem(basketKey(id));if(raw)return basketClean(JSON.parse(raw))}catch{}
      return basketClean(memoryBasket[id]);
    },
    set(id,list){
      const clean=basketClean(list);memoryBasket[id]=clean;
      try{localStorage.setItem(basketKey(id),JSON.stringify(clean))}catch{}
      if(typeof document!=='undefined'&&typeof CustomEvent==='function')document.dispatchEvent(new CustomEvent('rt-amx-basket',{detail:{id}}));
      return clean;
    },
    add(id,items){const r=basketAdd(basket.get(id),items);basket.set(id,r.list);return r},
    remove(id,index){return basket.set(id,basketRemove(basket.get(id),index))},
    move(id,index,delta){return basket.set(id,basketMove(basket.get(id),index,delta))},
    clear(id){return basket.set(id,[])}
  };
  // ---- 0.239 AMX 통신 방식(LAN 기본 / RS-232): 선택·IP·포트는 이 브라우저에만 기억하고(rtcom.amxComm.<제품 id>.v1), 화면의 모든 AMX 코드가 입력하는 즉시 바뀐다 ----
  const commMemory={};
  const specRegistry={};
  const commKey=id=>`rtcom.amxComm.${id}.v1`;
  function commOf(spec){
    const id=spec.id||'x';let v=commMemory[id];
    try{const raw=localStorage.getItem(commKey(id));if(raw)v=JSON.parse(raw)}catch{}
    v=v&&typeof v==='object'?v:{};
    return {mode:v.mode==='serial'?'serial':'lan',ip:String(v.ip||'').slice(0,40),port:String(v.port||'').slice(0,6)};
  }
  function setComm(spec,patch){
    const id=spec.id||'x',next={...commOf(spec),...patch};
    commMemory[id]=next;try{localStorage.setItem(commKey(id),JSON.stringify(next))}catch{}
    return next;
  }
  function commBarHtml(spec){
    const c=commOf(spec),id=esc(spec.id||'x');
    const note=spec.lan?.port?`TCP 포트 ${spec.lan.port}: ${spec.lan.source||'매뉴얼'}`:'이 제품의 LAN(TCP) 포트는 매뉴얼에 없어 알티컴 확인이 필요합니다. 아는 포트 번호를 직접 넣으세요.';
    return `<div class="rt-ce-comm" data-ce-commbar="${id}"><label>통신 방식<select data-ce-comm="mode"><option value="lan"${c.mode==='lan'?' selected':''}>LAN (TCP/IP)</option><option value="serial"${c.mode==='serial'?' selected':''}>RS-232 (직렬)</option></select></label><span class="rt-ce-comm-lan"${c.mode==='lan'?'':' hidden'}><label>장비 IP 주소<input type="text" inputmode="decimal" data-ce-comm="ip" value="${esc(c.ip)}" placeholder="192.168.1.xxx" autocomplete="off" maxlength="15"></label><label>TCP 포트<input type="text" inputmode="numeric" data-ce-comm="port" value="${esc(c.port)}" placeholder="${esc(spec.lan?.port||'확인 필요')}" autocomplete="off" maxlength="5"></label></span><p class="rt-pg-hint">${esc(note)} ${spec.lan?.confirmed?'LAN으로 보내는 커맨드 문자열은 RS-232와 같습니다. 장비는 동시 접속이 1개이고 연결을 자동으로 끊지 않습니다(알티컴 회신).':'LAN으로 보내는 커맨드 문자열은 RS-232와 같다고 보고 만든 예시이며, 제품별 확인 내용은 알티컴에 문의하세요.'}</p></div>`;
  }
  // AMX 코드 <pre>: 항목 목록을 속성에 담아 두면 통신 방식·IP·포트가 바뀔 때 화면을 다시 그리지 않고 그 자리에서 글만 바꾼다(입력 칸 포커스 유지).
  function amxPre(spec,items,extra=''){
    specRegistry[spec.id||'x']=spec;
    return `<pre class="rt-ce-cmd rt-ce-code" ${extra} data-ce-amxspec="${esc(spec.id||'x')}" data-ce-amxitems="${esc(JSON.stringify(items))}">${esc(amxCode(spec,items,commOf(spec)))}</pre>`;
  }
  function installCommHandlers(){
    if(typeof document==='undefined'||document.__rtCeCommInstalled)return;
    document.__rtCeCommInstalled=true;
    const onEdit=event=>{
      const el=event.target.closest&&event.target.closest('[data-ce-comm]');if(!el)return;
      const bar=el.closest('[data-ce-commbar]');if(!bar)return;
      const id=bar.dataset.ceCommbar,spec=specRegistry[id];if(!spec)return;
      const key=el.dataset.ceComm,value=key==='mode'?(el.value==='serial'?'serial':'lan'):el.value.trim();
      const c=setComm(spec,{[key]:value});
      document.querySelectorAll(`[data-ce-commbar="${id}"]`).forEach(b=>{
        b.querySelectorAll('[data-ce-comm]').forEach(x=>{if(x!==el)x.value=c[x.dataset.ceComm]});
        const lanBox=b.querySelector('.rt-ce-comm-lan');if(lanBox)lanBox.hidden=c.mode!=='lan';
      });
      document.querySelectorAll(`[data-ce-amxspec="${id}"]`).forEach(pre=>{try{pre.textContent=amxCode(spec,JSON.parse(pre.dataset.ceAmxitems),c)}catch{}});
    };
    document.addEventListener('input',onEdit);document.addEventListener('change',onEdit);
  }
  installCommHandlers();
  // ---- 0.239 AMX 코드 잠금(사용자 요청 2026-10-16 "AMX코드 짜주는건 기능을 비번을 걸어서 잠그고, 알티컴 장비 커맨드 제어 예시는 그냥 보여 주게") ----
  // 잠그는 것: AMX NetLinx 코드(통신 설정·시작 코드, 명령마다 SEND_STRING 줄, HDS·QMS의 AMX 예제, "내 AMX 구성"의 코드·복사·파일 저장).
  // 그냥 보이는 것: 커맨드 문자열·토큰 설명·HEX·복사 버튼·시뮬레이터 커맨드·"담기" 버튼과 담은 커맨드 목록. AMX 말고 다른 컨트롤러에서도 같은 문자열을 보내 쓸 수 있다.
  // 이 잠금은 브라우저에서 비밀번호를 비교하는 "잠금 스티커"다. 사이트가 정적(GitHub Pages)이라 코드 파일이 공개되어 있어 개발자 도구를 아는 사람은 우회할 수 있다.
  //   (사용자 결정 2026-10-16: 브라우저 잠금 선택. 서버 잠금은 Cloudflare Worker가 필요해 하지 않음.) 비밀번호 원문은 저장소에 없고 PBKDF2-SHA256 변환값만 둔다.
  // 설정: node scripts/tools/set-amx-password.cjs <비밀번호> 가 아래 AMX_LOCK 한 줄을 바꿔 쓴다. null이면 아무도 열 수 없다.
  const AMX_LOCK={"v":1,"iterations":200000,"salt":"afdc86e407a427c659669131e560a76a","hash":"ce535470d835a256c7ab87b6128d7e18b7b3c3515d13b135f65790edb7911237"};
  const UNLOCK_KEY='rtcom.amxUnlock.v1';
  const hexOf=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  const bytesOf=hex=>Uint8Array.from((hex.match(/../g)||[]).map(h=>parseInt(h,16)));
  async function lockHash(password,saltHex,iterations){
    const subtle=globalThis.crypto&&globalThis.crypto.subtle;
    if(!subtle)throw new Error('이 브라우저는 비밀번호 확인 기능(https 연결 필요)을 지원하지 않습니다');
    const key=await subtle.importKey('raw',new TextEncoder().encode(String(password)),'PBKDF2',false,['deriveBits']);
    return hexOf(await subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:bytesOf(saltHex),iterations},key,256));
  }
  async function makeLock(password,opts={}){
    const iterations=opts.iterations||200000;
    const salt=opts.salt||hexOf(globalThis.crypto.getRandomValues(new Uint8Array(16)));
    return {v:1,iterations,salt,hash:await lockHash(password,salt,iterations)};
  }
  async function verifyPassword(password,cfg=AMX_LOCK){
    if(!cfg||typeof password!=='string'||!password)return false;
    try{return (await lockHash(password,cfg.salt,cfg.iterations))===cfg.hash}catch{return false}
  }
  const lockPrint=cfg=>cfg?String(cfg.hash).slice(0,16):'';
  let unlockedMemory='';
  const lock={
    configured:()=>!!AMX_LOCK,
    isUnlocked(cfg=AMX_LOCK){
      if(!cfg)return false;
      let saved=unlockedMemory;
      try{saved=sessionStorage.getItem(UNLOCK_KEY)||saved}catch{}
      return saved===lockPrint(cfg);
    },
    async unlock(password,cfg=AMX_LOCK){
      if(!(await verifyPassword(password,cfg)))return false;
      unlockedMemory=lockPrint(cfg);
      try{sessionStorage.setItem(UNLOCK_KEY,unlockedMemory)}catch{}
      lockChanged();return true;
    },
    relock(){unlockedMemory='';try{sessionStorage.removeItem(UNLOCK_KEY)}catch{}lockChanged()}
  };
  function lockChanged(){if(typeof document!=='undefined'&&typeof CustomEvent==='function')document.dispatchEvent(new CustomEvent('rt-amx-lock'))}
  // 잠금 상태가 바뀌면 다시 그린다. 카드가 화면에서 사라졌으면 스스로 빠진다.
  function onLock(root,fn){
    if(typeof document==='undefined')return;
    const h=()=>{if(!root.isConnected){document.removeEventListener('rt-amx-lock',h);return}fn()};
    document.addEventListener('rt-amx-lock',h);
  }
  const lockedHtml=what=>`<div class="rt-ce-lock" data-ce-lockbox><p class="rt-ce-lock-msg"><b>${esc(what)}은(는) 비밀번호로 잠겨 있습니다.</b> 위의 커맨드 문자열·HEX는 잠금 없이 그대로 쓸 수 있습니다(AMX가 아닌 다른 컨트롤러에서도 같은 문자열을 보냅니다).</p>${AMX_LOCK?`<form class="rt-ce-lockform" data-ce-lockform><label>비밀번호<input type="password" autocomplete="off" required aria-label="AMX 코드 잠금 해제 비밀번호"></label><button type="submit" class="rt-pg-btn rt-pg-primary">잠금 해제</button><span class="rt-ce-copied" data-ce-lockmsg role="status" aria-live="polite"></span></form>`:'<p class="rt-pg-hint">비밀번호가 아직 설정되지 않아 열 수 없습니다.</p>'}</div>`;
  const relockBtn='<button type="button" class="rt-pg-btn" data-ce-relock title="AMX 코드를 다시 잠급니다">다시 잠그기</button>';
  // 잠겨 있으면 안내 상자, 열려 있으면 html()이 만든 내용을 돌려 준다.
  const gated=(what,html)=>lock.isUnlocked()?html():lockedHtml(what);
  function installLockHandlers(){
    if(typeof document==='undefined'||document.__rtCeLockInstalled)return;
    document.__rtCeLockInstalled=true;
    document.addEventListener('submit',event=>{
      const form=event.target.closest&&event.target.closest('[data-ce-lockform]');if(!form)return;
      event.preventDefault();
      const input=form.querySelector('input'),msg=form.querySelector('[data-ce-lockmsg]');
      lock.unlock(input.value).then(ok=>{if(!ok&&msg){msg.textContent='비밀번호가 맞지 않습니다';input.select()}});
    });
    document.addEventListener('click',event=>{if(event.target.closest&&event.target.closest('[data-ce-relock]'))lock.relock()});
  }
  installLockHandlers();
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
  // ---- 명령 빌더(제품 JSON의 builders): 매개변수를 고르면 매뉴얼 형식의 명령이 만들어진다 ----
  // builder: {id,title,cmd,page,summary,group,order:[매개변수 id 또는 {lit,num,padVar,kind}],params:[...],route,template,enter,productId}
  //  - select: 옵션 값 앞에 prefix를 붙인다(예: H + 09). optional이면 빈 값("생략")을 고를 수 있다.
  //  - number: min~max 정수, pad 자리 0 채움(예: V + 03). padVar이면 제품의 자릿수 선택(spec.variants, VDM 2·3자리)을 따른다.
  //  - list: "1-4,8" 같은 번호 목록. style 'range'는 3개 이상 이어진 번호를 범위(O01-04)로, 'explicit'은 번호마다(O01O02O03), 'comma'는 번호마다 쉼표로(O01,O02) 적는다.
  //  - text: 따옴표로 감싸는 문자열(OSD 자막, prefix S + "…"), maxLen까지.
  //  - lit: 고정 글자(예: 멀티뷰의 S). num이 있으면 그 숫자를 자릿수에 맞춰 붙인다(예: I + 000).
  //  - route: {cmd}가 있으면 입력 번호 1개와 출력 목록으로 연결 쌍(I001O001-007, I001O009)을 쉼표로 이은 연결·해제 명령을 만든다.
  //  - template: "s in {in} av out {out}!"처럼 * 제품 ID 없이 문장형으로 만드는 명령(SPX 커맨드 2). enter가 false이면 Enter(0x0D)를 붙이지 않는다.
  //  - productId: 이 명령만 쓰는 제품 ID(예: 펌웨어 확인 *999?version!).
  function parseNumList(text,min,max){
    const nums=new Set();
    for(const part of String(text??'').split(/[,\s]+/).filter(Boolean)){
      const m=part.match(/^(\d+)(?:-(\d+))?$/);if(!m)continue;
      let a=Number(m[1]),b=m[2]===undefined?a:Number(m[2]);
      if(a>b)[a,b]=[b,a];
      for(let n=Math.max(a,min);n<=Math.min(b,max);n++)nums.add(n);
    }
    return [...nums].sort((x,y)=>x-y);
  }
  function formatNumList(nums,prefix,pad,style){
    const out=[];let k=0;
    while(k<nums.length){
      let e=k;while(e+1<nums.length&&nums[e+1]===nums[e]+1)e++;
      if(style!=='explicit'&&e-k+1>=3)out.push({text:`${prefix}${String(nums[k]).padStart(pad,'0')}-${String(nums[e]).padStart(pad,'0')}`,from:nums[k],to:nums[e]});
      else for(let n=k;n<=e;n++)out.push({text:`${prefix}${String(nums[n]).padStart(pad,'0')}`,from:nums[n],to:nums[n]});
      k=e+1;
    }
    return out;
  }
  function builderDefaults(b){const v={};for(const p of b.params||[])v[p.id]=p.default??'';return v}
  const variantPad=(spec,ctx)=>ctx?.pad||spec.variants?.[0]?.pad||2;
  const padOf=(spec,p,ctx)=>p.padVar?variantPad(spec,ctx):(p.pad||2);
  function buildCommand(spec,b,values,ctx){
    const vals={...builderDefaults(b),...(values||{})};
    const idText=b.productId||spec.productId;
    const idPart={kind:'id',text:idText,title:`Product ID · 제품 ID ${idText}`};
    const paramText=(p)=>{
      const raw=vals[p.id],prefix=p.prefix||'',kind=p.kind||'vol';
      if(p.type==='select'){
        if(raw===''||raw===undefined||raw===null){if(p.optional)return {skip:true};return {error:`${p.label}을(를) 고르세요.`}}
        const opt=(p.options||[]).find(o=>String(o[0])===String(raw));
        if(!opt)return {error:`${p.label} 값이 올바르지 않습니다.`};
        return {pieces:[{kind,text:`${prefix}${opt[0]}`,title:`${p.label} · ${opt[1]}`}]};
      }
      if(p.type==='number'){
        const n=Math.round(Number(raw));
        if(!Number.isFinite(n))return {error:`${p.label}을(를) 입력하세요.`};
        const v=clamp(n,p.min??0,p.max??99);
        return {pieces:[{kind,text:`${prefix}${String(v).padStart(padOf(spec,p,ctx),'0')}`,title:`${p.label} · ${v}`}],num:v};
      }
      if(p.type==='text'){
        const t=String(raw??'').replace(/"/g,'').slice(0,p.maxLen||20);
        if(!t)return {error:`${p.label}을(를) 입력하세요(최대 ${p.maxLen||20}자).`};
        return {pieces:[{kind,text:`${prefix}"${t}"`,title:`${p.label} · ${t}`}]};
      }
      const pad=padOf(spec,p,ctx);
      const nums=parseNumList(raw,p.min??1,p.max??99);
      if(!nums.length)return {error:`${p.label}을(를) 입력하세요(예: 1-4,8, 범위 ${p.min??1}~${p.max??99}).`};
      const pieces=[];
      const items=formatNumList(nums,prefix,pad,p.style);
      items.forEach((it,i)=>{
        if(p.style==='comma'&&i)pieces.push({kind:'sep',text:',',title:'구분 기호'});
        pieces.push({kind,text:it.text,title:it.from===it.to?`${p.label} · ${it.from}`:`${p.label} · ${it.from}~${it.to}(범위)`});
      });
      return {pieces,nums};
    };
    // 문장형 템플릿(SPX 커맨드 2): 제품 ID·시작 글자 없이 "s in 1 av out 2!"처럼 만든다.
    if(b.template){
      const parts=[];
      for(const piece of b.template.split(/(\{\w+\})/).filter(Boolean)){
        const m=piece.match(/^\{(\w+)\}$/);
        if(!m){
          const endBang=piece.endsWith('!');
          const lit=endBang?piece.slice(0,-1):piece;
          if(lit)parts.push({kind:'cmd',text:lit,title:`명령 · ${b.title}`});
          if(endBang)parts.push(mEnd());
          continue;
        }
        const p=(b.params||[]).find(x=>x.id===m[1]);if(!p)continue;
        const raw=vals[p.id];
        if(p.type==='select'){
          const opt=(p.options||[]).find(o=>String(o[0])===String(raw));
          if(!opt)return {error:`${p.label} 값이 올바르지 않습니다.`};
          if(String(opt[0])!=='')parts.push({kind:p.kind||'vol',text:String(opt[0]),title:`${p.label} · ${opt[1]}`});
        }else{
          const n=Math.round(Number(raw));
          if(!Number.isFinite(n))return {error:`${p.label}을(를) 입력하세요.`};
          const v=clamp(n,p.min??0,p.max??99);
          parts.push({kind:p.kind||'vol',text:String(v),title:`${p.label} · ${v}`});
        }
      }
      return {text:textOf(parts),parts,enter:b.enter!==false};
    }
    const parts=[mStart(),idPart];
    // 연결·해제 쌍 명령: 입력 1개 × 출력 목록 → I001O001-007,I001O009
    if(b.route){
      const pin=(b.params||[]).find(x=>x.id==='inp'),pout=(b.params||[]).find(x=>x.id==='out');
      const ri=paramText(pin);if(ri.error)return {error:ri.error};
      const ro=paramText({...pout,style:'range',prefix:''});if(ro.error)return {error:ro.error};
      const pad=padOf(spec,pout,ctx),inTxt=ri.pieces[0].text;
      parts.push({kind:'cmd',text:b.route.cmd,title:`Command · ${b.title}`});
      let first=true;
      for(const it of formatNumList(ro.nums,'',pad,'range')){
        if(!first)parts.push({kind:'sep',text:',',title:'구분 기호'});
        first=false;
        parts.push({kind:'in',text:`I${inTxt.slice(pin.prefix?pin.prefix.length:0)}`,title:`${pin.label} · ${ri.num}`});
        parts.push({kind:'out',text:`O${it.text}`,title:it.from===it.to?`${pout.label} · ${it.from}`:`${pout.label} · ${it.from}~${it.to}(범위)`});
      }
      parts.push(mEnd());
      return {text:textOf(parts),parts,enter:b.enter!==false};
    }
    if(b.cmd)parts.push({kind:'cmd',text:b.cmd,title:`Command · ${b.title}`});
    for(const item of b.order||[]){
      if(typeof item==='object'&&item.lit!==undefined){
        const text=item.num!==undefined?`${item.lit}${String(item.num).padStart(item.padVar?variantPad(spec,ctx):(item.pad||2),'0')}`:item.lit;
        parts.push({kind:item.kind||'cmd',text,title:item.title||'고정 글자'});continue;
      }
      const p=(b.params||[]).find(x=>x.id===item);if(!p)continue;
      const r=paramText(p);
      if(r.error)return {error:r.error};
      if(r.skip)continue;
      parts.push(...r.pieces);
    }
    parts.push(mEnd());
    return {text:textOf(parts),parts,enter:b.enter!==false};
  }
  const tokens=parts=>parts.map(p=>`<span class="rt-ce-tok rt-ce-tok-${p.kind}" title="${esc(p.title)}">${esc(p.text)}</span>`).join('');
  const range=(n,from=1)=>Array.from({length:n},(_,i)=>from+i);

  function mount(root,spec){
    if(spec.kind==='matrix')return mountMatrix(root,spec);
    if(spec.kind==='builders')return mountBuilders(root,spec);
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
      <div class="rt-ce-block">${gated('AMX NetLinx 예제',()=>`<div class="rt-ce-head"><h3>AMX NetLinx 예제 (${mute?'경로 · 볼륨 · 뮤트':'선택한 경로 + 볼륨'})</h3><button type="button" class="rt-pg-btn" data-ce-copy="amx">복사</button>${relockBtn}<span class="rt-ce-copied" data-ce-note="amx" aria-live="polite"></span></div>
        ${commBarHtml(spec)}${amxPre(spec,[{label:`IN ${sel.input} → OUT ${sel.output}`,text:sel.text},{label:dbText(vol.db),text:vol.text},...(mute?[{label:'뮤트',text:mute.text}]:[])],'data-ce-text="amx"')}`)}</div>
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
    onLock(root,render);
    render();
  }
  // 설정 명령 패널(spec.builders): 명령을 고르고 매개변수를 넣으면 명령·HEX·AMX 한 줄이 바로 만들어진다.
  // 선택값은 이 브라우저에만 기억한다(rtcom.controlExample.<제품 id>.builder). 매트릭스 카드가 다시 그려져도 상태가 남도록 닫힘 변수로 둔다.
  function createBuilderPanel(spec,opts={}){
    const list=spec.builders||[];
    const key=`rtcom.controlExample.${spec.id||'x'}.builder`;
    let st={sel:list[0]?.id,values:{},variant:spec.variants?.[0]?.id};
    try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&typeof v==='object')st={...st,...v,values:{...(v.values||{})}}}catch{}
    if(!list.some(b=>b.id===st.sel))st.sel=list[0]?.id;
    if(spec.variants&&!spec.variants.some(x=>x.id===st.variant))st.variant=spec.variants[0].id;
    const ctxOf=()=>({pad:spec.variants?.find(x=>x.id===st.variant)?.pad});
    const save=()=>{try{localStorage.setItem(key,JSON.stringify(st))}catch{}};
    const cur=()=>list.find(b=>b.id===st.sel)||list[0];
    const valuesOf=b=>({...builderDefaults(b),...(st.values[b.id]||{})});
    let lastText='',lastEnter=true;
    const control=(b,p,v)=>{
      const val=v[p.id];
      if(p.type==='select')return `<label>${esc(p.label)}<select data-ce-bp="${esc(p.id)}">${p.optional?`<option value=""${val===''?' selected':''}>(생략)</option>`:''}${(p.options||[]).map(o=>`<option value="${esc(o[0])}"${String(o[0])===String(val)?' selected':''}>${esc(o[1])}</option>`).join('')}</select></label>`;
      if(p.type==='number')return `<label>${esc(p.label)}<input type="number" data-ce-bp="${esc(p.id)}" value="${esc(val)}" min="${p.min??0}" max="${p.max??99}" step="1"></label>`;
      if(p.type==='text')return `<label>${esc(p.label)}<input type="text" data-ce-bp="${esc(p.id)}" value="${esc(val)}" maxlength="${p.maxLen||20}" placeholder="자막(최대 ${p.maxLen||20}자)" autocomplete="off"></label>`;
      return `<label>${esc(p.label)}<input type="text" data-ce-bp="${esc(p.id)}" value="${esc(val)}" placeholder="예: 1-4,8" autocomplete="off"></label>`;
    };
    function output(b){
      const r=buildCommand(spec,b,valuesOf(b),ctxOf());
      if(r.error){lastText='';lastEnter=true;return `<p class="rt-ce-warn">${esc(r.error)}</p>`}
      lastText=r.text;lastEnter=r.enter!==false;
      const dev=spec.amxDevice||'dvSwitcher';
      return `<div class="rt-ce-head"><h3>${esc(b.title)}${cmdOf(b)?` (${esc(cmdOf(b))})`:''}</h3><button type="button" class="rt-pg-btn" data-ce-bcopy>복사</button>${opts.basket?'<button type="button" class="rt-pg-btn rt-pg-primary" data-ce-badd title="이 명령을 아래 \"내 AMX 구성\"에 담습니다">+ 구성에 담기</button>':''}<span class="rt-ce-copied" data-ce-bnote aria-live="polite"></span></div>
        <pre class="rt-ce-cmd"><span class="rt-ce-line"><small>${esc(b.title)} · ${esc(spec.docLabel||'매뉴얼')} ${esc(b.page)}</small>${tokens(r.parts)}${r.enter===false?'':'<span class="rt-ce-cr" title="Enter · 0x0D">⏎</span>'}</span></pre>
        <p class="rt-ce-hex">HEX <code>${esc(toHex(r.text,r.enter!==false))}</code>${r.enter===false?' · 이 형식은 매뉴얼에 Enter가 적혀 있지 않아 붙이지 않았습니다':''}</p>
        ${gated('AMX 코드 한 줄',()=>`<pre class="rt-ce-cmd rt-ce-code rt-ce-oneline">SEND_STRING ${esc(dev)},"'${esc(r.text)}'${r.enter===false?'':',$0D'}"</pre>`)}`;
    }
    const cmdOf=x=>x.cmd||x.route?.cmd||'';
    const optHtml=(x,b)=>`<option value="${esc(x.id)}"${x.id===b.id?' selected':''}>${esc(x.title)}${cmdOf(x)?` (${esc(cmdOf(x))})`:''}</option>`;
    function selectOptions(b){
      if(!list.some(x=>x.group))return list.map(x=>optHtml(x,b)).join('');
      const groups=[];
      for(const x of list){const g=x.group||'기타';let e=groups.find(y=>y.name===g);if(!e){e={name:g,items:[]};groups.push(e)}e.items.push(x)}
      return groups.map(g=>`<optgroup label="${esc(g.name)}">${g.items.map(x=>optHtml(x,b)).join('')}</optgroup>`).join('');
    }
    function render(el){
      const b=cur();if(!b){el.innerHTML='';return}
      const v=valuesOf(b);
      el.innerHTML=`<div class="rt-ce-block"><div class="rt-ce-head"><h3>설정 명령 · ${list.length}종</h3></div>
        <div class="rt-ce-controls">${spec.variants?`<label>${esc(spec.variantLabel||'번호 자릿수')}<select data-ce-bvariant>${spec.variants.map(x=>`<option value="${esc(x.id)}"${x.id===st.variant?' selected':''}>${esc(x.label)}</option>`).join('')}</select></label>`:''}<label>명령<select data-ce-bsel>${selectOptions(b)}</select></label></div>
        <p class="rt-ce-hint-inline">${esc(b.summary||'')} <span class="rt-ce-page">${esc(spec.docLabel||'매뉴얼')} ${esc(b.page)}</span></p>
        <div class="rt-ce-controls">${(b.params||[]).map(p=>control(b,p,v)).join('')}</div>
        <div data-ce-bout>${output(b)}</div></div>`;
    }
    function mount(el){
      if(!el)return;
      render(el);
      onLock(el,()=>render(el));
      el.addEventListener('change',event=>{
        const sel=event.target.closest('[data-ce-bsel]');
        if(sel){st.sel=sel.value;save();render(el);return}
        const vr=event.target.closest('[data-ce-bvariant]');
        if(vr){st.variant=vr.value;save();render(el);return}
        const f=event.target.closest('[data-ce-bp]');if(!f)return;
        const b=cur();st.values[b.id]={...(st.values[b.id]||{}),[f.dataset.ceBp]:f.value};save();
        el.querySelector('[data-ce-bout]').innerHTML=output(b);
      });
      el.addEventListener('input',event=>{
        const f=event.target.closest('[data-ce-bp]');if(!f||f.tagName==='SELECT')return;
        const b=cur();st.values[b.id]={...(st.values[b.id]||{}),[f.dataset.ceBp]:f.value};save();
        el.querySelector('[data-ce-bout]').innerHTML=output(b);
      });
      el.addEventListener('click',event=>{
        if(event.target.closest('[data-ce-badd]')&&opts.basket&&lastText){
          const b=cur(),note=el.querySelector('[data-ce-bnote]');
          const r=basket.add(spec.id||'x',[{label:`${b.title}${cmdOf(b)?` (${cmdOf(b)})`:''}`,text:lastText,enter:lastEnter,source:'설정 명령'}]);
          if(note){note.textContent=basketNote(r);setTimeout(()=>{note.textContent=''},3500)}
          return;
        }
        if(!event.target.closest('[data-ce-bcopy]')||!lastText)return;
        const note=el.querySelector('[data-ce-bnote]');
        const done=()=>{if(note){note.textContent='복사했습니다';setTimeout(()=>{note.textContent=''},1800)}};
        if(navigator.clipboard?.writeText)navigator.clipboard.writeText(lastText).then(done,()=>{if(note)note.textContent='복사하지 못했습니다. 직접 선택해 복사하세요.'});
        else{const pre=el.querySelector('[data-ce-bout] pre');const r=document.createRange();r.selectNodeContents(pre);const sl=getSelection();sl.removeAllRanges();sl.addRange(r);done()}
      });
    }
    return {mount};
  }
  // 빌더만 있는 제품(모듈러 매트릭스 시리즈 등): 통신 설정과 AMX 시작 코드, 설정 명령 패널.
  function mountBuilders(root,spec){
    const baud=spec.serial?.baud||9600,bid=spec.id||'x';
    root.innerHTML=`<div class="rt-ce-block" data-ce-start></div>
      <div data-ce-builders></div>
      <div class="rt-ce-block rt-ce-basket" data-ce-basket></div>
      <p class="rt-pg-hint">※ 근거: ${esc(spec.source)}. 통신 ${baud}bps ${esc(spec.serial?.confirmed||'')}. 문장 끝에 Enter를 붙입니다. 제품 ID는 ${esc(spec.productId)}입니다(${esc(spec.productIdNote||'')}).</p>
      <p class="rt-pg-hint">※ ${esc(spec.limits||'')} AMX 장치 번호와 버튼 번호는 현장에 맞게 바꾸세요.</p>`;
    createBuilderPanel(spec,{basket:true}).mount(root.querySelector('[data-ce-builders]'));
    const startBox=root.querySelector('[data-ce-start]');
    const renderStart=()=>{startBox.innerHTML=gated('통신 설정과 AMX 시작 코드',()=>`<div class="rt-ce-head"><h3>통신 설정과 AMX 시작 코드</h3><button type="button" class="rt-pg-btn" data-ce-copy="amx">복사</button>${relockBtn}<span class="rt-ce-copied" data-ce-note="amx" aria-live="polite"></span></div>
      ${commBarHtml(spec)}${amxPre(spec,[],'data-ce-text="amx"')}`)};
    renderStart();onLock(root,renderStart);
    const box=root.querySelector('[data-ce-basket]');
    const flash=text=>{const note=box.querySelector('[data-ce-bkmsg]');if(note){note.textContent=text;setTimeout(()=>{note.textContent=''},2500)}};
    const renderBasket=()=>{
      const list=basket.get(bid);
      const open=lock.isUnlocked();
      box.innerHTML=`<div class="rt-ce-head"><h3>내 AMX 구성 · ${list.length}개</h3>${list.length?`${open?`<button type="button" class="rt-pg-btn" data-ce-bk="copy">AMX 코드 복사</button><button type="button" class="rt-pg-btn" data-ce-bk="download">파일로 저장(.axs)</button>${relockBtn}`:''}<button type="button" class="rt-pg-btn" data-ce-bk="clear">전부 비우기</button>`:''}<span class="rt-ce-copied" data-ce-bkmsg aria-live="polite"></span></div>
      ${list.length?`<ol class="rt-ce-bklist">${list.map((x,i)=>`<li><span class="rt-ce-bkno">버튼 ${i+1}</span><span class="rt-ce-bkbody"><b>${esc(x.label||'명령')}</b><code>${esc(x.text)}</code></span>${x.source?`<span class="rt-ce-bksrc">${esc(x.source)}</span>`:''}<span class="rt-ce-bkact"><button type="button" class="rt-pg-btn" data-ce-bk="up" data-i="${i}" aria-label="버튼 ${i+1} 위로"${i===0?' disabled':''}>↑</button><button type="button" class="rt-pg-btn" data-ce-bk="down" data-i="${i}" aria-label="버튼 ${i+1} 아래로"${i===list.length-1?' disabled':''}>↓</button><button type="button" class="rt-pg-btn" data-ce-bk="del" data-i="${i}" aria-label="버튼 ${i+1} 빼기">×</button></span></li>`).join('')}</ol>
      ${open?`${commBarHtml(spec)}${amxPre(spec,list,'data-ce-bkcode')}`:lockedHtml('AMX 코드 만들기·복사·파일 저장')}`
      :'<p class="rt-pg-hint">아직 담은 명령이 없습니다. 위 "화면 연출 시뮬레이터"의 <b>AMX 구성에 담기</b> 버튼이나, 이 카드 "설정 명령"의 <b>+ 구성에 담기</b> 버튼을 누르면 여기에 쌓이고, 담은 순서대로 터치 패널 버튼 하나씩 한 개의 AMX 코드가 만들어집니다.</p>'}
      <p class="rt-pg-hint">담은 목록은 이 브라우저에만 저장됩니다. 버튼 번호는 담은 순서이며 ↑ ↓로 바꿀 수 있습니다. 파일의 한글 주석이 NetLinx Studio에서 깨져 보이면 주석 줄(//)만 지우고 쓰세요. 동작에는 영향이 없습니다.</p>`;
    };
    renderBasket();
    const onBasket=event=>{
      if(!root.isConnected){document.removeEventListener('rt-amx-basket',onBasket);return}
      if(event.detail?.id===bid)renderBasket();
    };
    document.addEventListener('rt-amx-basket',onBasket);
    onLock(root,renderBasket);
    box.addEventListener('click',event=>{
      const btn=event.target.closest('[data-ce-bk]');if(!btn)return;
      const act=btn.dataset.ceBk,i=Number(btn.dataset.i);
      if(act==='up')basket.move(bid,i,-1);
      else if(act==='down')basket.move(bid,i,1);
      else if(act==='del')basket.remove(bid,i);
      else if(act==='clear')basket.clear(bid);
      else if((act==='copy'||act==='download')&&!lock.isUnlocked())return;
      else if(act==='copy'){
        const code=basketCode(spec,basket.get(bid),commOf(spec));
        const done=()=>flash('복사했습니다');
        if(navigator.clipboard?.writeText)navigator.clipboard.writeText(code).then(done,()=>flash('복사하지 못했습니다. 아래 코드를 직접 선택해 복사하세요.'));
        else{const pre=box.querySelector('[data-ce-bkcode]');const r=document.createRange();r.selectNodeContents(pre);const sl=getSelection();sl.removeAllRanges();sl.addRange(r);done()}
      }else if(act==='download'){
        const blob=new Blob([basketCode(spec,basket.get(bid),commOf(spec))+'\n'],{type:'text/plain;charset=utf-8'});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`rtcom-${bid}-amx.axs`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
        flash('파일로 저장했습니다');
      }
    });
    root.addEventListener('click',event=>{
      const btn=event.target.closest('[data-ce-copy]');if(!btn)return;
      const pre=root.querySelector('[data-ce-text="amx"]'),note=root.querySelector('[data-ce-note="amx"]');
      const done=()=>{if(note){note.textContent='복사했습니다';setTimeout(()=>{note.textContent=''},1800)}};
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(pre.textContent).then(done,()=>{if(note)note.textContent='복사하지 못했습니다. 직접 선택해 복사하세요.'});
    });
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
    const panel=spec.builders?.length?createBuilderPanel(spec):null;
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
      ${panel?'<div data-ce-builders></div>':''}
      <div class="rt-ce-block">${gated('AMX NetLinx 예제',()=>`<div class="rt-ce-head"><h3>AMX NetLinx 예제 (${presetMax?'경로 · 프리셋 불러오기':'선택한 경로'})</h3><button type="button" class="rt-pg-btn" data-ce-copy="amx"${amxList.length?'':' disabled'}>복사</button>${relockBtn}<span class="rt-ce-copied" data-ce-note="amx" aria-live="polite"></span></div>
        ${amxList.length?`${commBarHtml(spec)}${amxPre(spec,amxList,'data-ce-text="amx"')}`:'<pre class="rt-ce-cmd rt-ce-code" data-ce-text="amx">경로를 선택하면 코드가 만들어집니다.</pre>'}`)}</div>
      <p class="rt-pg-hint">※ 근거: ${esc(spec.source)}. 통신 ${spec.serial?.baud}bps ${esc(spec.serial?.confirmed||'')}. 문장 끝에 Enter(CR 0x0D)를 붙입니다. 제품 ID는 매뉴얼 예시의 ${esc(spec.productId)}입니다(${esc(spec.productIdNote||'')}).</p>
      <p class="rt-pg-hint">※ ${esc(spec.limits||'')} AMX 장치 번호와 버튼 번호는 현장에 맞게 바꾸세요.</p>`;
      if(panel)panel.mount(root.querySelector('[data-ce-builders]'));
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
    onLock(root,render);
    render();
  }
  function mountAll(body){
    body.querySelectorAll('[data-control-example]').forEach(el=>{
      try{mount(el,JSON.parse(el.dataset.controlExample))}catch{el.textContent='커맨드 예시를 불러오지 못했습니다.'}
    });
  }
  return {parseNumList,formatNumList,buildCommand,builderDefaults,routeCommand,presetCommand,switchCommand,volumeCommand,muteCommand,volumeCode,dbOf,toHex,amxCode,basketClean,basketAdd,basketRemove,basketMove,basketCode,basket,BASKET_MAX,commOf,setComm,AMX_LOCK,makeLock,verifyPassword,lock,mount,mountAll};
});
