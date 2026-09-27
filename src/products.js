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
    // 해상도 칸은 "4K"+"60Hz 4:4:4"처럼 짧게 쓴다(명세 6-B 4장). 원문은 사양 표에 그대로 남는다.
    // 크로마(4:4:4 등)가 해상도 행 자체에 없으면 overview·korean·english에서도 찾는다(같은 제품이 이미 밝힌 사실이라 새로 만드는 값이 아님).
    function shortResolution(item){
      const spec=(item.specifications||[]).find(s=>/해상도/.test(s.name));
      if(!spec)return null;
      const haystack=[spec.value,spec.condition,item.overview,item.korean,item.english].filter(Boolean).join(' ');
      const hz=(haystack.match(/(\d+)\s*Hz/i)||[])[1];
      const chroma=(haystack.match(/4:4:4|4:2:2|4:2:0/)||[])[0];
      const is8k=/7680|8k/i.test(haystack);
      const is4k=/4096|3840|4k/i.test(haystack);
      const value=is8k?'8K':is4k?'4K':spec.value.split(',')[0].split('(')[0].trim();
      const unit=[hz&&`${hz}Hz`,chroma].filter(Boolean).join(' ');
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
      const cardWord=(item.lineup||[]).some(entry=>/카드/.test(entry.kind))?'카드당':'보드당';
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
    const specTable=specs=>table(['구분','사양'],specs.map(spec=>[`<span class="rt-pg-spec-dot" style="display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px;background:${GROUP_DOT[spec.group]||'#8a94a6'}" title="${esc(spec.group)}"></span>${esc(spec.name)}`,`${esc(spec.value)}${spec.unit?` ${esc(spec.unit)}`:''}${verification(spec.verification)}${spec.condition?`<span class="rt-pg-note-line">${esc(spec.condition)}</span>`:''}`])).replace('class="rt-pg-tablewrap"','class="rt-pg-tablewrap rt-pg-spec-table"');

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

      // 멀티뷰 전용 출력(QMS-88UX의 9·10번 등): videoModes의 QUAD 요약 "출력 9·10번 전용"에서 번호를 읽어 매트릭스 출력과 분리된 별도 갈래로 그린다.
      const quadMode=(item.videoModes?.modes||[]).find(mode=>mode.name==='QUAD');
      const multiview=((quadMode?.summary||'').match(/출력\s*([\d·,\s]+)번\s*전용/)||[])[1]?.split(/[·,\s]+/).map(Number).filter(n=>n>=1&&n<=outN)||[];
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
      const topLabel=[bwSpec&&`${bwSpec.value}${bwSpec.unit||''}`,res&&[res.value,res.unit].filter(Boolean).join(' ')].filter(Boolean).join(' · ');
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
        const mvCaption=`${multiview.join('·')}번 각 4분할 · 합쳐서 최대 8입력`;
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
      const captionHalfWidth=Math.max(captionText.length,multiview.length?`${multiview.join('·')}번 각 4분할 · 합쳐서 최대 8입력`.length:0)*3.6+20;
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
      const distanceSpecs=(item.specifications||[]).filter(spec=>/전송거리/.test(spec.name));
      const cableName=isFiber?'광케이블':'HDBaseT(CATx)';
      const cableLabelFor=spec=>{
        const m=(spec.condition||'').match(/(BELDEN\s*)?([A-Z0-9]+)\s*\(([^)]+)\)/);
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
        bodyMarkup=`<text x="${width/2}" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#687386">조합 1 · XDM-CIS100·COS100 카드에 직결(전원 직접 연결, PSE 사용 불가)</text>`;
        bodyMarkup+=monitorIcon(iconX,row1Y,'소스 기기')+arrow(iconX+24,row1Y,leftBoxX-6,row1Y,COLOR_IN);
        bodyMarkup+=deviceBox(leftBoxX,row1Y-boxH/2,boxW,boxH,'XDM-CTR100','TX · 전원 직접 연결');
        bodyMarkup+=cableSeg(row1Y);
        bodyMarkup+=deviceBox(cardX,row1Y-boxH/2,boxW,boxH,'XDM-CIS100','입력 카드(HDBaseT)');
        bodyMarkup+=deviceBox(leftBoxX,row2Y-boxH/2,boxW,boxH,'XDM-COS100','출력 카드(HDBaseT)');
        bodyMarkup+=cableSeg(row2Y);
        bodyMarkup+=deviceBox(cardX,row2Y-boxH/2,boxW,boxH,'XDM-CTR100','RX · 전원 직접 연결');
        bodyMarkup+=arrow(cardX+boxW+6,row2Y,dstX-24,row2Y,COLOR_OUT)+monitorIcon(dstX,row2Y,'디스플레이');
        bodyMarkup+=`<text x="${width/2}" y="${combo2Y-56}" text-anchor="middle" font-size="11" font-weight="700" fill="#687386">조합 2 · HDBaseT 카드 없이 연장할 때(XDM HDMI 카드 연장·단독 1:1)</text>`;
        bodyMarkup+=monitorIcon(iconX,combo2Y,'소스 기기')+arrow(iconX+24,combo2Y,leftBoxX-6,combo2Y,COLOR_IN);
        bodyMarkup+=deviceBox(leftBoxX,combo2Y-boxH/2,boxW,boxH,'XDM-CTR100 PSE','전원 연결(POE 공급측)');
        bodyMarkup+=cableSeg2(leftBoxX,cardX,combo2Y);
        bodyMarkup+=deviceBox(cardX,combo2Y-boxH/2,boxW,boxH,'XDM-CTR100','전원 케이블 불필요(PD)');
        bodyMarkup+=arrow(cardX+boxW+6,combo2Y,dstX-24,combo2Y,COLOR_OUT)+monitorIcon(dstX,combo2Y,'디스플레이');
        bodyMarkup+=`<text x="${width/2}" y="${combo2Y+boxH/2+22}" text-anchor="middle" font-size="10" fill="#687386">TX/RX는 각 기기 DIP 스위치로 선택 · CIS100·COS100 카드에 직결할 때는 이 조합 대신 CTR100에 전원을 직접 연결</text>`;
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
    function connectionDiagram(item){
      if(item.group==='cable')return cableDiagram(item);
      if(item.group==='distribution'||item.group==='integrated')return ioFlowDiagram(item);
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
      const photo=(item.images||[]).find(img=>img.role===map.image);
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
      const seg=map.title?`<span class="rt-pg-seg"><span class="rt-pg-on">${esc(map.title)}</span></span>`:tall?`<span class="rt-pg-seg" role="group" aria-label="사진 면 선택"><button type="button" data-pm-side="front" aria-pressed="false">정면</button><button type="button" class="rt-pg-on" data-pm-side="rear" aria-pressed="true">${sideLabel}</button></span>`:'';
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
    function headerBlock({icon,title,subtitle,back,diagram,cta,print=true}){
      return `<header class="rt-pg-top"><div class="rt-pg-brandmark"><div class="rt-pg-swatch">${icon}</div><div class="rt-pg-title"><h1 id="rt-pg-title">${title}</h1><p class="rt-pg-sub">${subtitle}</p></div></div>
      <div class="rt-pg-toolbar">${back?`<a class="rt-pg-btn" href="#products">← 제품 목록</a>`:''}${diagram?`<button type="button" class="rt-pg-btn" data-open-diagram>제조사 원본 다이어그램</button>`:''}${print?`<button type="button" class="rt-pg-btn" data-print>인쇄 / PDF</button>`:''}${cta||''}</div></header>`;
    }
    function listView(){
      const items=index.products.filter(matches);
      const counts=Object.fromEntries(groups.map(([id])=>[id,id==='all'?index.products.length:index.products.filter(item=>item.group===id).length]));
      return `${headerBlock({icon:GROUP_ICON.series,title:'알티컴 제품정보',subtitle:'RTCOM PRODUCTS · 매트릭스·분배기·전송기·케이블',back:false,print:false})}
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
        ${io.length?`<div><h4>입출력 단자</h4>${table(['분류','방향','단자','수량','신호','조건'],io)}</div>`:''}
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
    // 매뉴얼이 없는 QMS-44UX 전용 이름(CASCADE1·4CH-POP·2CH-SIDE·3CH-MODE1) 4종과 WALL·DUAL 레이아웃은 이름 뜻에 맞춰 만든 도식이다.
    const LAYOUT_SHAPES={
      'QUAD':[[1,0,0,50,50],[2,50,0,50,50],[3,0,50,50,50],[4,50,50,50,50]],
      '3-BOTTOM':[[1,0,0,100,50],[2,0,50,33.33,50],[3,33.33,50,33.34,50],[4,66.67,50,33.33,50]],
      '3-SIDE RIGHT':[[1,0,0,70,100],[2,70,0,30,33.33],[3,70,33.33,30,33.34],[4,70,66.67,30,33.33]],
      '3-SIDE LEFT':[[2,0,0,30,33.33],[3,0,33.33,30,33.34],[4,0,66.67,30,33.33],[1,30,0,70,100]],
      'HORIZONTAL PBP':[[1,0,0,50,100],[2,50,0,50,100]],
      'VERTICAL PBP':[[1,0,0,100,50],[2,0,50,100,50]],
      'QUAD PBP, PIP':[[1,0,0,50,100],[2,28,62,20,32],[3,50,0,50,100],[4,78,62,20,32]],
      'SINGLE SELECT A PORT':[[1,0,0,100,100]],
      '3CH-MODE2':[[3,0,0,30,100],[1,30,0,40,50],[2,30,50,40,50],[4,70,0,30,100]],
      'USER MODE 1':[[1,0,0,65,100],[2,65,0,35,50],[3,65,50,35,50]],
      'USER MODE 2':[[1,25,0,50,40],[2,0,40,50,60],[3,50,40,50,60]],
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
      'PBP-FULL':[[1,0,0,50,100],[2,50,0,50,100]],
      'PIP':[[1,0,0,100,100],[2,62,62,32,32]],
      'USER MODE':[[1,0,0,65,100],[2,65,0,35,50],[3,65,50,35,50]],
      'CASCADE1':[[1,0,0,100,100],[2,50,50,40,40]],
      '4CH-POP':[[1,0,0,50,100],[2,28,62,20,32],[3,50,0,50,100],[4,78,62,20,32]],
      '2CH-SIDE':[[1,0,0,50,100],[2,50,0,50,100]],
      '3CH-MODE1':[[1,0,0,65,100],[2,65,0,35,50],[3,65,50,35,50]],
      'USER MODE 3':[[3,0,0,30,100],[1,30,0,40,50],[2,30,50,40,50],[4,70,0,30,100]]
    };
    function layoutShapeSvg(name){
      const cells=LAYOUT_SHAPES[String(name||'').trim().toUpperCase()];
      if(!cells)return '<div class="rt-pg-layout-missing">도해 준비 중</div>';
      const rects=cells.map(([n,x,y,w,h])=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}"/><text x="${x+w/2}" y="${y+h/2}">${n}</text></g>`).join('');
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="${esc(name)} 화면 구성">${rects}</svg>`;
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
            ${mode.layouts?.length?`<span class="rt-pg-vmode-count">레이아웃 ${mode.layouts.length}종</span><div class="rt-pg-vmode-chips">${mode.layouts.map((layout,index)=>`<button type="button" class="rt-pg-layout-chip${index===0?' on':''}" data-layout-chip data-layout="${esc(layout)}">${esc(layout)}</button>`).join('')}</div><div class="rt-pg-layout-preview" data-layout-preview>${layoutShapeSvg(mode.layouts[0])}<small data-layout-name>${esc(mode.layouts[0])}</small></div>`:''}
          </div>`).join('')}</div>
        </div>
      </section>`;
    }

    // ---- 전면 컨트롤 강조(EDID 로터리 스위치 등, 0.35). edidSwitch가 있을 때만 전체 폭 카드로 보여준다 ----
    // ---- EDID 로터리 대표 설정 그림(0.59, 사용자 요청 "EDID 로터리 스위치도 대표적인 것을 DIP 스위치처럼 예상 이미지 만들어봐줘") ----
    // 제품 사진과 같은 파란 16단(0~F) 로터리를 그리고, 화살표가 고른 코드를 가리키게 한다. 0이 위쪽이고 시계 방향으로 1, 2 … F 순서다.
    // opts.name: 화면 읽기 이름(기본 "EDID 로터리", 오디오 설정은 "MODE 로터리"). opts.dark·opts.box: 어두운 패널 안에 넣을 때 쓰는 선택(현재 미사용).
    function rotaryGraphic(code,opts={}){
      const idx=parseInt(code,16);
      const S=112,c=S/2,labels='0123456789ABCDEF'.split('');
      const at=(i,r)=>{const a=(i*22.5-90)*Math.PI/180;return [c+r*Math.cos(a),c+r*Math.sin(a)]};
      let body=`<circle cx="${c}" cy="${c}" r="34" fill="#1E7BE6"/><circle cx="${c}" cy="${c}" r="34" fill="none" stroke="#0B4FA8" stroke-width="2"/>`;
      for(let i=0;i<16;i++){const [x1,y1]=at(i,30),[x2,y2]=at(i,34);body+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#0B4FA8" stroke-width="1.4"/>`;}
      body+=`<circle cx="${c}" cy="${c}" r="20" fill="#E9F2FF" stroke="#0B4FA8" stroke-width="1.5"/>`;
      const deg=idx*22.5;
      body+=`<g transform="rotate(${deg} ${c} ${c})"><rect x="${c-3}" y="${c-16}" width="6" height="32" rx="2" fill="#1C1C1E"/><path d="M${c} ${c-27}l-6 9h12z" fill="#1C1C1E"/></g>`;
      labels.forEach((label,i)=>{const [x,y]=at(i,47);const on=i===idx;body+=on?`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#007AFF"/><text x="${x.toFixed(1)}" y="${(y+3.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${label}</text>`:`<text x="${x.toFixed(1)}" y="${(y+3.2).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="600" fill="${opts.dark?'#C7C7CC':'#8A8A8E'}">${label}</text>`;});
      if(opts.box){const [bx,by,bs]=opts.box;return `<svg x="${bx}" y="${by}" width="${bs}" height="${bs}" viewBox="0 0 ${S} ${S}">${body}</svg>`;}
      return `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-label="${esc(opts.name||'EDID 로터리')} ${esc(code)}번">${body}</svg>`;
    }
    // 대표 설정: 기본값 코드(edidSwitch.default의 "0 = …" 앞 글자)와 자주 쓰는 코드(table[].highlight)를 코드 순으로 최대 4개 보여준다.
    function edidExamples(es){
      const def=(String(es.default||'').match(/^\s*([0-9A-F])\s*=/i)||[])[1]?.toUpperCase();
      const picks=es.table.filter(row=>row.highlight||String(row.code).toUpperCase()===def).slice(0,4);
      if(!picks.length)return '';
      return `<div class="rt-pg-rotary-row" aria-label="EDID 로터리 대표 설정">${picks.map(row=>`<figure class="rt-pg-rotary${String(row.code).toUpperCase()===def?' is-default':''}">${rotaryGraphic(String(row.code).toUpperCase())}<figcaption><em>${esc(row.code)}번${String(row.code).toUpperCase()===def?' · 기본값':''}</em>${esc(row.function)}</figcaption></figure>`).join('')}</div>`;
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
    function dipGraphic(count,target,on,onUp){
      const sw=20,gap=8,x0=34,y0=10,h=44,W=x0+count*(sw+gap)+4,H=y0+h+22;
      let body=`<rect x="${x0-8}" y="${y0-6}" width="${count*(sw+gap)+8}" height="${h+12}" rx="4" fill="#D7302B"/>`;
      body+=`<text x="4" y="${y0+12}" font-size="11" font-weight="800" fill="#1c1c1e">ON</text><path d="M14 ${y0+h-2}V${y0+18}M10 ${y0+22}l4-5 4 5" fill="none" stroke="#1c1c1e" stroke-width="1.6"/>`;
      for(let i=1;i<=count;i++){
        const x=x0+(i-1)*(sw+gap),active=i===target,up=onUp?on:!on;
        body+=`<rect x="${x}" y="${y0}" width="${sw}" height="${h}" rx="2" fill="${active?'#6E1411':'#B9534F'}"/>`;
        if(active)body+=`<rect x="${x+2}" y="${up?y0+2:y0+h-20}" width="${sw-4}" height="18" rx="2" fill="#fff" stroke="#007AFF" stroke-width="2"/>`;
        body+=`<text x="${x+sw/2}" y="${y0+h+17}" text-anchor="middle" font-size="12" font-weight="${active?800:600}" fill="${active?'#1c1c1e':'#a1a1a6'}">${i}</text>`;
      }
      return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="딥 스위치 ${target}번 ${on?'ON':'OFF'}">${body}</svg>`;
    }
    function dipSwitchSection(item){
      const ds=item.dipSwitch;
      if(!ds||!ds.rows?.length)return '';
      const idx=String(6+(item.videoModes?1:0)+(item.edidSwitch?.table?.length?1:0)+(item.audioMux?.modes?.length?1:0)).padStart(2,'0');
      const state=(label,on,st,n)=>`<figure class="rt-pg-dip-state${on?' is-on':''}">${dipGraphic(ds.count,n,on,ds.onUp!==false)}<figcaption><em>${label}${st.name?` · ${esc(st.name)}`:''}</em>${esc(st.text)}</figcaption></figure>`;
      const rows=ds.rows.map(row=>`<div class="rt-pg-dip-row"><div class="rt-pg-dip-head"><b>${row.n}번</b><span>${esc(row.title)}</span></div><div class="rt-pg-dip-states">${state('OFF',false,row.off,row.n)}${state('ON',true,row.on,row.n)}</div>${row.note?`<p class="rt-pg-dip-note">${esc(row.note)}</p>`:''}</div>`).join('');
      return `<section class="rt-pg-card rt-pg-dip" style="margin-top:18px"><h2><span class="rt-pg-idx">${idx}</span>딥 스위치 설정 <span class="rt-pg-note">— 전면 ${esc(ds.label||'딥 스위치')} · ${ds.onUp!==false?'위쪽':'아래쪽'}이 ON</span></h2><div class="rt-pg-dip-rows">${rows}</div>${ds.apply?`<p class="rt-pg-hint">※ ${esc(ds.apply)}</p>`:''}${ds.note?`<p class="rt-pg-hint">※ ${esc(ds.note)}</p>`:''}</section>`;
    }
    // ---- 오디오 설정(병합 MUX·추출 DEMUX 중 선택, HD-13U). 매뉴얼 문장을 "이럴 때·연결·소리가 나오는 곳·확인 방법"으로 풀어 두 칸으로 보여준다 ----
    // HDS-21U·HDS-42MU는 딥 스위치 1번으로 고르므로 이 카드 대신 딥 스위치 설정 카드에서 함께 설명한다(사용자 요청 2026-09-27).
    // ---- 오디오 설정 전면 패널 그림(0.61, 사용자 요청 "HD-13U 07 오디오 설정 부분을 DIP 이미지처럼 불 켜짐을 만들어줘") ----
    // 로터리를 panel.rotary.value에 맞추고 SET 버튼을 누르는 모습과, 확인용 LED(panel.target)가 깜빡이는지(mode.led "blink") 켜진 채인지("steady")를 그린다.
    // 깜빡임은 CSS 애니메이션(rt-pg-led-blink)으로 보여주고, 움직임 줄이기 설정이나 인쇄에서도 알 수 있게 LED 둘레에 빛 표시를 함께 그린다.
    function audioPanelGraphic(panel,mode){
      const leds=panel.leds||[];
      // 로터리는 EDID 설정 카드의 대표 설정 그림과 똑같은 밝은 칸(rt-pg-rotary)으로 따로 두고, 어두운 패널에는 SET 버튼과 LED만 그린다(사용자 요청 2026-09-27 "이 느낌 로터리 써줘").
      const value=String(panel.rotary?.value??'0').toUpperCase();
      const W=250,H=92,py=8,ph=62,cy=py+ph/2-4,labelY=py+ph-8,bx=26;
      let body=`<rect x="2" y="${py}" width="${W-4}" height="${ph}" rx="8" fill="#1C1C1E"/>`;
      body+=`<circle cx="${bx}" cy="${cy}" r="8" fill="#48484A" stroke="#8E8E93" stroke-width="1"/><circle cx="${bx}" cy="${cy}" r="12" fill="none" stroke="#007AFF" stroke-width="2"/>`;
      body+=`<text x="${bx}" y="${labelY}" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff">${esc(panel.button||'SET')}</text><text x="${bx}" y="${py+ph+15}" text-anchor="middle" font-size="10" font-weight="800" fill="#007AFF">누름</text>`;
      const x0=66,gap=(W-22-x0)/Math.max(1,leds.length-1);
      leds.forEach((label,i)=>{
        const x=x0+i*gap,on=label===panel.target,blink=on&&mode.led==='blink';
        if(on)body+=`<circle cx="${x}" cy="${cy}" r="10" fill="#34C759" opacity=".22"/>`;
        if(blink)body+=`<g stroke="#34C759" stroke-width="1.6" stroke-linecap="round">${[0,60,120,180,240,300].map(a=>{const r1=8.5,r2=12.5,rad=a*Math.PI/180;return `<path d="M${(x+r1*Math.cos(rad)).toFixed(1)} ${(cy+r1*Math.sin(rad)).toFixed(1)}L${(x+r2*Math.cos(rad)).toFixed(1)} ${(cy+r2*Math.sin(rad)).toFixed(1)}"/>`}).join('')}</g>`;
        body+=`<circle cx="${x}" cy="${cy}" r="4.5" fill="${on?'#34C759':'#2F3A31'}"${blink?' class="rt-pg-led-blink"':''}/>`;
        body+=`<text x="${x}" y="${labelY}" text-anchor="middle" font-size="8" font-weight="${on?800:600}" fill="${on?'#fff':'#8E8E93'}">${esc(label)}</text>`;
        if(on)body+=`<text x="${x}" y="${py+ph+15}" text-anchor="middle" font-size="10" font-weight="800" fill="${blink?'#248A3D':'#6E6E73'}">${blink?'깜빡임':'깜빡이지 않음'}</text>`;
      });
      const label=`${panel.rotary?.label||'MODE'} 로터리 ${value}번 + ${panel.button||'SET'} 누름 → ${panel.target} LED ${mode.led==='blink'?'깜빡임':'깜빡이지 않음'}`;
      return `<div class="rt-pg-audio-panelrow" role="img" aria-label="${esc(label)}"><figure class="rt-pg-rotary rt-pg-rotary-mini">${rotaryGraphic(value,{name:`${panel.rotary?.label||'MODE'} 로터리`})}<figcaption><em>${esc(panel.rotary?.label||'MODE')} ${esc(value)}번</em>선택</figcaption></figure><span class="rt-pg-audio-plus" aria-hidden="true">+</span><svg class="rt-pg-audio-panel" viewBox="0 0 ${W} ${H}" aria-hidden="true">${body}</svg></div>`;
    }
    function audioMuxSection(item){
      const am=item.audioMux;
      if(!am||!am.modes?.length)return '';
      const idx=String(6+(item.videoModes?1:0)+(item.edidSwitch?.table?.length?1:0)).padStart(2,'0');
      const arrow='<svg viewBox="0 0 16 10" width="16" height="10" aria-hidden="true"><path d="M1 5h12M9 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      return `<section class="rt-pg-card rt-pg-audio" style="margin-top:18px"><h2><span class="rt-pg-idx">${idx}</span>오디오 설정 <span class="rt-pg-note">— 병합과 추출 중 하나를 골라 쓴다</span></h2>
        ${am.howTo?`<p class="rt-pg-audio-how">${esc(am.howTo)}</p>`:''}
        <div class="rt-pg-audio-modes">${am.modes.map(mode=>`<div class="rt-pg-audio-mode rt-pg-audio-${mode.name==='MUX'?'mux':'demux'}">
          <div class="rt-pg-audio-head"><b>${esc(mode.title)}</b><small>${esc(mode.name)}${mode.setting?` · ${esc(mode.setting)}`:''}</small></div>
          ${mode.flow?.length?`<div class="rt-pg-audio-flow">${mode.flow.map(step=>`<span>${esc(step)}</span>`).join(arrow)}</div>`:''}
          ${am.panel&&mode.led?audioPanelGraphic(am.panel,mode):''}
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
      // videoModes·audioMux 카드만 05 주요 기능 오른쪽에 붙이고, edidSwitch·dipSwitch는 전체 폭 아래에 둔다(사용자 요청 2026-09-27, 아래 이유 참고).
      const hasVideoModes=!!item.videoModes?.modes?.length;
      const hasAudioMux=!!item.audioMux?.modes?.length;
      let sideCard='',belowCards='';
      // edidSwitch는 사진+안내 2장+코드표(최대 12행)까지 있어 05 옆 좁은 칸(360px)에 넣으면 오른쪽 칸(02·03·기록)보다 훨씬 길어져 빈 공간이 크게 남는다(사용자 확인 2026-09-27 "06 EDID설정 깨진ㄷ").
      // videoModes·audioMux는 상대적으로 짧아 좁은 칸에 넣어도 균형이 맞으므로 이 둘만 05 옆에 붙이고, edidSwitch·dipSwitch는 항상 전체 폭 아래에 둔다.
      if(hasVideoModes){sideCard=videoModesSection(item);belowCards=edidSwitchSection(item)}
      // 오디오 설정(병합·추출 두 칸)도 좁은 칸에서는 오른쪽 칸이 잘리고, EDID 설정(06)보다 먼저 보여 번호가 07 → 06 순서로 뒤집혔다(사용자 지적 2026-09-27 "13U 07 오디오가 잘린다").
      // 그래서 EDID 설정이 있는 제품은 06 EDID → 07 오디오 순서로 둘 다 전체 폭 아래에 두고, EDID가 없을 때만 오디오 설정을 05 옆에 붙인다.
      else if(hasAudioMux&&!item.edidSwitch?.table?.length){sideCard=audioMuxSection(item)}
      else if(hasAudioMux){belowCards=`${edidSwitchSection(item)}${audioMuxSection(item)}`}
      else{belowCards=edidSwitchSection(item)}
      belowCards+=dipSwitchSection(item);
      // 휴대폰(1000px 이하)에서는 .rt-pg-col이 사라지고 rt-pg-col-mobile-N 순서로만 쌓이므로, sideCard도 순서 클래스가 있어야 05 다음(01~05, 06, 07 기록)으로 나온다(없으면 order:0이라 맨 앞으로 감).
      if(sideCard)sideCard=sideCard.replace('class="rt-pg-card', 'class="rt-pg-card rt-pg-col-mobile-6');
      return `${headerBlock({icon:GROUP_ICON[item.group],title:noBreak(item.productName),subtitle:`${esc(subtitleFor(item))} · RTCOM`,back:true,diagram:!!photo})}
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
          ${portSection?`<section class="rt-pg-card rt-pg-col-mobile-2"><h2><span class="rt-pg-idx">02</span>Port Map <span class="rt-pg-note">— ${item.portMap?'실제 제품 사진 기준':'입출력 표 기준'}</span></h2>${portSection}</section>`:''}
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
      const cardRow=(card,isOut)=>{
        const [model,desc,count,sig]=card;
        const linked=CARD_EXTENDER_LABEL[model];
        return `<div class="rt-pg-cardrow"><img src="output/design/assets/cards/${encodeURIComponent(model)}.webp" alt="" loading="lazy"><div><b>${esc(model)}</b><span>${esc(desc)}${linked?` · ↔ ${esc(linked)}`:''}</span></div><span class="rt-pg-pc${isOut?' rt-pg-out':''}">${esc(count)}포트</span></div>`;
      };
      const SIG_COLOR={HDMI:'var(--pg-sig-hdmi)',DP:'var(--pg-sig-dp)',SDI:'var(--pg-sig-sdi)',CAT:'var(--pg-sig-cat)',FIBER:'var(--pg-sig-fiber)'};
      const SIG_NAME={HDMI:'HDMI',DP:'DisplayPort',SDI:'SDI',CAT:'HDBaseT·CATx',FIBER:'광'};
      const legendKeys=[...new Set([...inCards,...outCards].map(card=>card[3]))];
      const arch=seriesSignalSvg(item.name||family,inCards,outCards,SIG_COLOR);
      return `${headerBlock({icon:GROUP_ICON.series,title:noBreak(item.productName),subtitle:`${esc(subtitleFor(item))} · RTCOM`,back:true,cta:`<a class="rt-pg-btn rt-pg-primary" href="#matrix-configurator" data-configure-family="${esc(family)}">${esc(family)} 구성기에서 구성하기 →</a>`})}
      <div class="rt-pg-cols">
        <div class="rt-pg-col">
          <section class="rt-pg-card rt-pg-col-mobile-1"><h2><span class="rt-pg-idx">01</span>한눈에 보기</h2><p class="rt-pg-lead">${leadFor(item)}</p>${factsList(facts)}</section>
          <section class="rt-pg-card rt-pg-col-mobile-5"><h2><span class="rt-pg-idx">05</span>시리즈 사양</h2>${specTable((item.specifications||[]).map(spec=>({...spec,name:spec.name})))}</section>
          <section class="rt-pg-card rt-pg-col-mobile-6"><h2><span class="rt-pg-idx">06</span>주요 기능</h2><ul class="rt-pg-checks" data-feature-list>${featureItems.slice(0,featureShown).map(feature=>`<li><i><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.3l2.6 2.5L10 3.4" fill="none" stroke="#fff" stroke-width="2"/></svg></i><span>${esc(feature.text)}</span></li>`).join('')}</ul>${featureItems.length>featureShown?`<button type="button" class="rt-pg-more" data-more-features>기능 ${featureItems.length-featureShown}개 더 보기 ›</button><ul class="rt-pg-checks" data-feature-more hidden>${featureItems.slice(featureShown).map(feature=>`<li><i><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.3l2.6 2.5L10 3.4" fill="none" stroke="#fff" stroke-width="2"/></svg></i><span>${esc(feature.text)}</span></li>`).join('')}</ul>`:''}</section>
        </div>
        <div class="rt-pg-col">
          <section class="rt-pg-card rt-pg-col-mobile-2"><h2><span class="rt-pg-idx">02</span>신호 구성 <span class="rt-pg-note">— 입력 카드 → 메인프레임 → 출력 카드</span></h2>${arch}<ul class="rt-pg-legend">${legendKeys.map(key=>`<li><i style="background:${SIG_COLOR[key]||'#8A8A8E'}"></i>${esc(SIG_NAME[key]||key)}</li>`).join('')}<li><i style="background:transparent;border:1.5px dashed #8A8A8E"></i>전송기(연동)</li></ul></section>
          <section class="rt-pg-card rt-pg-col-mobile-3"><h2><span class="rt-pg-idx">03</span>메인프레임 <span class="rt-pg-note">— ${frames.length}종 · 막대는 랙 높이</span></h2><div class="rt-pg-frames">${frames.map(frame=>{const slug=frame.model.toLowerCase();const hasPhoto=!NO_FRAME_PHOTO.has(frame.model);return `<div class="rt-pg-frame"><div class="rt-pg-ph">${hasPhoto?`<img src="output/design/assets/frames/${slug}-front.webp" alt="">`:'<em>사진 준비 중</em>'}</div><b>${esc(frame.model)}</b><small>${esc((frame.summary||'').split(' · ')[0])} · ${frame.rackUnits}U</small><div class="rt-pg-ru"><i style="width:${Math.max(8,frame.rackUnits/maxRU*100)}%"></i></div></div>`}).join('')}</div></section>
          <section class="rt-pg-card rt-pg-col-mobile-4"><h2><span class="rt-pg-idx">04</span>카드 라인업 <span class="rt-pg-note">— 입력 ${inCards.length} · 출력 ${outCards.length}</span></h2><div class="rt-pg-cards2"><div class="rt-pg-cardcol"><h3>입력</h3>${inCards.map(card=>cardRow(card,false)).join('')}</div><div class="rt-pg-cardcol"><h3>출력</h3>${outCards.map(card=>cardRow(card,true)).join('')}</div></div></section>
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
    function initDiagramScroll(container){
      container.querySelectorAll('.rt-pg-svg-wrap').forEach(canvas=>{
        const update=()=>{
          const hasMore=canvas.scrollWidth-canvas.clientWidth-canvas.scrollLeft>4;
          canvas.classList.toggle('rt-has-more',hasMore);
        };
        update();
        canvas.addEventListener('scroll',update,{passive:true});
      });
    }
    window.addEventListener('resize',()=>initDiagramScroll(body));
    function show(state){
      view.hidden=!state.products;configurator.hidden=state.products;
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
    body.addEventListener('click',event=>{
      const filterBtn=event.target.closest('[data-product-filter]');
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
      const moreBtn=event.target.closest('[data-more-features]');
      if(moreBtn){const more=body.querySelector('[data-feature-more]');if(more){more.hidden=false;moreBtn.hidden=true}return}
      const layoutChip=event.target.closest('[data-layout-chip]');
      if(layoutChip){
        const chips=layoutChip.parentElement;
        chips.querySelectorAll('[data-layout-chip]').forEach(btn=>btn.classList.toggle('on',btn===layoutChip));
        const preview=chips.nextElementSibling;
        if(preview?.matches('[data-layout-preview]')){
          preview.innerHTML=`${layoutShapeSvg(layoutChip.dataset.layout)}<small data-layout-name>${esc(layoutChip.dataset.layout)}</small>`;
        }
        return;
      }
    });
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
