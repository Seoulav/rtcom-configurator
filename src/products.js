  // 0.19 — 알티컴 공개 제품정보. 구성기와 같은 한 화면 안에서 #products 주소 조각(hash)으로만 전환한다(페이지 이동 없음 → 상대 경로·404 문제 없음).
  // 데이터: data/products/index.json(목록)과 data/products/<id>.json(상세, AV Portal 상세 JSON 호환). 비공개 AV Portal은 이 파일을 읽기만 한다.
  // 0.33 — 화면 디자인을 사용자 LED 구성기 계승 글래스 스타일로 바꿨다(docs/handoff/PRODUCT_GLASS_REDESIGN_SPEC.md 6-A).
  // 새 클래스는 모두 rt-pg-* 접두사를 쓰고 CSS는 #rtcom-design .rt-products-view 범위 안에서만 선언한다(src/styles.css).
  (()=>{
    const root=document.getElementById('rtcom-design');
    const view=root.querySelector('.rt-products-view');
    const configurator=root.querySelector('.rt-configurator-view');
    const body=view.querySelector('.rt-products-body');
    const tabs=[...root.querySelectorAll('[data-view-tab]')];
    const groups=[['all','전체'],['series','매트릭스 시리즈'],['integrated','일체형 매트릭스'],['distribution','분배기·선택기'],['extender','전송기'],['cable','케이블']];
    const groupLabel=Object.fromEntries(groups);
    const roleLabel={Main:'대표',Front:'전면',Rear:'후면',Perspective:'사선',Diagram:'구성도',Other:'기타'};
    const directionLabel={IN:'입력',OUT:'출력',BIDIR:'입출력'};
    const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
    // lead 필드는 "**한 곳까지**" 굵게만 허용한다(명세 3장). 나머지는 그대로 이스케이프한다.
    const md=text=>esc(text||'').replace(/\*\*(.+?)\*\*/,'<b>$1</b>');
    const image=file=>`output/design/assets/products/${encodeURIComponent(file)}`;
    let index=null,filter='all',query='';
    const details=new Map();
    const load=url=>fetch(url).then(response=>{if(!response.ok)throw new Error(`${response.status} ${url}`);return response.json()});
    const loadIndex=()=>index?Promise.resolve(index):load('data/products/index.json').then(data=>(index=data));
    const loadDetail=id=>details.has(id)?Promise.resolve(details.get(id)):load(`data/products/${encodeURIComponent(id)}.json`).then(data=>{details.set(id,data);return data});
    const route=()=>{const match=location.hash.match(/^#products(?:\/([a-z0-9-]+))?$/);return match?{products:true,id:match[1]||null}:{products:false}};
    const reviewBadge=item=>item.packageStatus==='REVIEW REQUIRED'?'<span class="rt-pg-badge" title="카탈로그 안에서 표기가 서로 다른 항목이 있습니다">표기 검토 필요</span>':'';
    const matches=item=>(filter==='all'||item.group===filter)&&(!query||[item.productName,item.model,...(item.aliases||[]),item.english,item.korean,...(item.categories||[])].join(' ').toLowerCase().includes(query));
    // 모델명의 하이픈(예: CT103-U-H)에서 줄이 바뀌면 "CR103-"과 "U"로 잘린 것처럼 보인다. 문자는 그대로 두고 " / " 앞뒤에서만 줄이 바뀌게 한다(PR #22 요청, 0.47).
    const noBreak=value=>String(value??'').split(' / ').map(part=>`<span class="rt-nowrap">${esc(part)}</span>`).join(' / ');
    const shortConnector=connector=>(connector||'').replace(/\([^)]*\)/g,'').split(/[,/]/)[0].trim();
    const verification=value=>value&&value!=='VERIFIED'?` <span class="rt-pg-badge">${value==='REVIEW REQUIRED'?'검토 필요':esc(value)}</span>`:'';
    const isSizeSpec=spec=>spec.group==='Physical'&&(spec.name==='무게'||spec.name.startsWith('크기'));
    const GROUP_DOT={Video:'#3978ee',Transmission:'#1f9d7c',Power:'#c17a1f',Audio:'#a855c9',Control:'#7669ef'};

    // ---- 그룹별 아이콘(01 카드 왼쪽 타일). 분배기=가지치기·매트릭스(시리즈·일체형)=교차·전송기=두 상자와 선·케이블=선 (명세 2-1) ----
    const GROUP_ICON={
      series:'<svg width="30" height="26" viewBox="0 0 30 26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="12" height="20" rx="2"/><path d="M2 7h7M2 13h7M2 19h7M21 7h7M21 13h7M21 19h7M11 8l8 10M19 8l-8 10" stroke-width="1.6"/></svg>',
      integrated:'<svg width="30" height="26" viewBox="0 0 30 26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="12" height="20" rx="2"/><path d="M2 7h7M2 13h7M2 19h7M21 7h7M21 13h7M21 19h7M11 8l8 10M19 8l-8 10" stroke-width="1.6"/></svg>',
      distribution:'<svg width="30" height="22" viewBox="0 0 30 22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="4" cy="11" r="2.4" fill="#fff"/><path d="M6.5 11H13M13 11C17 11 17 3 22 3M13 11C17 11 17 19 22 19M13 11H22"/><rect x="22" y="1" width="6" height="4" rx="1"/><rect x="22" y="9" width="6" height="4" rx="1"/><rect x="22" y="17" width="6" height="4" rx="1"/></svg>',
      extender:'<svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="1" y="5" width="9" height="10" rx="2"/><rect x="20" y="5" width="9" height="10" rx="2"/><path d="M10 10H20"/></svg>',
      cable:'<svg width="30" height="14" viewBox="0 0 30 14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="4" cy="7" r="2.4" fill="#fff"/><path d="M6.5 7H23.5"/><circle cx="26" cy="7" r="2.4" fill="#fff"/></svg>'
    };
    // 제품별 아이콘(0.105): XDM-PSU는 전송기 그룹이지만 전원 장치라, 두 상자 아이콘 대신 랙 본체 위 번개(전원) 모양을 쓴다(사용자 요청 2026-09-28 "ㅁ-ㅁ 모양을 뭔가 POWER SUPPLY형상이 없어서").
    const PRODUCT_ICON={
      'xdm-psu':'<svg width="30" height="26" viewBox="0 0 30 26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="26" height="14" rx="2.5"/><path d="M16.5 3L11 13.5h5.5L13.5 23" stroke-width="2.2"/><circle cx="6" cy="13" r="1.2" fill="#fff" stroke="none"/><circle cx="24" cy="13" r="1.2" fill="#fff" stroke="none"/></svg>'
    };
    // 카드가 연동하는 전송기 표시(카드 라인업의 점선 알약). src/app.js의 extenderInfo·extenderLineup(pair 필드)과 대조해 확인했다(2026-09-27).
    const CARD_EXTENDER_LABEL={'XDM-CIS100':'CTR100 TX · CT103','XDM-COS100':'CTR100 RX · CR103','XDM-FIS100':'FT101','XDM-FOS100':'FR101','CIS4-U':'CT104-U','COS4-U':'CR104-U','FIS4-U':'FT101-U','FOS4-U':'FR101-U','SPX-COS12':'SPX-RX'};
    // 메인프레임 사진이 없는 모델(명세 2-3: "사진이 없는 VDM-288X는 사진 준비 중으로 둡니다"). 없는 파일을 요청하지 않도록 미리 안다.
    const NO_FRAME_PHOTO=new Set(['VDM-288X']);

    function subtitleFor(item){
      if(item.subtitle)return item.subtitle;
      return item.series||(item.english||'').split(' — ')[0]||'';
    }
    // lead가 없으면(6-A는 HD-210U·XDM·VDM·SPX만 채움) 개요 첫 문장만 가져온다(새 사실을 만들지 않음).
    // 버그 수정(명세 4장): 예전 정규식 (?<=[.다])\s+ 는 "HDMI Ver. 2.0"의 점에서도 끊었다. "다." 뒤에서만 끊도록 좁혔다.
    const firstSentence=text=>(text||'').split(/(?<=다\.)\s+/)[0]||'';
    function leadFor(item){
      if(item.lead)return md(item.lead);
      return esc(firstSentence(item.overview));
    }
    // 해상도 칸은 "4K"+"/60 @ 4:4:4"처럼 짧게 쓴다(명세 6-B 4장). 원문은 사양 표에 그대로 남는다.
    // 크로마(4:4:4 등)가 해상도 행 자체에 없으면 overview·korean·english에서도 찾는다(같은 제품이 이미 밝힌 사실이라 새로 만드는 값이 아님).
    function shortResolution(item){
      const spec=(item.specifications||[]).find(s=>/해상도/.test(s.name));
      if(!spec)return null;
      const haystack=[spec.value,spec.condition,item.overview,item.korean,item.english].filter(Boolean).join(' ');
      // 0.184: 해상도 표기 Extron 방식(4K/60 @ 4:4:4). 주사율은 "4K/60"·"@ 60Hz" 어느 쪽에서도 읽는다.
      const hzm=haystack.match(/\b[48]K\/(\d{2})|(\d{2})\s*Hz/i)||[],hz=hzm[1]||hzm[2];
      const chroma=(haystack.match(/4:4:4|4:2:2|4:2:0/)||[])[0];
      const is8k=/7680|8k/i.test(haystack);
      const is4k=/4096|3840|4k/i.test(haystack);
      const value=is8k?'8K':is4k?'4K':spec.value.split(',')[0].split('(')[0].trim();
      const unit=(is4k||is8k)?`${hz?`/${hz}`:''}${chroma?`${hz?' @ ':''}${chroma}`:''}`:[hz&&`${hz}Hz`,chroma].filter(Boolean).join(' ');
      return {label:'해상도',value,unit};
    }
    function quickFacts(item){
      if(!['distribution','integrated','cable'].includes(item.group))return [];
      const specs=item.specifications||[];
      const bandwidth=specs.find(spec=>/대역폭/.test(spec.name));
      const hdmiPorts=direction=>{
        const rows=(item.io||[]).filter(port=>port.direction===direction&&/^HDMI/i.test(port.connector||'')&&port.quantity);
        if(!rows.length)return null;
        const total=rows.reduce((sum,port)=>sum+(parseInt(port.quantity,10)||0),0);
        return total?{label:directionLabel[direction],value:String(total),unit:shortConnector(rows[0].connector)}:null;
      };
      const facts=[bandwidth&&{label:'대역폭',value:bandwidth.value,unit:bandwidth.unit},shortResolution(item),hdmiPorts('IN'),hdmiPorts('OUT')].filter(Boolean);
      return facts.length>=2?facts.slice(0,4):[];
    }
    // 시리즈(XDM·VDM·SPX) 한눈에 보기 수치는 specifications·lineup에서 그대로 계산한다(새 값을 만들지 않음).
    function seriesFacts(item){
      const specs=item.specifications||[];
      const bwSpec=specs.find(spec=>spec.group==='Video'&&/대역폭/.test(spec.name));
      const resSpec=specs.find(spec=>spec.name==='최대 해상도');
      const portsSpec=specs.find(spec=>spec.name==='슬롯당 포트');
      const chanSpec=specs.find(spec=>spec.name==='입력 채널')||specs.find(spec=>spec.name==='입·출력 구성');
      let scale=null;
      if(chanSpec){
        const parts=chanSpec.value.split(',').map(part=>part.trim());
        const last=parts[parts.length-1];
        scale=chanSpec.name==='입력 채널'?[last,last]:last.replace(/x/i,'×').split('×');
      }
      let resText=null;
      if(resSpec){
        const hz=(resSpec.value.match(/(\d+)Hz/)||[])[1];
        const chroma=((resSpec.condition||'').match(/\d:\d:\d/)||[])[0];
        resText=[hz&&`${hz}Hz`,chroma].filter(Boolean).join(' ');
      }
      const cardWord=(item.lineup||[]).some(entry=>/카드/.test(entry.kind))?'카드당':'카드당';
      return [
        scale&&{label:'최대 규모',value:scale[0],unit:`×${scale[1]}`},
        resText&&{label:'해상도',value:'4K',unit:resText},
        bwSpec&&{label:'대역폭',value:bwSpec.value,unit:bwSpec.unit},
        portsSpec&&{label:cardWord,value:portsSpec.value,unit:portsSpec.unit}
      ].filter(Boolean);
    }
    function factsList(facts){
      return facts.length?`<ul class="rt-pg-facts">${facts.map(fact=>`<li class="rt-pg-fact"><span>${esc(fact.label)}</span><b>${esc(fact.value)}</b>${fact.unit?`<small>${esc(fact.unit)}</small>`:''}</li>`).join('')}</ul>`:'';
    }
    const table=(head,rows)=>rows.length?`<div class="rt-pg-tablewrap"><table><thead><tr>${head.map(cell=>`<th scope="col">${cell}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>`<td data-label="${head[i]}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
    // 04 제품 사양 표는 다른 표보다 줄 간격을 약 15% 줄인다(사용자 요청 2026-09-27 "04 사양도 상하 간격을 15% 정도 줄여도 되겠다"). 표 틀에 rt-pg-spec-table을 붙여 CSS로만 구분한다.
    // 0.166: 값이 여러 줄이면(SPX-TX/RX "4K60 실효 전송거리") 줄마다 앞부분을 값으로, 끝 괄호 속 설명(케이블 모델)을 그 아래 작은 글자로 보여 준다.
    const specValue=value=>{
      const text=String(value??'');
      if(!text.includes('\n'))return esc(text);
      return text.split('\n').map(line=>{const m=line.match(/^(.*?)\s*\(([^)]*)\)\s*$/);return m?`<span class="rt-pg-spec-line">${esc(m[1])}<span class="rt-pg-note-line">${esc(m[2])}</span></span>`:`<span class="rt-pg-spec-line">${esc(line)}</span>`}).join('');
    };
    // 0.184(사용자 결정 2026-09-30 "단위는 붙여 쓰기"): 값과 단위를 붙인다(100m·0.28kg·18Gbps·4포트). hours처럼 영어 낱말 단위만 띄운다.
    const unitGap=unit=>/^(?!Gbps|Mbps|VAC|VDC)[A-Za-z]{4,}$/.test(unit)?' ':'';
    const specTable=specs=>table(['구분','사양'],specs.map(spec=>[`<span class="rt-pg-spec-dot" style="display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px;background:${GROUP_DOT[spec.group]||'#8a94a6'}" title="${esc(spec.group)}"></span>${esc(spec.name)}`,`${specValue(spec.value)}${spec.unit?`${unitGap(spec.unit)}${esc(spec.unit)}`:''}${verification(spec.verification)}${spec.condition?`<span class="rt-pg-note-line">${esc(spec.condition)}</span>`:''}`])).replace('class="rt-pg-tablewrap"','class="rt-pg-tablewrap rt-pg-spec-table"');

    // ---- 연결 다이어그램(신호 흐름, 02 카드). 기존 자동 생성 로직을 새 팔레트로 그대로 재사용한다 ----
    const COLOR_IN='#007AFF',COLOR_OUT='#BF5AF2',COLOR_FIBER='#30B0C7',COLOR_COPPER='#1E9E52';
    const svgEsc=value=>esc(value);
    const monitorIcon=(cx,cy,label,scale=1)=>{
      const w=44*scale,h=30*scale;
      return `<g transform="translate(${cx-w/2} ${cy-h/2})"><rect x="0" y="0" width="${w}" height="${h}" rx="4" fill="#fff" stroke="#b9c3d6" stroke-width="2"/><rect x="${w*0.32}" y="${h}" width="${w*0.36}" height="${h*0.22}" fill="#c9d3e6"/><rect x="${w*0.18}" y="${h+h*0.22}" width="${w*0.64}" height="${h*0.14}" rx="2" fill="#c9d3e6"/>${label?`<text x="${w/2}" y="${h+h*0.55+13}" text-anchor="middle" font-size="10" fill="#687386">${svgEsc(label)}</text>`:''}</g>`;
    };
    const deviceBox=(x,y,w,h,label,sub)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#eef2f8" stroke="#c8d3e6" stroke-width="2"/><text x="${x+w/2}" y="${y+h/2-(sub?7:0)}" text-anchor="middle" font-size="13" font-weight="750" fill="#1f2532">${svgEsc(label)}</text>${sub?`<text x="${x+w/2}" y="${y+h/2+13}" text-anchor="middle" font-size="10" fill="#687386">${svgEsc(sub)}</text>`:''}</g>`;
    const arrow=(x1,y1,x2,y2,color)=>{
      const angle=Math.atan2(y2-y1,x2-x1),size=7;
      const ax=x2-Math.cos(angle)*2,ay=y2-Math.sin(angle)*2;
      const p1=[ax-size*Math.cos(angle-0.5),ay-size*Math.sin(angle-0.5)],p2=[ax-size*Math.cos(angle+0.5),ay-size*Math.sin(angle+0.5)];
      return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="2.5" fill="none"/><polygon points="${ax},${ay} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}" fill="${color}"/>`;
    };
    const diagramWrap=(body,width,height,legendItems)=>`<div class="rt-pg-svg-wrap"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="연결 다이어그램" preserveAspectRatio="xMidYMid meet">${body}</svg></div>
      <p class="rt-pg-svg-hint">좌우로 밀어서 볼 수 있습니다.</p>
      <ul class="rt-pg-legend">${legendItems.map(([color,label])=>`<li><i style="background:${color}"></i>${svgEsc(label)}</li>`).join('')}</ul>`;
    // 분배기·일체형(매트릭스) "02 신호 흐름"(명세 6-B 3장, 승인 시안 hd-210u-glass-style.html의 flow SVG를 일반화).
    // 입력 칩(개별 번호) → 선택/매트릭스 노드 → 대역폭·해상도 띠 → 출력 화면 격자. 오디오 입력이 있으면 점선으로 표시한다.
    // 입력 수·출력 수·오디오는 io 데이터에서 뽑는다(새 사실을 만들지 않음). 분배기(1입력)는 노드 없이 바로 띠로 잇고,
    // 일체형 매트릭스(QMS, item.group==='integrated')는 노드를 "매트릭스"로 표시한다.
    function ioFlowDiagram(item){
      const io=item.io||[];
      const videoIn=io.find(port=>port.direction==='IN'&&/^HDMI|^Female HDMI|^HDMI 19-Pin/i.test(port.connector||'')&&parseInt(port.quantity,10));
      const videoOut=io.find(port=>port.direction==='OUT'&&/^HDMI|^Female HDMI|^HDMI 19-Pin/i.test(port.connector||'')&&parseInt(port.quantity,10));
      if(!videoIn||!videoOut)return null;
      const inTotal=parseInt(videoIn.quantity,10),outTotal=parseInt(videoOut.quantity,10);
      const inN=Math.min(inTotal,8),outN=Math.min(outTotal,12);
      // 오디오 입력(병합·믹스)·출력(추출·디먹스)은 io(Audio 그룹)에 있으면 그것을, 없으면 overview의 문구를 근거로 인정한다
      // (HD-13U는 제품사양 표에 오디오 단자가 없어 io에 안 적었지만 개요에 "병합 및 추출"이 이미 있다 — issues I2 참고).
      const audioIn=io.find(port=>port.direction==='IN'&&port.group==='Audio')||(/오디오\s*(병합|삽입)/.test(item.overview||'')?{signal:'Analog Audio'}:null);
      const audioOut=io.find(port=>port.direction==='OUT'&&port.group==='Audio')||(/오디오[^.]*추출|추출[^.]*오디오/.test(item.overview||'')?{signal:'Analog Audio'}:null);
      // 입력·출력이 모두 여럿이면 매트릭스 전환(각 출력이 독립), 출력이 1개면 여러 입력 중 하나를 고르는 선택기다.
      // 입출력이 둘 이상이라고 매트릭스인 것은 아니다(HD-210U는 2입력 중 1개를 골라 10출력에 같은 영상을 보내는 분배기). 0.34 검수에서
      // 입출력 수 기준(inN>1&&outN>1)을 되돌려, 일체형 매트릭스이거나 제품 문구에 매트릭스라고 적힌 경우(HDS-42MU "4x2 Matrix Switcher")만 매트릭스로 본다.
      const isMatrix=inN>1&&outN>1&&(item.group==='integrated'||/matrix|매트릭스/i.test([item.english,item.korean,item.overview,...(item.features||[]).map(feature=>feature.text)].join(' ')));
      const A=COLOR_IN,V='#5E5CE6',P=COLOR_OUT,PI='#8944AB',M='#8A8A8E';
      const sigName=(videoIn.connector.match(/^[A-Za-z]+/)||['HDMI'])[0];

      // 매트릭스는 크로스포인트 상자 위에 제목·예시 표시·출력 번호를 두므로 위쪽 여백을 더 준다.
      const chipW=104,chipH=34,chipVGap=12,leftX=10,topPad=isMatrix?66:20;
      const chipYs=[];for(let i=0;i<inN;i++)chipYs.push(topPad+i*(chipH+chipVGap));
      const chipsBottom=chipYs[chipYs.length-1]+chipH;
      const audioY=audioIn?chipsBottom+18:null,audioH=30;
      const leftBottom=audioIn?audioY+audioH:chipsBottom;
      const midY=(chipYs[0]+chipsBottom)/2;

      let bodyMarkup=`<defs><linearGradient id="rt-pg-flowband-${esc(item.id)}" x1="0" x2="1"><stop offset="0" stop-color="#0A84FF"/><stop offset=".55" stop-color="${V}"/><stop offset="1" stop-color="${P}"/></linearGradient></defs>`;
      chipYs.forEach((y,i)=>{
        const label=inN===1?`${sigName} IN`:`${sigName} IN ${i+1}`;
        bodyMarkup+=`<rect x="${leftX}" y="${y}" width="${chipW}" height="${chipH}" rx="17" fill="rgba(0,122,255,.12)"/><text x="${leftX+chipW/2}" y="${y+chipH/2+5}" text-anchor="middle" font-size="13" font-weight="700" fill="${A==='#007AFF'?'#0057D8':A}">${svgEsc(label)}</text>`;
      });
      if(audioIn)bodyMarkup+=`<rect x="${leftX}" y="${audioY}" width="${chipW}" height="${audioH}" rx="15" fill="rgba(118,118,128,.10)"/><text x="${leftX+chipW/2}" y="${audioY+audioH/2+4}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${M}">AUDIO IN</text>`;

      // 멀티뷰 전용 출력(QMS-88UX의 9·10번 등): videoModes의 QUAD 요약 "출력 9·10번에서 사용"(0.186 이전 "전용")에서 번호를 읽어 매트릭스 출력과 분리된 별도 갈래로 그린다.
      const quadMode=(item.videoModes?.modes||[]).find(mode=>mode.name==='QUAD');
      const multiview=((quadMode?.summary||'').match(/출력\s*([\d·,\s]+)번\s*(?:전용|에서)/)||[])[1]?.split(/[·,\s]+/).map(Number).filter(n=>n>=1&&n<=outN)||[];
      const matrixPorts=Array.from({length:outN},(_,i)=>i+1).filter(n=>!multiview.includes(n));

      // 매트릭스는 입력들이 한 점으로 모였다가 하나의 띠로 나가면 "여러 입력 중 1개 선택 → 분배"로 읽힌다(사용자 지적 2026-09-27, QMS-44UX).
      // 그래서 상자 안에 입력(가로줄) × 출력(세로줄) 크로스포인트를 그리고, 출력마다 다른 입력을 고른 예시 점을 찍는다(마지막 출력은 첫 출력과 같은 입력 = 한 입력을 여러 출력으로).
      const xpSx=15,xpPad=16,xpTop=22;
      const matrixBoxW=Math.max(68,matrixPorts.length*xpSx+xpPad*2-xpSx+8);
      const nodeX=isMatrix?leftX+chipW+30+matrixBoxW/2:leftX+chipW+70;
      let nodeRight;
      if(inN>1||isMatrix){
        if(!isMatrix)chipYs.forEach(y=>{
          const cy=y+chipH/2;
          bodyMarkup+=`<path d="M${leftX+chipW} ${cy}C${leftX+chipW+32} ${cy} ${leftX+chipW+32} ${midY} ${nodeX-22} ${midY}" fill="none" stroke="${A}" stroke-width="3"/>`;
        });
        if(isMatrix){
          const boxW=matrixBoxW,boxX=nodeX-boxW/2,boxY=chipYs[0]-xpTop,boxH=chipsBottom-chipYs[0]+xpTop+12;
          const colX=j=>boxX+xpPad+4+j*xpSx,rowY=i=>chipYs[i]+chipH/2;
          bodyMarkup+=`<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="14" fill="#fff" stroke="${A}" stroke-width="3"/>`;
          chipYs.forEach((y,i)=>{bodyMarkup+=`<path d="M${leftX+chipW} ${rowY(i)}H${boxX}" stroke="${A}" stroke-width="3"/><path d="M${boxX+6} ${rowY(i)}H${boxX+boxW-6}" stroke="${A}" stroke-width="1.2" opacity=".35"/>`;});
          const sel=matrixPorts.map((_,j)=>(j*5+1)%inN);
          if(sel.length>2)sel[sel.length-1]=sel[0];
          matrixPorts.forEach((n,j)=>{
            const x=colX(j);
            bodyMarkup+=`<path d="M${x} ${boxY+xpTop-6}V${boxY+boxH-8}" stroke="${P}" stroke-width="1.2" opacity=".35"/><text x="${x}" y="${boxY+xpTop-9}" text-anchor="middle" font-size="9" font-weight="700" fill="${PI}">${n}</text>`;
            chipYs.forEach((_,i)=>{bodyMarkup+=i===sel[j]?`<circle cx="${x}" cy="${rowY(i)}" r="5" fill="${PI}"/>`:`<circle cx="${x}" cy="${rowY(i)}" r="2" fill="#C7C7CC"/>`;});
          });
          bodyMarkup+=`<text x="${nodeX}" y="${boxY-26}" text-anchor="middle" font-size="12" font-weight="800" fill="${A}">매트릭스</text><text x="${nodeX}" y="${boxY-10}" text-anchor="middle" font-size="10" font-weight="600" fill="${M}"><tspan fill="${PI}">●</tspan> 선택 예시</text>`;
          nodeRight=boxX+boxW;
          if(audioIn){const joinY=boxY+boxH;bodyMarkup+=`<path d="M${leftX+chipW} ${audioY+audioH/2}C${leftX+chipW+42} ${audioY+audioH/2} ${boxX+18} ${audioY+audioH/2} ${boxX+18} ${joinY}" fill="none" stroke="${M}" stroke-width="1.8" stroke-dasharray="4 3"/><rect x="${leftX+chipW+8}" y="${audioY+audioH+2}" width="30" height="15" rx="7" fill="#fff"/><text x="${leftX+chipW+23}" y="${audioY+audioH+13}" text-anchor="middle" font-size="10" font-weight="700" fill="${M}">병합</text>`;}
        }else{
          if(audioIn)bodyMarkup+=`<path d="M${leftX+chipW} ${audioY+audioH/2}C${leftX+chipW+42} ${audioY+audioH/2} ${nodeX} ${audioY+audioH/2} ${nodeX} ${midY+21}" fill="none" stroke="${M}" stroke-width="1.8" stroke-dasharray="4 3"/><rect x="${leftX+chipW+8}" y="${audioY+audioH+2}" width="30" height="15" rx="7" fill="#fff"/><text x="${leftX+chipW+23}" y="${audioY+audioH+13}" text-anchor="middle" font-size="10" font-weight="700" fill="${M}">병합</text>`;
          bodyMarkup+=`<circle cx="${nodeX}" cy="${midY}" r="21" fill="#fff" stroke="${A}" stroke-width="3"/><path d="M${nodeX-10} ${midY}h20M${nodeX+4} ${midY-7}l7 7-7 7" fill="none" stroke="${A}" stroke-width="2.6" stroke-linecap="round"/><text x="${nodeX}" y="${audioIn?midY-31:midY+41}" text-anchor="middle" font-size="11" font-weight="600" fill="${M}">${inN}개 중 1개 선택</text>`;
          nodeRight=nodeX+21;
        }
      }else{
        nodeRight=leftX+chipW;
        // 입력이 1개뿐인 분배기(HD-13U 등)는 선택 노드가 없어 오디오 병합 선도 안 그려졌다 — 대역폭 띠로 들어가기 직전 지점에 합류시킨다.
        if(audioIn)bodyMarkup+=`<path d="M${leftX+chipW} ${audioY+audioH/2}C${leftX+chipW+30} ${audioY+audioH/2} ${leftX+chipW+30} ${midY} ${nodeRight+18} ${midY}" fill="none" stroke="${M}" stroke-width="1.8" stroke-dasharray="4 3"/><rect x="${leftX+chipW+8}" y="${audioY+audioH+2}" width="30" height="15" rx="7" fill="#fff"/><text x="${leftX+chipW+23}" y="${audioY+audioH+13}" text-anchor="middle" font-size="10" font-weight="700" fill="${M}">병합</text>`;
      }

      const bandX1=nodeRight+22,bandWidth=280,bandX2=bandX1+bandWidth,bandY=midY;
      bodyMarkup+=`<rect x="${bandX1}" y="${bandY-7}" width="${bandWidth}" height="14" rx="7" fill="url(#rt-pg-flowband-${esc(item.id)})"/><path d="M${bandX2} ${bandY-9}l14 9-14 9" fill="${P}"/>`;
      const bwSpec=(item.specifications||[]).find(spec=>/대역폭/.test(spec.name));
      const res=shortResolution(item);
      const topLabel=[bwSpec&&`${bwSpec.value}${bwSpec.unit||''}`,res&&[res.value,res.unit].filter(Boolean).join('')].filter(Boolean).join(' · ');
      if(topLabel)bodyMarkup+=`<text x="${(bandX1+bandX2)/2}" y="${bandY-24}" text-anchor="middle" font-size="14" font-weight="800" fill="#1C1C1E">${svgEsc(topLabel)}</text>`;
      const hdcp=(item.specifications||[]).find(spec=>/HDCP/.test(spec.name));
      // HDCP 값은 제품마다 "HDCP 2.2 support", "HDCP Compliant v2.2 지원"처럼 달라 앞의 HDCP·Compliant·v를 걷어내고 한 번만 붙인다(0.34 검수: "HDCP HDCP Compliant v2.2").
      const hdcpVersion=hdcp&&hdcp.value.replace(/지원|support/ig,'').replace(/^\s*HDCP\s*/i,'').replace(/Compliant\s*/i,'').replace(/^v(?=\d)/i,'').trim();
      // 병합(MUX)과 추출(DEMUX)을 하나만 골라 쓰는 제품(audioMux.mode "select", HD-13U)은 "또는"으로 이어 동시에 되는 것처럼 보이지 않게 한다.
      const audioSelect=audioIn&&audioOut&&item.audioMux?.mode==='select';
      const audioBits=audioSelect?[item.audioMux.caption||'오디오 병합 또는 추출 중 선택']:[audioIn&&'오디오 병합',audioOut&&'오디오 추출'];
      const protoBits=[videoIn.protocol,hdcp&&(hdcpVersion?`HDCP ${hdcpVersion}`:'HDCP'),...audioBits].filter(Boolean);
      if(protoBits.length)bodyMarkup+=`<text x="${(bandX1+bandX2)/2}" y="${bandY+28}" text-anchor="middle" font-size="11" font-weight="600" fill="${M}">${svgEsc(protoBits.join(' · '))}</text>`;

      const cellW=32,cellH=23,cellGap=8,panelPad=14;
      const cols=Math.min(matrixPorts.length,5),rows=Math.ceil(matrixPorts.length/cols);
      const gridW=cols*cellW+(cols-1)*cellGap,gridH=rows*(cellH+13)+(rows-1)*cellGap;
      const panelX=bandX2+20,panelW=gridW+panelPad*2,panelH=gridH+panelPad*2+10;
      const panelY=Math.max(10,bandY-panelH/2);
      bodyMarkup+=`<rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="16" fill="rgba(137,68,171,.09)"/>`;
      matrixPorts.forEach((n,i)=>{
        const c=i%cols,r=Math.floor(i/cols);
        const x=panelX+panelPad+c*(cellW+cellGap),y=panelY+panelPad+r*(cellH+13+cellGap)+8;
        bodyMarkup+=`<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" fill="#fff" stroke="${P}" stroke-width="1.8"/><path d="M${x+cellW/2} ${y+cellH}v5M${x+cellW/2-7} ${y+cellH+6}h14" stroke="${P}" stroke-width="1.6"/><text x="${x+cellW/2}" y="${y+cellH/2+3.5}" text-anchor="middle" font-size="9" font-weight="700" fill="${PI}">${n}</text>`;
      });
      const outCaption=outTotal>outN?`OUT 1–${outN} 외 ${outTotal-outN}개`:matrixPorts.length===1?'OUT':`OUT ${matrixPorts[0]}–${matrixPorts[matrixPorts.length-1]}`;
      const sameSignal=matrixPorts.length===1?'선택한 입력 출력':isMatrix?'출력마다 입력 선택':'같은 영상';
      const captionText=`${outCaption} · ${sameSignal}${multiview.length&&!isMatrix?' 매트릭스':''}`;
      bodyMarkup+=`<text x="${panelX+panelW/2}" y="${panelY+panelH+16}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${PI}">${svgEsc(captionText)}</text>`;

      // 멀티뷰 전용 출력: 매트릭스 출력과 같은 대역폭 띠에서 갈라져 나오는 별도 갈래로, 위쪽에 자체 패널과 캡션을 둔다.
      if(multiview.length){
        const mvCols=Math.min(multiview.length,5),mvRows=Math.ceil(multiview.length/mvCols);
        const mvGridW=mvCols*cellW+(mvCols-1)*cellGap,mvGridH=mvRows*(cellH+13)+(mvRows-1)*cellGap;
        const mvPanelW=mvGridW+panelPad*2,mvPanelH=mvGridH+panelPad*2+10;
        const mvPanelX=panelX,mvPanelY=Math.max(10,panelY-mvPanelH-46);
        bodyMarkup+=`<path d="M${bandX2} ${bandY-7}C${bandX2} ${mvPanelY+mvPanelH/2} ${mvPanelX-20} ${mvPanelY+mvPanelH/2} ${mvPanelX} ${mvPanelY+mvPanelH/2}" fill="none" stroke="${PI}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
        bodyMarkup+=`<rect x="${mvPanelX}" y="${mvPanelY}" width="${mvPanelW}" height="${mvPanelH}" rx="16" fill="rgba(137,68,171,.16)"/>`;
        multiview.forEach((n,i)=>{
          const c=i%mvCols,r=Math.floor(i/mvCols);
          const x=mvPanelX+panelPad+c*(cellW+cellGap),y=mvPanelY+panelPad+r*(cellH+13+cellGap)+8;
          bodyMarkup+=`<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" fill="#F3EEFF" stroke="${P}" stroke-width="1.8"/><path d="M${x+cellW/2} ${y+2}V${y+cellH-2}M${x+2} ${y+cellH/2}H${x+cellW-2}" stroke="${P}" stroke-width="1" opacity=".55"/><path d="M${x+cellW/2} ${y+cellH}v5M${x+cellW/2-7} ${y+cellH+6}h14" stroke="${P}" stroke-width="1.6"/><text x="${x+cellW/2}" y="${y+cellH/2+3.5}" text-anchor="middle" font-size="9" font-weight="700" fill="${PI}">${n}</text>`;
        });
        const mvCaption=`${multiview.join('·')}번 각 4분할 또는 8분할`;
        bodyMarkup+=`<text x="${mvPanelX+mvPanelW/2}" y="${mvPanelY+mvPanelH+16}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${PI}">${svgEsc(mvCaption)}</text>`;
      }

      // 오디오 추출(디먹스): 캡션 아래에 AUDIO OUT 칩을 두고 대역폭 띠에서 점선으로 이어 "병합"과 대칭으로 보이게 한다.
      // 멀티뷰 갈래(위쪽)와 같은 모양으로 그려서(대역폭 띠 오른쪽 끝 → 짧게 왼쪽으로 들어가는 곡선) 점선이 패널을 가로지르지 않게 한다.
      let audioOutBottom=panelY+panelH+16,audioOutRight=0;
      if(audioOut){
        const audioOutW=104,audioOutH=30,aoX=panelX,aoY=panelY+panelH+34,aoMidY=aoY+audioOutH/2;
        bodyMarkup+=`<path d="M${bandX2} ${bandY+7}C${bandX2} ${aoMidY} ${aoX-20} ${aoMidY} ${aoX} ${aoMidY}" fill="none" stroke="${M}" stroke-width="1.8" stroke-dasharray="4 3"/><rect x="${aoX}" y="${aoY}" width="${audioOutW}" height="${audioOutH}" rx="15" fill="rgba(118,118,128,.10)"/><text x="${aoX+audioOutW/2}" y="${aoMidY+4}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${M}">AUDIO OUT</text><rect x="${aoX+audioOutW+6}" y="${aoY+7}" width="30" height="15" rx="7" fill="#fff"/><text x="${aoX+audioOutW+21}" y="${aoY+18}" text-anchor="middle" font-size="10" font-weight="700" fill="${M}">추출</text>`;
        audioOutBottom=aoY+audioOutH;
        audioOutRight=aoX+audioOutW+36;
      }

      // 캡션 글자가 출력 격자보다 넓을 수 있어(예: 매트릭스 전환 문구) SVG 너비에 여유를 둔다.
      const captionHalfWidth=Math.max(captionText.length,multiview.length?`${multiview.join('·')}번 각 4분할 또는 8분할`.length:0)*3.6+20;
      // AUDIO OUT 칩과 "추출" 표시도 너비에 넣는다(출력이 1개인 HDS-21U는 출력 패널이 좁아 "추출"이 잘렸다, 사용자 지적 2026-09-27).
      const width=Math.max(panelX+panelW+20,panelX+panelW/2+captionHalfWidth+20,audioOutRight+16);
      const height=Math.max(leftBottom+20,panelY+panelH+38,midY+70,audioOutBottom+16);
      return diagramWrap(bodyMarkup,width,height,[]);
    }
    function cableDiagram(item){
      const specs=item.specifications||[];
      const bandwidth=specs.find(spec=>/대역폭/.test(spec.name));
      const distance=specs.find(spec=>/거리|길이/.test(spec.name));
      const width=760,height=170,midY=85;
      const label=[bandwidth&&`${bandwidth.value}${bandwidth.unit||''}`,distance&&`최대 ${distance.value}${distance.unit||''}`].filter(Boolean).join(' · ');
      let bodyMarkup=monitorIcon(70,midY,'소스 기기')+arrow(95,midY,290,midY,COLOR_IN);
      bodyMarkup+=`<rect x="290" y="${midY-22}" width="180" height="44" rx="22" fill="#eef2f8" stroke="#c8d3e6" stroke-width="2"/><text x="380" y="${midY+5}" text-anchor="middle" font-size="13" font-weight="750" fill="#1f2532">${svgEsc(item.model)}</text>`;
      bodyMarkup+=arrow(470,midY,width-70-24,midY,COLOR_OUT)+monitorIcon(width-70,midY,'디스플레이');
      if(label)bodyMarkup+=`<text x="${width/2}" y="${midY-38}" text-anchor="middle" font-size="11" font-weight="700" fill="#687386">${svgEsc(label)}</text>`;
      return diagramWrap(bodyMarkup,width,height,[[COLOR_IN,'입력'],[COLOR_OUT,'출력']]);
    }
    // XDM-PSU "03 Signal Flow"(사용자 요청 2026-09-28 "xdm-psu제품에도 signal flow개념을 그려줘"). PSU에는 HDMI 입출력이 없어
    // extenderDiagram이 그리지 못한다. 제품 데이터(overview·io)에 적힌 연결만 그린다: POH는 CIS100 ↔ CTR100(Tx) CAT 사이에 끼워
    // CTR100에 전원을 싣고, PHX는 2핀 전원선으로 COS100에 전원을 넣어 COS100이 CAT로 CTR100(Rx)에 전원을 함께 보낸다.
    const COLOR_POWER='#FF9500';
    // 0.98: 제조사 연결도(MAX2-POE-PSU 구성도)처럼 매트릭스 프레임(위) · XDM-PSU(가운데) · XDM-CTR100 Tx/Rx(아래)를 장비 모양 그림으로 그리고,
    // 케이블을 따라 신호(초록)·전원(주황)이 흐르는 애니메이션을 넣는다(사용자 요청 2026-09-28 "딥스위치를 이미지화 했던 것처럼 … 애니메이션 이미지화해서 실제 연결처럼").
    // 움직임을 줄이는 설정(prefers-reduced-motion)에서는 흐름 점선이 멈춘 채로 보인다.
    function psuDiagram(item){
      const width=1000,height=710,INK='#1f2532',SUB='#687386',BODY='#eceff4',EDGE='#8e97a6',HI='#007AFF',TAG='#1f3b8f';
      const rj45=(x,y,on)=>`<g><rect x="${x}" y="${y}" width="16" height="13" rx="1.5" fill="${on?'#e3edff':'#fff'}" stroke="${on?HI:'#3a4150'}" stroke-width="${on?2:1.3}"/><rect x="${x+5}" y="${y+8}" width="6" height="3.5" fill="${on?HI:'#3a4150'}"/></g>`;
      const pin2=(x,y,on)=>`<g><rect x="${x}" y="${y}" width="14" height="10" rx="1.5" fill="${on?'#34C759':'#8fd6a0'}" stroke="${on?'#1c7a36':'#5da873'}" stroke-width="${on?1.8:1}"/><rect x="${x+2.5}" y="${y+3}" width="3.5" height="4" fill="#0f3d1c"/><rect x="${x+8}" y="${y+3}" width="3.5" height="4" fill="#0f3d1c"/></g>`;
      const phoenix5=(x,y,on)=>`<g${on?' class="rt-psu-cos-pin"':''}><rect x="${x}" y="${y}" width="16" height="8" rx="1.2" fill="${on?'#34C759':'#8fd6a0'}" stroke="${on?'#1c7a36':'#5da873'}" stroke-width="${on?1.6:1}"/>${[0,1,2,3,4].map(i=>`<rect x="${x+1.6+i*2.7}" y="${y+2.5}" width="1.8" height="3" fill="#0f3d1c"/>`).join('')}</g>`;
      const hdmi=(x,y,on)=>`<path d="M${x} ${y}h22v6l-3 4h-16l-3-4z" fill="${on?'#fff':'#f4f6f9'}" stroke="${on?'#3a4150':'#9aa3b2'}" stroke-width="1.4"/>`;
      const pill=(x,y,text,fill=TAG)=>{const w=Math.max(46,text.length*6.6+18);return `<g><rect x="${x-w/2}" y="${y-10}" width="${w}" height="20" rx="10" fill="${fill}"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10.5" font-weight="750" fill="#fff">${svgEsc(text)}</text></g>`};
      // 케이블 한 가닥: 회색 피복 위에 흐름 점선을 겹친다. flows=[[색, 방향(1 정방향·-1 역방향), 시작 어긋남]]
      const cable=(d,flows,bodyColor='#aeb6c3')=>`<path d="${d}" fill="none" stroke="${bodyColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>${flows.map(([color,dir,offset=0])=>`<path class="rt-psu-flow${dir<0?' rt-psu-rev':''}" d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 11" stroke-dashoffset="${offset}"/>`).join('')}`;
      const twoPin=d=>`<path d="${d}" fill="none" stroke="#e0463c" stroke-width="3" stroke-linejoin="round" transform="translate(-2.2 0)"/><path d="${d}" fill="none" stroke="#2c2c2e" stroke-width="3" stroke-linejoin="round" transform="translate(2.2 0)"/><path class="rt-psu-flow" d="${d}" fill="none" stroke="${COLOR_POWER}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 10"/>`;
      let body='';
      // ---- 케이블(장비보다 먼저 그려 장비 몸체 아래로 들어가게 한다) ----
      // 0.101(사용자 요청 "XDM-PSU 전원과 PHX가 조금 거리가 멀었으면 해", "XDM COS카드 전원 연결을 조금 만 더 길게해줘"): PSU 후면 모듈 행과 그 아래 CTR100 Tx/Rx를 30px 아래로,
      // AC 입력만 PHX보다 40px 오른쪽으로 옮겨 PHX↔COS100 2핀 전원선이 더 길어지고 PHX↔AC 입력 사이 간격이 생기게 한다.
      const cisPort=[336,62],cosPort=[501,52],cosPin=[501,67],pohCis=[322,352],pohExt=[322,382],phx=[552,366],txRj=[122,568],rxRj=[870,568];
      // ① POH "CIS Card" ↔ CIS100: 신호만(Tx에서 온 영상이 CIS100으로 들어감)
      body+=cable(`M${pohCis[0]} ${pohCis[1]+6}H250V${cisPort[1]+6}H${cisPort[0]}`,[[COLOR_COPPER,1]]);
      // ② CTR100 Tx ↔ POH "Extender": 신호는 Tx → PSU, 전원은 PSU → Tx(역방향)
      body+=cable(`M${txRj[0]} ${txRj[1]+6}H80V${pohExt[1]+6}H${pohExt[0]}`,[[COLOR_COPPER,1],[COLOR_POWER,-1,9]]);
      // HDMI: 소스 → Tx HDMI IN, Rx HDMI OUT → 디스플레이
      body+=cable('M84 654H171V604',[[COLOR_IN,1]]);
      body+=cable('M755 604V654H916',[[COLOR_OUT,1]]);
      // ---- 매트릭스 프레임(CIS100·COS100 카드 장착) ----
      body+=`<rect x="300" y="24" width="400" height="190" rx="6" fill="${BODY}" stroke="${EDGE}" stroke-width="2"/>`;
      for(let i=0;i<12;i++){
        const x=316+i*30,card=i===0?'CIS':i===6?'COS':'';
        body+=`<rect x="${x}" y="40" width="26" height="136" rx="2" fill="${card?'#dfeaff':'#f7f8fa'}" stroke="${card?HI:'#b8bfcb'}" stroke-width="${card?2:1}"/><circle cx="${x+13}" cy="46" r="2.4" fill="#b8bfcb"/><circle cx="${x+13}" cy="170" r="2.4" fill="#b8bfcb"/>`;
        if(card==='CIS')for(let p=0;p<4;p++)body+=rj45(x+5,56+p*26,p===0);
        // 0.99 COS100: 포트마다 RJ45 아래에 피닉스 5핀(오디오 추출 및 PoE)이 있고, PHX 2핀 전원선은 이 피닉스 단자에 꽂는다(사용자 확인 2026-09-28 "COS PHNIX픽에 전원연결", 카탈로그 COS100 사진).
        if(card==='COS')for(let p=0;p<4;p++)body+=rj45(x+5,52+p*30,p===0)+phoenix5(x+5,67+p*30,p===0);
      }
      for(let v=0;v<18;v++)body+=`<rect x="${318+v*20}" y="186" width="12" height="16" rx="3" fill="#cfd5de"/>`;
      body+=pill(410,100,'XDM-CIS100 입력 카드');
      body+=pill(606,130,'XDM-COS100 출력 카드');
      // ③ PHX 2핀 → COS100 1번 포트 피닉스 단자(프레임 위로 그려 꽂히는 곳이 보이게 한다)
      body+=twoPin(`M${phx[0]+7} ${phx[1]}V262H539V${cosPin[1]+4}H${cosPin[0]+17}`);
      // ④ COS100 1번 RJ45 → CTR100 Rx: 신호와 전원이 함께 Rx로
      body+=cable(`M${cosPort[0]+16} ${cosPort[1]+6}H930V${rxRj[1]+6}H${rxRj[0]+16}`,[[COLOR_COPPER,1],[COLOR_POWER,1,9]]);
      body+=`<text x="700" y="232" text-anchor="end" font-size="10" fill="${SUB}">XDM 매트릭스 프레임</text>`;
      // ---- XDM-PSU 후면(POH·PHX 모듈, AC 인렛) ----
      body+=`<text x="300" y="322" font-size="15" font-weight="800" fill="${TAG}">XDM-PSU</text>`;
      body+=`<rect x="300" y="332" width="440" height="80" rx="6" fill="${BODY}" stroke="${EDGE}" stroke-width="2"/>`;
      for(let i=0;i<6;i++){const x=322+i*34;body+=rj45(x,pohCis[1],i===0)+rj45(x,pohExt[1],i===0)}
      for(let j=0;j<4;j++)body+=pin2(phx[0]+j*28,phx[1],j===0);
      body+=`<rect x="692" y="344" width="34" height="18" rx="3" fill="#fff" stroke="#3a4150" stroke-width="1.3"/><rect x="702" y="348" width="14" height="10" rx="2" fill="#e0463c"/><rect x="692" y="368" width="34" height="32" rx="4" fill="#fff" stroke="#3a4150" stroke-width="1.3"/><path d="M700 376h6v8h-6zM712 376h6v8h-6zM706 388h6v6h-6z" fill="#3a4150"/>`;
      body+=`<text x="${322+85}" y="428" text-anchor="middle" font-size="10" font-weight="750" fill="${INK}">${svgEsc('XDM-PSU · POH')}</text><text x="${322+85}" y="441" text-anchor="middle" font-size="9.5" fill="${SUB}">위 CIS Card · 아래 Extender</text>`;
      body+=`<text x="${phx[0]+49}" y="428" text-anchor="middle" font-size="10" font-weight="750" fill="${INK}">${svgEsc('XDM-PSU · PHX')}</text><text x="${phx[0]+49}" y="441" text-anchor="middle" font-size="9.5" fill="${SUB}">2핀(+/−) COS Card</text>`;
      body+=`<text x="709" y="428" text-anchor="middle" font-size="9.5" fill="${SUB}">AC 입력</text>`;
      // ---- XDM-CTR100 Tx/Rx(뒷면: RJ45·HDMI·피닉스, 상태 LED) ----
      const ctr=(x,label,sub,rjX,hdmiX,ledX,noteX)=>{
        let g=`<text x="${x+90}" y="524" text-anchor="middle" font-size="14" font-weight="800" fill="${TAG}">XDM-CTR100</text><text x="${x+90}" y="540" text-anchor="middle" font-size="11" font-weight="700" fill="${INK}">${svgEsc(label)}</text>`;
        g+=`<rect x="${x}" y="550" width="180" height="54" rx="6" fill="${BODY}" stroke="${EDGE}" stroke-width="2"/>`;
        g+=rj45(rjX,568,true)+hdmi(hdmiX,570,true)+hdmi(hdmiX+26,570,false);
        g+=`<rect x="${x+106}" y="571" width="30" height="10" rx="1.5" fill="#8fd6a0" stroke="#5da873"/>`;
        g+=`<circle class="rt-psu-led" cx="${ledX}" cy="561" r="3.4" fill="#34C759"/><circle class="rt-psu-led" cx="${ledX+10}" cy="561" r="3.4" fill="#34C759" style="animation-delay:.6s"/>`;
        g+=`<text x="${noteX}" y="622" font-size="9.5" fill="${SUB}">${svgEsc(sub)}</text>`;
        return g;
      };
      body+=ctr(110,'TX · 송신기','전원 어댑터 불필요 · POH가 CAT로 전원 공급',txRj[0],160,270,182);
      body+=ctr(710,'RX · 수신기','전원 어댑터 불필요 · COS100이 CAT로 전원 공급',rxRj[0],744,724,766);
      body+=monitorIcon(60,648,'소스 기기')+monitorIcon(940,648,'디스플레이');
      // ---- 케이블 이름표 ----
      body+=pill(250,196,'CAT · 신호',COLOR_COPPER);
      body+=pill(80,478,'CAT · 신호+전원',COLOR_COPPER);
      body+=pill(930,300,'CAT · 신호+전원',COLOR_COPPER);
      body+=pill(610,262,'2핀 전원선',COLOR_POWER);
      body+=pill(128,670,'HDMI',COLOR_IN)+pill(848,670,'HDMI',COLOR_OUT);
      const ac=(item.specifications||[]).find(spec=>spec.name==='전원');
      body+=`<text x="${width/2}" y="470" text-anchor="middle" font-size="10" fill="${SUB}">XDM-PSU 1대 = 모듈 16칸(POH·PHX를 섞어 장착) · POH 1개 = CTR100 TX 1대 · PHX 1개 = COS100 1장${ac?` · 본체 전원 ${svgEsc(ac.value)}`:''}</text>`;
      body+=`<text x="${width/2}" y="486" text-anchor="middle" font-size="10" fill="${SUB}">XDM-CIS100·COS100 카드 구성에서는 XDM-CTR100 PSE를 사용할 수 없습니다</text>`;
      // 0.99: XDM-PSU만 그림이 커서 "크게 보기"(전체 화면 확대 창)를 둔다(사용자 요청 2026-09-28 "xdm-psu만 03 Singal flow 확대해서 볼 수 있게해줘"). 그림을 눌러도 열린다.
      return `<div class="rt-flow-zoom-bar"><button type="button" class="rt-pg-btn" data-flow-zoom>⤢ 크게 보기</button></div>`+diagramWrap(`<g class="rt-psu-anim">${body}</g>`,width,height,[[COLOR_IN,'입력(HDMI)'],[COLOR_COPPER,'HDBaseT 신호(CATx)'],[COLOR_POWER,'전원'],[COLOR_OUT,'출력(HDMI)']]);
    }
    function extenderDiagram(item){
      const io=item.io||[];
      if(!io.length)return null;
      const isTransceiver=io.every(port=>!/^(TX|RX)\s*·/.test(port.group||''));
      const side=(prefix,direction)=>io.find(port=>(isTransceiver?port.group==='Video':port.group.startsWith(prefix))&&port.direction===direction&&/HDMI/i.test(port.connector||''));
      const txVideo=side('TX','IN'),rxVideo=side('RX','OUT');
      const transmission=io.find(port=>/Transmission/.test(port.group||''));
      if(!txVideo||!rxVideo||!transmission)return null;
      const isFiber=/광|Fiber|SC|LC/i.test(`${transmission.connector} ${transmission.signal} ${transmission.protocol}`);
      const cableColor=isFiber?COLOR_FIBER:COLOR_COPPER;
      const distanceSpecs=(item.specifications||[]).filter(spec=>/전송\s?거리/.test(spec.name));
      // HDBaseT를 쓰지 않는 CATx 전송기(SPX-TX/RX)는 "CATx"로만 적고, 거리 조건의 해상도 부분(4K 60Hz·1080p·Long Reach)을 표시에 쓴다(0.64).
      const isHDBaseT=/HDBaseT/i.test(JSON.stringify([item.english,item.korean,item.overview,item.features]));
      const cableName=isFiber?'광케이블':isHDBaseT?'HDBaseT(CATx)':'CATx';
      const cableLabelFor=spec=>{
        // 0.166: 값이 여러 줄인 행(SPX-TX/RX "4K60 실효 전송거리")은 괄호 속 케이블 모델을 빼고 한 줄로 이어 범례에 쓴다.
        if(String(spec.value).includes('\n'))return `${spec.name}: ${String(spec.value).split('\n').map(line=>line.replace(/\s*\([^)]*\)/g,'').trim()).join(' · ')}`;
        const m=(spec.condition||'').match(/(BELDEN\s*)?([A-Z0-9]+)\s*\(([^)]+)\)/);
        if(!m&&!isFiber&&!isHDBaseT){const seg=(spec.condition||'').split('·').map(s=>s.replace(/\([^)]*\)/g,'').trim()).find(s=>/4K|1080p|Long Reach/i.test(s));if(seg)return `${seg.replace(/\s*모드$/,'')} 최대 ${spec.value}${spec.unit||''}`;}
        if(!m)return `최대 ${spec.value}${spec.unit||''}`;
        const mod=m[3].split(',')[0].trim();
        return `${m[1]||''}${m[2]}(${mod}) 최대 ${spec.value}${spec.unit||''}`;
      };
      const distanceLines=distanceSpecs.map(cableLabelFor);
      const [txLabel,rxLabel]=isTransceiver?[item.model.split(' / ')[0],item.model.split(' / ')[0]]:(item.model.includes(' / ')?item.model.split(' / '):[item.model,item.model]);
      const pseCombo=item.id==='xdm-ctr100';
      // 0.47: XDM-CTR100 PSE를 별도 제품(xdm-ctr100-pse)으로 나눴다. PSE는 매트릭스 카드에 직결할 수 없으므로 PSE 조합만 그린다.
      const pseOnly=item.id==='xdm-ctr100-pse';
      let bodyMarkup,width,height,captions;
      if(pseOnly){
        width=980;
        const boxW=170,boxH=70,iconX=60,leftBoxX=210,cardX=600,dstX=920,rowY=100;
        height=240;
        bodyMarkup=`<text x="${width/2}" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#687386">PSE 조합 · PSE에만 전원 연결, 상대 기기는 CAT 케이블로 전원을 받음(PD)</text>`;
        bodyMarkup+=monitorIcon(iconX,rowY,'소스 기기')+arrow(iconX+24,rowY,leftBoxX-6,rowY,COLOR_IN);
        bodyMarkup+=deviceBox(leftBoxX,rowY-boxH/2,boxW,boxH,'XDM-CTR100 PSE','전원 연결(POE 공급측)');
        bodyMarkup+=`<path d="M${leftBoxX+boxW} ${rowY}L${cardX} ${rowY}" stroke="${cableColor}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><text x="${(leftBoxX+boxW+cardX)/2}" y="${rowY-14}" text-anchor="middle" font-size="10" font-weight="700" fill="${cableColor}">${svgEsc(cableName)} · 신호+전원 동시 공급</text>`;
        bodyMarkup+=deviceBox(cardX,rowY-boxH/2,boxW,boxH,'XDM-CTR100 · CT/CR103','전원 케이블 불필요(PD)');
        bodyMarkup+=arrow(cardX+boxW+6,rowY,dstX-24,rowY,COLOR_OUT)+monitorIcon(dstX,rowY,'디스플레이');
        bodyMarkup+=`<text x="${width/2}" y="${rowY+boxH/2+26}" text-anchor="middle" font-size="10" fill="#687386">PSE[TX 모드] ↔ XDM-CTR100[RX 모드]·XDM-CR103 · PSE[RX 모드] ↔ XDM-CTR100[TX 모드]·XDM-CT103</text>`;
        bodyMarkup+=`<text x="${width/2}" y="${rowY+boxH/2+44}" text-anchor="middle" font-size="10" fill="#687386">TX/RX는 각 기기 딥 스위치로 선택 · XDM-CIS100·COS100 카드에는 PSE가 아닌 XDM-CTR100을 직결</text>`;
        captions=[[COLOR_IN,'입력'],[cableColor,cableName],[COLOR_OUT,'출력']];
      } else if(pseCombo){
        width=980;
        const boxW=170,boxH=70;
        const iconX=60,leftBoxX=210,cardX=600,dstX=920;
        const row1Y=100,row2Y=220,combo2Y=390;
        height=460;
        const cableSeg=(y)=>`<path d="M${leftBoxX+boxW} ${y}L${cardX} ${y}" stroke="${cableColor}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><text x="${(leftBoxX+boxW+cardX)/2}" y="${y-14}" text-anchor="middle" font-size="10" font-weight="700" fill="${cableColor}">${svgEsc(cableName)}</text>`;
        const cableSeg2=(x1,x2,y)=>`<path d="M${x1+boxW} ${y}L${x2} ${y}" stroke="${cableColor}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><text x="${(x1+boxW+x2)/2}" y="${y-14}" text-anchor="middle" font-size="10" font-weight="700" fill="${cableColor}">${svgEsc(cableName)} · 신호+전원 동시 공급</text>`;
        bodyMarkup=`<text x="${width/2}" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#687386">조합 1 · XDM-CIS100·COS100 카드에 직결(XDM-PSU로 전원 공급, PSE 사용 불가)</text>`;
        bodyMarkup+=monitorIcon(iconX,row1Y,'소스 기기')+arrow(iconX+24,row1Y,leftBoxX-6,row1Y,COLOR_IN);
        bodyMarkup+=deviceBox(leftBoxX,row1Y-boxH/2,boxW,boxH,'XDM-CTR100','TX · XDM-PSU 급전');
        bodyMarkup+=cableSeg(row1Y);
        bodyMarkup+=deviceBox(cardX,row1Y-boxH/2,boxW,boxH,'XDM-CIS100','입력 카드(HDBaseT)');
        bodyMarkup+=deviceBox(leftBoxX,row2Y-boxH/2,boxW,boxH,'XDM-COS100','출력 카드(HDBaseT)');
        bodyMarkup+=cableSeg(row2Y);
        bodyMarkup+=deviceBox(cardX,row2Y-boxH/2,boxW,boxH,'XDM-CTR100','RX · XDM-PSU 급전');
        bodyMarkup+=arrow(cardX+boxW+6,row2Y,dstX-24,row2Y,COLOR_OUT)+monitorIcon(dstX,row2Y,'디스플레이');
        bodyMarkup+=`<text x="${width/2}" y="${combo2Y-56}" text-anchor="middle" font-size="11" font-weight="700" fill="#687386">조합 2 · HDBaseT 카드 없이 연장할 때(XDM HDMI 카드 연장·단독 1:1)</text>`;
        bodyMarkup+=monitorIcon(iconX,combo2Y,'소스 기기')+arrow(iconX+24,combo2Y,leftBoxX-6,combo2Y,COLOR_IN);
        bodyMarkup+=deviceBox(leftBoxX,combo2Y-boxH/2,boxW,boxH,'XDM-CTR100 PSE','전원 연결(POE 공급측)');
        bodyMarkup+=cableSeg2(leftBoxX,cardX,combo2Y);
        bodyMarkup+=deviceBox(cardX,combo2Y-boxH/2,boxW,boxH,'XDM-CTR100','전원 케이블 불필요(PD)');
        bodyMarkup+=arrow(cardX+boxW+6,combo2Y,dstX-24,combo2Y,COLOR_OUT)+monitorIcon(dstX,combo2Y,'디스플레이');
        bodyMarkup+=`<text x="${width/2}" y="${combo2Y+boxH/2+22}" text-anchor="middle" font-size="10" fill="#687386">TX/RX는 각 기기 딥 스위치로 선택 · CIS100·COS100 카드에 직결할 때는 이 조합 대신 XDM-PSU로 전원 공급</text>`;
        captions=[[COLOR_IN,'입력'],[cableColor,cableName],[COLOR_OUT,'출력']];
      } else {
        width=980;height=220;
        const midY=110,boxW=170,boxH=76;
        const srcX=60,txX=210,rxX=width-210-boxW,dstX=width-60;
        bodyMarkup=monitorIcon(srcX,midY,'소스 기기')+arrow(srcX+24,midY,txX-6,midY,COLOR_IN);
        bodyMarkup+=deviceBox(txX,midY-boxH/2,boxW,boxH,txLabel,isTransceiver?'송신 모드':'송신기(TX)');
        bodyMarkup+=`<path d="M${txX+boxW} ${midY}L${rxX} ${midY}" stroke="${cableColor}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><text x="${(txX+boxW+rxX)/2}" y="${midY-20}" text-anchor="middle" font-size="11" font-weight="700" fill="${cableColor}">${svgEsc(cableName)}</text>`;
        bodyMarkup+=deviceBox(rxX,midY-boxH/2,boxW,boxH,rxLabel,isTransceiver?'수신 모드':'수신기(RX)');
        bodyMarkup+=arrow(rxX+boxW+6,midY,dstX-24,midY,COLOR_OUT)+monitorIcon(dstX,midY,'디스플레이');
        captions=[[COLOR_IN,'입력(소스 → TX)'],[cableColor,cableName],[COLOR_OUT,'출력(RX → 디스플레이)']];
      }
      // 추천 케이블(최대 전송거리)은 캔버스 안이 아니라 범례에서 "출력" 오른쪽에 이어 붙인다(사용자 요청).
      if(distanceLines.length)captions.push([cableColor,distanceLines.join(' · ')]);
      const extras=io.filter(port=>port!==txVideo&&port!==rxVideo&&port!==transmission&&!/Transmission/.test(port.group||'')).map(port=>port.signal||shortConnector(port.connector));
      const note=extras.length?`<p class="rt-pg-hint" style="text-align:center">그 외 신호(${[...new Set(extras)].map(esc).join(', ')})는 아래 자료 기록의 입출력 표를 확인하세요.</p>`:'';
      return diagramWrap(bodyMarkup,width,height,captions)+note;
    }
    // SPX-R6 "03 Signal Flow"(0.157). 송·수신기 한 쌍이 아니라 모듈 6개를 품은 섀시라 extenderDiagram이 그리지 못한다.
    // 사양서 연결도(1쪽)에 있는 연결만 그린다: 소스 6대 → 모듈 칸 HDMI IN → CAT OUT → SPX-RX 6대 → 디스플레이,
    // IR 리시버(리모컨) → IR IN, 제어 컨트롤러 → IR Ctrl, 외부 전원 어댑터 1개 → 본체(모듈 6개 공급).
    const COLOR_IR='#7669EF';
    function rackExtenderDiagram(item){
      const width=860,rows=6,top=96,head=34,gap=50;
      const r6X=160,r6W=190,rxX=530,rxW=112,srcX=48,dstX=812,rowY=i=>top+head+18+i*gap;
      const r6Bottom=top+head+gap*rows+6,height=r6Bottom+92;
      let body=`<text x="${width/2}" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#687386">${svgEsc(`${item.model} 1대 = 모듈 6개 · 모듈마다 소스 1대 → SPX-RX 1대 → 디스플레이 1대`)}</text>`;
      // IR 리시버·제어 컨트롤러(위)와 전원 어댑터(아래)
      body+=deviceBox(r6X-44,38,120,36,'IR 리시버','리모컨 신호')+deviceBox(r6X+114,38,120,36,'제어 컨트롤러','');
      body+=arrow(r6X+22,74,r6X+22,top-3,COLOR_IR)+arrow(r6X+168,74,r6X+168,top-3,COLOR_IR);
      body+=`<text x="${r6X+29}" y="${top-8}" font-size="10" font-weight="700" fill="${COLOR_IR}">IR IN</text><text x="${r6X+175}" y="${top-8}" font-size="10" font-weight="700" fill="${COLOR_IR}">IR Ctrl</text>`;
      body+=`<rect x="${r6X}" y="${top}" width="${r6W}" height="${r6Bottom-top}" rx="14" fill="#eef2f8" stroke="#c8d3e6" stroke-width="2"/>`;
      body+=`<text x="${r6X+r6W/2}" y="${top+24}" text-anchor="middle" font-size="14" font-weight="800" fill="#1f2532">${svgEsc(item.model)}</text>`;
      body+=arrow(r6X+r6W/2,r6Bottom+34,r6X+r6W/2,r6Bottom+4,COLOR_POWER);
      body+=`<text x="${r6X+r6W/2}" y="${r6Bottom+52}" text-anchor="middle" font-size="11" fill="#687386">전원 어댑터 1개 → 모듈 6개 공급</text>`;
      for(let i=0;i<rows;i++){
        const y=rowY(i);
        body+=monitorIcon(srcX,y-4,i===rows-1?'소스 기기':'',0.8)+arrow(srcX+22,y,r6X-6,y,COLOR_IN);
        body+=`<rect x="${r6X+12}" y="${y-17}" width="${r6W-24}" height="34" rx="8" fill="#fff" stroke="#c8d3e6" stroke-width="1.5"/><text x="${r6X+24}" y="${y+4}" font-size="12" font-weight="750" fill="#1f2532">모듈 ${i+1}</text><text x="${r6X+r6W-22}" y="${y+4}" text-anchor="end" font-size="10" fill="#687386">HDMI IN → CAT OUT</text>`;
        body+=`<path d="M${r6X+r6W} ${y}L${rxX} ${y}" stroke="${COLOR_COPPER}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/>`;
        body+=deviceBox(rxX,y-17,rxW,34,'SPX-RX','');
        body+=arrow(rxX+rxW+6,y,dstX-22,y,COLOR_OUT)+monitorIcon(dstX,y-4,i===rows-1?'디스플레이':'',0.8);
      }
      body+=`<text x="${(r6X+r6W+rxX)/2}" y="${rowY(0)-24}" text-anchor="middle" font-size="11" font-weight="700" fill="${COLOR_COPPER}">CATx(CAT5e) · PoC</text>`;
      // 0.193: 전송 거리를 한 행에 줄 나눔("4K/60 @ 4:4:4 50m\n1080p/60 60m")으로 적으면 줄마다 범례 한 토막으로 쓴다.
      const distances=(item.specifications||[]).filter(spec=>/전송\s?거리/.test(spec.name)).flatMap(spec=>String(spec.value).includes('\n')?String(spec.value).split('\n').map(line=>line.replace(/\s*\([^)]*\)/g,'').replace(/\s*@\s*4:4:4/,'').trim()):[`${/1080p/.test(spec.condition)?'1080p':'4K/60'} 최대 ${spec.value}${spec.unit||''}`]);
      const captions=[[COLOR_IN,'입력(HDMI)'],[COLOR_COPPER,'CATx 전송'],[COLOR_IR,'IR 제어'],[COLOR_POWER,'전원'],[COLOR_OUT,'출력(HDMI)']];
      if(distances.length)captions.push([COLOR_COPPER,`CAT5e 기준 ${distances.join(' · ')}`]);
      return diagramWrap(body,width,height,captions)+`<p class="rt-pg-hint" style="text-align:center">사양서 연결도 기준입니다. PoC로 송·수신기 중 한쪽에만 전원을 연결해도 됩니다. 모듈은 TX(송신)·RX(수신)를 골라 쓸 수 있고(그림은 자주 쓰는 TX 구성), RX 사용과 SPX-RX IR 기능(IR Blaster)은 현장에서는 잘 쓰지 않습니다. IR Blaster 연결은 제조사 원본 다이어그램을 참고하세요.</p>`;
    }
    function connectionDiagram(item){
      if(item.group==='cable')return cableDiagram(item);
      if(item.group==='distribution'||item.group==='integrated')return ioFlowDiagram(item);
      if(item.id==='xdm-psu')return psuDiagram(item);
      if(item.id==='spx-r6')return rackExtenderDiagram(item);
      if(item.group==='extender')return extenderDiagram(item);
      return null;
    }

    // ---- 단자 지도(03 카드). portMap이 있으면 사진 위에 번호표를 얹고, 없으면 io 표에서 뽑은 카드만 보여준다(명세 3장) ----
    // 크기 사양(W×D×H)의 세 번째 값(높이, mm). 2U(88.9mm) 판단용. 값이 없으면 0.
    const heightMm=item=>{const spec=(item.specifications||[]).find(row=>/크기/.test(row.name));const parts=String(spec?.value||'').split(/[×x*]/);return parseFloat(parts[2])||0};
    function portMapDiagram(item){
      // portMap은 사진 한 장(객체) 또는 여러 장(배열, 전송기 송신기·수신기 등)이다(0.42). 장마다 사진·번호표·설명 카드를 차례로 그린다.
      const maps=item.portMap?(Array.isArray(item.portMap)?item.portMap:[item.portMap]):[];
      const blocks=maps.map(map=>portMapBlock(item,map)).filter(Boolean);
      return blocks.length?blocks.join(''):null;
    }
    function portMapBlock(item,map){
      const photo=(item.images||[]).find(img=>img.role===map.image&&(!map.file||img.file===map.file));
      if(!photo||!photo.resolution)return null;
      const [rw,rh]=photo.resolution.split(/[×x]/).map(Number);
      if(!rw||!rh)return null;
      // displayWidth가 있으면 그 폭(px)에 맞춰 그려서, 세로로 긴 벽부형 사진도 번호표 글씨 크기를 유지한 채 작게 보여준다(0.43).
      const X0=40,Y0=40,W=map.displayWidth?map.displayWidth-X0*2:680,s=W/rw,H=Y0*2+rh*s;
      const px=x=>X0+x*s;
      let svgBody=`<image href="${image(photo.file)}" x="${X0}" y="${Y0}" width="${W}" height="${rh*s}"/>`;
      // 위아래 두 줄로 단자가 놓인 후면(QMS-88UX 등)은 아랫줄 단자의 괄호를 사진 아래에 그린다(side:"bottom", 0.34 검수).
      // y가 있으면 사진 가장자리 대신 그 높이(원본 px)에 괄호를 붙인다. 앞면·뒷면이 위아래로 함께 찍힌 전송기 사진용(0.42).
      const YB=Y0+rh*s;
      map.items.forEach(it=>{
        // 벽부형처럼 단자가 세로로 쌓인 판넬은 사진 왼쪽·오른쪽에 세로 괄호를 그린다(side:"left"|"right", y1~y2, 0.43).
        if(it.side==='left'||it.side==='right'){
          const y1=Y0+it.y1*s,y2=Y0+it.y2*s,cy=(y1+y2)/2,dir=it.side==='left'?-1:1;
          const E=X0+(typeof it.x==='number'?it.x:(it.side==='left'?0:rw))*s;
          svgBody+=`<path d="M${E-dir*8} ${y1}H${E+dir*6}V${y2}H${E-dir*8}" fill="none" stroke="${COLOR_IN}" stroke-width="1.5"/><path d="M${E+dir*6} ${cy}H${E+dir*14}" stroke="${COLOR_IN}" stroke-width="1.5"/><circle cx="${E+dir*24}" cy="${cy}" r="10" fill="${COLOR_IN}"/><text x="${E+dir*24}" y="${cy+4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${it.n}</text>`;
          return;
        }
        const x1=px(it.x1),x2=px(it.x2),cx=(x1+x2)/2;
        if(it.side==='bottom'){
          const B=typeof it.y==='number'?Y0+it.y*s:YB;
          svgBody+=`<path d="M${x1} ${B-8}V${B+6}H${x2}V${B-8}" fill="none" stroke="${COLOR_IN}" stroke-width="1.5"/><path d="M${cx} ${B+6}V${B+14}" stroke="${COLOR_IN}" stroke-width="1.5"/><circle cx="${cx}" cy="${B+24}" r="10" fill="${COLOR_IN}"/><text x="${cx}" y="${B+28}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${it.n}</text>`;
          return;
        }
        const B=typeof it.y==='number'?Y0+it.y*s:Y0;
        svgBody+=`<path d="M${x1} ${B+8}V${B-6}H${x2}V${B+8}" fill="none" stroke="${COLOR_IN}" stroke-width="1.5"/><path d="M${cx} ${B-6}V${B-14}" stroke="${COLOR_IN}" stroke-width="1.5"/><circle cx="${cx}" cy="${B-24}" r="10" fill="${COLOR_IN}"/><text x="${cx}" y="${B-20}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${it.n}</text>`;
      });
      // 0.55(사용자 요청 "2U크기 이상 제품은 정면, 후면 버튼을 유지하고 나머지는 앞 또는 정면·포트연결 뒷면 또는 측면이 보이게"):
      // 높이 2U(88mm) 이상은 정면·후면 버튼으로 사진을 바꿔 보고, 그보다 작은 제품은 버튼 없이 정면 사진과 포트 연결면(후면·측면)을 함께 보여준다.
      const front=(item.images||[]).find(img=>img.role==='Front');
      const withFront=!map.title&&front&&map.image!=='Front'&&front.file!==photo.file;
      const tall=withFront&&heightMm(item)>=88;
      const sideLabel=map.image==='Rear'?'후면':map.image==='Perspective'?'사선':'포트 연결면';
      // 0.82(사용자 요청 2026-09-28 "색깔을 줘서 구분할 수 있게", "모든 제품을 그렇게 해줘"): 송신기·수신기 라벨을 입력·출력과 같은 색(파랑·주황)으로 구분한다.
      // startsWith가 아니라 includes인 이유: xdm-ft101-fr101처럼 "위 앞면(송신기), 아래 뒷면"같이 문장 중간에 나오는 제목도 있다(둘 다 포함된 제목은 없음, 0.82 QA 확인).
      const txRxClass=map.title?.includes('송신기')?' rt-pg-on-tx':map.title?.includes('수신기')?' rt-pg-on-rx':'';
      const seg=map.title?`<span class="rt-pg-seg"><span class="rt-pg-on${txRxClass}">${esc(map.title)}</span></span>`:tall?`<span class="rt-pg-seg" role="group" aria-label="사진 면 선택"><button type="button" data-pm-side="front" aria-pressed="false">정면</button><button type="button" class="rt-pg-on" data-pm-side="rear" aria-pressed="true">${sideLabel}</button></span>`:'';
      const frontFigure=withFront?`<figure class="rt-pg-face"${tall?' data-pm-face="front" hidden':''}>${tall?'':'<figcaption class="rt-pg-face-cap">정면</figcaption>'}<img src="${image(front.file)}" alt="${esc(front.alt||`${item.productName} 정면`)}" loading="lazy"></figure>`:'';
      const sideCap=withFront&&!tall?`<p class="rt-pg-face-cap">${sideLabel} · 포트 연결</p>`:'';
      const ports=`<div class="rt-pg-ports">${[...map.items].sort((a,b)=>a.n-b.n).map(it=>`<div class="rt-pg-port"><b><span class="rt-pg-n">${it.n}</span>${esc(it.label)}</b>${esc(it.desc)}</div>`).join('')}</div>`;
      const note=map.note?`<p class="rt-pg-hint">${esc(map.note)}</p>`:'';
      return `${seg}${tall?'':frontFigure}${sideCap}${tall?frontFigure+'<div data-pm-face="rear">':''}<div class="rt-pg-panel"><div class="rt-pg-svg-wrap"><svg viewBox="0 0 ${W+X0*2} ${H}" width="100%"${map.displayWidth?` style="display:block;max-width:${map.displayWidth}px;margin:0 auto"`:''} role="img" aria-label="${esc(map.title||'')} 단자 지도">${svgBody}</svg></div></div>${ports}${note}${tall?'</div>':''}`;
    }
    function portCards(item){
      const io=item.io||[];
      if(!io.length)return null;
      return `<div class="rt-pg-ports">${io.map((port,i)=>`<div class="rt-pg-port"><b><span class="rt-pg-n">${i+1}</span>${esc(directionLabel[port.direction]||port.direction)} · ${esc(port.signal||shortConnector(port.connector))}</b>${esc(port.quantity)}개${port.protocol?` · ${esc(port.protocol)}`:''}${port.condition?` · ${esc(port.condition)}`:''}</div>`).join('')}</div>`;
    }

    // ---- 목록 화면 ----
    // 제조사 문서 PDF(사용자 결정 2026-09-28, docs/implementation/PRODUCT_DOCUMENT_DOWNLOADS.md): documents[].file이 있는 문서만 "제품 목록" 옆에 버튼을 만든다.
    // 이름 부분("카탈로그 보기")은 팝업·새 탭에서 보기, 오른쪽("↓ 다운로드")은 바로 받기(0.192, 휴대폰은 화살표만). 파일이 없는 종류는 버튼을 숨긴다(케이블은 카탈로그만).
    const DOC_LABEL={Catalog:'카탈로그',Manual:'매뉴얼',ProductSheet:'제품 안내서'};
    const docFile=file=>`output/design/assets/docs/${encodeURIComponent(file)}`;
    const DOWNLOAD_ICON='<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 2v8m0 0L4.8 6.8M8 10l3.2-3.2M3 13h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function docButtons(item){
      const order=Object.keys(DOC_LABEL);
      return (item.documents||[]).filter(doc=>doc.file&&DOC_LABEL[doc.type]).sort((a,b)=>order.indexOf(a.type)-order.indexOf(b.type)).map(doc=>{
        // page가 있으면(전체 카탈로그 공용 파일, 0.95) 새 탭은 그 쪽에서 열고(#page=N, 아이폰 Safari는 1쪽부터 열릴 수 있음), 내려받기는 파일 전체를 받는다.
        const label=doc.label||DOC_LABEL[doc.type],pageNote=doc.page?` ${doc.page}쪽`:'',title=esc(`${doc.title||label}${pageNote}`),href=docFile(doc.file);
        // 팝업 미리보기(0.105 샘플 → 0.113 데이터로 지정): documents[].preview가 "image"면 미리 그린 쪽 그림(previewImages),
        // "pdfjs"면 PDF.js로 원본 PDF를 팝업 안에 그린다. 지정이 없으면 기존처럼 새 탭에서 연다(사용자 결정 2026-09-28 "13u 메뉴얼은 pdf.js으로 카탈로그는 이미지 방식").
        const popup=doc.preview==='image'||doc.preview==='pdfjs';
        const images=doc.preview==='image'?(doc.previewImages||[]).map(name=>image(name)).join('|'):'';
        const openEl=popup
          ?`<button type="button" class="rt-pg-doc-open" data-doc-preview="${href}" data-doc-kind="${doc.preview}"${images?` data-doc-images="${images}"`:''} data-doc-title="${title}" title="${title} · 미리보기">${esc(label)} 보기</button>`
          :`<a class="rt-pg-doc-open" href="${href}${doc.page?`#page=${doc.page}`:''}" target="_blank" rel="noopener" title="${title} · 새 탭에서 보기">${esc(label)} 보기${doc.page?` <small>${doc.page}쪽</small>`:''}</a>`;
        return `<span class="rt-pg-doc" data-doc="${esc(doc.type)}">${openEl}<a class="rt-pg-doc-save" href="${href}" download="${esc(doc.file)}" title="${title} · 다운로드(전체 파일)" aria-label="${esc(label)} 다운로드">${DOWNLOAD_ICON}<span class="rt-pg-doc-save-text">다운로드</span></a></span>`;
      }).join('');
    }
    // 제품 목록 화면의 "전체 카탈로그" 버튼(0.95): 링크 하나로 카탈로그 전체를 공유한다.
    const FULL_CATALOG={type:'Catalog',title:'알티컴 종합 카탈로그 2026 (국문 46쪽)',label:'전체 카탈로그',file:'rtcom-catalog-2026.pdf'};
    function headerBlock({icon,title,subtitle,back,diagram,cta,docs='',print=true}){
      return `<header class="rt-pg-top"><div class="rt-pg-brandmark"><div class="rt-pg-swatch">${icon}</div><div class="rt-pg-title"><h1 id="rt-pg-title">${title}</h1><p class="rt-pg-sub">${subtitle}</p></div></div>
      <div class="rt-pg-toolbar">${back?`<a class="rt-pg-btn" href="#products">← 제품 목록</a>`:''}${docs}${diagram?`<button type="button" class="rt-pg-btn" data-open-diagram>제조사 원본 다이어그램</button>`:''}${print?`<button type="button" class="rt-pg-btn" data-print>인쇄 / PDF</button>`:''}${cta||''}</div></header>`;
    }
    function listView(){
      const items=index.products.filter(matches);
      const counts=Object.fromEntries(groups.map(([id])=>[id,id==='all'?index.products.length:index.products.filter(item=>item.group===id).length]));
      return `${headerBlock({icon:GROUP_ICON.series,title:'알티컴 제품정보',subtitle:'RTCOM PRODUCTS · 매트릭스·분배기·전송기·케이블',back:false,print:false,docs:docButtons({documents:[FULL_CATALOG]})})}
      <section class="rt-pg-card"><div class="rt-pg-tools"><div class="rt-pg-seg" role="group" aria-label="제품 분류">${groups.map(([id,label])=>`<span data-product-filter="${id}" role="button" tabindex="0" aria-pressed="${filter===id}" class="${filter===id?'rt-pg-on':''}">${label} (${counts[id]})</span>`).join('')}</div><label class="rt-pg-search"><span class="rt-visually-hidden">제품 검색</span><input type="search" data-product-search placeholder="모델명·기능 검색 (예: HDMI, 광, 4K)" value="${esc(query)}"></label></div>
      <p class="rt-pg-count" role="status">${items.length}개 제품</p>
      ${items.length?`<ul class="rt-pg-grid">${items.map(item=>`<li><a class="rt-pg-gridcard" href="#products/${item.id}"><span class="rt-pg-photo">${item.cardImage?`<img src="${image(item.cardImage)}" alt="" loading="lazy">`:'<span aria-hidden="true">RTCOM</span>'}</span><span class="rt-pg-body"><span class="rt-pg-group">${esc(groupLabel[item.group])}</span><strong>${noBreak(item.productName)}</strong><span class="rt-pg-card-lead">${esc(item.lead?firstSentence(item.lead).replace(/\*\*/g,''):item.korean)}</span>${reviewBadge(item)}</span></a></li>`).join('')}</ul>`:'<p class="rt-pg-empty">조건에 맞는 제품이 없습니다. 검색어를 지우거나 다른 분류를 선택하세요.</p>'}</section>`;
    }

    // ---- 기록·원본 영역(2-6) ----
    function recordSection(item,diagramHtml,photo){
      // 입출력 단자 표는 TX 쪽 → (구분 없음) → RX 쪽 순, 각 쪽 안에서는 영상 → 오디오 → 전송 → 제어, 같은 종류는 입력 → 출력 → 양방향 순으로 정렬한다.
      const sideRank=group=>group.startsWith('TX')?0:group.startsWith('RX')?2:1;
      const typeRank=group=>{const i=['Video','Audio','Transmission','Control'].indexOf(group.replace(/^(TX|RX)\s*·\s*/,''));return i<0?4:i};
      const dirRank=direction=>({IN:0,OUT:1,BIDIR:2})[direction]??3;
      const sortedIo=[...(item.io||[])].sort((a,b)=>sideRank(a.group)-sideRank(b.group)||typeRank(a.group)-typeRank(b.group)||dirRank(a.direction)-dirRank(b.direction));
      const io=sortedIo.map(port=>[esc(port.group),esc(directionLabel[port.direction]||port.direction),esc(port.connector),esc(port.quantity),`${esc(port.signal)}${port.protocol?` · ${esc(port.protocol)}`:''}${verification(port.verification)}`,esc(port.condition)]);
      // 0.52: 사용자 요청으로 이름을 "제조사 자료"로 바꾸고, 표기 다름·참고 사항·출처는 전체 제품 공통으로 화면에서 뺐다(원본은 data/products/*.json의 issues·sources에 남는다).
      const count=io.length+(photo?1:0);
      return `<details class="rt-pg-record"${item.packageStatus==='REVIEW REQUIRED'?' open':''}><summary>제조사 자료 (${count}건)${reviewBadge(item)}</summary><div class="rt-pg-record-body">
        ${photo?`<div id="rt-pg-diagram-photo"><h4>제조사 원본 다이어그램</h4><div class="rt-pg-diagram-photo"><img src="${image(photo.file)}" alt="${esc(photo.alt||`${item.productName} 연결 다이어그램`)}" loading="lazy"></div>${photo.note?`<p class="rt-pg-diagram-caption">${esc((photo.note||'').replace(/^[A-Za-z]+ · /,''))}</p>`:''}</div>`:''}
        ${io.length?`<div><h4>입출력 단자</h4>${table(['분류','방향','단자','수량','신호','조건'],io).replace('class="rt-pg-tablewrap"','class="rt-pg-tablewrap rt-pg-io-table"')}</div>`:''}
      </div></details>`;
    }

    // ---- 화면 구성 모드(QMS 전용, 명세 6-B 7장). videoModes가 있을 때만 "05 주요 기능" 아래 전체 폭 카드로 보여준다 ----
    const VMODE_ICON={
      MATRIX:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 3l18 18M21 3L3 21"/></svg>',
      QUAD:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
      WALL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 2.4"/><circle cx="12" cy="12" r="3.2"/></svg>',
      DUAL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="8" rx="1.5"/><rect x="3" y="13" width="18" height="8" rx="1.5"/></svg>'
    };
    const VMODE_NAME_KO={MATRIX:'매트릭스',QUAD:'쿼드 뷰',WALL:'비디오 월',DUAL:'듀얼'};
    // 레이아웃 이름별 화면 분할 도해(칸 번호·x·y·너비·높이, 0~100 기준). QMS-88UX 매뉴얼(RTcom_Manual_QMS-88UX_KV.03.pdf) 20~21쪽 Layout List 도해를 그대로 옮겼다(사용자 요청 2026-09-27).
    // QMS-44UX 전용 이름의 QUAD 도해는 아래 LAYOUT_SHAPES_BY_PRODUCT(0.146, 44UX 매뉴얼 21~22쪽 도해)가 우선한다. 매뉴얼에 도해가 없는 QMS-44UX WALL(2×2~FULL, 23쪽 이름·29쪽 가로×세로 배치)과 DUAL PBP·PIP(24쪽 "2분할")는 이름 뜻에 맞춘 도식이며 QMS-44UX만 쓴다. PBP-Full·User Mode는 그림을 두지 않는다(0.156). QMS-88UX DUAL은 매뉴얼 Layout 5~7 도해를 쓴다(0.152 재검토). QMS-88UX WALL은 아래 WALL_SPECS(0.155, 매뉴얼 19쪽 월 설정)를 쓴다.
    const LAYOUT_SHAPES={
      'QUAD':[[1,0,0,50,50],[2,50,0,50,50],[3,0,50,50,50],[4,50,50,50,50]],
      '3-BOTTOM':[[1,0,0,100,50],[2,0,50,33.33,50],[3,33.33,50,33.34,50],[4,66.67,50,33.33,50]],
      // 0.147: QMS-88UX 매뉴얼 21쪽 재대조(사용자 요청 "1~3번 모두 진행") — 3-SIDE는 1번 60%·오른쪽(왼쪽) 열 40%, Quad PBP/PIP의 작은 창은 아래 끝까지, USER MODE 1은 50:50, USER MODE 2는 위 가운데 1번(절반 높이)+아래 2·3번.
      '3-SIDE RIGHT':[[1,0,0,60,100],[2,60,0,40,33.33],[3,60,33.33,40,33.34],[4,60,66.67,40,33.33]],
      '3-SIDE LEFT':[[2,0,0,40,33.33],[3,0,33.33,40,33.34],[4,0,66.67,40,33.33],[1,40,0,60,100]],
      'HORIZONTAL PBP':[[1,0,0,50,100],[2,50,0,50,100]],
      'VERTICAL PBP':[[1,0,0,100,50],[2,0,50,100,50]],
      'QUAD PBP, PIP':[[1,0,0,50,100],[2,23,58,26,42],[3,50,0,50,100],[4,74,58,26,42]],
      'SINGLE SELECT A PORT':[[1,0,0,100,100]],
      '3CH-MODE2':[[3,0,0,30,100],[1,30,0,40,50],[2,30,50,40,50],[4,70,0,30,100]],
      'USER MODE 1':[[1,0,0,50,100],[2,50,0,50,50],[3,50,50,50,50]],
      'USER MODE 2':[[1,25,0,50,50],[2,0,50,50,50],[3,50,50,50,50]],
      'DEFAULT SINGLE':[[1,0,0,100,100]],
      '2×2':[[1,0,0,50,50],[2,50,0,50,50],[3,0,50,50,50],[4,50,50,50,50]],
      '2×1':[[1,0,0,50,100],[2,50,0,50,100]],
      '1×2':[[1,0,0,100,50],[2,0,50,100,50]],
      '3×1':[[1,0,0,33.33,100],[2,33.33,0,33.34,100],[3,66.67,0,33.33,100]],
      '1×3':[[1,0,0,100,33.33],[2,0,33.33,100,33.34],[3,0,66.67,100,33.33]],
      '4×1':[[1,0,0,25,100],[2,25,0,25,100],[3,50,0,25,100],[4,75,0,25,100]],
      '1×4':[[1,0,0,100,25],[2,0,25,100,25],[3,0,50,100,25],[4,0,75,100,25]],
      'FULL':[[1,0,0,100,100]],
      'PBP':[[1,0,0,50,100],[2,50,0,50,100]],
      'PIP':[[1,0,0,100,100],[2,62,62,32,32]],
      'CASCADE1':[[1,0,0,100,100],[2,50,50,40,40]],
      '4CH-POP':[[1,0,0,50,100],[2,28,62,20,32],[3,50,0,50,100],[4,78,62,20,32]],
      '2CH-SIDE':[[1,0,0,50,100],[2,50,0,50,100]],
      '3CH-MODE1':[[1,0,0,65,100],[2,65,0,35,50],[3,65,50,35,50]],
      'USER MODE 3':[[3,0,0,30,100],[1,30,0,40,50],[2,30,50,40,50],[4,70,0,30,100]],
      // 0.66: QMS-88UX 출력 9·10번 Output Option 2·3(매뉴얼 22~23쪽) — Q1·Q2를 합쳐 비율을 유지하지 않고 그대로 8분할.
      '8분할(비율무시)':[[1,0,0,25,50],[2,25,0,25,50],[3,50,0,25,50],[4,75,0,25,50],[5,0,50,25,50],[6,25,50,25,50],[7,50,50,25,50],[8,75,50,25,50]],
      // 0.85: Output Option 5(매뉴얼 KV.04 23쪽) — 16:9 칸 8개를 4×2로 두고 위아래를 비움(Option 6은 2×4 세로 배치, 같은 16:9 비율).
      '8분할(16:9 비율)':[[1,0,25,25,25],[2,25,25,25,25],[3,50,25,25,25],[4,75,25,25,25],[5,0,50,25,25],[6,25,50,25,25],[7,50,50,25,25],[8,75,50,25,25]]
    };
    // 0.146(사용자 요청 2026-09-29 "QMS-44UX 매뉴얼에 나와 있는 분할이 다르다, 매뉴얼 읽어 보고 비교해서 찾아줘"): QMS-44UX 사용자 매뉴얼 21~22쪽 Quad Layout List 12종 도해를 그대로 옮긴 전용 도해.
    // 이름이 같아도 QMS-88UX 매뉴얼의 도해와 다른 레이아웃(3CH-MODE2·USER MODE 1·2)이 있어 제품별로 따로 둔다. 셀 끝의 [lx,ly]는 번호 글자 위치(없으면 셀 가운데), black은 매뉴얼처럼 검은 여백을 깔 레이아웃.
    const LAYOUT_SHAPES_BY_PRODUCT={'qms-44ux':{
      shapes:{
        'QUAD':[[1,0,0,50,50],[2,50,0,50,50],[3,0,50,50,50],[4,50,50,50,50]],
        '3-BOTTOM':[[1,25,0,50,50],[2,0,50,33.33,50],[3,33.33,50,33.34,50],[4,66.67,50,33.33,50]],
        '3-SIDE RIGHT':[[1,0,25,60,48.3],[2,60,0,40,33.33],[3,60,33.33,40,33.34],[4,60,66.67,40,33.33]],
        '3-SIDE LEFT':[[2,0,0,40,33.33],[3,0,33.33,40,33.34],[4,0,66.67,40,33.33],[1,40,25,60,48.3]],
        'CASCADE1':[[1,0,0,100,100,6,8],[2,21.6,24.2,33.7,33.3,29,52],[3,40.2,39.4,33.7,33.3,47,67],[4,58.8,54.5,33.7,33.3,66,82]],
        '4CH-POP':[[1,0,0,100,100,3.5,6],[2,7.4,9,86.3,80.9,10.5,15],[3,13.5,19.5,74.2,60.7,16.5,25],[4,18.6,28.1,64.3,45.3,22,34]],
        '2CH-SIDE':[[3,0,0,29,100],[1,29,0,42,50],[2,29,50,42,50],[4,71,0,29,100]],
        '3CH-MODE1':[[1,0,0,50,100],[2,50,0,50,50],[3,50,50,50,50]],
        '3CH-MODE2':[[1,25,0,50,50],[2,0,50,50,50],[3,50,50,50,50]],
        'USER MODE 1':[[1,0,0,25,25],[2,25,25,25,25],[3,50,50,25,25],[4,75,75,25,25]],
        'USER MODE 2':[[1,0,25,25,50],[2,25,25,25,50],[3,50,25,25,50],[4,75,25,25,50]],
        'USER MODE 3':[[1,20,0,60,25],[2,20,25,60,25],[3,20,50,60,25],[4,20,75,60,25]]
      },
      black:new Set(['3-BOTTOM','3-SIDE RIGHT','3-SIDE LEFT','3CH-MODE2','USER MODE 1','USER MODE 2','USER MODE 3']),
      // 0.156(사용자 결정 2026-09-29 "메뉴얼 기준으로 해줘"): DUAL의 PBP-Full·User Mode는 매뉴얼 24쪽에 이름만 있고 배치 설명이 없다.
      // 이전에는 PBP와 같은 그림·창 3개 그림(24쪽 "2분할"과 어긋남)을 이름만 보고 그렸으므로, 그림 대신 "매뉴얼에 배치 그림 없음"을 보여 준다.
      noDrawing:new Set(['PBP-FULL','USER MODE'])
    }};
    // 0.155(사용자 요청 2026-09-29 "QMS-44 비디오월 기능을 88에도 동일한 컨셉으로 만들어줘", "메뉴얼 읽어보고 작업해줘"): QMS-88UX 매뉴얼 KV.04 19쪽 6) Wall Mode.
    // Wall 1·Wall 2를 각각 가로(H)×세로(V)와 시작(Start)·끝(End) 출력 포트로 정한다. 2×2 월은 2개까지, 월 1개면 최대 3×3 또는 2×5(매뉴얼 H×V 표기 그대로 가로 2 × 세로 5).
    // 출력 9·10번(M1·M2)은 평소 멀티뷰 포트지만 Wall 모드로 설정하면 월에 넣을 수 있다. 값: [[가로, 세로, 시작 출력 번호], …].
    const WALL_SPECS={'qms-88ux':{
      '2×2':[[2,2,1]],
      '2×2 + 2×2':[[2,2,1],[2,2,5]],
      '3×3':[[3,3,1]],
      '2×5':[[2,5,1]]
    }};
    // 0.147(사용자 요청 2026-09-29 "44,88모두 분할 부분구성 예시를 그래픽작업해달라는거야"): 흰 칸 도식 대신 실제 화면처럼 그린다.
    // 한 화면 분할(MATRIX·QUAD·DUAL 등)은 모니터(검은 베젤·스탠드) 안에 입력마다 다른 색 화면을 칸대로 채우고,
    // 비디오 월(WALL)은 디스플레이 여러 대를 붙이고 영상 한 장(하늘·산 그림)이 베젤을 건너 이어지게 그린다. 칸 배치(LAYOUT_SHAPES)는 그대로라 매뉴얼 도해와 같다.
    // 칸 사각형에만 rt-pg-cell 클래스를 붙인다(e2e가 칸 수를 센다). 화면 바탕은 검정이라, 칸이 덮지 않은 곳은 매뉴얼처럼 검은 여백으로 보인다.
    const LAYOUT_COLORS=['#2f7cf6','#f08c1a','#1fb45a','#9b51e0','#e5484d','#12a594','#e0409b','#5b5bd6'];
    let layoutSvgSeq=0;
    function layoutShapeSvg(name,productId,modeName){
      const own=LAYOUT_SHAPES_BY_PRODUCT[productId];
      const key=String(name||'').trim().toUpperCase();
      if(own?.noDrawing?.has(key))return '<div class="rt-pg-layout-missing" data-layout-nodrawing>매뉴얼에 배치 그림 없음</div>';
      const cells=own?.shapes[key]||LAYOUT_SHAPES[key]||(modeName==='WALL'&&WALL_SPECS[productId]?.[key]?[[1,0,0,100,100]]:null);
      if(!cells)return '<div class="rt-pg-layout-missing">도해 준비 중</div>';
      const id=`lay${++layoutSvgSeq}`;
      const label=`aria-label="${esc(name)} 화면 구성"`;
      if(modeName==='WALL'){
        // 디스플레이 한 대 = 16:9 칸(64×36) + 베젤 3, 대 사이 틈 2. 월 하나는 [가로 대수, 세로 대수, 시작 출력 번호]다.
        // QMS-44UX는 칸 배치(LAYOUT_SHAPES)의 첫 칸 폭·높이로 가로·세로 대수를 센다(2×2 → 2열 2행). QMS-88UX는 WALL_SPECS(월 2개까지)를 쓴다.
        const walls=WALL_SPECS[productId]?.[key]||[[Math.max(1,Math.round(100/cells[0][3])),Math.max(1,Math.round(100/cells[0][4])),1]];
        const DW=64,DH=36,BZ=3,GAP=2,PAD=4,WGAP=14;
        const sizeOf=([cols,rows])=>[cols*(DW+BZ*2)+(cols-1)*GAP,rows*(DH+BZ*2)+(rows-1)*GAP];
        const W=PAD*2+walls.reduce((sum,wall)=>sum+sizeOf(wall)[0],0)+(walls.length-1)*WGAP,H=PAD*2+Math.max(...walls.map(wall=>sizeOf(wall)[1]));
        let body='',ox=PAD;
        walls.forEach(([cols,rows,first],wi)=>{
          const [ww,wh]=sizeOf([cols,rows]),oy=PAD+(H-PAD*2-wh)/2;
          let screens='',frames='',badges='';
          for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
            const fx=ox+c*(DW+BZ*2+GAP),fy=oy+r*(DH+BZ*2+GAP),n=first+r*cols+c;
            frames+=`<rect x="${fx}" y="${fy}" width="${DW+BZ*2}" height="${DH+BZ*2}" rx="2.5" fill="#1f2532"/>`;
            screens+=`<rect class="rt-pg-cell" x="${fx+BZ}" y="${fy+BZ}" width="${DW}" height="${DH}"/>`;
            badges+=`<circle cx="${fx+BZ+7}" cy="${fy+BZ+7}" r="5.2" fill="#fff" fill-opacity=".92"/><text x="${fx+BZ+7}" y="${fy+BZ+7.2}" font-size="7" font-weight="800" fill="#1f2532" text-anchor="middle" dominant-baseline="central">${n}</text>`;
          }
          const x0=ox+BZ,y0=oy+BZ,x1=ox+ww-BZ,y1=oy+wh-BZ,iw=x1-x0,ih=y1-y0;
          // 0.155 위 줄(1·2번 화면)에도 산이 보이도록 뒤쪽 산줄기(봉우리)를 더하고 앞 언덕은 조금 낮췄다.
          const ridgePts=[[0,0.62],[0.16,0.27],[0.30,0.5],[0.47,0.16],[0.64,0.5],[0.81,0.3],[1,0.54]];
          const ridge=`M${ridgePts.map(([a,b])=>`${(x0+iw*a).toFixed(1)} ${(y0+ih*b).toFixed(1)}`).join('L')}V${y1}H${x0}Z`;
          const hill=`M${x0} ${y0+ih*0.84}C${x0+iw*0.18} ${y0+ih*0.6},${x0+iw*0.32} ${y0+ih*0.68},${x0+iw*0.46} ${y0+ih*0.58}S${x0+iw*0.78} ${y0+ih*0.7},${x1} ${y0+ih*0.6}V${y1}H${x0}Z`;
          const hill2=`M${x0} ${y0+ih*0.9}C${x0+iw*0.3} ${y0+ih*0.7},${x0+iw*0.55} ${y0+ih*0.86},${x0+iw*0.75} ${y0+ih*0.72}S${x1-iw*0.05} ${y0+ih*0.8},${x1} ${y0+ih*0.76}V${y1}H${x0}Z`;
          // 월이 둘이면 두 번째 월은 다른 영상(노을)으로 칠해 서로 다른 소스임을 보인다.
          const sky=wi?['#ff9a62','#ffe0b8']:['#5aa9ff','#cfe6ff'],land=wi?['#8a5a3c','#5c3a24']:['#34a853','#1e7a3c'],far=wi?'#c98a62':'#5f86c9';
          body+=`<defs><linearGradient id="${id}s${wi}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><clipPath id="${id}c${wi}">${screens.replace(/ class="rt-pg-cell"/g,'')}</clipPath></defs>${frames}${screens.replace(/<rect class="rt-pg-cell"/g,'<rect class="rt-pg-cell" fill="#0b0d12"')}<g clip-path="url(#${id}c${wi})"><rect x="${x0}" y="${y0}" width="${iw}" height="${ih}" fill="url(#${id}s${wi})"/><circle cx="${x0+iw*0.76}" cy="${y0+ih*0.13}" r="${Math.min(iw,ih)*0.08}" fill="#ffd66b"/><path d="${ridge}" fill="${far}"/><path d="${hill}" fill="${land[0]}"/><path d="${hill2}" fill="${land[1]}"/></g>${badges}`;
          ox+=ww+WGAP;
        });
        return `<svg class="rt-pg-layout-wall" viewBox="0 0 ${W} ${H}" role="img" ${label}>${body}</svg>`;
      }
      // 한 화면 분할: 모니터 200×134(베젤 6, 화면 188×106 ≈ 16:9, 스탠드). 칸 좌표 0~100을 화면 크기로 늘린다.
      const SX=6,SY=6,SW=188,SH=106,mx=v=>SX+v*SW/100,my=v=>SY+v*SH/100;
      // 검은 여백 판정은 0.85·0.146·0.147 규칙 그대로(칸이 가장자리를 다 채우지 못하거나 매뉴얼에 검은 여백이 있는 레이아웃). 화면 바탕 사각형에 표시 클래스를 붙인다.
      const minX=Math.min(...cells.map(c=>c[1])),minY=Math.min(...cells.map(c=>c[2]));
      const maxX=Math.max(...cells.map(c=>c[1]+c[3])),maxY=Math.max(...cells.map(c=>c[2]+c[4]));
      const letterbox=minX>0.5||minY>0.5||maxX<99.5||maxY<99.5||(own?.shapes[key]?own.black.has(key):key==='USER MODE 2');
      const used=[...new Set(cells.map(c=>c[0]))];
      const grads=used.map(n=>{const col=LAYOUT_COLORS[(n-1)%LAYOUT_COLORS.length];return `<linearGradient id="${id}g${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity=".62"/></linearGradient>`}).join('');
      const tiles=cells.map(([n,x,y,w,h,lx,ly])=>{
        const X=mx(x),Y=my(y),Wd=w*SW/100,Hd=h*SH/100,fs=Math.max(7,Math.min(20,Math.min(Wd,Hd)*0.42));
        const tx=lx!=null?mx(lx):X+Wd/2,ty=ly!=null?my(ly):Y+Hd/2;
        const hill=Hd>18&&Wd>24?`<path d="M${X} ${Y+Hd}V${Y+Hd*0.8}Q${X+Wd*0.3} ${Y+Hd*0.62} ${X+Wd*0.55} ${Y+Hd*0.78}T${X+Wd} ${Y+Hd*0.72}V${Y+Hd}Z" fill="#fff" fill-opacity=".16"/>`:'';
        return `<g><rect class="rt-pg-cell" data-w="${w}" data-h="${h}" x="${X}" y="${Y}" width="${Wd}" height="${Hd}" fill="url(#${id}g${n})" stroke="#fff" stroke-opacity=".7" stroke-width=".9"/>${hill}<text x="${tx}" y="${ty}" font-size="${fs.toFixed(1)}" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central" style="paint-order:stroke;stroke:rgba(0,0,0,.28);stroke-width:1.6px">${n}</text></g>`;
      }).join('');
      return `<svg viewBox="0 0 200 134" role="img" ${label}><defs>${grads}<clipPath id="${id}c"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}"/></clipPath></defs><rect x="1" y="1" width="198" height="118" rx="6" fill="#1f2532"/><rect${letterbox?' class="rt-pg-layout-letterbox"':''} x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#0b0d12"/><g clip-path="url(#${id}c)">${tiles}</g><circle cx="100" cy="115.5" r="1.3" fill="#5b6475"/><path d="M92 119h16l3 9H89z" fill="#3a4150"/><rect x="72" y="127.5" width="56" height="5" rx="2.5" fill="#3a4150"/></svg>`;
    }
    // 0.159(사용자 요청 2026-09-29 "매트릭스쪽 비슷한 컨셉으로 하나 만들자", "1TO1, ALL, 임의스위칭 이거는 빼고 그냥 크로스포인트 이미지만"):
    // MATRIX 카드에 칩 없이 크로스포인트 그림 한 장을 둔다. 왼쪽 입력(IN n)에서 오른쪽 출력 모니터(OUT n)로 입력 색 선을 잇는다(색은 LAYOUT_COLORS, QUAD·DUAL과 같다).
    // 값은 출력 1번부터 차례로 "들어오는 입력 번호" 예시다. QMS-88UX 출력 9·10번은 멀티뷰 전용이라 매트릭스 그림에서 뺀다.
    const MATRIX_ROUTES={'qms-44ux':[3,1,3,4],'qms-88ux':[2,7,2,5,1,8,3,3]};
    function matrixCrosspointSvg(productId){
      const route=MATRIX_ROUTES[productId];
      if(!route)return '';
      const N=route.length,big=N>4,gy=big?30:44,W=380,H=N*gy+8;
      const iy=i=>6+i*gy,mw=big?40:48,mh=big?22:27,mx=270;
      const col=n=>LAYOUT_COLORS[(n-1)%LAYOUT_COLORS.length];
      let lines='',ins='',outs='';
      route.forEach((inp,o)=>{const y1=iy(inp-1)+14,y2=iy(o)+3+mh/2;lines+=`<path d="M58 ${y1}C140 ${y1},190 ${y2},${mx} ${y2}" stroke="${col(inp)}" stroke-width="2.4" fill="none" opacity=".92"/>`});
      for(let i=0;i<N;i++){const y=iy(i);ins+=`<rect x="12" y="${y}" width="46" height="28" rx="4" fill="${col(i+1)}"/><rect x="15" y="${y+3}" width="40" height="18" rx="2" fill="#fff" fill-opacity=".25"/><text x="35" y="${y+14}" font-size="11" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">IN ${i+1}</text>`}
      route.forEach((inp,o)=>{const x=mx,y=iy(o);outs+=`<rect x="${x}" y="${y}" width="${mw+6}" height="${mh+6}" rx="3" fill="#1f2532"/><rect class="rt-pg-cell" x="${x+3}" y="${y+3}" width="${mw}" height="${mh}" fill="${col(inp)}"/><path d="M${x+3} ${y+3+mh}V${y+3+mh*0.75}Q${x+3+mw*0.3} ${y+3+mh*0.55} ${x+3+mw*0.55} ${y+3+mh*0.72}T${x+3+mw} ${y+3+mh*0.66}V${y+3+mh}Z" fill="#fff" fill-opacity=".18"/><text x="${x+3+mw/2}" y="${y+3+mh/2}" font-size="${big?10:12}" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${inp}</text><text x="${x+mw+14}" y="${y+3+mh/2}" font-size="10" font-weight="800" fill="#6b7280" dominant-baseline="central">OUT ${o+1}</text>`});
      return `<div class="rt-pg-layout-preview rt-pg-matrix-preview"><svg class="rt-pg-layout-matrix" viewBox="0 0 ${W} ${H}" role="img" aria-label="입력 ${N} → 출력 ${N} 크로스포인트 예시">${lines}${ins}${outs}</svg></div>`;
    }
    function videoModesSection(item){
      const vm=item.videoModes;
      if(!vm||!vm.modes?.length)return '';
      const modes=vm.modes;
      const tileIcons=['MATRIX','DUAL','QUAD','WALL'].filter(name=>modes.some(mode=>mode.name===name));
      return `<section class="rt-pg-card" style="margin-top:18px"><h2><span class="rt-pg-idx">06</span>화면 구성 모드</h2>
        <div class="rt-pg-vmode">
          <div class="rt-pg-vmode-tile"><b>Video Mode</b><div class="rt-pg-vmode-icons">${tileIcons.map(name=>`<div>${VMODE_ICON[name]}<span>${name}</span></div>`).join('')}</div><small>다양한 화면구성</small></div>
          <div class="rt-pg-vmode-cards">${modes.map(mode=>`<div class="rt-pg-vmode-card">
            <div class="rt-pg-vmode-card-head">${VMODE_ICON[mode.name]||''}<div><b>${esc(VMODE_NAME_KO[mode.name]||mode.name)}</b><small>${esc(mode.name)}</small></div></div>
            <p>${esc(mode.summary)}${mode.detail?` ${esc(mode.detail)}`:''}</p>
            ${mode.layouts?.length?`<span class="rt-pg-vmode-count">레이아웃 ${mode.layouts.length}종</span><div class="rt-pg-vmode-chips">${mode.layouts.map((layout,index)=>`<button type="button" class="rt-pg-layout-chip${index===0?' on':''}" data-layout-chip data-layout="${esc(layout)}">${esc(layout)}</button>`).join('')}</div><div class="rt-pg-layout-preview" data-layout-preview data-layout-product="${esc(item.id)}" data-layout-mode="${esc(mode.name)}">${layoutShapeSvg(mode.layouts[0],item.id,mode.name)}<small data-layout-name>${esc(mode.layouts[0])}</small></div>`:''}${mode.name==='MATRIX'&&!mode.layouts?.length?matrixCrosspointSvg(item.id):''}
          </div>`).join('')}</div>
        </div>
      </section>`;
    }

    // ---- 전면 컨트롤 강조(EDID 로터리 스위치 등, 0.35). edidSwitch가 있을 때만 전체 폭 카드로 보여준다 ----
    // ---- EDID 로터리 대표 설정 그림(0.59, 사용자 요청 "EDID 로터리 스위치도 대표적인 것을 DIP 스위치처럼 예상 이미지 만들어봐줘") ----
    // 제품 사진과 같은 파란 16단(0~F) 로터리를 그리고, 화살표가 고른 코드를 가리키게 한다. 0이 위쪽이고 시계 방향으로 1, 2 … F 순서다.
    // opts.name: 화면 읽기 이름(기본 "EDID 로터리", 오디오 설정은 "MODE 로터리").
    function rotaryGraphic(code,opts={}){
      const idx=parseInt(code,16);
      const S=112,c=S/2,labels='0123456789ABCDEF'.split('');
      const at=(i,r)=>{const a=(i*22.5-90)*Math.PI/180;return [c+r*Math.cos(a),c+r*Math.sin(a)]};
      let body=`<circle cx="${c}" cy="${c}" r="34" fill="#1E7BE6"/><circle cx="${c}" cy="${c}" r="34" fill="none" stroke="#0B4FA8" stroke-width="2"/>`;
      for(let i=0;i<16;i++){const [x1,y1]=at(i,30),[x2,y2]=at(i,34);body+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#0B4FA8" stroke-width="1.4"/>`;}
      body+=`<circle cx="${c}" cy="${c}" r="20" fill="#E9F2FF" stroke="#0B4FA8" stroke-width="1.5"/>`;
      const deg=idx*22.5;
      body+=`<g transform="rotate(${deg} ${c} ${c})"><rect x="${c-3}" y="${c-16}" width="6" height="32" rx="2" fill="#1C1C1E"/><path d="M${c} ${c-27}l-6 9h12z" fill="#1C1C1E"/></g>`;
      labels.forEach((label,i)=>{const [x,y]=at(i,47);const on=i===idx;body+=on?`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#007AFF"/><text x="${x.toFixed(1)}" y="${(y+3.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${label}</text>`:`<text x="${x.toFixed(1)}" y="${(y+3.2).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="600" fill="#8A8A8E">${label}</text>`;});
      return `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-label="${esc(opts.name||'EDID 로터리')} ${esc(code)}번">${body}</svg>`;
    }
    // 대표 설정: 기본값 코드(edidSwitch.default의 "0 = …" 앞 글자)와 자주 쓰는 코드(table[].highlight)를 코드 순으로 최대 4개 보여준다.
    // examples "all": 표의 모든 코드를 그림으로 보여주고, table[].group이 있으면 묶음마다 제목을 붙여 한 줄씩 둔다(XDM-FT101: Source 0~3 / Analog 8~11, 사용자 요청 2026-09-27).
    function edidExamples(es){
      const def=(String(es.default||'').match(/^\s*([0-9A-F])\s*=/i)||[])[1]?.toUpperCase();
      const tile=row=>{const code=String(row.code).toUpperCase(),isDef=code===def;return `<figure class="rt-pg-rotary${isDef?' is-default':''}">${rotaryGraphic(code,es.rotaryName?{name:es.rotaryName}:{})}<figcaption><em>${esc(row.code)}번${isDef?' · 기본값':''}</em>${esc(row.caption||row.function)}</figcaption></figure>`};
      if(es.examples==='all'){
        const groups=[];for(const row of es.table){const g=row.group||'';let last=groups[groups.length-1];if(!last||last.name!==g){last={name:g,rows:[]};groups.push(last)}last.rows.push(row)}
        return groups.map(g=>`${g.name?`<p class="rt-pg-rotary-group">${esc(g.name)}</p>`:''}<div class="rt-pg-rotary-row rt-pg-rotary-all" aria-label="${esc(g.name||'로터리 설정')}">${g.rows.map(tile).join('')}</div>`).join('');
      }
      const picks=es.table.filter(row=>row.highlight||String(row.code).toUpperCase()===def).slice(0,4);
      if(!picks.length)return '';
      return `<div class="rt-pg-rotary-row" aria-label="EDID 로터리 대표 설정">${picks.map(tile).join('')}</div>`;
    }

    function edidSwitchSection(item){
      const es=item.edidSwitch;
      if(!es||!es.table?.length)return '';
      const photo=(item.images||[]).find(img=>img.role===es.image);
      if(!photo||!photo.resolution)return '';
      const [rw,rh]=photo.resolution.split(/[×x]/).map(Number);
      if(!rw||!rh)return '';
      const pct=(value,base)=>`${(value/base*100).toFixed(2)}%`;
      const stepsHtml=(es.steps||[]).map(step=>`<div class="rt-pg-edid-step"><b>${esc(step.title)}</b><ol>${step.items.map(text=>`<li>${esc(text)}</li>`).join('')}</ol></div>`).join('');
      // 코드표가 길면(0.58, HD-13U 등 16행) 세로로 길어져 카드가 너무 커지므로 반으로 나눠 좌우 두 표로 펼친다(사용자 요청 2026-09-27 "좌우표를 펼쳐서 줄여줘").
      const codeRows=es.table.map(row=>row.highlight?[`<b>${esc(row.code)}</b>`,`<b>${esc(row.function)}</b>`]:[esc(row.code),esc(row.function)]);
      const codeTableHtml=codeRows.length>6?(()=>{const half=Math.ceil(codeRows.length/2);return `<div class="rt-pg-edid-tables">${table(['코드','기능'],codeRows.slice(0,half))}${table(['코드','기능'],codeRows.slice(half))}</div>`})():table(['코드','기능'],codeRows);
      return `<section class="rt-pg-card" style="margin-top:18px"><h2><span class="rt-pg-idx">${item.videoModes?'07':'06'}</span>EDID 설정</h2>
        <div class="rt-pg-edid">
          <div class="rt-pg-edid-photo">
            <img src="${image(photo.file)}" alt="${esc(photo.alt||item.productName)}" loading="lazy">
            <span class="rt-pg-edid-ring" style="left:${pct(es.x1,rw)};top:${pct(es.y1,rh)};width:${pct(es.x2-es.x1,rw)};height:${pct(es.y2-es.y1,rh)}"></span>
            <span class="rt-pg-edid-tag" style="left:${pct((es.x1+es.x2)/2,rw)};top:${pct(es.y1,rh)}">${esc(es.label)}</span>
          </div>
          <div class="rt-pg-edid-body">
            ${es.desc?`<p class="rt-pg-edid-desc">${esc(es.desc)}</p>`:''}
            ${es.default?`<p class="rt-pg-hint"><span class="rt-pg-pill">기본값 — ${esc(es.default)}</span></p>`:''}
            ${edidExamples(es)}
            ${stepsHtml?`<div class="rt-pg-edid-steps">${stepsHtml}</div>`:''}
            ${codeTableHtml}
          </div>
        </div>
      </section>`;
    }

    // ---- 딥 스위치 설정(0.58, 사용자 요청 "딥스위치를 만들어서 설정값을 설명하면 어때?") ----
    // 스위치 번호마다 OFF·ON 두 그림을 나란히 그린다. 설명하는 스위치만 또렷하게, 나머지는 흐리게 그린다. 위쪽이 ON(dipSwitch.onUp).
    // HDS-21U·HDS-42MU는 오디오 병합·추출도 딥 스위치 1번으로 고르므로 07 오디오 설정 카드를 이 카드로 바꿨다.
    // target: 설명하는 스위치 번호(on이 그 상태) 또는 {번호:true/false} 묶음(EDID처럼 두 스위치 조합을 그릴 때, SPX-TX 3·4번).
    // color: "black"이면 검은 몸체(OBUX-1C Tx), 없으면 빨간 몸체(HDS·HD-210U·SPX-TX).
    function dipGraphic(count,target,on,onUp,color){
      const black=color==='black',bodyFill=black?'#2C2C2E':'#D7302B',slotOn=black?'#0B0B0C':'#6E1411',slotOff=black?'#636366':'#B9534F';
      const states=typeof target==='object'?target:{[target]:on};
      const sw=20,gap=8,x0=34,y0=10,h=44,W=x0+count*(sw+gap)+4,H=y0+h+22;
      let body=`<rect x="${x0-8}" y="${y0-6}" width="${count*(sw+gap)+8}" height="${h+12}" rx="4" fill="${bodyFill}"/>`;
      // 위쪽이 ON이면 "ON"을 위에 두고 화살표가 위를, 아래쪽이 ON(SPX-TX)이면 "ON"을 아래에 두고 화살표가 아래를 가리킨다.
      body+=onUp?`<text x="4" y="${y0+12}" font-size="11" font-weight="800" fill="#1c1c1e">ON</text><path d="M14 ${y0+h-2}V${y0+18}M10 ${y0+22}l4-5 4 5" fill="none" stroke="#1c1c1e" stroke-width="1.6"/>`:`<text x="4" y="${y0+h}" font-size="11" font-weight="800" fill="#1c1c1e">ON</text><path d="M14 ${y0+2}V${y0+h-18}M10 ${y0+h-22}l4 5 4-5" fill="none" stroke="#1c1c1e" stroke-width="1.6"/>`;
      for(let i=1;i<=count;i++){
        const x=x0+(i-1)*(sw+gap),active=i in states,up=onUp?states[i]:!states[i];
        body+=`<rect x="${x}" y="${y0}" width="${sw}" height="${h}" rx="2" fill="${active?slotOn:slotOff}"/>`;
        if(active)body+=`<rect x="${x+2}" y="${up?y0+2:y0+h-20}" width="${sw-4}" height="18" rx="2" fill="#fff" stroke="#007AFF" stroke-width="2"/>`;
        body+=`<text x="${x+sw/2}" y="${y0+h+17}" text-anchor="middle" font-size="12" font-weight="${active?800:600}" fill="${active?'#1c1c1e':'#a1a1a6'}">${i}</text>`;
      }
      return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="딥 스위치 ${Object.entries(states).map(([n,v])=>`${n}번 ${v?'ON':'OFF'}`).join(' · ')}">${body}</svg>`;
    }
    // dipSwitch.order: ["on","off"]이면 ON 칸을 왼쪽에 둔다(HDS-21U·HDS-42MU, 사용자 요청 2026-09-27 "딥스위치 값 서로 좌우 위치 변경해줘"). 없으면 OFF → ON.
    function dipSwitchSection(item){
      const ds=item.dipSwitch;
      if(!ds||!ds.rows?.length)return '';
      const idx=String(6+(item.videoModes?1:0)+(item.edidSwitch?.table?.length?1:0)+(item.audioMux?.modes?.length?1:0)).padStart(2,'0');
      const state=(label,on,st,n)=>`<figure class="rt-pg-dip-state${on?' is-on':''}">${dipGraphic(ds.count,n,on,ds.onUp!==false,ds.color)}<figcaption><em>${label}${st.name?` · ${esc(st.name)}`:''}</em>${esc(st.text)}</figcaption></figure>`;
      // combos: 두 개 이상 스위치를 함께 바꿔 고르는 설정(SPX-TX 3·4번 EDID). 조합마다 그림 하나와 이름·설명을 한 칸에 둔다.
      const combos=(ds.combos||[]).map(cb=>[Math.min(...cb.switches),`<div class="rt-pg-dip-row"><div class="rt-pg-dip-head"><b>${cb.switches.join('·')}번</b><span>${esc(cb.title)}</span></div><div class="rt-pg-dip-combos">${cb.items.map(it=>`<figure class="rt-pg-dip-state${it.default?' is-on':''}">${dipGraphic(ds.count,Object.fromEntries(cb.switches.map((n,i)=>[n,it.set[i]==='on'])),null,ds.onUp!==false,ds.color)}<figcaption><em>${cb.switches.map((n,i)=>`${n} ${it.set[i].toUpperCase()}`).join(' · ')}${it.default?' · 기본값':''}</em><b>${esc(it.name)}</b> ${esc(it.text)}</figcaption></figure>`).join('')}</div></div>`]);
      const rows=ds.rows.map(row=>[row.n,`<div class="rt-pg-dip-row"><div class="rt-pg-dip-head"><b>${row.n}번</b><span>${esc(row.title)}</span></div><div class="rt-pg-dip-states">${(ds.order?.[0]==='on'?[['ON',true,row.on],['OFF',false,row.off]]:[['OFF',false,row.off],['ON',true,row.on]]).map(([label,on,st])=>state(label,on,st,row.n)).join('')}</div>${row.note?`<p class="rt-pg-dip-note">${esc(row.note)}</p>`:''}</div>`]);
      // 0.65 번호 한 개 행과 여러 번호 조합을 가장 작은 스위치 번호 순으로 섞어 둔다(XDM-CTR100: 1·2번 TX/RX → 3번 전송 거리).
      const sorted=[...rows,...combos].sort((x,y)=>x[0]-y[0]).map(entry=>entry[1]).join('');
      return `<section class="rt-pg-card rt-pg-dip" style="margin-top:18px"><h2><span class="rt-pg-idx">${idx}</span>딥 스위치 설정 <span class="rt-pg-note">— ${esc(ds.place||'전면')} ${esc(ds.label||'딥 스위치')} · ${ds.onUp!==false?'위쪽':'아래쪽'}이 ON</span></h2><div class="rt-pg-dip-rows">${sorted}</div>${ds.apply?`<p class="rt-pg-hint">※ ${esc(ds.apply)}</p>`:''}${ds.note?`<p class="rt-pg-hint">※ ${esc(ds.note)}</p>`:''}</section>`;
    }
    // ---- 오디오 설정(병합 MUX·추출 DEMUX 중 선택, HD-13U). 매뉴얼 문장을 "이럴 때·연결·소리가 나오는 곳·확인 방법"으로 풀어 두 칸으로 보여준다 ----
    // HDS-21U·HDS-42MU는 딥 스위치 1번으로 고르므로 이 카드 대신 딥 스위치 설정 카드에서 함께 설명한다(사용자 요청 2026-09-27).
    // ---- 오디오 설정 순서 그림(0.61, 사용자 요청 "DIP 이미지처럼 불 켜짐", "분배기 로터리 이미지 그대로 활용해줘, 통일감이 없어") ----
    // EDID 설정 카드의 대표 설정 줄(rt-pg-rotary-row·rt-pg-rotary 칸, 112px 그림, 파란 글자 캡션)을 그대로 쓴다.
    // ① MODE 로터리를 panel.rotary.value에 맞춤 → ② SET 누름 → ③④ 모드별 확인 LED(panel.target)가 깜빡임(led "blink") / 깜빡이지 않음("steady").
    // 깜빡임은 CSS 애니메이션(rt-pg-led-blink)으로 보여주고, 움직임 줄이기 설정이나 인쇄에서도 알 수 있게 LED 둘레에 빛 표시를 함께 그린다.
    function setButtonGraphic(label){
      const S=112,c=S/2;
      const body=`<circle cx="${c}" cy="${c-4}" r="30" fill="#1C1C1E"/><circle cx="${c}" cy="${c-4}" r="15" fill="#48484A" stroke="#8E8E93" stroke-width="1.5"/><circle cx="${c}" cy="${c-4}" r="21" fill="none" stroke="#007AFF" stroke-width="3"/><path d="M${c} ${c-50}v12M${c-6} ${c-44}l6 6 6-6" fill="none" stroke="#007AFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><text x="${c}" y="${c+42}" text-anchor="middle" font-size="11" font-weight="800" fill="#1C1C1E">${esc(label)}</text>`;
      return `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-label="${esc(label)} 버튼 누름">${body}</svg>`;
    }
    function ledGraphic(label,blink){
      const S=112,c=S/2,cy=c-4;
      let body=`<circle cx="${c}" cy="${cy}" r="30" fill="#1C1C1E"/><circle cx="${c}" cy="${cy}" r="18" fill="#34C759" opacity=".25"/>`;
      if(blink)body+=`<g stroke="#34C759" stroke-width="2.2" stroke-linecap="round">${[0,45,90,135,180,225,270,315].map(a=>{const r1=14,r2=22,rad=a*Math.PI/180;return `<path d="M${(c+r1*Math.cos(rad)).toFixed(1)} ${(cy+r1*Math.sin(rad)).toFixed(1)}L${(c+r2*Math.cos(rad)).toFixed(1)} ${(cy+r2*Math.sin(rad)).toFixed(1)}"/>`}).join('')}</g>`;
      body+=`<circle cx="${c}" cy="${cy}" r="8" fill="#34C759"${blink?' class="rt-pg-led-blink"':''}/><text x="${c}" y="${c+42}" text-anchor="middle" font-size="11" font-weight="800" fill="#1C1C1E">${esc(label)}</text>`;
      return `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-label="${esc(label)} LED ${blink?'깜빡임':'깜빡이지 않음'}">${body}</svg>`;
    }
    function audioStepsRow(am){
      const pn=am.panel;
      if(!pn)return '';
      const value=String(pn.rotary?.value??'0').toUpperCase(),rlabel=pn.rotary?.label||'MODE';
      const tiles=[`<figure class="rt-pg-rotary">${rotaryGraphic(value,{name:`${rlabel} 로터리`})}<figcaption><em>① ${esc(value)}번</em>${esc(rlabel)} 로터리를 ${esc(value)}에 맞춤</figcaption></figure>`,
        `<figure class="rt-pg-rotary">${setButtonGraphic(pn.button||'SET')}<figcaption><em>② ${esc(pn.button||'SET')} 누름</em>누를 때마다 병합 ↔ 추출</figcaption></figure>`,
        ...am.modes.filter(mode=>mode.led).map(mode=>`<figure class="rt-pg-rotary rt-pg-audio-step-${mode.led}">${ledGraphic(pn.target,mode.led==='blink')}<figcaption><em>${esc(mode.title)}</em>${esc(pn.target)} LED ${mode.led==='blink'?'깜빡임':'깜빡이지 않음'}</figcaption></figure>`)];
      return `<div class="rt-pg-rotary-row rt-pg-audio-steps" aria-label="오디오 병합·추출 전환 순서">${tiles.join('')}</div>`;
    }
    function audioMuxSection(item){
      const am=item.audioMux;
      if(!am||!am.modes?.length)return '';
      const idx=String(6+(item.videoModes?1:0)+(item.edidSwitch?.table?.length?1:0)).padStart(2,'0');
      const arrow='<svg viewBox="0 0 16 10" width="16" height="10" aria-hidden="true"><path d="M1 5h12M9 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      return `<section class="rt-pg-card rt-pg-audio" style="margin-top:18px"><h2><span class="rt-pg-idx">${idx}</span>오디오 설정 <span class="rt-pg-note">— 병합과 추출 중 하나를 골라 쓴다</span></h2>
        ${am.howTo?`<p class="rt-pg-audio-how">${esc(am.howTo)}</p>`:''}
        ${audioStepsRow(am)}
        <div class="rt-pg-audio-modes">${am.modes.map(mode=>`<div class="rt-pg-audio-mode rt-pg-audio-${mode.name==='MUX'?'mux':'demux'}">
          <div class="rt-pg-audio-head"><b>${esc(mode.title)}</b><small>${esc(mode.name)}${mode.setting?` · ${esc(mode.setting)}`:''}</small></div>
          ${mode.flow?.length?`<div class="rt-pg-audio-flow">${mode.flow.map(step=>`<span>${esc(step)}</span>`).join(arrow)}</div>`:''}
          <dl>${mode.rows.map(row=>`<dt>${esc(row.label)}</dt><dd>${esc(row.text)}</dd>`).join('')}</dl>
        </div>`).join('')}</div>
        ${am.note?`<p class="rt-pg-hint">※ ${esc(am.note)}</p>`:''}
      </section>`;
    }

    // ---- 단일 제품 템플릿(분배기·일체형·전송기·케이블) — 명세 2-2·2-4 ----
    function singleDetailView(item,byId){
      const images=(item.images||[]).filter(img=>img.role!=='Diagram');
      const photo=(item.images||[]).find(img=>img.role==='Diagram');
      const allSpecs=item.specifications||[];
      const orderedSpecs=[...allSpecs.filter(spec=>!isSizeSpec(spec)),...allSpecs.filter(isSizeSpec).map(spec=>({...spec,name:spec.name.replace('크기(W×D×H)','크기')}))];
      const facts=quickFacts(item);
      const diagram=connectionDiagram(item);
      const portSection=item.group!=='cable'?(portMapDiagram(item)||portCards(item)):null;
      const related=Object.values((item.related||[]).filter(link=>byId[link.target]).reduce((all,link)=>{if(!all[link.target]||link.relation!=='PART_OF_SERIES')all[link.target]=link;return all},{}));
      // audioMux 카드만 05 주요 기능 오른쪽에 붙이고, videoModes·edidSwitch·dipSwitch는 전체 폭 아래에 둔다(사용자 요청 2026-09-27, 아래 이유 참고).
      const hasVideoModes=!!item.videoModes?.modes?.length;
      const hasAudioMux=!!item.audioMux?.modes?.length;
      let sideCard='',belowCards='';
      // edidSwitch는 사진+안내 2장+코드표(최대 12행)까지 있어 05 옆 좁은 칸(360px)에 넣으면 오른쪽 칸(02·03·기록)보다 훨씬 길어져 빈 공간이 크게 남는다(사용자 확인 2026-09-27 "06 EDID설정 깨진ㄷ").
      // videoModes(QMS)도 모드 카드 4개+레이아웃 칩 12개까지 있어 좁은 칸에서는 글자가 카드 밖으로 넘친다(사용자 확인 2026-09-27 "06화면모드 짤린다"). audioMux만 상대적으로 짧아 05 옆에 붙이고, 나머지는 항상 전체 폭 아래에 둔다.
      if(hasVideoModes){belowCards=`${videoModesSection(item)}${edidSwitchSection(item)}`}
      // 오디오 설정(병합·추출 두 칸)도 좁은 칸에서는 오른쪽 칸이 잘리고, EDID 설정(06)보다 먼저 보여 번호가 07 → 06 순서로 뒤집혔다(사용자 지적 2026-09-27 "13U 07 오디오가 잘린다").
      // 그래서 EDID 설정이 있는 제품은 06 EDID → 07 오디오 순서로 둘 다 전체 폭 아래에 두고, EDID가 없을 때만 오디오 설정을 05 옆에 붙인다.
      else if(hasAudioMux&&!item.edidSwitch?.table?.length){sideCard=audioMuxSection(item)}
      else if(hasAudioMux){belowCards=`${edidSwitchSection(item)}${audioMuxSection(item)}`}
      else{belowCards=edidSwitchSection(item)}
      belowCards+=dipSwitchSection(item);
      // 휴대폰(1000px 이하)에서는 .rt-pg-col이 사라지고 rt-pg-col-mobile-N 순서로만 쌓이므로, sideCard도 순서 클래스가 있어야 05 다음(01~05, 06, 07 기록)으로 나온다(없으면 order:0이라 맨 앞으로 감).
      if(sideCard)sideCard=sideCard.replace('class="rt-pg-card', 'class="rt-pg-card rt-pg-col-mobile-6');
      return `${headerBlock({icon:PRODUCT_ICON[item.id]||GROUP_ICON[item.group],title:noBreak(item.productName),subtitle:`${esc(subtitleFor(item))} · RTCOM`,back:true,docs:docButtons(item),diagram:!!photo})}
      <div class="rt-pg-cols">
        <div class="rt-pg-col">
          <section class="rt-pg-card rt-pg-col-mobile-1"><h2><span class="rt-pg-idx">01</span>한눈에 보기</h2>
            <p class="rt-pg-lead">${leadFor(item)}</p>
            ${factsList(facts)}
            ${related.length?`<p class="rt-pg-hint"><b>관련 제품</b> ${related.map(link=>`<a href="#products/${link.target}">${noBreak(byId[link.target].productName)}</a>`).join(' · ')}</p>`:''}
          </section>
          <section class="rt-pg-card rt-pg-col-mobile-4"><h2><span class="rt-pg-idx">04</span>제품 사양</h2>${specTable(orderedSpecs)}</section>
          ${(item.features||[]).length?`<section class="rt-pg-card rt-pg-col-mobile-5"><h2><span class="rt-pg-idx">05</span>주요 기능</h2><ul class="rt-pg-checks">${item.features.map(feature=>`<li><i><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.3l2.6 2.5L10 3.4" fill="none" stroke="#fff" stroke-width="2"/></svg></i><span>${esc(feature.text)}</span></li>`).join('')}</ul></section>`:''}
          ${sideCard}
        </div>
        <div class="rt-pg-col">
          ${portSection?`<section class="rt-pg-card rt-pg-col-mobile-2"><h2><span class="rt-pg-idx">02</span>Port Map <span class="rt-pg-note">— ${item.portMap?([].concat(item.portMap)[0].basis||'실제 제품 사진 기준'):'입출력 표 기준'}</span></h2>${portSection}</section>`:''}
          ${diagram?`<section class="rt-pg-card rt-pg-col-mobile-3"><h2><span class="rt-pg-idx">03</span>Signal Flow</h2>${diagram}</section>`:''}
          ${recordSection(item,diagram,photo)}
        </div>
      </div>
      ${belowCards}`;
    }

    // ---- 시리즈 템플릿(XDM·VDM·SPX) — 명세 2-3 ----
    function seriesDetailView(item){
      const family=item.model.split(' ')[0];
      const catalog=(window.RtCatalog||{})[family];
      const lineup=item.lineup||[];
      const frames=lineup.filter(entry=>entry.kind==='메인프레임'&&typeof entry.rackUnits==='number');
      const maxRU=Math.max(1,...frames.map(entry=>entry.rackUnits));
      const facts=seriesFacts(item);
      const inCards=catalog?.input||[],outCards=catalog?.output||[];
      const featureItems=item.features||[];
      const featureShown=6;
      // 0.143(사용자 요청 2026-09-29 "카드 정보를 클릭하면 카드에 관련된 상세 정보가 나왔으면 좋겠고", "CIS·COS 카드 관련해서 CTR100을 연동해야 된다는 내용은 빼고 HDBaseT 카드라고만 명시"):
      // 행 전체를 버튼으로 만들어 누르면 카드 상세 팝업(openProductCardInfo)을 열고, "↔ CTR100 TX · CT103" 같은 연동 전송기 표기는 행에서 뺐다.
      const cardRow=(card,isOut)=>{
        const [model,desc,count,sig]=card;
        return `<button type="button" class="rt-pg-cardrow rt-pg-cardbtn" data-pg-card="${esc(model)}" data-pg-card-dir="${isOut?'출력':'입력'}" data-pg-card-family="${esc(family)}" aria-label="${esc(model)} 카드 상세 정보 보기"><img src="output/design/assets/cards/${encodeURIComponent(model)}.webp" alt="" loading="lazy"><div><b>${esc(model)}</b><span>${esc(desc)}</span></div><span class="rt-pg-pc${isOut?' rt-pg-out':''}">${esc(count)}포트</span></button>`;
      };
      const SIG_COLOR={HDMI:'var(--pg-sig-hdmi)',DP:'var(--pg-sig-dp)',SDI:'var(--pg-sig-sdi)',CAT:'var(--pg-sig-cat)',FIBER:'var(--pg-sig-fiber)'};
      // SPX의 CAT 카드(SPX-COS12)는 HDBaseT가 아닌 CATx 전송이다(사용자 확인 2026-09-27).
      const SIG_NAME={HDMI:'HDMI',DP:'DisplayPort',SDI:'SDI',CAT:family==='SPX'?'CATx':'HDBaseT·CATx',FIBER:'광'};
      const legendKeys=[...new Set([...inCards,...outCards].map(card=>card[3]))];
      const arch=seriesSignalSvg(item.name||family,inCards,outCards,SIG_COLOR);
      return `${headerBlock({icon:GROUP_ICON.series,title:noBreak(item.productName),subtitle:`${esc(subtitleFor(item))} · RTCOM`,back:true,docs:docButtons(item),cta:`<a class="rt-pg-btn rt-pg-primary" href="#matrix-configurator" data-configure-family="${esc(family)}">${esc(family)} 구성기에서 구성하기 →</a>`})}
      <div class="rt-pg-cols">
        <div class="rt-pg-col">
          <section class="rt-pg-card rt-pg-col-mobile-1"><h2><span class="rt-pg-idx">01</span>한눈에 보기</h2><p class="rt-pg-lead">${leadFor(item)}</p>${factsList(facts)}</section>
          <section class="rt-pg-card rt-pg-col-mobile-5"><h2><span class="rt-pg-idx">05</span>시리즈 사양</h2>${specTable((item.specifications||[]).map(spec=>({...spec,name:spec.name})))}</section>
          <section class="rt-pg-card rt-pg-col-mobile-6"><h2><span class="rt-pg-idx">06</span>주요 기능</h2><ul class="rt-pg-checks" data-feature-list>${featureItems.slice(0,featureShown).map(feature=>`<li><i><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.3l2.6 2.5L10 3.4" fill="none" stroke="#fff" stroke-width="2"/></svg></i><span>${esc(feature.text)}</span></li>`).join('')}</ul>${featureItems.length>featureShown?`<button type="button" class="rt-pg-more" data-more-features>기능 ${featureItems.length-featureShown}개 더 보기 ›</button><ul class="rt-pg-checks" data-feature-more hidden>${featureItems.slice(featureShown).map(feature=>`<li><i><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.3l2.6 2.5L10 3.4" fill="none" stroke="#fff" stroke-width="2"/></svg></i><span>${esc(feature.text)}</span></li>`).join('')}</ul>`:''}</section>
        </div>
        <div class="rt-pg-col">
          <section class="rt-pg-card rt-pg-col-mobile-2"><h2><span class="rt-pg-idx">02</span>신호 구성 <span class="rt-pg-note">— 입력 카드 → 메인프레임 → 출력 카드</span></h2>${arch}<ul class="rt-pg-legend">${legendKeys.map(key=>`<li><i style="background:${SIG_COLOR[key]||'#8A8A8E'}"></i>${esc(SIG_NAME[key]||key)}</li>`).join('')}<li><i style="background:transparent;border:1.5px dashed #8A8A8E"></i>전송기(연동)</li></ul></section>
          <section class="rt-pg-card rt-pg-col-mobile-3"><h2><span class="rt-pg-idx">03</span>메인프레임 <span class="rt-pg-note">— ${frames.length}종 · 막대는 랙 높이 · 누르면 정면·후면</span></h2><div class="rt-pg-frames">${frames.map(frame=>{const slug=frame.model.toLowerCase();const hasPhoto=!NO_FRAME_PHOTO.has(frame.model);return `<button type="button" class="rt-pg-frame rt-pg-framebtn" data-pg-frame="${esc(frame.model)}" data-pg-frame-family="${esc(family)}" data-pg-frame-summary="${esc(frame.summary||'')}" data-pg-frame-ru="${frame.rackUnits}" aria-label="${esc(frame.model)} 정면·후면 보기"><div class="rt-pg-ph">${hasPhoto?`<img src="output/design/assets/frames/${slug}-front-art.webp" alt="">`:'<em>사진 준비 중</em>'}</div><b>${esc(frame.model)}</b><small>${esc((frame.summary||'').split(' · ')[0])} · ${frame.rackUnits}U</small>${frameSlotText(frame.summary)?`<small class="rt-pg-frame-slots">${esc(frameSlotText(frame.summary))}</small>`:''}<div class="rt-pg-ru"><i style="width:${Math.max(8,frame.rackUnits/maxRU*100)}%"></i></div></button>`}).join('')}</div></section>
          <section class="rt-pg-card rt-pg-col-mobile-4"><h2><span class="rt-pg-idx">04</span>카드 라인업 <span class="rt-pg-note">— 입력 ${inCards.length} · 출력 ${outCards.length} · 카드를 누르면 상세 정보</span></h2><div class="rt-pg-cards2"><div class="rt-pg-cardcol"><h3>입력</h3>${inCards.map(card=>cardRow(card,false)).join('')}</div><div class="rt-pg-cardcol"><h3>출력</h3>${outCards.map(card=>cardRow(card,true)).join('')}</div></div></section>
          ${recordSection(item,null,null)}
        </div>
      </div>`;
    }
    // 신호 구성 SVG(입력 카드 → 메인프레임 → 출력 카드). series-glass-style.html 시안의 배치 로직을 그대로 옮겼다.
    function seriesSignalSvg(name,ins,outs,sigColor){
      const n=Math.max(ins.length,outs.length),rh=40,H=n*rh+40,W=760;
      const mx=300,mw=160,my=14,mh=H-28;
      let h=`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="18" fill="url(#rt-pg-mf)"/>`;
      for(let i=0;i<5;i++)h+=`<path d="M${mx+22} ${my+30+i*(mh-60)/4}H${mx+mw-22}" stroke="#fff" stroke-opacity=".22" stroke-width="1.2"/>`;
      h+=`<text x="${mx+mw/2}" y="${my+mh/2-6}" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">${svgEsc(name.split(' ')[0])} 메인프레임</text><text x="${mx+mw/2}" y="${my+mh/2+14}" text-anchor="middle" font-size="11" font-weight="600" fill="#fff" fill-opacity=".85">크로스 스위칭 · 심리스</text>`;
      const y0=len=>H/2-(len-1)*rh/2;
      ins.forEach((c,i)=>{
        const y=y0(ins.length)+i*rh,col=sigColor[c[3]]||'#8A8A8E',linked=CARD_EXTENDER_LABEL[c[0]];
        if(linked)h+=`<rect x="4" y="${y-12}" width="92" height="24" rx="12" fill="none" stroke="#8A8A8E" stroke-dasharray="4 3"/><text x="50" y="${y+4}" text-anchor="middle" font-size="10.5" font-weight="600" fill="#3A3A3C">${svgEsc(linked.split(' · ')[0])}</text><path d="M96 ${y}H112" stroke="#8A8A8E" stroke-width="1.5" stroke-dasharray="3 3"/>`;
        h+=`<rect x="112" y="${y-14}" width="140" height="28" rx="14" fill="${col}" fill-opacity=".12"/><circle cx="128" cy="${y}" r="4.5" fill="${col}"/><text x="140" y="${y+4.5}" font-size="12" font-weight="700" fill="#1C1C1E">${svgEsc(c[0])}</text><path d="M252 ${y}C276 ${y} 276 ${H/2+(y-H/2)*.6} ${mx} ${H/2+(y-H/2)*.6}" fill="none" stroke="${col}" stroke-width="2"/>`;
      });
      outs.forEach((c,i)=>{
        const y=y0(outs.length)+i*rh,col=sigColor[c[3]]||'#8A8A8E',x=508,linked=CARD_EXTENDER_LABEL[c[0]];
        h+=`<path d="M${mx+mw} ${H/2+(y-H/2)*.6}C${x-24} ${H/2+(y-H/2)*.6} ${x-24} ${y} ${x} ${y}" fill="none" stroke="${col}" stroke-width="2"/><rect x="${x}" y="${y-14}" width="140" height="28" rx="14" fill="${col}" fill-opacity=".12"/><circle cx="${x+16}" cy="${y}" r="4.5" fill="${col}"/><text x="${x+28}" y="${y+4.5}" font-size="12" font-weight="700" fill="#1C1C1E">${svgEsc(c[0])}</text>`;
        if(linked)h+=`<path d="M${x+140} ${y}H${x+156}" stroke="#8A8A8E" stroke-width="1.5" stroke-dasharray="3 3"/><rect x="${x+156}" y="${y-12}" width="92" height="24" rx="12" fill="none" stroke="#8A8A8E" stroke-dasharray="4 3"/><text x="${x+202}" y="${y+4}" text-anchor="middle" font-size="10.5" font-weight="600" fill="#3A3A3C">${svgEsc(linked.split(' · ')[0])}</text>`;
      });
      return `<div class="rt-pg-svg-wrap"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="신호 구성"><defs><linearGradient id="rt-pg-mf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A84FF"/><stop offset=".55" stop-color="#5E5CE6"/><stop offset="1" stop-color="#BF5AF2"/></linearGradient></defs>${h}</svg></div>`;
    }

    function detailView(item){
      const byId=Object.fromEntries(index.products.map(product=>[product.id,product]));
      return item.group==='series'?seriesDetailView(item):singleDetailView(item,byId);
    }

    // 다이어그램 캔버스가 화면보다 넓어 가로 스크롤이 필요하면 오른쪽 끝에 그러데이션을 보여 "잘린 것"이 아니라 "더 있음"임을 알린다.
    // 0.178(사용자 요청 2026-09-29 "좌우 이동식 가운데 선이 보이는 문제 해결해줘"): 그러데이션을 스크롤 칸(.rt-pg-svg-wrap) 자신의 ::after로 그리면
    // 절대 위치 요소가 내용과 함께 밀려서, 옆으로 밀면 그림 가운데에 세로 띠(선)가 남았다. 스크롤하지 않는 바깥 틀(.rt-pg-svg-frame)을 씌워 그 틀의 오른쪽 끝에 고정한다.
    function initDiagramScroll(container){
      container.querySelectorAll('.rt-pg-svg-wrap').forEach(canvas=>{
        let frame=canvas.parentElement;
        if(!frame.classList.contains('rt-pg-svg-frame')){frame=document.createElement('div');frame.className='rt-pg-svg-frame';canvas.before(frame);frame.appendChild(canvas)}
        const update=()=>{
          const hasMore=canvas.scrollWidth-canvas.clientWidth-canvas.scrollLeft>4;
          frame.classList.toggle('rt-has-more',hasMore);
        };
        update();
        if(!canvas.dataset.scrollHint){canvas.dataset.scrollHint='1';canvas.addEventListener('scroll',update,{passive:true})}
      });
    }
    window.addEventListener('resize',()=>initDiagramScroll(body));
    function show(state){
      view.hidden=!state.products;configurator.hidden=state.products;
      document.documentElement.classList.toggle('rt-print-products',state.products); // 0.147: 제품정보 화면에서 인쇄/PDF를 누르면 구성기 검토 시트가 아니라 지금 보는 제품 화면을 인쇄한다(src/styles.css 끝의 print 규칙).
      for(const tab of tabs){const active=(tab.dataset.viewTab==='products')===state.products;tab.setAttribute('aria-current',active?'page':'false')}
      if(!state.products)return;
      body.innerHTML=`<div class="rt-pg-orbs"></div><div class="rt-pg-wrap"><p class="rt-pg-count" role="status">제품 정보를 불러오는 중입니다…</p></div>`;
      loadIndex().then(()=>{
        // 같은 제품의 다른 이름으로 된 옛 주소(예: #products/hd-14u → hd-104u, 0.24~0.35에서 쓰던 id)는 정식 id로 바꿔 연다.
        if(state.id&&!index.products.some(product=>product.id===state.id)){
          const target=index.products.find(product=>(product.aliases||[]).some(name=>name.toLowerCase()===state.id));
          if(target){location.replace(`#products/${target.id}`);return new Promise(()=>{})}
        }
      }).then(()=>state.id?loadDetail(state.id).then(item=>{
        if(route().id!==state.id)return;
        body.innerHTML=`<div class="rt-pg-orbs"></div><div class="rt-pg-wrap">${detailView(item)}</div>`;
        body.querySelector('#rt-pg-title')?.setAttribute('tabindex','-1');
        body.querySelector('#rt-pg-title')?.focus({preventScroll:true});
        window.scrollTo({top:view.offsetTop-8});
        initDiagramScroll(body);
      }):(body.innerHTML=`<div class="rt-pg-orbs"></div><div class="rt-pg-wrap">${listView()}</div>`))
        .catch(()=>{body.innerHTML=`<div class="rt-pg-wrap"><p class="rt-pg-empty">제품 정보를 불러오지 못했습니다. <a href="#products">목록으로</a></p></div>`});
    }
    // 0.143 제품정보 04 카드 라인업 카드 상세 팝업: 사양은 src/card-specs.js(RtCardSpecs), 용도 설명은 src/app.js(RtCardTips)를 읽는다. 연동 전송기 표기는 넣지 않는다.
    function openProductCardInfo(id,dir,family){
      const specsAll=globalThis.RtCardSpecs||{},tips=globalThis.RtCardTips||{},info=specsAll[id]||{};
      const cat=(globalThis.RtCatalog||{})[family]||{},all=[...(cat.input||[]),...(cat.output||[])],c=all.find(item=>item[0]===id)||[id,'',''];
      const rows=[['구분',`${family} ${dir} 카드`],['신호',c[1]],['채널',c[2]?`${c[2]}채널`:''],...(info.specs||[])].filter(([,v])=>v);
      const dialog=document.createElement('dialog');
      dialog.className='rt-card-info-modal';
      dialog.setAttribute('aria-labelledby','rt-pg-card-info-title');
      dialog.innerHTML=`<div class="rt-card-modal-head"><div><span class="rt-eyebrow">${esc(dir)} 카드 · ${esc(family)}</span><h3 id="rt-pg-card-info-title">${esc(id)}</h3>${info.title?`<p class="rt-card-info-sub">${esc(info.title)}</p>`:''}</div><button type="button" class="rt-card-modal-close" data-card-info-close aria-label="카드 상세 정보 닫기">×</button></div><div class="rt-card-info-body"><div class="rt-card-info-plate"><img src="output/design/assets/cards/${encodeURIComponent(id)}.webp" alt="${esc(id)} 카드 후면 판넬"></div>${tips[id]?`<p class="rt-card-info-tip">${esc(tips[id])}</p>`:''}<table class="rt-card-info-table"><tbody>${rows.map(([k,v])=>`<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>${info.note?`<p class="rt-card-info-note">${esc(info.note)}</p>`:''}${info.missing?`<p class="rt-card-info-missing">상세 사양 준비 중 · ${esc(info.missing)}</p>`:''}<p class="rt-card-info-src">${[info.page?`알티컴 종합 카탈로그 2026 (국문) ${info.page}쪽`:'',info.source?esc(info.source):''].filter(Boolean).join(' · ')||'제조사 자료 확인 중'}</p></div><div class="rt-card-modal-foot"><button type="button" class="rt-button" data-card-info-close>닫기</button></div>`;
      const opener=document.activeElement;
      const finish=()=>{if(dialog.open)dialog.close();dialog.remove();opener?.focus?.({preventScroll:true})};
      dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('[data-card-info-close]'))finish()});
      dialog.addEventListener('cancel',event=>{event.preventDefault();finish()});
      root.appendChild(dialog);
      if(typeof dialog.showModal==='function'){dialog.showModal();dialog.querySelector('.rt-card-modal-close').focus()}else dialog.setAttribute('open','');
    }
    // 0.151(사용자 요청 2026-09-29 "03 메인프레임에 각 프레임 선택시 팝업이써 정면, 후면이 동시 보이게", "카드랑 같은 방식으로"):
    // 시리즈 상세 03 메인프레임 타일을 누르면 카드 상세 팝업과 같은 대화상자에 정면·후면 그림을 함께 보여 준다.
    // 가로로 긴 프레임(1U~9U 가로 그림)은 위아래로, 세로로 긴 대형 프레임은 좌우로 놓는다(후면 그림을 읽은 뒤 비율로 고름).
    // 0.180(사용자 요청 2026-09-30 "03 메인 프레임도 수량 … 수정"): 라인업 요약의 "입력 슬롯 N · 출력 슬롯 M"을 타일 둘째 줄에 "입력 N · 출력 M 슬롯"으로 보여 준다(없는 시리즈는 빈 글).
    const frameSlotText=summary=>{const m=String(summary||'').match(/입력 슬롯\s*(\d+)\s*·\s*출력 슬롯\s*(\d+)/);return m?`입력 ${m[1]} · 출력 ${m[2]} 슬롯`:''};
    function splitSummary(text){
      const parts=[];let depth=0,buf='';
      for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='(')depth++;if(ch===')')depth=Math.max(0,depth-1);if(!depth&&text.startsWith(' · ',i)){parts.push(buf);buf='';i+=2;continue}buf+=ch}
      if(buf)parts.push(buf);return parts.map(part=>part.trim()).filter(Boolean);
    }
    function openProductFrameInfo(model,family,summary,rackUnits){
      const frame={model,summary,rackUnits:Number(rackUnits)};
      const [io,...rest]=splitSummary(frame.summary||'');
      const rows=[['구분',`${family} 메인프레임`],['입출력',io||''],...rest.filter(part=>!/^\d+\s*U$/i.test(part)).map(part=>{const slot=part.match(/^(입력|출력) 슬롯\s*(\d+)$/);return slot?[`${slot[1]} 슬롯`,`${slot[2]}개`]:[/mm/.test(part)?'크기':/kg/.test(part)?'무게':'특징',part]}),['랙 높이',typeof frame.rackUnits==='number'?`${frame.rackUnits}U`:'']].filter(([,v])=>v);
      const slug=model.toLowerCase(),hasPhoto=!NO_FRAME_PHOTO.has(model);
      const face=(side,label)=>`<figure class="rt-frame-info-face"><div class="rt-card-info-plate"><img src="output/design/assets/frames/${slug}-${side}-art.webp" alt="${esc(model)} ${label} 그림" data-frame-face="${side}"></div><figcaption>${label}</figcaption></figure>`;
      const dialog=document.createElement('dialog');
      dialog.className='rt-card-info-modal rt-frame-info-modal';
      dialog.setAttribute('aria-labelledby','rt-pg-frame-info-title');
      dialog.innerHTML=`<div class="rt-card-modal-head"><div><span class="rt-eyebrow">메인프레임 · ${esc(family)}</span><h3 id="rt-pg-frame-info-title">${esc(model)}</h3>${io?`<p class="rt-card-info-sub">${esc(io)} 매트릭스 프레임</p>`:''}</div><button type="button" class="rt-card-modal-close" data-card-info-close aria-label="프레임 정면·후면 닫기">×</button></div><div class="rt-card-info-body">${hasPhoto?`<div class="rt-frame-info-duo">${face('front','정면')}${face('rear','후면')}</div>`:'<p class="rt-card-info-missing">정면·후면 그림 준비 중</p>'}<table class="rt-card-info-table"><tbody>${rows.map(([k,v])=>`<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div><div class="rt-card-modal-foot"><button type="button" class="rt-button rt-primary" data-frame-configure>슬롯 구성기 <span aria-hidden="true">→</span></button><button type="button" class="rt-button" data-card-info-close>닫기</button></div>`;
      const rear=dialog.querySelector('[data-frame-face="rear"]'),front=dialog.querySelector('[data-frame-face="front"]');
      // 0.178(사용자 요청 2026-09-29 "모듈러 매트릭스 프레임 상하 높이 안맞는문제 일괄 점검 후 수정해"): 좌우 배치에서 두 칸을 1fr 1fr(같은 폭)로 두면
      // 가로:세로 비율이 다른 정면(랙 날개 포함)·후면 그림의 높이가 달라졌다. 두 그림을 모두 읽은 뒤 비율 합을 넘겨 두 그림을 같은 높이로 그린다(src/styles.css 0.178).
      // 위아래 배치(가로로 긴 프레임)는 0.154처럼 가로폭을 같게 둔다.
      const pickLayout=()=>{
        const duo=dialog.querySelector('.rt-frame-info-duo');
        if(!duo||!rear.naturalWidth||!front?.naturalWidth)return;
        if(rear.naturalWidth/rear.naturalHeight>1.25){duo.classList.add('rt-frame-info-stack');return}
        const rf=front.naturalWidth/front.naturalHeight,rr=rear.naturalWidth/rear.naturalHeight;
        duo.classList.add('rt-frame-info-row');
        duo.style.setProperty('--rt-duo-ratio',(rf+rr).toFixed(4));
      };
      for(const img of [rear,front])if(img&&!img.complete)img.addEventListener('load',pickLayout,{once:true});
      if(rear)pickLayout();
      const opener=document.activeElement;
      const finish=()=>{if(dialog.open)dialog.close();dialog.remove();opener?.focus?.({preventScroll:true})};
      // 0.183(사용자 요청 2026-09-30 "03 메인프레임 선택시 팝업중 닫기 바로 구성기로 넘어갈 수 있도록 왼쪽에 슬롯구성기 버튼"): 팝업을 닫고 이 프레임을 고른 채 구성기 03 카드 슬롯 단계로 간다(app.js rt-configure-family).
      dialog.addEventListener('click',event=>{
        if(event.target.closest('[data-frame-configure]')){finish();location.hash='#matrix-configurator';root.dispatchEvent(new CustomEvent('rt-configure-family',{detail:{family,model}}));return}
        if(event.target===dialog||event.target.closest('[data-card-info-close]'))finish();
      });
      dialog.addEventListener('cancel',event=>{event.preventDefault();finish()});
      root.appendChild(dialog);
      if(typeof dialog.showModal==='function'){dialog.showModal();dialog.querySelector('.rt-card-modal-close').focus()}else dialog.setAttribute('open','');
    }
    body.addEventListener('click',event=>{
      const filterBtn=event.target.closest('[data-product-filter]');
      const pgCard=event.target.closest('[data-pg-card]');
      if(pgCard){openProductCardInfo(pgCard.dataset.pgCard,pgCard.dataset.pgCardDir,pgCard.dataset.pgCardFamily);return}
      const pgFrame=event.target.closest('[data-pg-frame]');
      if(pgFrame){openProductFrameInfo(pgFrame.dataset.pgFrame,pgFrame.dataset.pgFrameFamily,pgFrame.dataset.pgFrameSummary,pgFrame.dataset.pgFrameRu);return}
      if(filterBtn){filter=filterBtn.dataset.productFilter;body.querySelector('.rt-pg-wrap').innerHTML=listView();body.querySelector(`[data-product-filter="${filter}"]`)?.focus();return}
      const configure=event.target.closest('[data-configure-family]');
      if(configure){event.preventDefault();location.hash='#matrix-configurator';root.dispatchEvent(new CustomEvent('rt-configure-family',{detail:configure.dataset.configureFamily}));return}
      const printBtn=event.target.closest('[data-print]');
      if(printBtn){window.print();return}
      // 0.55 2U 이상 제품의 정면·후면 버튼: 같은 단자 지도 안에서 정면 사진과 후면 단자 지도를 바꿔 보여준다.
      const sideBtn=event.target.closest('[data-pm-side]');
      if(sideBtn){const seg=sideBtn.closest('.rt-pg-seg'),scope=seg?.parentElement;if(scope){seg.querySelectorAll('[data-pm-side]').forEach(btn=>{const on=btn===sideBtn;btn.classList.toggle('rt-pg-on',on);btn.setAttribute('aria-pressed',String(on))});scope.querySelectorAll('[data-pm-face]').forEach(el=>{el.hidden=el.dataset.pmFace!==sideBtn.dataset.pmSide})}return}
      const diagramBtn=event.target.closest('[data-open-diagram]');
      if(diagramBtn){const record=body.querySelector('.rt-pg-record');if(record){record.open=true;record.querySelector('#rt-pg-diagram-photo')?.scrollIntoView({behavior:'smooth',block:'start'})}return}
      const docPreviewBtn=event.target.closest('[data-doc-preview]');
      if(docPreviewBtn){const d=docPreviewBtn.dataset;openDocPreview(d.docPreview,d.docTitle,d.docKind,d.docImages?d.docImages.split('|'):[]);return}
      // 0.99 XDM-PSU Signal Flow 확대 창: 그림을 복사해 전체 화면 창에 넣고 100%(화면 폭 맞춤)~300%로 키운다. 창 안에서 스크롤·손가락으로 옮겨 본다.
      const flowZoom=event.target.closest('[data-flow-zoom]')||(event.target.closest('.rt-pg-svg-wrap')?.querySelector('.rt-psu-anim')&&event.target.closest('.rt-pg-svg-wrap'));
      if(flowZoom){openFlowZoom(flowZoom.closest('section'));return}
      const docWide=event.target.closest('[data-doc-wide]');
      if(docWide){const dlg=docWide.closest('dialog');const width=docWide.getAttribute('aria-pressed')==='true'?0:docMaxWidth();saveDocWidth(width);applyDocWidth(dlg,width);return}
      const docZoom=event.target.closest('[data-doc-zoom-step]');
      if(docZoom){const dlg=docZoom.closest('dialog');if(dlg?.rtDoc?.ready){dlg.rtDoc.zoom=Math.max(0,Math.min(DOC_ZOOMS.length-1,dlg.rtDoc.zoom+Number(docZoom.dataset.docZoomStep)));renderDocPages(dlg)}return}
      const zoomStep=event.target.closest('[data-zoom-step]');
      if(zoomStep){const dlg=zoomStep.closest('dialog');setFlowZoom(dlg,Number(dlg.dataset.zoom)+Number(zoomStep.dataset.zoomStep));return}
      if(event.target.closest('[data-zoom-close]')){event.target.closest('dialog').close();return}
      const moreBtn=event.target.closest('[data-more-features]');
      if(moreBtn){const more=body.querySelector('[data-feature-more]');if(more){more.hidden=false;moreBtn.hidden=true}return}
      const layoutChip=event.target.closest('[data-layout-chip]');
      if(layoutChip){
        const chips=layoutChip.parentElement;
        chips.querySelectorAll('[data-layout-chip]').forEach(btn=>btn.classList.toggle('on',btn===layoutChip));
        const preview=chips.nextElementSibling;
        if(preview?.matches('[data-layout-preview]')){
          preview.innerHTML=`${layoutShapeSvg(layoutChip.dataset.layout,preview.dataset.layoutProduct,preview.dataset.layoutMode)}<small data-layout-name>${esc(layoutChip.dataset.layout)}</small>`;
        }
        return;
      }
    });
    const FLOW_ZOOMS=[1,1.5,2,3];
    function setFlowZoom(dlg,index){
      const i=Math.max(0,Math.min(FLOW_ZOOMS.length-1,index));
      dlg.dataset.zoom=String(i);
      dlg.querySelector('.rt-flow-zoom-canvas').style.width=`${FLOW_ZOOMS[i]*100}%`;
      dlg.querySelector('[data-zoom-level]').textContent=`${FLOW_ZOOMS[i]*100}%`;
      dlg.querySelector('[data-zoom-step="-1"]').disabled=i===0;
      dlg.querySelector('[data-zoom-step="1"]').disabled=i===FLOW_ZOOMS.length-1;
    }
    function openFlowZoom(section){
      const svg=section?.querySelector('.rt-pg-svg-wrap svg');
      if(!svg)return;
      // 0.101(사용자 지적 "확대시 범례가 안보인다 같이 확대되게해줘"): 범례(rt-pg-legend)는 svg 바깥의 형제 요소라 확대 창에 svg만 복사하면 통째로 빠졌다.
      // 확대 배율과 무관하게 항상 읽을 수 있도록 확대 창 머리글 아래에 고정 줄로 넣는다(그림 캔버스 자체를 확대·축소해도 범례 글자 크기는 유지됨).
      const legend=section?.querySelector('.rt-pg-legend');
      let dlg=body.querySelector('dialog.rt-flow-zoom');
      if(!dlg){
        dlg=document.createElement('dialog');dlg.className='rt-flow-zoom';dlg.setAttribute('aria-label','Signal Flow 크게 보기');
        dlg.addEventListener('click',event=>{if(event.target===dlg)dlg.close()});
        body.appendChild(dlg);
      }
      const title=body.querySelector('#rt-pg-title')?.textContent||'';
      dlg.innerHTML=`<div class="rt-flow-zoom-head"><b>${esc(title)} · 03 Signal Flow</b><div class="rt-flow-zoom-tools"><button type="button" data-zoom-step="-1" aria-label="축소">−</button><span data-zoom-level aria-live="polite">100%</span><button type="button" data-zoom-step="1" aria-label="확대">+</button><button type="button" class="rt-flow-zoom-close" data-zoom-close aria-label="닫기">×</button></div></div>${legend?`<div class="rt-flow-zoom-legend">${legend.outerHTML}</div>`:''}<div class="rt-flow-zoom-body"><div class="rt-flow-zoom-canvas">${svg.outerHTML}</div></div>`;
      setFlowZoom(dlg,0);
      if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
      dlg.querySelector('[data-zoom-step="1"]').focus();
    }
    // 제조사 문서 팝업 미리보기(0.124부터 전 제품: 카탈로그는 미리 그린 쪽 그림, 매뉴얼은 PDF.js). 0.112: iframe은 PDF 보기 기능이 없는 브라우저(휴대폰 크롬, 카카오톡 인앱 등)에서
    // 파일 다운로드로 넘어가서(사용자 지적 "pdf파일 다운로드 뜨지 않게 카탈로그를 직접 보이게해줘"), 저장소에 넣은 PDF.js(src/vendor/pdfjs)로 쪽마다 canvas에 그린다.
    // 라이브러리는 팝업을 처음 열 때만 불러온다. 옛 브라우저가 products.js 전체를 못 읽는 일이 없도록 import()는 Function으로 감싼다.
    const PDFJS_DIR='src/vendor/pdfjs/';
    let pdfjsLib=null;
    const loadPdfjs=async()=>{
      if(pdfjsLib)return pdfjsLib;
      const lib=await new Function('u','return import(u)')(new URL(`${PDFJS_DIR}pdf.min.mjs`,document.baseURI).href);
      lib.GlobalWorkerOptions.workerSrc=new URL(`${PDFJS_DIR}pdf.worker.min.mjs`,document.baseURI).href;
      return pdfjsLib=lib;
    };
    const DOC_ZOOMS=[1,1.5,2,3];
    // 화면 폭에 맞춘 쪽 너비(px). 확대 배율을 곱해 그린다.
    const docFitWidth=dlg=>Math.max(240,dlg.querySelector('.rt-doc-zoom-body').clientWidth-24);
    function updateDocZoomTools(dlg){
      const state=dlg.rtDoc;
      dlg.querySelector('[data-doc-zoom-level]').textContent=`${DOC_ZOOMS[state.zoom]*100}%`;
      dlg.querySelector('[data-doc-zoom-step="-1"]').disabled=!state.ready||state.zoom===0;
      dlg.querySelector('[data-doc-zoom-step="1"]').disabled=!state.ready||state.zoom===DOC_ZOOMS.length-1;
    }
    async function renderDocPages(dlg){
      const state=dlg.rtDoc,pagesEl=dlg.querySelector('.rt-doc-pages');
      if(!state?.ready||!pagesEl)return;
      updateDocZoomTools(dlg);
      const zoom=DOC_ZOOMS[state.zoom],fitWidth=docFitWidth(dlg);
      state.fitWidth=fitWidth;
      // 이미지 방식(카탈로그): 미리 그린 그림의 표시 폭만 바꾼다. 쪽 그림은 200dpi라 300%까지 확대해도 흐려지지 않는다.
      if(state.kind==='image'){pagesEl.querySelectorAll('img').forEach(img=>{img.style.width=`${Math.floor(fitWidth*zoom)}px`});return}
      // PDF.js(매뉴얼): 쪽마다 크기만 맞춘 빈 자리를 먼저 만들고, 화면에 보이는 쪽과 그 앞뒤 한 화면만 canvas로 그린다.
      // 100쪽이 넘는 매뉴얼(VDM 103쪽)도 첫 화면이 바로 뜨고, 멀리 지나간 쪽의 canvas는 지워서 휴대폰 메모리를 아낀다(0.124).
      const scroller=dlg.querySelector('.rt-doc-zoom-body');
      const ratio=scroller.scrollHeight>scroller.clientHeight?scroller.scrollTop/scroller.scrollHeight:0;
      state.gen=(state.gen||0)+1;
      if(!state.slots){
        state.slots=state.sizes.map((size,i)=>{const slot=document.createElement('div');slot.className='rt-doc-page';slot.dataset.docPage=String(i+1);slot.setAttribute('role','img');slot.setAttribute('aria-label',`${state.title} ${i+1}쪽`);return slot});
        pagesEl.replaceChildren(...state.slots);
      }
      state.slots.forEach((slot,i)=>{
        const size=state.sizes[i],cssScale=fitWidth/size.width*zoom;
        slot.style.width=`${Math.floor(size.width*cssScale)}px`;slot.style.height=`${Math.floor(size.height*cssScale)}px`;
        freeDocPage(slot);
      });
      scroller.scrollTop=ratio*scroller.scrollHeight;
      state.visible=new Set();
      state.observer?.disconnect();
      state.observer=new IntersectionObserver(entries=>{
        for(const entry of entries){
          const i=Number(entry.target.dataset.docPage)-1;
          if(entry.isIntersecting)state.visible.add(i);else{state.visible.delete(i);freeDocPage(entry.target)}
        }
        pumpDocPages(dlg,state);
      },{root:scroller,rootMargin:'100% 0px'});
      state.slots.forEach(slot=>state.observer.observe(slot));
    }
    // 그려 둔 canvas를 비운다. width를 0으로 줄여야 Safari가 canvas 메모리를 바로 돌려준다.
    function freeDocPage(slot){
      const canvas=slot.querySelector('canvas');
      if(canvas){canvas.width=0;canvas.height=0}
      slot.replaceChildren();delete slot.dataset.docDrawn;
    }
    // 그려야 할 쪽을 화면 가운데에 가까운 순서로 한 쪽씩 그린다(동시에 여러 쪽을 그리지 않아 첫 화면이 먼저 뜬다).
    async function pumpDocPages(dlg,state){
      if(state.busy)return;
      state.busy=true;
      try{
        const scroller=dlg.querySelector('.rt-doc-zoom-body');
        for(;;){
          if(dlg.rtDoc!==state||!dlg.open)break;
          const gen=state.gen,box=scroller.getBoundingClientRect(),mid=box.top+box.height/2;
          let next=-1,best=Infinity;
          for(const i of state.visible){
            const slot=state.slots[i];
            if(slot.dataset.docDrawn===String(gen))continue;
            const r=slot.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-mid);
            if(d<best){best=d;next=i}
          }
          if(next<0)break;
          const slot=state.slots[next],page=await state.pdf.getPage(next+1);
          const cssWidth=parseFloat(slot.style.width),cssHeight=parseFloat(slot.style.height);
          const base=page.getViewport({scale:1}),cssScale=cssWidth/base.width;
          // 화면 배율만큼 선명하게 그리되 canvas 한 변이 4096px을 넘지 않게 한다(휴대폰 메모리 보호).
          const pixelScale=Math.min(window.devicePixelRatio||1,4096/cssWidth,4096/cssHeight);
          const viewport=page.getViewport({scale:cssScale*pixelScale});
          const canvas=document.createElement('canvas');
          canvas.width=Math.floor(viewport.width);canvas.height=Math.floor(viewport.height);
          await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
          if(dlg.rtDoc!==state||gen!==state.gen||!state.visible.has(next)){canvas.width=0;canvas.height=0;continue}
          slot.replaceChildren(canvas);slot.dataset.docDrawn=String(gen);
          dlg.querySelector('.rt-doc-status')?.remove();
        }
      }catch(error){
        // 창을 닫아 문서를 푼 뒤 끝난 그리기는 조용히 버린다. 열려 있는데 실패하면 원본 링크로 안내한다.
        if(dlg.rtDoc===state&&dlg.open){const status=dlg.querySelector('.rt-doc-status');if(status)status.innerHTML=`미리보기를 불러오지 못했습니다. <a href="${state.href}" target="_blank" rel="noopener">PDF 원본 열기</a>`}
      }finally{state.busy=false}
    }
    // 0.126 PC에서 팝업 폭 조절(사용자 요청 2026-09-28 "메뉴얼 웹뷰어시 팝업창의 가로폭이 너무 좁아", "마우스로 창 크기 가변가능할까?"):
    // 창은 화면 가운데에 있으므로 좌우 가장자리 어느 쪽을 끌어도 양쪽이 같이 넓어진다(폭 = 가운데에서 마우스까지 거리 × 2).
    // 고른 폭은 이 브라우저에만 기억하고(저장이 막혀 있어도 기본 폭으로 동작), 폭이 바뀌면 쪽을 새 폭에 맞춰 다시 그린다. 휴대폰 폭에서는 쓰지 않는다.
    const DOC_WIDTH_KEY='rtcom.docPopupWidth',DOC_MIN_WIDTH=480;
    const DOC_WIDE_ICON='<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M1.5 8h13M1.5 8l3-3M1.5 8l3 3M14.5 8l-3-3M14.5 8l-3 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const docMaxWidth=()=>window.innerWidth-16;
    const readDocWidth=()=>{try{const w=Number(localStorage.getItem(DOC_WIDTH_KEY));return w>=DOC_MIN_WIDTH?w:0}catch(error){return 0}};
    const saveDocWidth=w=>{try{if(w)localStorage.setItem(DOC_WIDTH_KEY,String(Math.round(w)));else localStorage.removeItem(DOC_WIDTH_KEY)}catch(error){}};
    function applyDocWidth(dlg,width){
      const custom=width>0&&window.innerWidth>560;
      dlg.style.width=custom?`${Math.min(width,docMaxWidth())}px`:'';
      dlg.querySelector('[data-doc-wide]')?.setAttribute('aria-pressed',String(custom&&width>=docMaxWidth()));
    }
    function bindDocResize(dlg){
      let drag=null;
      dlg.addEventListener('pointerdown',event=>{
        const handle=event.target.closest('[data-doc-resize]');
        if(!handle||event.button!==0)return;
        event.preventDefault();
        const box=dlg.getBoundingClientRect();
        drag={center:box.left+box.width/2,id:event.pointerId};
        handle.setPointerCapture(event.pointerId);dlg.classList.add('rt-doc-resizing');
      });
      dlg.addEventListener('pointermove',event=>{
        if(!drag||event.pointerId!==drag.id)return;
        const width=Math.max(DOC_MIN_WIDTH,Math.min(docMaxWidth(),Math.abs(event.clientX-drag.center)*2));
        dlg.style.width=`${Math.round(width)}px`;
      });
      const end=event=>{
        if(!drag||event.pointerId!==drag.id)return;
        drag=null;dlg.classList.remove('rt-doc-resizing');
        const width=dlg.getBoundingClientRect().width;
        saveDocWidth(width);applyDocWidth(dlg,width);
      };
      dlg.addEventListener('pointerup',end);dlg.addEventListener('pointercancel',end);
      dlg.addEventListener('dblclick',event=>{if(event.target.closest('[data-doc-resize]')){saveDocWidth(0);applyDocWidth(dlg,0)}});
      // 창 크기가 바뀌면(끌기·넓게 버튼·브라우저 창 조절·휴대폰 회전) 쪽을 새 폭에 맞춘다. PDF.js는 크기 변화가 멈춘 뒤 한 번만 다시 그린다.
      if(typeof ResizeObserver!=='function')return;
      let timer=0;
      new ResizeObserver(()=>{
        const state=dlg.rtDoc;
        if(!state?.ready||!dlg.open||Math.abs(docFitWidth(dlg)-state.fitWidth)<4)return;
        clearTimeout(timer);
        if(state.kind==='image')renderDocPages(dlg);else timer=setTimeout(()=>{if(dlg.rtDoc===state)renderDocPages(dlg)},200);
      }).observe(dlg);
    }
    async function openDocPreview(href,title,kind='pdfjs',images=[]){
      let dlg=body.querySelector('dialog.rt-doc-zoom');
      if(!dlg){
        dlg=document.createElement('dialog');dlg.className='rt-doc-zoom';dlg.setAttribute('aria-label','문서 미리보기');
        dlg.addEventListener('click',event=>{if(event.target===dlg)dlg.close()});
        // 닫으면 관찰을 멈추고 PDF 문서를 풀어 메모리를 돌려준다.
        dlg.addEventListener('close',()=>{const state=dlg.rtDoc;if(!state)return;state.observer?.disconnect();state.slots?.forEach(freeDocPage);state.pdf?.destroy();dlg.rtDoc=null});
        bindDocResize(dlg);
        body.appendChild(dlg);
      }
      const file=href.split('/').pop();
      dlg.innerHTML=`<div class="rt-flow-zoom-head"><b>${esc(title)}</b><div class="rt-flow-zoom-tools"><button type="button" data-doc-zoom-step="-1" aria-label="축소" disabled>−</button><span data-doc-zoom-level aria-live="polite">100%</span><button type="button" data-doc-zoom-step="1" aria-label="확대" disabled>+</button><a class="rt-doc-zoom-link" href="${href}" target="_blank" rel="noopener" title="PDF 원본을 새 탭에서 열기">새 탭</a><a class="rt-doc-zoom-link" href="${href}" download="${esc(file)}" title="PDF 다운로드" aria-label="PDF 다운로드">${DOWNLOAD_ICON}<span class="rt-doc-save-text">다운로드</span></a><button type="button" class="rt-doc-wide" data-doc-wide aria-pressed="false" title="창을 화면 폭에 맞게 넓히기(다시 누르면 기본 폭)" aria-label="창 넓게">${DOC_WIDE_ICON}</button><button type="button" class="rt-flow-zoom-close" data-zoom-close aria-label="닫기">×</button></div></div><div class="rt-doc-zoom-body" data-doc-kind="${kind==='image'?'image':'pdfjs'}"><p class="rt-doc-status" role="status">${kind==='image'?'카탈로그':'문서'}를 불러오는 중입니다…</p><div class="rt-doc-pages"></div></div><div class="rt-doc-resize" data-doc-resize="left" title="끌어서 창 폭 조절 · 두 번 누르면 기본 폭" aria-hidden="true"></div><div class="rt-doc-resize" data-doc-resize="right" title="끌어서 창 폭 조절 · 두 번 누르면 기본 폭" aria-hidden="true"></div>`;
      applyDocWidth(dlg,readDocWidth());
      const state=dlg.rtDoc={title,href,kind:kind==='image'?'image':'pdfjs',zoom:0,ready:false};
      if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
      dlg.querySelector('[data-zoom-close]').focus();
      const status=dlg.querySelector('.rt-doc-status');
      const fail=()=>{status.innerHTML=`미리보기를 불러오지 못했습니다. <a href="${href}" target="_blank" rel="noopener">PDF 원본 열기</a>`};
      if(state.kind==='image'){
        // 이미지 방식: 라이브러리 없이 쪽 그림을 바로 보여 준다. 그림이 하나라도 안 뜨면 원본 PDF 링크로 안내한다.
        const pagesEl=dlg.querySelector('.rt-doc-pages');
        const imgs=images.map((src,i)=>{const img=document.createElement('img');img.src=src;img.alt=`${title} ${i+1}쪽`;img.decoding='async';return img});
        if(!imgs.length){fail();return}
        pagesEl.replaceChildren(...imgs);
        state.ready=true;renderDocPages(dlg);
        Promise.all(imgs.map(img=>img.decode?img.decode():Promise.resolve())).then(()=>{if(dlg.rtDoc===state)status.remove()},()=>{if(dlg.rtDoc===state)fail()});
        return;
      }
      try{
        const lib=await loadPdfjs();
        const pdf=await lib.getDocument({url:href,isEvalSupported:false}).promise;
        if(dlg.rtDoc!==state)return;
        // 쪽 크기만 먼저 모두 읽는다(그리기보다 훨씬 빠름). 가로·세로가 섞인 문서도 자리 크기가 맞는다.
        const sizes=await Promise.all(Array.from({length:pdf.numPages},(_,i)=>pdf.getPage(i+1).then(page=>{const v=page.getViewport({scale:1});return {width:v.width,height:v.height}})));
        if(dlg.rtDoc!==state){pdf.destroy();return}
        state.pdf=pdf;state.sizes=sizes;state.ready=true;
        renderDocPages(dlg);
      }catch(error){
        if(dlg.rtDoc===state)fail();
      }
    }
    body.addEventListener('keydown',event=>{
      const filterBtn=event.target.closest('[data-product-filter]');
      if(filterBtn&&(event.key==='Enter'||event.key===' ')){event.preventDefault();filterBtn.click()}
    });
    body.addEventListener('input',event=>{
      if(!event.target.matches('[data-product-search]'))return;
      query=event.target.value.trim().toLowerCase();
      const caret=event.target.selectionStart;body.querySelector('.rt-pg-wrap').innerHTML=listView();
      const input=body.querySelector('[data-product-search]');input.focus();input.setSelectionRange(caret,caret);
    });
    // 제품정보 화면에서 로고를 누르면 확인 없이 구성기로 돌아간다(구성기 첫 화면 이동 확인은 구성기 화면에서만).
    document.addEventListener('click',event=>{
      if(!route().products||!event.target.closest('.rt-brand-lockup'))return;
      event.preventDefault();event.stopImmediatePropagation();location.hash='#matrix-configurator';
    },true);
    window.addEventListener('hashchange',()=>show(route()));
    show(route());
  })();
