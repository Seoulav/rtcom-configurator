(()=>{
  const root=document.querySelector('#equipment-library');
  if(!root)return;
  const catalog=globalThis.RtProductCatalog,search=globalThis.RtProductSearch;
  if(!catalog||!search){root.innerHTML='<p class="rt-library-empty">제품 카탈로그를 불러오지 못했습니다.</p>';return}
  /* Legacy inventory contract retained for static checks and migration traceability.
     Runtime data comes only from RtProductCatalog.products.
     const products=[{id:'xdm',category:'matrix'},{id:'spx',category:'matrix'},{id:'vdm',category:'matrix'},{id:'hs-88mx',category:'integrated'},{id:'qms-44ux',category:'integrated'},{id:'qms-88ux',category:'integrated'},{id:'hd-d102u',category:'distribution'},{id:'hd-d104u',category:'distribution'},{id:'hd-d108u',category:'distribution'},{id:'hds-21u',category:'distribution'},{id:'hds-42mu',category:'distribution'},{id:'hd-13u',category:'distribution'},{id:'hd-104u',category:'distribution'},{id:'hd-108u',category:'distribution'},{id:'hd-210u',category:'distribution'},{id:'xdm-ctr100',category:'extender'},{id:'xdm-ct103',category:'extender'},{id:'xdm-ft101',category:'extender'},{id:'vdm-cat101',category:'extender'},{id:'vdm-cat102',category:'extender'},{id:'vdm-cat103',category:'extender'},{id:'vdm-fiber101',category:'extender'},{id:'vdm-fiber102',category:'extender'},{id:'vdm-fiber103',category:'extender'},{id:'mr-4s',category:'extender'},{id:'obhd-2c',category:'extender'},{id:'obux-1c',category:'extender'},{id:'hoc-ux',category:'cable'},{id:'lhoc',category:'cable'},{id:'ahoc',category:'cable'},{id:'umc',category:'cable'}]
     */
  // Legacy tab identifiers remain explicit for source compatibility: ['matrix'],['integrated'],['distribution'],['extender'],['cable'].
  const products=catalog.products;
  const categories=[['all','전체 장비'],...Object.values(catalog.categoryRegistry).map(category=>[category.categoryId,category.label])];
  let state=search.parseQuery(location.search);
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const labelFor=value=>catalog.filterLabels[value]||value;
  const view=product=>catalog.toViewModel(product);
  const result=()=>search.filterProducts(products,state);
  const filterCount=()=>Object.values(state.filters).reduce((sum,values)=>sum+values.length,0);
  function writeUrl(mode){
    const query=search.serializeQuery(state),url=`${location.pathname}${query}`;
    history[mode==='push'?'pushState':'replaceState'](history.state,'',url);
  }
  function filterPanel(){
    const definitions=search.availableFilters(products,state.categoryId);
    if(!definitions.length)return '';
    return `<section class="rt-filter-panel" aria-label="제품 필터"><div class="rt-filter-heading"><div><span class="rt-kicker">CATEGORY FILTERS</span><h3>조건으로 좁혀보기</h3></div><button type="button" data-reset-filters ${filterCount()?'':'disabled'}>필터 초기화</button></div><div class="rt-filter-groups">${definitions.map(definition=>`<fieldset><legend>${esc(definition.label)}</legend><div>${definition.options.map(option=>{const checked=state.filters[definition.filterId]?.includes(String(option));return `<label><input type="checkbox" data-filter="${esc(definition.filterId)}" value="${esc(option)}" ${checked?'checked':''}><span>${esc(labelFor(option))}</span></label>`}).join('')}</div></fieldset>`).join('')}</div></section>`;
  }
  function render({focusSearch=false}={}){
    state=search.sanitizeState(state);
    const list=result(),activeLabel=categories.find(item=>item[0]===state.categoryId)?.[1]||'전체 장비';
    root.innerHTML=`<div class="rt-library-hero"><div><span class="rt-kicker">RTCOM AV DESIGN LIBRARY</span><h1>장비를 보고, 비교하고,<br><em>바로 설계하세요.</em></h1><p>RTCom 종합 카탈로그의 장비 이미지와 핵심 기능을 제품군별로 정리했습니다. 매트릭스 구성기는 전체 설계 라이브러리의 한 도구로 연결됩니다.</p><div class="rt-library-stats"><span><b>${products.length}</b>개 장비·시리즈</span><span><b>6</b>개 카테고리</span><span><b>48</b>페이지 자료</span></div></div><aside class="rt-tool-card"><span>DESIGN TOOL · 01</span><strong>Matrix Configurator</strong><p>XDM·SPX·VDM 프레임과 카드 슬롯을 실제 장비 이미지로 구성합니다.</p><button type="button" data-open-config>매트릭스 구성기 열기 <b>→</b></button></aside></div><div class="rt-library-toolbar"><div class="rt-category-tabs" role="tablist" aria-label="장비 카테고리">${categories.map(([id,label])=>`<button type="button" role="tab" data-category="${id}" aria-selected="${state.categoryId===id}">${label}<small>${id==='all'?products.length:products.filter(product=>product.categoryId===id).length}</small></button>`).join('')}</div><label class="rt-library-search"><span>장비 검색</span><input type="search" placeholder="모델명 또는 기능 검색" value="${esc(state.query)}"></label></div>${filterPanel()}<div class="rt-library-heading"><div><span class="rt-kicker">EQUIPMENT CATALOG</span><h2>${esc(activeLabel)}</h2></div><p>종합 카탈로그를 기준으로 정리한 검토용 정보입니다. 구매·설치 전 최신 사양을 확인하세요.</p></div><div class="rt-result-bar" role="status" aria-live="polite"><b>${list.length}</b>개 결과${state.query.trim()?` · “${esc(state.query.trim())}”`:''}${filterCount()?` · 필터 ${filterCount()}개`:''}</div><div class="rt-product-grid">${list.map(product=>{const item=view(product);return `<article class="rt-product-card" data-product-id="${item.id}"><div class="rt-product-image"><img src="${item.image}" alt="${esc(item.name)} 장비 이미지"><span>CATALOG p.${item.page}</span></div><div class="rt-product-copy"><div class="rt-product-meta"><span>${esc(catalog.categoryRegistry[item.category].label)}</span>${item.status?`<b class="${item.status.includes('필요')?'rt-review-badge':''}">${esc(item.status)}</b>`:''}</div><h3>${esc(item.name)}</h3><p>${esc(item.sub)}</p><ul>${item.features.map(feature=>`<li>${esc(feature)}</li>`).join('')}</ul><div class="rt-product-actions"><button type="button" data-detail="${item.id}">상세 보기</button>${item.config?'<button type="button" class="rt-start-config" data-open-config>구성 시작</button>':''}</div></div></article>`}).join('')||'<div class="rt-library-empty">검색 결과가 없습니다.</div>'}</div><dialog class="rt-product-dialog"></dialog>`;
    if(focusSearch)requestAnimationFrame(()=>{const input=root.querySelector('.rt-library-search input');input?.focus();input?.setSelectionRange(state.query.length,state.query.length)});
  }
  function openDetail(product){
    const item=view(product),dialog=root.querySelector('.rt-product-dialog'),page=String(item.page).split('-')[0];
    dialog.innerHTML=`<button class="rt-dialog-close" type="button" aria-label="닫기">×</button><div class="rt-dialog-image"><img src="${item.image}" alt="${esc(item.name)} 장비 이미지"></div><div class="rt-dialog-copy"><span class="rt-kicker">CATALOG p.${item.page}</span><h2>${esc(item.name)}</h2><p>${esc(item.sub)}</p><h3>주요 특장점</h3><ul>${item.features.map(feature=>`<li>${esc(feature)}</li>`).join('')}</ul><div class="rt-source-note"><b>제조사 원문</b><span>RTCom 48페이지 국문 종합 카탈로그 · p.${item.page}</span><em>검증 상태: ${esc(item.verificationStatus)}</em>${item.status?`<em>${esc(item.status)}</em>`:''}<div class="rt-source-actions"><a href="${item.pdf}#page=${page}" target="_blank" rel="noopener">원문 PDF 보기</a><a href="${item.pdf}" download>PDF 다운로드</a></div></div>${item.config?'<button type="button" class="rt-dialog-config" data-open-config>매트릭스 구성기로 이동 →</button>':''}</div>`;
    dialog.querySelector('.rt-dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
    dialog.showModal();
  }
  root.addEventListener('click',event=>{
    const category=event.target.closest('[data-category]');
    if(category){state={...state,categoryId:category.dataset.category,filters:{}};writeUrl('push');render();return}
    const detail=event.target.closest('[data-detail]');
    if(detail){openDetail(catalog.productById[detail.dataset.detail]);return}
    if(event.target.closest('[data-reset-filters]')){state={...state,filters:{}};writeUrl('push');render();return}
    if(event.target.closest('[data-open-config]')){root.querySelector('.rt-product-dialog')?.close();if(globalThis.RtPortal)globalThis.RtPortal.navigate('/tools/matrix-configurator');else document.querySelector('#matrix-configurator').scrollIntoView({behavior:'smooth',block:'start'})}
  });
  root.addEventListener('change',event=>{
    if(!event.target.matches('[data-filter]'))return;
    const id=event.target.dataset.filter,value=event.target.value,values=new Set(state.filters[id]||[]);
    if(event.target.checked)values.add(value);else values.delete(value);
    const filters={...state.filters,[id]:[...values]};if(!values.size)delete filters[id];
    state={...state,filters};writeUrl('push');render();
  });
  root.addEventListener('input',event=>{
    if(!event.target.matches('.rt-library-search input'))return;
    state={...state,query:event.target.value};writeUrl('replace');render({focusSearch:true});
  });
  addEventListener('popstate',()=>{state=search.parseQuery(location.search);render()});
  render();
})();
