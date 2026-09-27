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
    const matches=item=>(filter==='all'||item.group===filter)&&(!query||[item.productName,item.model,item.english,item.korean,...(item.categories||[])].join(' ').toLowerCase().includes(query));
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
    const specTable=specs=>table(['구분','사양'],specs.map(spec=>[`<span class="rt-pg-spec-dot" style="display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px;background:${GROUP_DOT[spec.group]||'#8a94a6'}" title="${esc(spec.group)}"></span>${esc(spec.name)}`,`${esc(spec.value)}${spec.unit?` ${esc(spec.unit)}`:''}${verification(spec.verification)}${spec.condition?`<span class="rt-pg-note-line">${esc(spec.condition)}</span>`:''}`]));

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
      // 오디오 입력은 io(Audio 그룹)에 있으면 그것을, 없으면 overview의 "오디오 병합/삽입" 문구를 근거로 인정한다(HD-210U·HD-13U 등 이미 개요에 있는 사실).
      const audioIn=io.find(port=>port.direction==='IN'&&port.group==='Audio')||(/오디오\s*(병합|삽입)/.test(item.overview||'')?{signal:'Analog Audio'}:null);
      // 입력·출력이 모두 여럿이면 매트릭스 전환(각 출력이 독립), 출력이 1개면 여러 입력 중 하나를 고르는 선택기다.
      const isMatrix=inN>1&&outN>1;
      const A=COLOR_IN,V='#5E5CE6',P=COLOR_OUT,PI='#8944AB',M='#8A8A8E';
      const sigName=(videoIn.connector.match(/^[A-Za-z]+/)||['HDMI'])[0];

      const chipW=104,chipH=34,chipVGap=12,leftX=10,topPad=20;
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

      const nodeX=leftX+chipW+70;
      let nodeRight;
      if(inN>1||isMatrix){
        chipYs.forEach(y=>{
          const cy=y+chipH/2;
          bodyMarkup+=`<path d="M${leftX+chipW} ${cy}C${leftX+chipW+32} ${cy} ${leftX+chipW+32} ${midY} ${nodeX-22} ${midY}" fill="none" stroke="${A}" stroke-width="3"/>`;
        });
        if(audioIn)bodyMarkup+=`<path d="M${leftX+chipW} ${audioY+audioH/2}C${leftX+chipW+42} ${audioY+audioH/2} ${leftX+chipW+52} ${midY+42} ${nodeX} ${midY+42}" fill="none" stroke="${M}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
        if(isMatrix){
          const boxW=68,boxH=Math.max(52,chipYs.length*(chipH+chipVGap)-chipVGap);
          bodyMarkup+=`<rect x="${nodeX-boxW/2}" y="${midY-boxH/2}" width="${boxW}" height="${boxH}" rx="14" fill="#fff" stroke="${A}" stroke-width="3"/><text x="${nodeX}" y="${midY+5}" text-anchor="middle" font-size="12" font-weight="700" fill="${A}">매트릭스</text>`;
          nodeRight=nodeX+boxW/2;
        }else{
          bodyMarkup+=`<circle cx="${nodeX}" cy="${midY}" r="21" fill="#fff" stroke="${A}" stroke-width="3"/><path d="M${nodeX-10} ${midY}h20M${nodeX+4} ${midY-7}l7 7-7 7" fill="none" stroke="${A}" stroke-width="2.6" stroke-linecap="round"/><text x="${nodeX}" y="${midY+41}" text-anchor="middle" font-size="11" font-weight="600" fill="${M}">${inN}개 중 1개 선택</text>`;
          nodeRight=nodeX+21;
        }
      }else{
        nodeRight=leftX+chipW;
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
      const protoBits=[videoIn.protocol,hdcp&&(hdcpVersion?`HDCP ${hdcpVersion}`:'HDCP'),audioIn&&'오디오 병합'].filter(Boolean);
      if(protoBits.length)bodyMarkup+=`<text x="${(bandX1+bandX2)/2}" y="${bandY+28}" text-anchor="middle" font-size="11" font-weight="600" fill="${M}">${svgEsc(protoBits.join(' · '))}</text>`;

      const cols=Math.min(outN,5),rows=Math.ceil(outN/cols);
      const cellW=32,cellH=23,cellGap=8,panelPad=14;
      const gridW=cols*cellW+(cols-1)*cellGap,gridH=rows*(cellH+13)+(rows-1)*cellGap;
      const panelX=bandX2+20,panelW=gridW+panelPad*2,panelH=gridH+panelPad*2+10;
      const panelY=Math.max(10,bandY-panelH/2);
      bodyMarkup+=`<rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="16" fill="rgba(137,68,171,.09)"/>`;
      // 멀티뷰 전용 출력(QMS-88UX의 9·10번 등): videoModes의 QUAD 요약 "출력 9·10번 전용"에서 번호를 읽어 4분할 화면으로 따로 그린다.
      const quadMode=(item.videoModes?.modes||[]).find(mode=>mode.name==='QUAD');
      const multiview=((quadMode?.summary||'').match(/출력\s*([\d·,\s]+)번\s*전용/)||[])[1]?.split(/[·,\s]+/).map(Number).filter(n=>n>=1&&n<=outN)||[];
      for(let i=0;i<outN;i++){
        const c=i%cols,r=Math.floor(i/cols);
        const x=panelX+panelPad+c*(cellW+cellGap),y=panelY+panelPad+r*(cellH+13+cellGap)+8;
        const mv=multiview.includes(i+1);
        bodyMarkup+=`<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" fill="${mv?'#F3EEFF':'#fff'}" stroke="${P}" stroke-width="1.8"/>${mv?`<path d="M${x+cellW/2} ${y+2}V${y+cellH-2}M${x+2} ${y+cellH/2}H${x+cellW-2}" stroke="${P}" stroke-width="1" opacity=".55"/>`:''}<path d="M${x+cellW/2} ${y+cellH}v5M${x+cellW/2-7} ${y+cellH+6}h14" stroke="${P}" stroke-width="1.6"/><text x="${x+cellW/2}" y="${y+cellH/2+3.5}" text-anchor="middle" font-size="9" font-weight="700" fill="${PI}">${i+1}</text>`;
      }
      const outCaption=outTotal>outN?`OUT 1–${outN} 외 ${outTotal-outN}개`:`OUT 1–${outN}`;
      const sameSignal=isMatrix?'독립 출력':'같은 영상';
      const matrixCount=outN-multiview.length;
      const captionText=multiview.length?`OUT 1–${matrixCount} 매트릭스 · ${multiview.join('·')} 멀티뷰`:`${outCaption} · ${sameSignal}`;
      bodyMarkup+=`<text x="${panelX+panelW/2}" y="${panelY+panelH+16}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${PI}">${svgEsc(captionText)}</text>`;

      // 캡션 글자가 출력 격자보다 넓을 수 있어(예: 매트릭스 전환 문구) SVG 너비에 여유를 둔다.
      const captionHalfWidth=captionText.length*3.6+20;
      const width=Math.max(panelX+panelW+20,panelX+panelW/2+captionHalfWidth+20);
      const height=Math.max(leftBottom+20,panelY+panelH+38,midY+70);
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
      const cableDistance=distanceSpecs.length?`최대 ${distanceSpecs.map(spec=>`${spec.value}${spec.unit||''}`).join(' / ')}`:'';
      const [txLabel,rxLabel]=isTransceiver?[item.model.split(' / ')[0],item.model.split(' / ')[0]]:(item.model.includes(' / ')?item.model.split(' / '):[item.model,item.model]);
      const pseCombo=item.id==='xdm-ctr100';
      let bodyMarkup,width,height,captions;
      if(pseCombo){
        width=980;
        const boxW=170,boxH=70;
        const iconX=60,leftBoxX=210,cardX=600,dstX=920;
        const row1Y=100,row2Y=220,combo2Y=390;
        height=460;
        const cableSeg=(y)=>`<path d="M${leftBoxX+boxW} ${y}L${cardX} ${y}" stroke="${cableColor}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><text x="${(leftBoxX+boxW+cardX)/2}" y="${y-14}" text-anchor="middle" font-size="10" font-weight="700" fill="${cableColor}">${svgEsc(cableName)}</text>${cableDistance?`<text x="${(leftBoxX+boxW+cardX)/2}" y="${y+22}" text-anchor="middle" font-size="9" fill="${cableColor}">${svgEsc(cableDistance)}</text>`:''}`;
        const cableSeg2=(x1,x2,y)=>`<path d="M${x1+boxW} ${y}L${x2} ${y}" stroke="${cableColor}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><text x="${(x1+boxW+x2)/2}" y="${y-14}" text-anchor="middle" font-size="10" font-weight="700" fill="${cableColor}">${svgEsc(cableName)} · 신호+전원 동시 공급</text>${cableDistance?`<text x="${(x1+boxW+x2)/2}" y="${y+22}" text-anchor="middle" font-size="9" fill="${cableColor}">${svgEsc(cableDistance)}</text>`:''}`;
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
        bodyMarkup+=`<path d="M${txX+boxW} ${midY}L${rxX} ${midY}" stroke="${cableColor}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><text x="${(txX+boxW+rxX)/2}" y="${midY-20}" text-anchor="middle" font-size="11" font-weight="700" fill="${cableColor}">${svgEsc(cableName)}</text>${cableDistance?`<text x="${(txX+boxW+rxX)/2}" y="${midY-6}" text-anchor="middle" font-size="10" fill="${cableColor}">${svgEsc(cableDistance)}</text>`:''}`;
        bodyMarkup+=deviceBox(rxX,midY-boxH/2,boxW,boxH,rxLabel,isTransceiver?'수신 모드':'수신기(RX)');
        bodyMarkup+=arrow(rxX+boxW+6,midY,dstX-24,midY,COLOR_OUT)+monitorIcon(dstX,midY,'디스플레이');
        captions=[[COLOR_IN,'입력(소스 → TX)'],[cableColor,cableName],[COLOR_OUT,'출력(RX → 디스플레이)']];
      }
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
    function portMapDiagram(item){
      const map=item.portMap;
      if(!map)return null;
      const photo=(item.images||[]).find(img=>img.role===map.image);
      if(!photo||!photo.resolution)return null;
      const [rw,rh]=photo.resolution.split(/[×x]/).map(Number);
      if(!rw||!rh)return null;
      const W=680,s=W/rw,X0=40,Y0=40,H=Y0*2+rh*s;
      const px=x=>X0+x*s;
      let svgBody=`<image href="${image(photo.file)}" x="${X0}" y="${Y0}" width="${W}" height="${rh*s}"/>`;
      // 위아래 두 줄로 단자가 놓인 후면(QMS-88UX 등)은 아랫줄 단자의 괄호를 사진 아래에 그린다(side:"bottom", 0.34 검수).
      const YB=Y0+rh*s;
      map.items.forEach(it=>{
        const x1=px(it.x1),x2=px(it.x2),cx=(x1+x2)/2;
        if(it.side==='bottom'){
          svgBody+=`<path d="M${x1} ${YB-8}V${YB+6}H${x2}V${YB-8}" fill="none" stroke="${COLOR_IN}" stroke-width="1.5"/><path d="M${cx} ${YB+6}V${YB+14}" stroke="${COLOR_IN}" stroke-width="1.5"/><circle cx="${cx}" cy="${YB+24}" r="10" fill="${COLOR_IN}"/><text x="${cx}" y="${YB+28}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${it.n}</text>`;
          return;
        }
        svgBody+=`<path d="M${x1} ${Y0+8}V${Y0-6}H${x2}V${Y0+8}" fill="none" stroke="${COLOR_IN}" stroke-width="1.5"/><path d="M${cx} ${Y0-6}V${Y0-14}" stroke="${COLOR_IN}" stroke-width="1.5"/><circle cx="${cx}" cy="${Y0-24}" r="10" fill="${COLOR_IN}"/><text x="${cx}" y="${Y0-20}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${it.n}</text>`;
      });
      const seg=`<span class="rt-pg-seg"><span class="${map.image==='Front'?'rt-pg-on':''}">정면</span><span class="${map.image==='Rear'?'rt-pg-on':''}">후면</span></span>`;
      const ports=`<div class="rt-pg-ports">${map.items.map(it=>`<div class="rt-pg-port"><b><span class="rt-pg-n">${it.n}</span>${esc(it.label)}</b>${esc(it.desc)}</div>`).join('')}</div>`;
      return `${seg}<div class="rt-pg-panel"><div class="rt-pg-svg-wrap"><svg viewBox="0 0 ${W+X0*2} ${H}" width="100%" role="img" aria-label="단자 지도">${svgBody}</svg></div></div>${ports}`;
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
      return `${headerBlock({icon:GROUP_ICON.series,title:'알티컴 제품정보',subtitle:'RTCOM PRODUCTS · 카탈로그(2026) 기준 매트릭스·분배기·전송기·케이블',back:false,print:false})}
      <section class="rt-pg-card"><div class="rt-pg-tools"><div class="rt-pg-seg" role="group" aria-label="제품 분류">${groups.map(([id,label])=>`<span data-product-filter="${id}" role="button" tabindex="0" aria-pressed="${filter===id}" class="${filter===id?'rt-pg-on':''}">${label} (${counts[id]})</span>`).join('')}</div><label class="rt-pg-search"><span class="rt-visually-hidden">제품 검색</span><input type="search" data-product-search placeholder="모델명·기능 검색 (예: HDMI, 광, 4K)" value="${esc(query)}"></label></div>
      <p class="rt-pg-count" role="status">${items.length}개 제품</p>
      ${items.length?`<ul class="rt-pg-grid">${items.map(item=>`<li><a class="rt-pg-gridcard" href="#products/${item.id}"><span class="rt-pg-photo">${item.cardImage?`<img src="${image(item.cardImage)}" alt="" loading="lazy">`:'<span aria-hidden="true">RTCOM</span>'}</span><span class="rt-pg-body"><span class="rt-pg-group">${esc(groupLabel[item.group])}${item.catalogPages?` · 카탈로그 ${esc(item.catalogPages)}쪽`:''}</span><strong>${esc(item.productName)}</strong><span class="rt-pg-card-lead">${esc(item.lead?firstSentence(item.lead).replace(/\*\*/g,''):item.korean)}</span>${reviewBadge(item)}</span></a></li>`).join('')}</ul>`:'<p class="rt-pg-empty">조건에 맞는 제품이 없습니다. 검색어를 지우거나 다른 분류를 선택하세요.</p>'}</section>`;
    }

    // ---- 기록·원본 영역(2-6) ----
    function recordSection(item,diagramHtml,photo){
      const io=(item.io||[]).map(port=>[esc(port.group),esc(directionLabel[port.direction]||port.direction),esc(port.connector),esc(port.quantity),`${esc(port.signal)}${port.protocol?` · ${esc(port.protocol)}`:''}${verification(port.verification)}`,esc(port.condition)]);
      const issues=item.issues||[];
      const sources=(item.sources||[]).map(source=>`${esc(source.name)}${source.page?` ${esc(source.page)}쪽`:''}${source.url&&/^https?:\/\//.test(source.url)?` — <a href="${esc(source.url)}" target="_blank" rel="noopener">열기 ↗</a>`:''}`);
      const count=io.length+issues.length+sources.length;
      return `<details class="rt-pg-record"${item.packageStatus==='REVIEW REQUIRED'?' open':''}><summary>자료 출처·검토 기록 (${count}건)${reviewBadge(item)}</summary><div class="rt-pg-record-body">
        ${photo?`<div id="rt-pg-diagram-photo"><h4>제조사 원본 다이어그램</h4><div class="rt-pg-diagram-photo"><img src="${image(photo.file)}" alt="${esc(photo.alt||`${item.productName} 연결 다이어그램`)}" loading="lazy"></div>${photo.note?`<p class="rt-pg-diagram-caption">${esc((photo.note||'').replace(/^[A-Za-z]+ · /,''))}</p>`:''}${photo.diagramMismatch?`<p class="rt-pg-diagram-mismatch"><b>표기 다름</b> ${esc(photo.diagramMismatch)}</p>`:''}</div>`:''}
        ${io.length?`<div><h4>입출력 단자</h4>${table(['분류','방향','단자','수량','신호','조건'],io)}</div>`:''}
        ${issues.length?`<div><h4>확인 사항</h4><ul>${issues.map(issue=>`<li data-status="${esc(issue.status)}"><b>${esc(issue.title)}</b> ${esc(issue.detail)}</li>`).join('')}</ul></div>`:''}
        <div><h4>출처</h4><p>${esc(item.verificationSummary)}</p>${sources.length?`<ul>${sources.map(source=>`<li>${source}</li>`).join('')}</ul>`:''}<p class="rt-pg-hint">공개 브로셔 수준 정보입니다. 최신 사양·납품 조건은 제조사 또는 서울영상테크에 확인하세요.</p></div>
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
            ${mode.layouts?.length?`<span class="rt-pg-vmode-count">레이아웃 ${mode.layouts.length}종</span><div class="rt-pg-vmode-chips">${mode.layouts.map(layout=>`<span>${esc(layout)}</span>`).join('')}</div>`:''}
          </div>`).join('')}</div>
        </div>
      </section>`;
    }

    // ---- 전면 컨트롤 강조(EDID 로터리 스위치 등, 0.35). edidSwitch가 있을 때만 전체 폭 카드로 보여준다 ----
    function edidSwitchSection(item){
      const es=item.edidSwitch;
      if(!es||!es.table?.length)return '';
      const photo=(item.images||[]).find(img=>img.role===es.image);
      if(!photo||!photo.resolution)return '';
      const [rw,rh]=photo.resolution.split(/[×x]/).map(Number);
      if(!rw||!rh)return '';
      const pct=(value,base)=>`${(value/base*100).toFixed(2)}%`;
      const stepsHtml=(es.steps||[]).map(step=>`<div class="rt-pg-edid-step"><b>${esc(step.title)}</b><ol>${step.items.map(text=>`<li>${esc(text)}</li>`).join('')}</ol></div>`).join('');
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
            ${stepsHtml?`<div class="rt-pg-edid-steps">${stepsHtml}</div>`:''}
            ${table(['코드','기능'],es.table.map(row=>[esc(row.code),esc(row.function)]))}
          </div>
        </div>
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
      return `${headerBlock({icon:GROUP_ICON[item.group],title:esc(item.productName),subtitle:`${esc(subtitleFor(item))} · RTCOM`,back:true,diagram:!!photo})}
      <div class="rt-pg-cols">
        <div class="rt-pg-col">
          <section class="rt-pg-card rt-pg-col-mobile-1"><h2><span class="rt-pg-idx">01</span>한눈에 보기</h2>
            <p class="rt-pg-lead">${leadFor(item)}</p>
            ${factsList(facts)}
            ${images.length?`<div class="rt-pg-gallery">${images.map(img=>`<figure><img src="${image(img.file)}" alt="${esc(img.alt||item.productName)}" loading="lazy"><figcaption>${esc(roleLabel[img.role]||img.role)}</figcaption></figure>`).join('')}</div>`:''}
            ${item.catalogPages?`<p class="rt-pg-hint"><span class="rt-pg-pill">카탈로그 46쪽판 ${esc(item.catalogPages)}쪽 대조</span></p>`:''}
            ${related.length?`<p class="rt-pg-hint"><b>관련 제품</b> ${related.map(link=>`<a href="#products/${link.target}">${esc(byId[link.target].productName)}</a>`).join(' · ')}</p>`:''}
          </section>
          <section class="rt-pg-card rt-pg-col-mobile-4"><h2><span class="rt-pg-idx">04</span>제품 사양</h2>${specTable(orderedSpecs)}</section>
          ${(item.features||[]).length?`<section class="rt-pg-card rt-pg-col-mobile-5"><h2><span class="rt-pg-idx">05</span>주요 기능</h2><ul class="rt-pg-checks">${item.features.map(feature=>`<li><i><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.3l2.6 2.5L10 3.4" fill="none" stroke="#fff" stroke-width="2"/></svg></i><span>${esc(feature.text)}</span></li>`).join('')}</ul></section>`:''}
        </div>
        <div class="rt-pg-col">
          ${diagram?`<section class="rt-pg-card rt-pg-col-mobile-2"><h2><span class="rt-pg-idx">02</span>신호 흐름</h2>${diagram}</section>`:''}
          ${portSection?`<section class="rt-pg-card rt-pg-col-mobile-3"><h2><span class="rt-pg-idx">03</span>단자 지도 <span class="rt-pg-note">— ${item.portMap?'실제 제품 사진 기준':'입출력 표 기준'}</span></h2>${portSection}</section>`:''}
          ${recordSection(item,diagram,photo)}
        </div>
      </div>
      ${videoModesSection(item)}${edidSwitchSection(item)}`;
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
      return `${headerBlock({icon:GROUP_ICON.series,title:esc(item.productName),subtitle:`${esc(subtitleFor(item))} · RTCOM`,back:true,cta:`<a class="rt-pg-btn rt-pg-primary" href="#matrix-configurator" data-configure-family="${esc(family)}">${esc(family)} 구성기에서 구성하기 →</a>`})}
      <div class="rt-pg-cols">
        <div class="rt-pg-col">
          <section class="rt-pg-card rt-pg-col-mobile-1"><h2><span class="rt-pg-idx">01</span>한눈에 보기</h2><p class="rt-pg-lead">${leadFor(item)}</p>${factsList(facts)}${item.catalogPages?`<p class="rt-pg-hint"><span class="rt-pg-pill">카탈로그 46쪽판 ${esc(item.catalogPages)}쪽 대조</span></p>`:''}</section>
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
      loadIndex().then(()=>state.id?loadDetail(state.id).then(item=>{
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
      const diagramBtn=event.target.closest('[data-open-diagram]');
      if(diagramBtn){const record=body.querySelector('.rt-pg-record');if(record){record.open=true;record.querySelector('#rt-pg-diagram-photo')?.scrollIntoView({behavior:'smooth',block:'start'})}return}
      const moreBtn=event.target.closest('[data-more-features]');
      if(moreBtn){const more=body.querySelector('[data-feature-more]');if(more){more.hidden=false;moreBtn.hidden=true}return}
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
