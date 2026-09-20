((scope)=>{
  const CATALOG_SCHEMA_VERSION='product-catalog.v1';
  const VERIFICATION_STATUSES=['VERIFIED','CATALOG_ONLY','NEEDS_REVIEW','CONFLICTED','UNKNOWN'];
  const PRODUCT_STATUSES=['ACTIVE','LEGACY','DISCONTINUED','PLANNED'];
  const RELATION_TYPES=['WORKS_WITH','REQUIRES','TX_PAIR','RX_PAIR','COMPATIBLE_CARD','COMPATIBLE_CHASSIS','RECOMMENDED_CABLE','REPLACED_BY','ALTERNATIVE'];
  const categoryRegistry={
    matrix:{categoryId:'matrix',label:'모듈형 매트릭스',extensionSchema:'MatrixSpecs',allowedSpecFields:{family:'string',signals:'string[]'},filters:[{filterId:'family',label:'제품군',field:'family'},{filterId:'signals',label:'지원 신호',field:'signals'}]},
    integrated:{categoryId:'integrated',label:'일체형 매트릭스',extensionSchema:'MatrixSpecs',allowedSpecFields:{topology:'string',productType:'string',signals:'string[]'},filters:[{filterId:'topology',label:'입출력 구성',field:'topology'},{filterId:'signals',label:'지원 신호',field:'signals'}]},
    distribution:{categoryId:'distribution',label:'분배기·선택기',extensionSchema:'DistributionSpecs',allowedSpecFields:{topology:'string',productType:'string',signals:'string[]'},filters:[{filterId:'productType',label:'유형',field:'productType'},{filterId:'topology',label:'입출력 구성',field:'topology'}]},
    extender:{categoryId:'extender',label:'전송기·확장',extensionSchema:'ExtenderSpecs',allowedSpecFields:{medium:'string',role:'string',signals:'string[]'},filters:[{filterId:'medium',label:'전송 매체',field:'medium'},{filterId:'role',label:'역할',field:'role'}]},
    cable:{categoryId:'cable',label:'케이블',extensionSchema:'CableSpecs',allowedSpecFields:{cableType:'string',medium:'string',signals:'string[]'},filters:[{filterId:'cableType',label:'케이블 유형',field:'cableType'},{filterId:'medium',label:'전송 매체',field:'medium'}]}
  };
  const filterLabels={
    MATRIX:'Matrix',SPLITTER:'Splitter',SWITCHER:'Switcher',FIBER:'광',CAT:'CAT·HDBaseT',HDMI:'HDMI',DISPLAYPORT:'DisplayPort',SDI:'SDI',UNKNOWN:'확인 필요',TRANSCEIVER:'Transceiver',TX_RX_PAIR:'TX/RX Pair',MODULE_FRAME:'확장 프레임',AOC:'Active Optical Cable',LOCKING_AOC:'Locking AOC',ARMORED_AOC:'Armored AOC',LOCKING_HDMI:'Locking HDMI'
  };
  const documents={
    'rtcom-catalog-2026':{documentId:'rtcom-catalog-2026',title:'RTCom 48페이지 국문 종합 카탈로그',publicPath:'output/design/assets/rtcom-catalog-2026.pdf',kind:'CATALOG',language:'ko'}
  };
  const sourceProducts=[
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
  const conflicted=new Set(['vdm-fiber101','vdm-fiber102','vdm-fiber103']);
  const needsReview=new Set(['vdm-cat103']);
  const relationMap={
    'xdm-ctr100':[{relationType:'WORKS_WITH',targetProductId:'xdm',condition:'XDM-CIS100·COS100 카드 연동',sourceRef:'rtcom-catalog-2026#page=10'}],
    'xdm-ct103':[{relationType:'WORKS_WITH',targetProductId:'xdm',condition:'XDM 슬롯 POE 지원',sourceRef:'rtcom-catalog-2026#page=11'}]
  };
  const signalRules=[['HDMI',/HDMI/i],['DISPLAYPORT',/DisplayPort|(?:^|[^A-Z])DP(?:[^A-Z]|$)/i],['SDI',/SDI/i],['CAT',/CATx?|HDBaseT/i],['FIBER',/광|Fiber|Optical/i]];
  const unique=values=>[...new Set(values.filter(Boolean))];
  const topology=text=>{const match=String(text).match(/(\d+)\s*[x×]\s*(\d+)/i);return match?`${match[1]}×${match[2]}`:undefined};
  const signals=text=>signalRules.filter(([,pattern])=>pattern.test(text)).map(([id])=>id);
  const productType=text=>/Splitter/i.test(text)?'SPLITTER':/Switcher/i.test(text)?'SWITCHER':/Matrix/i.test(text)?'MATRIX':undefined;
  const medium=text=>/광|Fiber|Optical/i.test(text)?'FIBER':/CATx?|HDBaseT/i.test(text)?'CAT':undefined;
  const role=text=>/역할 전환|Transceiver/i.test(text)?'TRANSCEIVER':/송신기.?수신기|TX.?RX/i.test(text)?'TX_RX_PAIR':/Extension Frame|확장 프레임|모듈 혼합/i.test(text)?'MODULE_FRAME':'UNKNOWN';
  const cableType=text=>/Armored/i.test(text)?'ARMORED_AOC':/Locking HDMI Active Optical/i.test(text)?'LOCKING_AOC':/Active Optical/i.test(text)?'AOC':/Locking HDMI/i.test(text)?'LOCKING_HDMI':'UNKNOWN';
  const verificationFor=item=>{
    const status=conflicted.has(item.id)?'CONFLICTED':needsReview.has(item.id)?'NEEDS_REVIEW':'CATALOG_ONLY';
    return {status,sourceRefs:[`rtcom-catalog-2026#page=${String(item.page).split('-')[0]}`],openQuestions:status==='CATALOG_ONLY'?[]:[item.features.at(-1)]};
  };
  const specsFor=item=>{
    const text=[item.name,item.sub,...item.features].join(' '),baseSignals=signals(text);
    if(item.category==='matrix')return {family:item.name.split(' ')[0],signals:baseSignals};
    if(item.category==='integrated'||item.category==='distribution')return {topology:topology(text),productType:productType(text),signals:baseSignals};
    if(item.category==='extender')return {medium:medium(text)||'UNKNOWN',role:role(text),signals:baseSignals};
    return {cableType:cableType(text),medium:medium(text)||'UNKNOWN',signals:baseSignals};
  };
  const portsFor=item=>{
    if(!['integrated','distribution'].includes(item.category))return [];
    const shape=topology([item.sub,...item.features].join(' '));
    if(!shape)return [];
    const [input,output]=shape.split('×').map(Number);
    return [{portId:'input',direction:'INPUT',signal:'HDMI',connector:'HDMI',count:input},{portId:'output',direction:'OUTPUT',signal:'HDMI',connector:'HDMI',count:output}];
  };
  const normalize=item=>{
    const verification=verificationFor(item);
    return {
      productId:item.id,
      slug:item.id,
      modelName:item.name,
      displayName:item.name,
      categoryId:item.category,
      subcategoryId:item.category==='extender'?(medium([item.sub,...item.features].join(' '))||'UNKNOWN'):undefined,
      status:'ACTIVE',
      shortDescription:item.sub,
      useCases:[],
      tags:unique([categoryRegistry[item.category].label,...signals([item.sub,...item.features].join(' '))]),
      aliases:unique(item.name.split(/\s*\/\s*/).map(value=>value.trim()).filter(value=>value!==item.name)),
      images:[{imageId:`${item.id}-primary`,kind:'PRODUCT',src:item.image,alt:`${item.name} 장비 이미지`}],
      ports:portsFor(item),
      capabilities:item.features.map((label,index)=>({capabilityId:`${item.id}-feature-${index+1}`,label,value:true,verificationStatus:verification.status})),
      relations:relationMap[item.id]||[],
      documents:['rtcom-catalog-2026'],
      verification,
      categorySpecs:specsFor(item)
    };
  };
  const products=sourceProducts.map(normalize);
  const sourceById=Object.fromEntries(sourceProducts.map(item=>[item.id,item]));
  const productById=Object.fromEntries(products.map(product=>[product.productId,product]));
  const toViewModel=product=>{
    const source=sourceById[product.productId],document=documents[product.documents[0]];
    return {id:product.productId,slug:product.slug,category:product.categoryId,name:product.displayName,sub:product.shortDescription,image:product.images[0].src,page:source.page,status:source.status,features:product.capabilities.map(item=>item.label),config:Boolean(source.config),pdf:document.publicPath,verificationStatus:product.verification.status};
  };
  const legacyProducts=()=>products.map(toViewModel);
  const api={CATALOG_SCHEMA_VERSION,VERIFICATION_STATUSES,PRODUCT_STATUSES,RELATION_TYPES,categoryRegistry,filterLabels,documents,products,productById,toViewModel,legacyProducts};
  scope.RtProductCatalog=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
