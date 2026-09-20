(()=>{
  const root=document.querySelector('#equipment-library');
  if(!root)return;
  const products=[
    {id:'xdm',category:'matrix',name:'XDM Series',sub:'eXtreme Digital Matrix',image:'output/design/assets/xdm.jpg',page:'4-12',status:'매뉴얼·기술자료 연동',features:['12x12부터 216x216까지 프레임 구성','4K60 4:4:4·심리스·비디오 월','HDMI·DP·12G-SDI·HDBaseT 3.0·광 카드','커스텀 해상도 EDID 대응: LED 무손실 패스스루·4K 모니터 업스케일'],config:true},
    {id:'spx',category:'matrix',name:'SPX Series',sub:'Signal Processing eXpert',image:'output/design/assets/spx.jpg',page:'13-16',status:'카탈로그 수록',features:['8포트 입력·10/12포트 출력 카드','독립 스케일링·비디오 월·쿼드 뷰','5개 메인 프레임']},
    {id:'vdm',category:'matrix',name:'VDM Series',sub:'Variety Digital Matrix',image:'output/design/assets/vdm.jpg',page:'17-27',status:'카탈로그 수록',features:['8x8부터 288x288까지 9개 프레임','HDMI·CAT·광·3G-SDI 크로스 플랫폼','4K30·심리스·스케일링·비디오 월']},

    {id:'hs-88mx',category:'integrated',name:'HS-88MX',sub:'8x8 HDMI Matrix Switcher',image:'output/design/assets/library/hs-88mx.jpg',page:'28',features:['HDMI 2.0 입력 8·출력 8','4K60 4:4:4','심리스·Quad View·Video Wall']},
    {id:'qms-44ux',category:'integrated',name:'QMS-44UX',sub:'4x4 HDMI Matrix Switcher',image:'output/design/assets/library/qms-44ux.jpg',page:'29',features:['4x4 HDMI Matrix','2x2 Video Wall·Quad Viewer·PIP','출력별 스케일링·심리스']},
    {id:'qms-88ux',category:'integrated',name:'QMS-88UX',sub:'8x8 HDMI Matrix Switcher',image:'output/design/assets/library/qms-88ux.jpg',page:'30',features:['HDMI 2.0 입력 8·출력 8','4K60 4:4:4','8채널 Multi-view·Video Wall·Dual Mode']},

    {id:'hd-d102u',category:'distribution',name:'HD-D102U',sub:'1x2 HDMI 18Gbps Splitter',image:'output/design/assets/library/hd-d102u.jpg',page:'31',features:['HDMI 입력 1·출력 2','4K60 4:4:4','Smart EDID']},
    {id:'hd-d104u',category:'distribution',name:'HD-D104U',sub:'1x4 HDMI 18Gbps Splitter',image:'output/design/assets/library/hd-d104u.jpg',page:'32',features:['HDMI 입력 1·출력 4','4K60 4:4:4','Smart EDID']},
    {id:'hd-d108u',category:'distribution',name:'HD-D108U',sub:'1x8 HDMI 18Gbps Splitter',image:'output/design/assets/library/hd-d108u.jpg',page:'33',features:['HDMI 입력 1·출력 8','4K60 4:4:4','HDCP 2.2·EDID']},
    {id:'hds-21u',category:'distribution',name:'HDS-21U',sub:'2x1 HDMI 4K Switcher',image:'output/design/assets/library/hds-21u.jpg',page:'34',features:['HDMI 입력 2·출력 1','Fast Switching·Priority','오디오 병합·추출']},
    {id:'hds-42mu',category:'distribution',name:'HDS-42MU',sub:'4x2 HDMI 4K Switcher',image:'output/design/assets/library/hds-42mu.jpg',page:'35',features:['HDMI 입력 4·출력 2','4K60·18Gbps','스테레오 오디오 입출력']},
    {id:'hd-13u',category:'distribution',name:'HD-13U',sub:'1x3 HDMI Splitter',image:'output/design/assets/library/hd-13u.jpg',page:'36',features:['HDMI 입력 1·출력 3','4K60·HDCP 2.2','오디오 병합·추출']},
    {id:'hd-104u',category:'distribution',name:'HD-104U',sub:'1x4 HDMI Splitter',image:'output/design/assets/library/hd-104u.jpg',page:'37',features:['HDMI 입력 1·출력 4','4K60·HDCP 2.2','EDID Minder']},
    {id:'hd-108u',category:'distribution',name:'HD-108U',sub:'1x8 HDMI Splitter',image:'output/design/assets/library/hd-108u.jpg',page:'38',features:['HDMI 입력 1·출력 8','4K60·HDCP 2.2','EDID Minder']},
    {id:'hd-210u',category:'distribution',name:'HD-210U',sub:'2x10 HDMI Splitter',image:'output/design/assets/library/hd-210u.jpg',page:'39',features:['HDMI 입력 2·출력 10','4K60·HDCP 2.2','오디오 병합']},

    {id:'xdm-ctr100',category:'extender',name:'XDM-CTR100 / PSE',sub:'HDBaseT 3.0 Transceiver',image:'output/design/assets/library/xdm-cat-extender.jpg',page:'10',features:['TX·RX 역할 전환','XDM-CIS100·COS100 연동','4K60 4:4:4·최대 100m']},
    {id:'xdm-ct103',category:'extender',name:'XDM-CT103 / CR103',sub:'1 Gang HDBaseT 3.0 Extender',image:'output/design/assets/library/xdm-wall-extender.jpg',page:'11',features:['벽부형 송신기·수신기','XDM 슬롯 POE 지원','4K60 4:4:4']},
    {id:'xdm-ft101',category:'extender',name:'XDM-FT101 / FR101',sub:'4K Fiber Extender',image:'output/design/assets/library/xdm-fiber-extender.jpg',page:'12',features:['HDMI·광·오디오·RS-232','싱글모드 2km','멀티모드 300m']},
    {id:'vdm-cat101',category:'extender',name:'CT101-U / CR101-U',sub:'HDBaseT Extender',image:'output/design/assets/library/vdm-cat-101.jpg',page:'21',features:['DVI·HDMI·오디오·RS-232','HDBaseT 최대 100m','4K30']},
    {id:'vdm-cat102',category:'extender',name:'CT102-U / CR102-U',sub:'Scaling HDBaseT Extender',image:'output/design/assets/library/vdm-cat-102.jpg',page:'22',features:['HDMI·DVI·VGA 입력','수신기 스케일링·심리스','CATx 최대 100m']},
    {id:'vdm-cat103',category:'extender',name:'CT103-U-H / CR103-U',sub:'Wall Plate HDBaseT Extender',image:'output/design/assets/library/vdm-cat-wall.jpg',page:'23',status:'표기 검토 필요',features:['벽부형 송신기·수신기','비디오·오디오·RS-232','일부 해상도 표기는 제조사 확인 필요']},
    {id:'vdm-fiber101',category:'extender',name:'FT101-U / FR101-U',sub:'Fiber Extender',image:'output/design/assets/library/vdm-fiber-101.jpg',page:'24',status:'표기 검토 필요',features:['광 장거리 전송','싱글모드 2km·멀티모드 500m','FR101-U 프로토콜 표기 확인 필요']},
    {id:'vdm-fiber102',category:'extender',name:'FT102-U / FR102-U',sub:'Scaling Fiber Extender',image:'output/design/assets/library/vdm-fiber-102.jpg',page:'25',status:'표기 검토 필요',features:['HDMI·DVI·VGA 입력','수신기 스케일링·심리스','카탈로그 방향 표기 확인 필요']},
    {id:'vdm-fiber103',category:'extender',name:'FT103-U-H / FR103-U',sub:'Wall Plate Fiber Extender',image:'output/design/assets/library/vdm-fiber-103.jpg',page:'26-27',status:'표기 검토 필요',features:['벽부형 광 송신기·수신기','1080p/WUXGA급 전송','카탈로그 방향 표기 확인 필요']},
    {id:'mr-4s',category:'extender',name:'MR-4S',sub:'Modular Extension Frame',image:'output/design/assets/library/mr-4s.jpg',page:'40',features:['CATx·광 모듈 최대 4개','송신·수신 모듈 혼합 구성','단일 전원 공급']},
    {id:'obhd-2c',category:'extender',name:'OBHD-2C',sub:'HDMI Fiber Extender',image:'output/design/assets/library/obhd-2c.jpg',page:'41',features:['Full HD 1080p60','싱글모드 2km','멀티모드 500m']},
    {id:'obux-1c',category:'extender',name:'OBUX-1C',sub:'4K HDMI Fiber Extender',image:'output/design/assets/library/obux-1c.jpg',page:'42',features:['4K60 4:4:4','OM3 멀티모드 최대 300m','오디오 병합·추출']},

    {id:'hoc-ux',category:'cable',name:'HOC-UX',sub:'HDMI Active Optical Cable',image:'output/design/assets/library/hoc-ux.jpg',page:'43',features:['4K60 4:4:4·18Gbps','최대 100m','추가 전원 없이 Plug & Play']},
    {id:'lhoc',category:'cable',name:'LHOC',sub:'Locking HDMI Active Optical Cable',image:'output/design/assets/library/lhoc.jpg',page:'44',features:['4K60 4:4:4·18Gbps','잠금형 커넥터·플래넘 케이블','최대 100m']},
    {id:'ahoc',category:'cable',name:'AHOC',sub:'Armored HDMI Active Optical Cable',image:'output/design/assets/library/ahoc.jpg',page:'45',features:['4K60 HDR·Dolby Vision','아머드 보호 구조','모바일 스풀 옵션']},
    {id:'umc',category:'cable',name:'UMC Locking Cable',sub:'Locking HDMI Cable',image:'output/design/assets/library/umc.jpg',page:'46',features:['슬라이딩 잠금 구조','최대 6kg 잠금','1m·2m·3m·5m·10m 구성']}
  ];
  const categories=[['all','전체 장비'],['matrix','모듈형 매트릭스'],['integrated','일체형 매트릭스'],['distribution','분배기·선택기'],['extender','전송기·확장'],['cable','케이블']];
  const catalogPdf='output/design/assets/rtcom-catalog-2026.pdf';
  let active='all',query='';
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const filtered=()=>products.filter(product=>(active==='all'||product.category===active)&&`${product.name} ${product.sub} ${product.features.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  function render(){
    const list=filtered();
    root.innerHTML=`<div class="rt-library-hero"><div><span class="rt-kicker">RTCOM AV DESIGN LIBRARY</span><h1>장비를 보고, 비교하고,<br><em>바로 설계하세요.</em></h1><p>RTCom 종합 카탈로그의 장비 이미지와 핵심 기능을 제품군별로 정리했습니다. 매트릭스 구성기는 전체 설계 라이브러리의 한 도구로 연결됩니다.</p><div class="rt-library-stats"><span><b>${products.length}</b>개 장비·시리즈</span><span><b>6</b>개 카테고리</span><span><b>48</b>페이지 자료</span></div></div><aside class="rt-tool-card"><span>DESIGN TOOL · 01</span><strong>Matrix Configurator</strong><p>XDM·SPX·VDM 프레임과 카드 슬롯을 실제 장비 이미지로 구성합니다.</p><button type="button" data-open-config>매트릭스 구성기 열기 <b>→</b></button></aside></div><div class="rt-library-toolbar"><div class="rt-category-tabs" role="tablist" aria-label="장비 카테고리">${categories.map(([id,label])=>`<button type="button" role="tab" data-category="${id}" aria-selected="${active===id}">${label}<small>${id==='all'?products.length:products.filter(product=>product.category===id).length}</small></button>`).join('')}</div><label class="rt-library-search"><span>장비 검색</span><input type="search" placeholder="모델명 또는 기능 검색" value="${esc(query)}"></label></div><div class="rt-library-heading"><div><span class="rt-kicker">EQUIPMENT CATALOG</span><h2>${categories.find(item=>item[0]===active)[1]}</h2></div><p>종합 카탈로그를 기준으로 정리한 검토용 정보입니다. 구매·설치 전 최신 사양을 확인하세요.</p></div><div class="rt-product-grid">${list.map(product=>`<article class="rt-product-card"><div class="rt-product-image"><img src="${product.image}" alt="${esc(product.name)} 장비 이미지"><span>CATALOG p.${product.page}</span></div><div class="rt-product-copy"><div class="rt-product-meta"><span>${categories.find(item=>item[0]===product.category)[1]}</span>${product.status?`<b class="${product.status.includes('필요')?'rt-review-badge':''}">${product.status}</b>`:''}</div><h3>${esc(product.name)}</h3><p>${esc(product.sub)}</p><ul>${product.features.map(feature=>`<li>${esc(feature)}</li>`).join('')}</ul><div class="rt-product-actions"><button type="button" data-detail="${product.id}">상세 보기</button>${product.config?'<button type="button" class="rt-start-config" data-open-config>구성 시작</button>':''}</div></div></article>`).join('')||'<div class="rt-library-empty">검색 결과가 없습니다.</div>'}</div><dialog class="rt-product-dialog"></dialog>`;
  }
  function openDetail(product){
    const dialog=root.querySelector('.rt-product-dialog');
    const pdf=product.pdf||catalogPdf;
    const page=String(product.page).split('-')[0];
    dialog.innerHTML=`<button class="rt-dialog-close" type="button" aria-label="닫기">×</button><div class="rt-dialog-image"><img src="${product.image}" alt="${esc(product.name)} 장비 이미지"></div><div class="rt-dialog-copy"><span class="rt-kicker">CATALOG p.${product.page}</span><h2>${esc(product.name)}</h2><p>${esc(product.sub)}</p><h3>주요 특장점</h3><ul>${product.features.map(feature=>`<li>${esc(feature)}</li>`).join('')}</ul><div class="rt-source-note"><b>제조사 원문</b><span>RTCom 48페이지 국문 종합 카탈로그 · p.${product.page}</span>${product.status?`<em>${esc(product.status)}</em>`:''}<div class="rt-source-actions"><a href="${pdf}#page=${page}" target="_blank" rel="noopener">원문 PDF 보기</a><a href="${pdf}" download>PDF 다운로드</a></div></div>${product.config?'<button type="button" class="rt-dialog-config" data-open-config>매트릭스 구성기로 이동 →</button>':''}</div>`;
    dialog.querySelector('.rt-dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
    dialog.showModal();
  }
  root.addEventListener('click',event=>{
    const category=event.target.closest('[data-category]');
    if(category){active=category.dataset.category;render();return}
    const detail=event.target.closest('[data-detail]');
    if(detail){openDetail(products.find(product=>product.id===detail.dataset.detail));return}
    if(event.target.closest('[data-open-config]')){root.querySelector('.rt-product-dialog')?.close();document.querySelector('#matrix-configurator').scrollIntoView({behavior:'smooth',block:'start'})}
  });
  root.addEventListener('input',event=>{if(!event.target.matches('.rt-library-search input'))return;query=event.target.value;if(query.trim())active='all';render();requestAnimationFrame(()=>{const input=root.querySelector('.rt-library-search input');input.focus();input.setSelectionRange(query.length,query.length)})});
  render();
})();
