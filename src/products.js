  // 0.19 — 알티컴 공개 제품정보. 구성기와 같은 한 화면 안에서 #products 주소 조각(hash)으로만 전환한다(페이지 이동 없음 → 상대 경로·404 문제 없음).
  // 데이터: data/products/index.json(목록)과 data/products/<id>.json(상세, AV Portal 상세 JSON 호환). 비공개 AV Portal은 이 파일을 읽기만 한다.
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
    const image=file=>`output/design/assets/products/${encodeURIComponent(file)}`;
    let index=null,filter='all',query='';
    const details=new Map();
    const load=url=>fetch(url).then(response=>{if(!response.ok)throw new Error(`${response.status} ${url}`);return response.json()});
    const loadIndex=()=>index?Promise.resolve(index):load('data/products/index.json').then(data=>(index=data));
    const loadDetail=id=>details.has(id)?Promise.resolve(details.get(id)):load(`data/products/${encodeURIComponent(id)}.json`).then(data=>{details.set(id,data);return data});
    const route=()=>{const match=location.hash.match(/^#products(?:\/([a-z0-9-]+))?$/);return match?{products:true,id:match[1]||null}:{products:false}};
    const reviewBadge=item=>item.packageStatus==='REVIEW REQUIRED'?'<span class="rt-product-badge" title="카탈로그 안에서 표기가 서로 다른 항목이 있습니다">표기 검토 필요</span>':'';
    const matches=item=>(filter==='all'||item.group===filter)&&(!query||[item.productName,item.model,item.english,item.korean,...(item.categories||[])].join(' ').toLowerCase().includes(query));
    function listView(){
      const items=index.products.filter(matches);
      const counts=Object.fromEntries(groups.map(([id])=>[id,id==='all'?index.products.length:index.products.filter(item=>item.group===id).length]));
      return `<div class="rt-products-tools"><div class="rt-products-tabs" role="group" aria-label="제품 분류">${groups.map(([id,label])=>`<button type="button" data-product-filter="${id}" aria-pressed="${filter===id}">${label} <b>${counts[id]}</b></button>`).join('')}</div><label class="rt-products-search"><span class="rt-visually-hidden">제품 검색</span><input type="search" data-product-search placeholder="모델명·기능 검색 (예: HDMI, 광, 4K)" value="${esc(query)}"></label></div>
      <p class="rt-products-count" role="status">${items.length}개 제품</p>
      ${items.length?`<ul class="rt-product-grid">${items.map(item=>`<li><a class="rt-product-card" href="#products/${item.id}"><span class="rt-product-visual">${item.cardImage?`<img src="${image(item.cardImage)}" alt="" loading="lazy">`:'<span aria-hidden="true">RTCOM</span>'}</span><span class="rt-product-card-body"><span class="rt-product-group">${esc(groupLabel[item.group])}${item.catalogPages?` · 카탈로그 ${esc(item.catalogPages)}쪽`:''}</span><strong>${esc(item.productName)}</strong><span class="rt-product-en">${esc(item.english)}</span><span class="rt-product-ko">${esc(item.korean)}</span>${reviewBadge(item)}</span></a></li>`).join('')}</ul>`:'<p class="rt-products-empty">조건에 맞는 제품이 없습니다. 검색어를 지우거나 다른 분류를 선택하세요.</p>'}`;
    }
    const table=(head,rows)=>rows.length?`<div class="rt-product-table-wrap"><table class="rt-product-table"><thead><tr>${head.map(cell=>`<th scope="col">${cell}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>`<td data-label="${head[i]}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
    const verification=value=>value&&value!=='VERIFIED'?` <span class="rt-product-badge">${value==='REVIEW REQUIRED'?'검토 필요':esc(value)}</span>`:'';
    const isSizeSpec=spec=>spec.group==='Physical'&&(spec.name==='무게'||spec.name.startsWith('크기'));
    // 에이앤미디어(antez.co.kr) 알티컴 제품 페이지 표기(2026-09-27 확인)를 참고한 배치: 개요 첫 문장 굵게 → 한눈에 보기 칩(대역폭·해상도·입출력) →
    // 주요 기능 / 크기·무게를 나란히 → 제품 사양·입출력 표. 카탈로그 표기 충돌 표시(검토 필요 배지)는 그대로 유지한다.
    const shortConnector=connector=>(connector||'').replace(/\([^)]*\)/g,'').split(/[,/]/)[0].trim();
    function quickFacts(item){
      if(!['distribution','integrated','cable'].includes(item.group))return [];
      const specs=item.specifications||[];
      const bandwidth=specs.find(spec=>/대역폭/.test(spec.name));
      const resolution=specs.find(spec=>/해상도/.test(spec.name));
      const hdmiPorts=direction=>{
        const rows=(item.io||[]).filter(port=>port.direction===direction&&/^HDMI/i.test(port.connector||'')&&port.quantity);
        if(!rows.length)return null;
        const total=rows.reduce((sum,port)=>sum+(parseInt(port.quantity,10)||0),0);
        return total?`${total} ${shortConnector(rows[0].connector)} ${directionLabel[direction]}`:null;
      };
      const facts=[bandwidth&&{label:'대역폭',value:`${bandwidth.value}${bandwidth.unit?` ${bandwidth.unit}`:''}`},resolution&&{label:'해상도',value:resolution.value.split(',')[0].split('(')[0].trim()},hdmiPorts('IN')&&{label:'입력',value:hdmiPorts('IN')},hdmiPorts('OUT')&&{label:'출력',value:hdmiPorts('OUT')}].filter(Boolean);
      return facts.length>=2?facts.slice(0,4):[];
    }
    function detailView(item){
      const byId=Object.fromEntries(index.products.map(product=>[product.id,product]));
      const images=item.images||[];
      const allSpecs=item.specifications||[];
      const sizeSpecs=allSpecs.filter(isSizeSpec).map(spec=>[esc(spec.name.replace('크기(W×D×H)','크기')),`${esc(spec.value)}${spec.unit?` ${esc(spec.unit)}`:''}`]);
      const specs=allSpecs.filter(spec=>!isSizeSpec(spec)).map(spec=>[`${esc(spec.group)} · ${esc(spec.name)}`,`${esc(spec.value)}${spec.unit?` ${esc(spec.unit)}`:''}${verification(spec.verification)}`,esc(spec.condition)]);
      const io=(item.io||[]).map(port=>[esc(port.group),esc(directionLabel[port.direction]||port.direction),esc(port.connector),esc(port.quantity),`${esc(port.signal)}${port.protocol?` · ${esc(port.protocol)}`:''}${verification(port.verification)}`,esc(port.condition)]);
      const lineup=(item.lineup||[]).map(entry=>[`<b>${esc(entry.model)}</b>`,esc(entry.kind),esc(entry.summary)]);
      // 같은 대상이 여러 관계로 적혀 있으면(예: 시리즈 소속 + 카드 연동) 한 번만 보이고, 구체적인 연동 설명을 우선한다.
      const related=Object.values((item.related||[]).filter(link=>byId[link.target]).reduce((all,link)=>{if(!all[link.target]||link.relation!=='PART_OF_SERIES')all[link.target]=link;return all},{}));
      const issues=(item.issues||[]);
      const sources=(item.sources||[]).map(source=>`${esc(source.name)}${source.page?` ${esc(source.page)}쪽`:''}${source.url&&/^https?:\/\//.test(source.url)?` — <a href="${esc(source.url)}" target="_blank" rel="noopener">열기 ↗</a>`:''}`);
      const facts=quickFacts(item);
      const overviewParagraphs=(item.overview||'').split(/\n{2,}/);
      const [headline,...restOfFirst]=overviewParagraphs[0]?.split(/(?<=[.다])\s+/)||[];
      return `<article class="rt-product-detail" aria-labelledby="rt-product-title">
        <a class="rt-product-back" href="#products">← 제품 목록</a>
        <div class="rt-product-hero"><div class="rt-product-gallery">${images.length?images.map(img=>`<figure><img src="${image(img.file)}" alt="${esc(img.alt||item.productName)}" loading="lazy"><figcaption>${[img.role==='Other'?'':roleLabel[img.role]||img.role,(img.note||'').replace(/^[A-Za-z]+ · /,'')].filter(Boolean).map(esc).join(' · ')}</figcaption></figure>`).join(''):'<p class="rt-products-empty">등록된 이미지가 없습니다.</p>'}</div>
        <div class="rt-product-headline"><span class="rt-eyebrow">${esc(groupLabel[item.group])} · ${esc(item.manufacturer)}</span><h2 id="rt-product-title" tabindex="-1">${esc(item.productName)}</h2><p class="rt-product-en">${esc(item.english)}</p><p class="rt-product-ko">${esc(item.korean)}</p>${reviewBadge(item)}
        ${item.group==='series'?`<a class="rt-button rt-primary rt-product-configure" href="#matrix-configurator" data-configure-family="${esc(item.model.split(' ')[0])}">${esc(item.model.split(' ')[0])} 구성기에서 구성하기 →</a>`:''}
        ${related.length?`<div class="rt-product-related"><b>관련 제품</b>${related.map(link=>`<a href="#products/${link.target}">${esc(byId[link.target].productName)}${link.note?` <small>${esc(link.note)}</small>`:''}</a>`).join('')}</div>`:''}</div></div>
        ${facts.length?`<ul class="rt-product-facts">${facts.map(fact=>`<li><b>${esc(fact.value)}</b><span>${esc(fact.label)}</span></li>`).join('')}</ul>`:''}
        ${item.overview?`<section class="rt-product-overview"><h3>개요</h3>${headline?`<p class="rt-product-overview-headline">${esc(headline)}</p>`:''}${[restOfFirst.join(' '),...overviewParagraphs.slice(1)].filter(Boolean).map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}</section>`:''}
        ${(item.features||[]).length||sizeSpecs.length?`<div class="rt-product-side-row">
          ${(item.features||[]).length?`<section class="rt-product-box rt-product-box-features"><h3>주요 기능</h3><ul class="rt-product-features">${item.features.map(feature=>`<li>${esc(feature.text)}</li>`).join('')}</ul></section>`:''}
          ${sizeSpecs.length?`<section class="rt-product-box rt-product-box-size"><h3>크기 및 무게</h3><ul class="rt-product-size">${sizeSpecs.map(([label,value])=>`<li><span>${label}</span><b>${value}</b></li>`).join('')}</ul></section>`:''}
        </div>`:''}
        ${lineup.length?`<section><h3>구성 제품</h3>${table(['모델','구분','요약'],lineup)}</section>`:''}
        ${specs.length?`<section><h3>제품 사양</h3>${table(['구분','사양','비고'],specs)}</section>`:''}
        ${io.length?`<section><h3>입출력 단자</h3>${table(['분류','방향','단자','수량','신호','조건'],io)}</section>`:''}
        ${issues.length?`<section><h3>확인 사항</h3><ul class="rt-product-issues">${issues.map(issue=>`<li data-status="${esc(issue.status)}"><b>${esc(issue.title)}</b> ${esc(issue.detail)}</li>`).join('')}</ul></section>`:''}
        <section class="rt-product-source"><h3>출처</h3><p>${esc(item.verificationSummary)}</p>${sources.length?`<ul>${sources.map(source=>`<li>${source}</li>`).join('')}</ul>`:''}<p class="rt-product-note">공개 브로셔 수준 정보입니다. 최신 사양·납품 조건은 제조사 또는 서울영상테크에 확인하세요.</p></section>
      </article>`;
    }
    function show(state){
      view.hidden=!state.products;configurator.hidden=state.products;
      for(const tab of tabs){const active=(tab.dataset.viewTab==='products')===state.products;tab.setAttribute('aria-current',active?'page':'false')}
      if(!state.products)return;
      body.innerHTML='<p class="rt-products-count" role="status">제품 정보를 불러오는 중입니다…</p>';
      loadIndex().then(()=>state.id?loadDetail(state.id).then(item=>{if(route().id!==state.id)return;body.innerHTML=detailView(item);body.querySelector('#rt-product-title')?.focus({preventScroll:true});window.scrollTo({top:view.offsetTop-8})}):(body.innerHTML=listView()))
        .catch(()=>{body.innerHTML=`<p class="rt-products-empty">제품 정보를 불러오지 못했습니다. <a href="#products">목록으로</a></p>`});
    }
    body.addEventListener('click',event=>{
      const button=event.target.closest('[data-product-filter]');
      if(button){filter=button.dataset.productFilter;body.innerHTML=listView();body.querySelector(`[data-product-filter="${filter}"]`)?.focus();return}
      const configure=event.target.closest('[data-configure-family]');
      if(configure){event.preventDefault();location.hash='#matrix-configurator';root.dispatchEvent(new CustomEvent('rt-configure-family',{detail:configure.dataset.configureFamily}))}
    });
    body.addEventListener('input',event=>{
      if(!event.target.matches('[data-product-search]'))return;
      query=event.target.value.trim().toLowerCase();
      const caret=event.target.selectionStart;body.innerHTML=listView();
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
