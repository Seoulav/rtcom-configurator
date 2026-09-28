
  (()=>{
    const root=document.getElementById('rtcom-design');
    const main=root.querySelector('.rt-main');
    const nav=root.querySelector('.rt-nav');
    const assets=Object.fromEntries([...root.querySelector('template').content.querySelectorAll('img')].map(x=>[x.dataset.family,x.src]));
    const families=RtCatalog;
    const labels=['제품군','프레임 선택','카드 슬롯','전송기','구성 검토','내보내기'];
    const currentSlots=()=>RtCore.slotsFor(state);
    let state=RtCore.initial();
    let modalSlot=null;
    // 0.55→0.70: 카드 팝업의 카드별 수량(사용자 요청 "카드 선택 시 해당 카드마다 수량 기입해서 순차적으로 들어가게").
    // {카드 id: 수량}. 팝업을 열 때마다 비운다. "순서대로 장착"은 목록 순서(카드별 수량만큼)로 선택한 슬롯부터 같은 방향 빈 슬롯에 채운다.
    let modalQtys={};
    // 0.117(사용자 요청 2026-09-28 "연동되는 전송기들을 … 카드 선택시로 … 특정 컨버터를 선택할 수 있게끔"): 카드 팝업에서 카드마다 고른 연동 전송기(''=연결 안 함). 팝업을 열 때마다 비운다.
    let modalExt={},modalExtQty={};
    const qtySum=()=>Object.values(modalQtys).reduce((sum,n)=>sum+n,0);
    // 02 프레임 미리보기의 정면/후면 세그먼트(2-2). 상태 저장·실행 취소 대상이 아닌 순수 화면 토글이다.
    let previewSide='front';
    // 04 전송기 미리보기가 지금 보여주는 슬롯 id(2-2). previewSide와 같은 성격의 순수 화면 상태 — state에 없고 저장·실행 취소 대상이 아니다.
    // 가족·모델이 바뀌면 previewSide와 함께 null로 되돌리고, linksViewV4가 렌더링 때마다 현재 remote/hdmiExtend 목록에 없으면 첫 슬롯으로 다시 잡는다.
    let linkPreviewSlot=null;
    let changedSlot=null;
    // XDM 연동 전송기 정보(RTCom 종합 카탈로그 p.10~12). 키는 저장 파일·BOM에 쓰이는 전송기 이름과 같다.
    const extenderInfo={
      'XDM-CTR100 · TX':{model:'XDM-CTR100',role:'HDBaseT 3.0 송·수신기 · DIP 스위치 TX 설정',image:'output/design/assets/extenders/xdm-ctr100.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 입력·출력 각 1 · RS-232+ · 오디오 출력','전원: XDM-PSU로 공급 · CTR100 개별 전원 불필요 (매트릭스 카드 구성에서는 PSE 사용 불가)'],pair:'XDM-CIS100',page:10,recommended:true},
      'XDM-CTR100 · RX':{model:'XDM-CTR100',role:'HDBaseT 3.0 송·수신기 · DIP 스위치 RX 설정',image:'output/design/assets/extenders/xdm-ctr100.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 입력·출력 각 1 · RS-232+ · 오디오 출력','전원: XDM-PSU로 공급 · CTR100 개별 전원 불필요 (매트릭스 카드 구성에서는 PSE 사용 불가)'],pair:'XDM-COS100',page:10,recommended:true},
      'XDM-CT103':{model:'XDM-CT103',role:'HDBaseT 3.0 1 Gang 벽부형 송신기',image:'output/design/assets/extenders/xdm-ct103.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 1 · 오디오 입력 1','XDM 슬롯 POE로 별도 전원 없이 사용'],pair:'XDM-CIS100',page:11},
      'XDM-CR103':{model:'XDM-CR103',role:'HDBaseT 3.0 1 Gang 벽부형 수신기',image:'output/design/assets/extenders/xdm-cr103.webp',specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','HDMI 1 · 오디오 1','XDM 슬롯 POE로 별도 전원 없이 사용'],pair:'XDM-COS100',page:11},
      'XDM-FT101':{model:'XDM-FT101',role:'4K 광 송신기',image:'output/design/assets/extenders/xdm-ft101.webp',specs:['4K60 4:4:4 · HDMI 2.0','싱글모드 2km · 멀티모드 300m (LC 1)','오디오 삽입 · RS-232+'],pair:'XDM-FIS100',page:12,recommended:true},
      [RtCore.psePair]:{model:'CTR100 PSE + CTR100',role:'HDMI 연장 한 쌍 (HDBaseT 3.0)',images:['output/design/assets/extenders/xdm-ctr100-pse.webp','output/design/assets/extenders/xdm-ctr100.webp'],specs:['4K60 4:4:4 · 최대 100m (CAT6a/CAT7)','전원: PSE 쪽에만 연결 · CTR100은 전원 불필요','두 제품 모두 DIP 스위치로 TX/RX 설정'],page:10},
      'SPX-RX':{model:'SPX-RX',role:'CATx 수신기 (HDMI 2.0 · CEC)',specs:['4K60 4:4:4 · 18Gbps · HDCP 2.2','CATx 4K60 최대 50m · 1080p 최대 60m','전원: 메인프레임이 CAT으로 공급(POC)'],recommended:true},
      // VDM 연동 전송기(사용자 확인 2026-09-26, 사양·사진: 알티컴 홈페이지 VDM EXTENDER 게시판)
      'CT104-U':{model:'CT104-U',role:'HDBaseT 4K 송신기 (HDMI + RS-232)',image:'output/design/assets/extenders/vdm-ct104-u.webp',specs:['4K30 · 1080p60 최대 100m (CAT5e/6)','HDMI 1.4 · RS-232 · HDCP','전원: DC 12V 2A'],pair:'CIS4-U',recommended:true},
      'CR104-U':{model:'CR104-U',role:'HDBaseT 4K 수신기 (HDMI + RS-232)',image:'output/design/assets/extenders/vdm-cr104-u.webp',specs:['4K30 · 1080p60 최대 100m (CAT5e/6)','HDMI 1.4 · RS-232 · HDCP','전원: DC 12V 2A'],pair:'COS4-U',recommended:true},
      'FT101-U':{model:'FT101-U',role:'HDMI 광 송신기 (오디오 · RS-232)',image:'output/design/assets/extenders/vdm-ft101-u.webp',specs:['4K30 · 싱글모드 2km · 멀티모드 500m','HDMI 1.4b · 3.5mm 오디오 입력 · RS-232','전원: DC 12V 2A'],pair:'FIS4-U',recommended:true},
      'FR101-U':{model:'FR101-U',role:'HDMI 광 수신기 (RS-232)',image:'output/design/assets/extenders/vdm-fr101-u.webp',specs:['4K30 · 싱글모드 2km · 멀티모드 500m','HDMI 1.4b · 오디오 출력 · RS-232','전원: DC 12V 2A'],pair:'FOS4-U',recommended:true},
      'XDM-FR101':{model:'XDM-FR101',role:'4K 광 수신기',image:'output/design/assets/extenders/xdm-fr101.webp',specs:['4K60 4:4:4 · HDMI 2.0','싱글모드 2km · 멀티모드 300m (LC 1)','오디오 추출 · RS-232+'],pair:'XDM-FOS100',page:12,recommended:true}
    };
    const vdmExtenderLineup=[
      {model:'CT104-U',role:'HDBaseT 4K 송신기',image:'output/design/assets/extenders/vdm-ct104-u.webp',pair:'CIS4-U',note:'CAT5e/6 최대 100m · DC 12V'},
      {model:'CR104-U',role:'HDBaseT 4K 수신기',image:'output/design/assets/extenders/vdm-cr104-u.webp',pair:'COS4-U',note:'CAT5e/6 최대 100m · DC 12V'},
      {model:'FT101-U',role:'HDMI 광 송신기',image:'output/design/assets/extenders/vdm-ft101-u.webp',pair:'FIS4-U',note:'싱글모드 2km · 멀티모드 500m · DC 12V'},
      {model:'FR101-U',role:'HDMI 광 수신기',image:'output/design/assets/extenders/vdm-fr101-u.webp',pair:'FOS4-U',note:'싱글모드 2km · 멀티모드 500m · DC 12V'}
    ];
    const extenderLineup=[
      {model:'XDM-CTR100',role:'HDBaseT 3.0 송·수신기 (DIP 스위치 TX/RX)',image:'output/design/assets/extenders/xdm-ctr100.webp',pair:'XDM-CIS100 · XDM-COS100',note:'DIP 스위치로 TX/RX를 설정합니다. TX는 CIS100, RX는 COS100과 연동하며 이때는 XDM-PSU로 전원을 공급해 CTR100에 전원 어댑터가 필요 없습니다. PSE와 한 쌍이어도 전원 불필요',page:10},
      {model:'XDM-CTR100 PSE',role:'POE 전원 공급형 송·수신기 (DIP 스위치 TX/RX)',image:'output/design/assets/extenders/xdm-ctr100-pse.webp',pair:'XDM-CTR100 (HDMI 카드 연장 · 1:1 연장)',note:'CTR100과 한 쌍으로 쓰면 PSE 쪽에만 전원을 연결하고 CTR100은 전원이 필요 없습니다. HDMI 입력·출력 카드 연장에 사용하며, HDBaseT 카드(CIS100·COS100) 구성에는 사용할 수 없습니다.',page:10},
      {model:'XDM-PSU',role:'16채널 모듈형 전원 장치 (19인치 2U)',image:'output/design/assets/products/xdm-psu-front.webp',pair:'XDM-CIS100 · XDM-COS100 + XDM-CTR100',note:'CIS100·COS100에 연결한 CTR100에 전원을 공급합니다. CIS용 XDM-POH(Tx 1대당 1개)와 COS용 XDM-PHX(COS100 1장당 1개) 모듈을 16칸에 꽂습니다.',source:'제조사 도면·구성도'},
      {model:'XDM-CT103',role:'1 Gang 벽부형 송신기',image:'output/design/assets/extenders/xdm-ct103.webp',pair:'XDM-CIS100',note:'XDM 슬롯 POE로 전원 공급',page:11},
      {model:'XDM-CR103',role:'1 Gang 벽부형 수신기',image:'output/design/assets/extenders/xdm-cr103.webp',pair:'XDM-COS100',note:'XDM 슬롯 POE로 전원 공급',page:11},
      {model:'XDM-FT101',role:'4K 광 송신기',image:'output/design/assets/extenders/xdm-ft101.webp',pair:'XDM-FIS100',note:'싱글모드 2km · 멀티모드 300m',page:12},
      {model:'XDM-FR101',role:'4K 광 수신기',image:'output/design/assets/extenders/xdm-fr101.webp',pair:'XDM-FOS100',note:'싱글모드 2km · 멀티모드 300m',page:12}
    ];
    const blankPlate='output/design/assets/cards/XDM-BLANK.webp';
    // SPX 카드·블랭크는 카탈로그 스캔에서 자른 임시 자산이다(고해상도 후면 사진을 받으면 교체).
    const blankPlates={XDM:blankPlate,SPX:'output/design/assets/cards/SPX-BLANK.webp',VDM:'output/design/assets/cards/VDM-BLANK.webp'};
    const photoCardFamilies=new Set(['XDM','SPX','VDM']);
    // 카드 판넬 가로:세로 비율(슬롯 모양). XDM 9.7, SPX 13.8, VDM 5.7
    const slotRatios={XDM:9.7,SPX:13.8,VDM:5.7};
    // VDM 후면 배치(매뉴얼 도면): 8X는 가로 보드 좌우, 16X~64X는 세로 보드 '입력 4 | 출력 4'를 단으로 쌓고, 80X 이상은 입력 위·출력 아래. 256X는 128X와 같은 랙 2대가 나란히 선다.
    // 열 수는 매뉴얼 후면 도면의 한 줄 보드 수다: 80X·128X는 11열(남는 칸은 제어 보드·빈칸), 180X는 15열, 256X는 랙 2대 × 11열.
    const vdmRacks={'VDM-8X':['h',1],'VDM-16X':['vs',4],'VDM-32X':['vs',4],'VDM-48X':['vs',4],'VDM-64X':['vs',4],'VDM-80X':['vt',11],'VDM-128X':['vt',11],'VDM-180X':['vt',15],'VDM-256X':['vt',11]};
    const frameFronts={'XDM-12':'output/design/assets/frames/xdm-12-front.webp','XDM-20':'output/design/assets/frames/xdm-20-front.webp','XDM-36':'output/design/assets/frames/xdm-36-front.webp','XDM-72':'output/design/assets/frames/xdm-72-front.webp','XDM-144':'output/design/assets/frames/xdm-144-front.webp','XDM-216':'output/design/assets/frames/xdm-216-front.webp','VDM-16X':'output/design/assets/frames/vdm-16x-front.webp','SPX-M810':'output/design/assets/frames/spx-m810-front.webp','SPX-M1620':'output/design/assets/frames/spx-m1620-front.webp','SPX-M3236':'output/design/assets/frames/spx-m3236-front.webp','SPX-M2472':'output/design/assets/frames/spx-m2472-front.webp','SPX-M24120':'output/design/assets/frames/spx-m24120-front.webp','VDM-48X':'output/design/assets/frames/vdm-48x-front.webp',
      // 실물 전면 사진이 없는 VDM은 매뉴얼 전면 선 도면(KV07 PDF pp.12–20) 배치를 따라 그린 평면 그림을 쓴다(scripts/tools/draw_vdm_frames.cjs).
      'VDM-8X':'output/design/assets/frames/vdm-8x-front-art.webp','VDM-32X':'output/design/assets/frames/vdm-32x-front-art.webp','VDM-64X':'output/design/assets/frames/vdm-64x-front-art.webp','VDM-80X':'output/design/assets/frames/vdm-80x-front-art.webp','VDM-128X':'output/design/assets/frames/vdm-128x-front-art.webp','VDM-180X':'output/design/assets/frames/vdm-180x-front-art.webp','VDM-256X':'output/design/assets/frames/vdm-256x-front-art.webp'};
    const frontDrawings=new Set(['VDM-8X','VDM-32X','VDM-64X','VDM-80X','VDM-128X','VDM-180X','VDM-256X']);
    // 국문 매뉴얼(KV08) 후면 사진과 사진 속 입력·출력 카드 영역(사진 픽셀 좌표: 왼쪽, 위, 오른쪽, 아래). 카드 고정 나사 간격으로 측정했다.
    // 업체의 빈 프레임 후면 사진을 받으면 src와 좌표만 바꾼다.
    // 0.113: XDM·SPX 후면도 매뉴얼 사진 배치를 따라 그린 평면 그림(scripts/tools/draw_xdm_spx_rear_frames.cjs)을 쓴다. 좌표는 원래 사진 좌표를 그림 배율대로 늘린 값이다.
    const SPX_MANUAL='SPX 국문 사용자 매뉴얼(250805)',VDM_MANUAL='VDM 국문 매뉴얼 KV07';
    const rearPhotos={
      'XDM-12':{src:'output/design/assets/frames/xdm-12-rear-art.webp',page:8,kind:'그림',size:[2000,757],input:[27,109,998,404],output:[1019,109,1983,404]},
      'XDM-20':{src:'output/design/assets/frames/xdm-20-rear-art.webp',page:9,kind:'그림',size:[2000,1821],input:[46,152,537,1112],output:[1040,152,1562,1112]},
      'XDM-36':{src:'output/design/assets/frames/xdm-36-rear-art.webp',page:9,kind:'그림',size:[2000,1854],input:[40,150,947,1115],output:[947,150,1854,1115]},
      'XDM-72':{src:'output/design/assets/frames/xdm-72-rear-art.webp',page:10,kind:'그림',size:[1242,2000],input:[16,143,1155,752],output:[16,882,1155,1503]},
      'XDM-144':{src:'output/design/assets/frames/xdm-144-rear-art.webp',page:11,kind:'그림',size:[707,2000],input:[15,85,649,757],output:[15,955,649,1633]},
      // XDM-216은 후면 사진이 없어 XDM-144 후면에 슬롯 줄(18칸)을 하나씩 더한 그림으로 표시한다(scripts/tools/draw_xdm_spx_rear_frames.cjs).
      'XDM-216':{src:'output/design/assets/frames/xdm-216-rear-art.webp',manual:'XDM-144 후면 기준',kind:'그림',size:[530,2000],input:[12,64,487,820],output:[12,968,487,1725]},
      'VDM-16X':{src:'output/design/assets/frames/vdm-16x-rear-art.webp',page:7,manual:VDM_MANUAL,kind:'그림',size:[2000,1238],input:[9,107,735,1229],output:[1247,107,1973,1229]},
      // VDM 국문 매뉴얼 KV07 2.2 Router Frame Specifications의 후면 선 도면(PDF 쪽)을 따라 그린 평면 그림(scripts/tools/draw_vdm_frames.cjs).
      // 좌표는 도면 보드 경계선으로 잰 값을 그림 배율대로 늘린 값이며, 스크립트를 실행하면 출력된다.
      // 입력·출력 영역이 여러 곳이면 배열로 두고 슬롯을 순서대로 똑같이 나눈다(256X: 왼쪽 랙 1–32, 오른쪽 랙 33–64).
      'VDM-8X':{src:'output/design/assets/frames/vdm-8x-rear-art.webp',page:12,manual:VDM_MANUAL,kind:'그림',size:[2000,612],input:[9,25,998,370],output:[1033,25,1991,370]},
      'VDM-32X':{src:'output/design/assets/frames/vdm-32x-rear-art.webp',page:14,manual:VDM_MANUAL,kind:'그림',size:[1937,2000],input:[34,42,698,1941],output:[1209,42,1894,1941]},
      'VDM-48X':{src:'output/design/assets/frames/vdm-48x-rear-art.webp',page:15,manual:VDM_MANUAL,kind:'그림',size:[1323,2000],input:[24,24,487,1959],output:[833,24,1306,1959]},
      'VDM-64X':{src:'output/design/assets/frames/vdm-64x-rear-art.webp',page:16,manual:VDM_MANUAL,kind:'그림',size:[1101,2000],input:[20,20,403,1958],output:[684,20,1074,1958]},
      'VDM-80X':{src:'output/design/assets/frames/vdm-80x-rear-art.webp',page:17,manual:VDM_MANUAL,kind:'그림',size:[758,2000],input:[19,63,742,821],output:[19,1046,742,1807]},
      'VDM-128X':{src:'output/design/assets/frames/vdm-128x-rear-art.webp',page:18,manual:VDM_MANUAL,kind:'그림',size:[811,2000],input:[5,20,770,832],output:[5,990,770,1804]},
      'VDM-180X':{src:'output/design/assets/frames/vdm-180x-rear-art.webp',page:19,manual:VDM_MANUAL,kind:'그림',size:[535,2000],input:[9,53,497,849],output:[9,1057,497,1858]},
      'VDM-256X':{src:'output/design/assets/frames/vdm-256x-rear-art.webp',page:20,manual:VDM_MANUAL,kind:'그림',size:[1215,2000],input:[[15,31,587,837],[605,31,1174,837]],output:[[15,999,587,1802],[605,999,1174,1802]]},
      // SPX 국문 사용자 매뉴얼(250805) 후면 사진. M810·M1620·M3236은 가로 카드(입력 위·출력 아래), M2472·M24120은 세로 카드(입력 왼쪽·출력 오른쪽).
      'SPX-M810':{src:'output/design/assets/frames/spx-m810-rear-art.webp',page:7,manual:SPX_MANUAL,kind:'그림',size:[2000,451],input:[246,70,1758,182],output:[246,182,1758,293]},
      'SPX-M1620':{src:'output/design/assets/frames/spx-m1620-rear-art.webp',page:8,manual:SPX_MANUAL,kind:'그림',size:[2000,1263],input:[202,350,1795,677],output:[202,677,1795,1003]},
      'SPX-M3236':{src:'output/design/assets/frames/spx-m3236-rear-art.webp',page:6,manual:SPX_MANUAL,kind:'그림',size:[2000,1360],input:[219,28,1642,416],output:[219,900,1642,1193]},
      'SPX-M2472':{src:'output/design/assets/frames/spx-m2472-rear-art.webp',page:9,manual:SPX_MANUAL,kind:'그림',size:[2000,1995],input:[16,208,328,1682],output:[844,208,1458,1682]},
      'SPX-M24120':{src:'output/design/assets/frames/spx-m24120-rear-art.webp',page:9,manual:SPX_MANUAL,kind:'그림',size:[1990,2000],input:[10,209,324,1681],output:[836,209,1869,1681]}
    };
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function card(id){return [...families[state.family].input,...families[state.family].output].find(c=>c[0]===id)}
    function slotCard(id){return card(state.placements[id])}
    function syncPorts(){state.portAssignments=RtCore.syncPorts(state)}
    function totals(){let input=0,output=0;for(const s of currentSlots()){const c=slotCard(s.id);if(c){if(s.dir==='input')input+=c[2];else output+=c[2]}}return {input,output,ext:Object.values(state.links).reduce((sum,l)=>sum+(l.device?l.count:0),0)}}
    function cardAsset(id){return photoCardFamilies.has(state.family)&&id?`output/design/assets/cards/${id}.webp`:assets[state.family]}
    const cardTips={
      'XDM-HI100':'HDMI 소스 4채널을 입력하는 기본 카드입니다.','XDM-HIS100':'HDMI 입력을 스케일링해야 하는 구성에 검토합니다.','XDM-DPI100':'DisplayPort 소스 4채널 입력용입니다.','XDM-CIS100':'HDBaseT 3.0 기반 원격 신호 4채널 입력용입니다.','XDM-FIS100':'광 전송 기반의 원거리 신호 4채널 입력용입니다.','XDM-SIS100':'12G-SDI 방송 신호 4채널 입력용입니다.',
      'XDM-HOS100':'HDMI 4채널 출력 또는 최대 4분할(Quad View) 화면 구성에 활용할 수 있습니다.','XDM-DPOS100':'DisplayPort 디스플레이 4채널 출력용입니다.','XDM-COS100':'HDBaseT 3.0 기반 원격 출력 4채널용입니다.','XDM-FOS100':'광 전송 기반의 원거리 출력 4채널용입니다.','XDM-SOS100':'12G-SDI 방송 신호 4채널 출력용입니다.','XDM-WOS100':'4개 레이어를 조합해 월 프로세서처럼 화면 연출에 활용할 수 있습니다.'
    };
    function cardTip(id){return cardTips[id]||'카드 용도와 설치 조건을 검토한 뒤 선택하세요.'}
    function cardBadge(id){return id==='XDM-WOS100'?'<em>4레이어</em>':id==='XDM-HOS100'?'<em>쿼드 뷰</em>':''}
    function choices(s,c){return RtCore.choices(c[0])}
    // 카드 팝업에서 고른 전송기 → 없으면 이 슬롯에 이미 연결된 전송기(같은 카드일 때) → 없으면 카드 기본 연동(RtCore.defaultLink). ''는 연결 안 함.
    // 0.118(사용자 요청 2026-09-28 "전송기 부분도 수량을 선택할 수 있게 해 줘. 그리고 그게 물량 산출서가 나올 수도 있도록"): 카드 1장당 연결할 전송기 수량(1~카드 채널 수).
    // 이 값이 links[슬롯].count가 되고, syncPorts → portAssignments → RtCore.bom을 거쳐 물량 산출서(BOM)에 그대로 들어간다.
    function extQty(cardId,slotId){const c=card(cardId),max=c?c[2]:1;if(Object.prototype.hasOwnProperty.call(modalExtQty,cardId))return Math.min(max,Math.max(1,modalExtQty[cardId]));if(state.placements[slotId]===cardId&&state.links[slotId]?.count)return Math.min(max,state.links[slotId].count);return max}
    function extChoice(cardId,slotId){if(Object.prototype.hasOwnProperty.call(modalExt,cardId))return modalExt[cardId];if(state.placements[slotId]===cardId&&state.links[slotId])return state.links[slotId].device||'';return RtCore.defaultLink(cardId,1)?.device||''}
    function linkFor(slotId,cardId,device,qty){if(!device||!RtCore.choices(cardId).includes(device))return null;const old=state.links[slotId],c=card(cardId),max=c?c[2]:0,count=Math.min(max,Math.max(1,qty||max));return {device,count,distance:old?.device===device?old.distance||'30':old?.distance||'30'}}
    function persist(){saveLocal()}
    function heading(k,title,desc){return `<div class="rt-eyebrow">${k}</div><h2>${title}</h2><p class="rt-description">${desc}</p>`}
    // 01 제품군(2-2, Analog Way 구조): 왼쪽 선택 목록 | 오른쪽 고정 미리보기. 사양 줄은 catalog.js에 있는 검증된 값만 쓴다(대역폭·해상도 등 미확인 수치는 만들지 않는다).
    function familyView(){
      const ids=Object.keys(families);
      const current=families[state.family]?state.family:ids[0];
      const rows=ids.map(id=>{
        const f=families[id];
        return `<button type="button" class="rt-cg-row" data-family="${id}" aria-pressed="${state.family===id}"><span class="rt-cg-row-head"><strong>${id}<small>${esc(f.name)}</small></strong><span class="rt-cg-dot" aria-hidden="true"></span></span><ul class="rt-cg-row-specs"><li>${esc(f.copy)}</li><li>메인프레임 ${f.models.length}종</li><li>${f.tags.map(esc).join(' · ')}</li></ul></button>`;
      }).join('');
      const pf=families[current];
      const preview=`<div class="rt-cg-preview"><img src="${assets[current]}" alt="${current} 제품군 참고 이미지"><div class="rt-cg-preview-cap"><strong>${current} Series</strong><span>${esc(pf.copy)}</span></div><div class="rt-cg-chips">${pf.tags.map(t=>`<em>${esc(t)}</em>`).join('')}</div></div>`;
      return heading('01 / 제품군','연결의 시작, 제품군을 선택하세요.','제품군마다 카드와 전송기 선택 항목이 달라집니다.')+`<div class="rt-cg-split"><div class="rt-cg-list" role="list">${rows}</div>${preview}</div>`;
    }
    function slotPlanFor(model){return RtCore.slotPlan(state.family,model)}
    function documentedSlotCount(model){return slotPlanFor(model)?.[0]||0}
    // SPX는 M810·M1620·M3236이 가로 카드를 위(입력)·아래(출력)로 쌓고, M2472·M24120은 세로 카드를 왼쪽(입력)·오른쪽(출력)에 둔다(매뉴얼 pp.7–9).
    const spxVertical=new Set(['SPX-M2472','SPX-M24120']);
    function rackLayout(model){if(!slotPlanFor(model)||model==='XDM-12')return 'h';if(state.family==='SPX')return spxVertical.has(model)?'vs':'hs';if(state.family==='VDM')return vdmRacks[model]?.[0]||'h';return ['XDM-72','XDM-144','XDM-216'].includes(model)?'vt':'vs'}
    function rackColumns(model,layout){if(state.family==='VDM'&&vdmRacks[model])return vdmRacks[model][1];return layout==='vt'?18:layout==='vs'?(slotPlanFor(model)?.[0]||1):1}
    const maxPorts=dir=>Math.max(...families[state.family][dir].map(item=>item[2]));
    // 02 프레임(2-2, Analog Way 구조): 왼쪽 목록 | 오른쪽 고정 미리보기(정면|후면 세그먼트). 랙 U 값은 PRODUCT_GLASS_REDESIGN_SPEC.md 2-3과 같다.
    const chassisRackU={'XDM-12':'4U','XDM-20':'9U','XDM-36':'9U','XDM-72':'16U','XDM-144':'29U','XDM-216':'40U'};
    // 0.70 "함께 보면 좋은 제품"(사용자 요청 "MATRIX 선택 시 연관 제품 목록이 보이게", 쇼핑몰 상품 상세 아래 추천 줄 참고):
    // 제품정보 데이터(data/products/<제품군>.json의 related)를 한 번 읽어 와서, 02 프레임 선택 아래에 시리즈 상세와 연동 전송기를 사진 카드 한 줄로 보여 준다.
    // 데이터를 읽지 못하면 이 줄만 빠지고 구성기는 그대로 동작한다. 화면 상태일 뿐 저장·실행 취소 대상이 아니다.
    const relatedCache={};
    function loadRelated(family){
      if(relatedCache[family])return;
      relatedCache[family]={loading:true,items:[]};
      const id=family.toLowerCase(),get=url=>fetch(url).then(r=>{if(!r.ok)throw new Error(url);return r.json()});
      Promise.all([get('data/products/index.json'),get(`data/products/${id}.json`)]).then(([index,series])=>{
        const byId=Object.fromEntries(index.products.map(item=>[item.id,item]));
        const seen=new Set(),items=[];
        const push=(target,note)=>{const item=byId[target];if(!item||seen.has(target))return;seen.add(target);items.push({id:target,name:item.productName,image:item.cardImage,note:note||item.korean||''})};
        push(id,`${family} 시리즈 제품정보 · 프레임·카드 사양`);
        for(const link of series.related||[])push(link.target,link.note);
        relatedCache[family]={items};
      }).catch(()=>{relatedCache[family]={items:[]}}).finally(()=>{if(state.step===1&&state.family===family)render()});
    }
    function relatedSection(family){
      const cache=relatedCache[family];
      if(!cache){loadRelated(family);return ''}
      if(!cache.items?.length)return '';
      const cardHtml=item=>`<a class="rt-rel-card" href="#products/${esc(item.id)}"><span class="rt-rel-photo">${item.image?`<img src="output/design/assets/products/${esc(item.image)}" alt="${esc(item.name)} 제품 사진" loading="lazy">`:''}</span><strong>${esc(item.name)}</strong><small>${esc(item.note)}</small></a>`;
      return `<section class="rt-rel" aria-labelledby="rt-rel-title"><div class="rt-rel-head"><h3 id="rt-rel-title">함께 보면 좋은 제품</h3><span>${esc(family)} 시리즈와 연동 전송기 · 누르면 제품정보로 이동</span></div><div class="rt-rel-row">${cache.items.map(cardHtml).join('')}</div></section>`;
    }
    function chassisViewV2(){
      const f=families[state.family];
      const xdmFeature=state.family==='XDM'?'<div class="rt-xdm-feature-note"><span>EDID · LED 활용 팁</span><strong>커스텀 해상도도 설계할 수 있습니다.</strong><p>개선 펌웨어 기준으로 비표준 입력을 원본 패스스루(LED) 또는 4K 업스케일(모니터) 경로로 나눠 검토합니다. 출고용 EDID 주입 조건은 제조사 확인이 필요합니다.</p></div>':'';
      const row=(m,i)=>{
        const plan=slotPlanFor(m),selected=state.model===m;
        const maxChannels=state.family!=='SPX'?`${plan?.[0]*4}×${plan?.[1]*4}`:String(f.modelNotes[i]||'').split('·')[0].trim().replace(/\s*×\s*/,'×');
        const specs=plan?[`입력·출력 슬롯 ${plan[0]} / ${plan[1]}`,`최대 ${maxChannels} 채널`]:['슬롯 구성 제조사 확인 필요'];
        const rackU=chassisRackU[m];
        return `<button type="button" class="rt-cg-row" data-model="${m}" aria-pressed="${selected}"><span class="rt-cg-row-head"><strong>${m}<small>${rackU?rackU+' · ':''}${esc(f.modelNotes[i]||'')}</small></strong><span class="rt-cg-dot" aria-hidden="true"></span></span><ul class="rt-cg-row-specs">${specs.map(s=>`<li>${s}</li>`).join('')}</ul></button>`;
      };
      const previewModel=state.model||f.models[0];
      const front=frameFronts[previewModel],rearInfo=rearPhotos[previewModel];
      // 0.116(사용자 요청 2026-09-28 "프레임을 선택할 때 제품 정면과 후면이 동시에 나오게 해 주고 XDM 144처럼 굉장히 큰 제품 같은 경우는 그때만 정면 후면 형태로"):
      // 정면·후면을 함께 보여 준다. 후면 이미지 세로/가로 비율로 배치를 고른다 — 1.1 이하는 위아래(stack), 2.0 이하는 좌우(row),
      // 그보다 긴 대형 프레임(XDM-144·216, VDM-80X·128X·180X)만 예전처럼 정면/후면 버튼으로 한 장씩 본다(toggle).
      const aspect=rearInfo?rearInfo.size[1]/rearInfo.size[0]:0;
      const duo=front&&rearInfo?(aspect>2?'':aspect>1.1?'row':'stack'):'';
      const side=previewSide==='rear'&&rearInfo?'rear':'front';
      const img=side==='rear'?rearInfo.src:front;
      const kindOf=which=>(which==='front'?frontDrawings.has(previewModel):rearInfo?.kind==='그림')?'그림':'사진';
      const plan=slotPlanFor(previewModel);
      // 0.114(사용자 요청 2026-09-28 "프레임 선택후 다음 이동 버튼을 여기에 넣어줘"): 미리보기 캡션 아래에도 다음 단계 버튼을 둔다. 아래 바의 다음 버튼과 같은 동작이며, 프레임을 고르기 전에는 누를 수 없다.
      const nextHere=`<button type="button" class="rt-button rt-primary rt-cg-preview-next" data-action="preview-next" ${state.model?'':'disabled'}>다음 · 카드 슬롯 구성 <span aria-hidden="true">→</span></button>`;
      const seg=`<span class="rt-cg-seg" role="group" aria-label="사진 방향"><button type="button" class="${side==='front'?'rt-cg-seg-on':''}" data-cg-side="front">정면</button><button type="button" class="${side==='rear'?'rt-cg-seg-on':''}" data-cg-side="rear">후면</button></span>`;
      const duoView=duo?`<div class="rt-cg-duo rt-cg-duo-${duo}"><figure><img src="${front}" data-cg-img="front" alt="${esc(previewModel)} 전면 ${kindOf('front')}"><figcaption>정면</figcaption></figure><figure><img src="${rearInfo.src}" data-cg-img="rear" alt="${esc(previewModel)} 후면 ${kindOf('rear')}"><figcaption>후면</figcaption></figure></div>`:'';
      const preview=`<div class="rt-cg-preview">${duo?duoView:`${rearInfo?seg:''}${img?`<img src="${img}" data-cg-img="${side}" alt="${esc(previewModel)} ${side==='rear'?'후면':'전면'} ${kindOf(side)}">`:'<div class="rt-cg-preview-placeholder">사진 준비 중</div>'}`}<div class="rt-cg-preview-cap"><strong>${esc(previewModel)}</strong><span>${plan?`입력 ${plan[0]} / 출력 ${plan[1]} 슬롯`:'슬롯 구성 제조사 확인 필요'}</span></div>${nextHere}</div>`;
      return heading('02 / 프레임 선택','구성의 중심이 될 프레임을 선택하세요.',`${state.family} 제품군 · 메인프레임 ${f.models.length}종`)+`<div class="rt-cg-split"><div class="rt-cg-list" role="list">${f.models.map(row).join('')}</div>${preview}</div>${relatedSection(state.family)}${xdmFeature}`;
    }
    function cardChoiceModal(){
      if(!modalSlot)return '';
      const slot=currentSlots().find(item=>item.id===modalSlot);
      if(!slot)return '';
      const installed=state.placements[slot.id];
      const tips=slot.dir==='output'&&state.family==='XDM'?'<div class="rt-output-tips"><div class="rt-pro-tip rt-quad-tip"><span>최대 4분할</span><div><strong>XDM-HOS100 · 쿼드 뷰(최대 4분할)</strong><p>일반 HDMI 4채널 출력 또는 최대 4분할 화면 구성에 활용할 수 있습니다.</p></div></div><div class="rt-pro-tip"><span>활용 TIP</span><div><strong>XDM-WOS100 · 4레이어</strong><p>4개 레이어를 조합해 월 프로세서처럼 화면을 연출할 수 있습니다.</p></div></div></div>':'';
      const dirWord=slot.dir==='input'?'입력':'출력';
      // 0.94 수량 UI가 사라지는 버그 수정(사용자 지적 "입력카드 다시 조정하려고 누르면 수량이 안보이고 장착됨이 보임", "출력카드는 수량선택이 안되는 버그"):
      // 같은 방향 슬롯이 이미 다 채워지면 fillTargets가 채울 수 있는 칸(qtyMax)을 1로 돌려주는데, 그 값 하나로 "카드별 수량" UI 노출 여부까지 정했다.
      // 그래서 프레임을 다 채운 뒤 슬롯을 다시 열면(=늘 qtyMax 1) 입력·출력 가리지 않고 수량 UI가 통째로 사라졌다. 노출 여부는 이 슬롯 방향의 전체 슬롯 수(sameDirTotal)로 판단하고,
      // qtyMax는 그대로 두어(다른 슬롯에 이미 있는 카드를 덮어쓰지 않음) 실제 채울 수 있는 칸 수를 제한하는 데만 쓴다.
      const others=currentSlots().filter(item=>item.dir===slot.dir&&item.id!==slot.id);
      const sameDirTotal=others.length+1;
      const qtyMax=RtCore.fillTargets(state,slot.id,999).length;
      const choiceButton=c=>`<button type="button" class="rt-card-choice" data-card="${c[0]}" aria-pressed="${installed===c[0]}"><span class="rt-card-choice-plate"><img src="${cardAsset(c[0])}" alt="${c[0]} 카드 후면 판넬"></span><span class="rt-card-choice-copy"><strong>${c[0]}${cardBadge(c[0])}</strong><small>${esc(c[1])} · ${c[2]}채널</small><span>${esc(cardTip(c[0]))}</span></span><span class="rt-card-choice-state" aria-hidden="true">${installed===c[0]?'장착됨':'선택'}</span></button>`;
      // 0.70 카드별 수량: 카드 버튼 아래에 −/+ 수량 칸을 둔다(버튼 안에 버튼을 넣지 않도록 형제로 둔다). 합계는 채울 수 있는 칸 수(qtyMax)를 넘지 않는다.
      const cardQty=c=>{const n=modalQtys[c[0]]||0,full=qtySum()>=qtyMax;return sameDirTotal>1?`<div class="rt-card-choice-qty"><span>${esc(c[0])} 수량</span><div class="rt-card-qty-stepper"><button type="button" data-card-qty-step="-1" data-qty-card="${c[0]}" aria-label="${c[0]} 수량 줄이기" ${n<=0?'disabled':''}>−</button><output data-qty-out="${c[0]}" aria-live="polite">${n}</output><button type="button" data-card-qty-step="1" data-qty-card="${c[0]}" aria-label="${c[0]} 수량 늘리기" ${full?'disabled':''}>+</button></div></div>`:''};
      // 0.79 상세 보기(사용자 요청 2026-09-28 "카드 선택창에도 상세보기 추가해"): 장착 버튼과 형제로 두어 누르면 카드 사양 창(openCardInfo)이 선택창 위에 뜬다.
      // 0.117 연동 전송기: 전송기와 짝을 이루는 카드(CIS·COS·FIS·FOS·HDMI 카드·SPX-COS12·VDM CAT/광 카드)는 카드 아래에서 전송기를 함께 고른다.
      // 고른 전송기는 카드를 장착할 때(선택·장착 버튼) 슬롯에 연결되고, 04 전송기에서 채널 수·거리를 다시 조정할 수 있다.
      const extQtyBox=(c,cur)=>{const n=extQty(c[0],slot.id),unit=cur===RtCore.psePair?'쌍':'대',off=!cur;return `<div class="rt-card-choice-ext-qty" data-ext-qty-box="${c[0]}"${off?' data-off="true"':''}><span>전송기 수량 <small>카드 1장당 · 최대 ${c[2]}${unit}</small></span><div class="rt-card-qty-stepper"><button type="button" data-ext-qty-step="-1" data-ext-qty-card="${c[0]}" aria-label="${c[0]} 전송기 수량 줄이기" ${off||n<=1?'disabled':''}>−</button><output data-ext-qty-out="${c[0]}" aria-live="polite">${off?0:n}</output><button type="button" data-ext-qty-step="1" data-ext-qty-card="${c[0]}" aria-label="${c[0]} 전송기 수량 늘리기" ${off||n>=c[2]?'disabled':''}>+</button></div></div>`};
      const extRow=c=>{const opts=RtCore.choices(c[0]);if(!opts.length)return '';const cur=extChoice(c[0],slot.id),def=RtCore.defaultLink(c[0],1)?.device||'';
        const chip=(dev,label,img,sub)=>`<button type="button" class="rt-ext-chip" data-ext-card="${c[0]}" data-ext-device="${esc(dev)}" aria-pressed="${cur===dev}">${img?`<img src="${img}" alt="" loading="lazy">`:'<i aria-hidden="true">—</i>'}<span><strong>${esc(label)}${dev===def?'<em>기본</em>':''}</strong>${sub?`<small>${esc(sub)}</small>`:''}</span></button>`;
        return `<div class="rt-card-choice-ext" role="group" aria-label="${c[0]} 연동 전송기"><span class="rt-card-choice-ext-title">연동 전송기 <small>장착할 때 함께 연결</small></span><div class="rt-card-choice-ext-row">${opts.map(o=>{const info=extenderInfo[o]||{};return chip(o,info.model||o,info.image||info.images?.[0],info.role||'')}).join('')}${chip('','연결 안 함','','카드 포트를 장비와 직접 연결')}</div>${extQtyBox(c,cur)}</div>`};
      const choice=c=>`<div class="rt-card-choice-item">${choiceButton(c)}${extRow(c)}<div class="rt-card-choice-foot"><button type="button" class="rt-card-choice-info" data-card-info="${c[0]}" aria-label="${c[0]} 카드 상세 보기">상세 보기</button>${cardQty(c)}</div></div>`;
      const list=families[state.family][slot.dir];
      // 2-4: 팝업 맨 위에 블랭크 커버(커넥터 없음 · 0포트)를 두고, 그 아래 구분 제목 뒤에 실제 카드 목록이 온다.
      const blankChoice=`<button type="button" class="rt-card-choice rt-card-choice-blank" data-card="BLANK" aria-pressed="${installed==='BLANK'}"><span class="rt-card-choice-copy"><strong>블랭크 커버</strong><small>커넥터 없음 · 빈 슬롯 마감</small><span>카드를 더 넣지 않을 슬롯을 막아 구성을 완성합니다.</span></span><span class="rt-card-choice-state rt-card-choice-zero" aria-hidden="true">0포트</span></button>`;
      // 0.55 수량: 선택한 슬롯부터 같은 방향 빈 슬롯까지 몇 칸을 한 번에 채울지 고른다(최대 = 채울 수 있는 칸 수).
      const qtyBar=sameDirTotal>1?`<div class="rt-card-qty" data-qty-max="${qtyMax}"><span class="rt-card-qty-label">카드별 수량</span><small>카드마다 수량을 넣고 ‘장착’을 누르면 ${esc(slot.label)}부터 빈 ${dirWord} 슬롯에 목록 순서대로 들어갑니다 · 최대 ${qtyMax}칸</small></div>`:'';
      // 0.106(사용자 요청 "순서 대로 장착과 닫기 버튼을 장착으로 통합해줘"): 수량을 채우는 버튼이 곧 팝업을 닫으므로(fill-qty가 modalSlot을 비움) 따로 "닫기"를 두지 않는다. 수량 버튼이 없을 때만(같은 방향 슬롯이 하나뿐) "닫기"를 남긴다.
      const fillQtyButton=sameDirTotal>1?`<button type="button" class="rt-button rt-primary" data-action="fill-qty" ${qtySum()?'':'disabled'}><span data-qty-total>장착${qtySum()?` · ${qtySum()}장`:''}</span></button>`:'';
      const closeButton=fillQtyButton?'':'<button type="button" class="rt-button" data-modal-close>닫기</button>';
      const sep=`<p class="rt-card-choice-sep">${slot.dir==='input'?'입력':'출력'} 카드 ${list.length}종 · ${list[0]?.[2]||4}채널</p>`;
      return `<dialog class="rt-card-modal" aria-labelledby="rt-card-modal-title"><div class="rt-card-modal-head"><div><span class="rt-eyebrow">${slot.dir==='input'?'입력':'출력'} 카드 · ${esc(state.model)}</span><h3 id="rt-card-modal-title">${esc(slot.label)} 카드 선택</h3></div><button type="button" class="rt-card-modal-close" data-modal-close aria-label="카드 선택 닫기">×</button></div>${tips}${qtyBar}<div class="rt-card-choice-list">${blankChoice}${sep}${list.map(choice).join('')}</div><div class="rt-card-modal-foot"><button type="button" class="rt-button rt-quiet" data-action="remove" ${installed?'':'disabled'} title="키보드 Delete 키로도 비울 수 있습니다">슬롯 비우기 <kbd class="rt-kbd">Del</kbd></button>${fillQtyButton}${closeButton}</div></dialog>`;
    }
    // 카드 상세 정보(사용자 요청 2026-09-28 "입력 출력카드 버튼을 만들어 해당 카드 상세정보가 나와야해"): 03 카드 슬롯 아래 입력·출력 카드 버튼과
    // 내 구성의 카드 행을 누르면 card-specs.js(카탈로그 46쪽판 근거) 사양을 대화상자로 보여준다. 화면 상태가 아니라서 실행 취소·자동 저장 대상이 아니다.
    const cardSpecs=globalThis.RtCardSpecs||{};
    function cardInfoBar(){
      const f=families[state.family];
      const group=dir=>`<div class="rt-card-info-group"><span>${dir==='input'?'입력':'출력'} 카드</span><div>${f[dir].map(c=>`<button type="button" class="rt-card-info-chip" data-card-info="${c[0]}"><strong>${c[0]}</strong><small>${esc(c[1])}</small></button>`).join('')}</div></div>`;
      return `<section class="rt-card-info-bar" aria-label="카드 상세 정보"><div class="rt-card-info-head"><strong>카드 정보</strong><small>버튼을 누르면 카드별 포트·해상도·규격을 볼 수 있습니다</small></div>${group('input')}${group('output')}</section>`;
    }
    function openCardInfo(id){
      const c=card(id);if(!c)return;
      const info=cardSpecs[id]||{},dir=families[state.family].input.some(item=>item[0]===id)?'입력':'출력';
      const links=RtCore.choices(id);
      const rows=[['구분',`${state.family} ${dir} 카드`],['신호',c[1]],['채널',`${c[2]}채널`],...(info.specs||[]),...(links.length?[['연동 전송기',links.join(', ')]]:[])];
      const dialog=document.createElement('dialog');
      dialog.className='rt-card-info-modal';
      dialog.setAttribute('aria-labelledby','rt-card-info-title');
      dialog.innerHTML=`<div class="rt-card-modal-head"><div><span class="rt-eyebrow">${dir} 카드 · ${esc(state.family)}</span><h3 id="rt-card-info-title">${esc(id)}</h3>${info.title?`<p class="rt-card-info-sub">${esc(info.title)}</p>`:''}</div><button type="button" class="rt-card-modal-close" data-card-info-close aria-label="카드 상세 정보 닫기">×</button></div><div class="rt-card-info-body"><div class="rt-card-info-plate"><img src="${cardAsset(id)}" alt="${esc(id)} 카드 후면 판넬"></div>${cardTips[id]?`<p class="rt-card-info-tip">${esc(cardTips[id])}</p>`:''}<table class="rt-card-info-table"><tbody>${rows.map(([k,v])=>`<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>${info.note?`<p class="rt-card-info-note">${esc(info.note)}</p>`:''}${info.missing?`<p class="rt-card-info-missing">상세 사양 준비 중 · ${esc(info.missing)}</p>`:''}<p class="rt-card-info-src">${[info.page?`알티컴 종합 카탈로그 2026 (국문) ${info.page}쪽`:'',info.source?esc(info.source):''].filter(Boolean).join(' · ')||'제조사 자료 확인 중'}</p></div><div class="rt-card-modal-foot"><button type="button" class="rt-button" data-card-info-close>닫기</button></div>`;
      const opener=document.activeElement;
      const finish=()=>{if(dialog.open)dialog.close();dialog.remove();opener?.focus?.({preventScroll:true})};
      dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('[data-card-info-close]'))finish()});
      dialog.addEventListener('cancel',event=>{event.preventDefault();finish()});
      root.appendChild(dialog);
      if(typeof dialog.showModal==='function'){dialog.showModal();dialog.querySelector('.rt-card-modal-close').focus()}else dialog.setAttribute('open','');
    }
    function configurationSummary(){
      const slotList=currentSlots(),t=totals(),completion=RtCore.completionFor(state),rows=dir=>{
        const counts={};for(const slot of slotList.filter(item=>item.dir===dir)){const c=slotCard(slot.id);if(c)counts[c[0]]=(counts[c[0]]||0)+1}
        const entries=Object.entries(counts);
        return entries.length?`<ul>${entries.map(([id,qty])=>{const c=card(id);return `<li><button type="button" class="rt-summary-card" data-card-info="${id}" aria-label="${id} 카드 상세 정보 보기"><img src="${cardAsset(id)}" alt=""><span><strong>${id}</strong><small>${esc(c[1])}</small></span><b>× ${qty}</b></button></li>`}).join('')}</ul>`:'<p class="rt-summary-empty">아직 장착한 카드가 없습니다.</p>';
      };
      const capacity=dir=>slotList.filter(item=>item.dir===dir).length*maxPorts(dir),meter=(label,value,max)=>`<div class="rt-summary-meter"><span>${label}<b>${value} / ${max}채널</b></span><i style="--rt-fill:${max?Math.min(100,Math.round(value/max*100)):0}%"></i></div>`;
      const cards=completion.cards,segTotal=completion.total||1;
      // 슬롯 완성도(2-3): N / 전체, 3색 막대(카드 파랑 · 블랭크 회색 · 빈칸 흰색), 미완성/완성 배지.
      const segbar=`<div class="rt-completion"><div class="rt-completion-head"><span>슬롯 완성도 ${completion.cards+completion.blanks} / ${completion.total}</span><span class="rt-completion-badge ${completion.empty?'rt-completion-badge-no':'rt-completion-badge-ok'}">${completion.empty?'미완성':'완성'}</span></div><div class="rt-completion-bar"><i style="width:${(completion.cards/segTotal*100).toFixed(2)}%;background:#007AFF"></i><i style="width:${(completion.blanks/segTotal*100).toFixed(2)}%;background:#8a94a6"></i></div><div class="rt-completion-legend"><span><i class="rt-completion-dot-card"></i>카드 ${completion.cards}</span><span><i class="rt-completion-dot-blank"></i>블랭크 ${completion.blanks}</span><span><i class="rt-completion-dot-empty"></i>빈칸 ${completion.empty}</span></div></div>`;
      const blankRow=completion.blanks?`<h4>마감재</h4><div class="rt-summary-total"><span>블랭크 커버 (${esc(state.family)})</span><b>× ${completion.blanks}</b></div>`:'';
      return `<aside class="rt-config-summary" aria-label="구성 요약"><span class="rt-eyebrow">내 구성</span><h3>${esc(state.model)}</h3><p>${state.family} · 입력 ${slotList.filter(item=>item.dir==='input').length} / 출력 ${slotList.filter(item=>item.dir==='output').length} 슬롯</p>${meter('입력',t.input,capacity('input'))}${meter('출력',t.output,capacity('output'))}${segbar}<h4>입력 카드</h4>${rows('input')}<h4>출력 카드</h4>${rows('output')}${blankRow}<div class="rt-summary-total"><span>장착 카드</span><b>${cards}장</b></div><p class="rt-summary-note">${state.family==='SPX'?'다음 단계에서 CATx 출력 카드(COS12)에 연결할 SPX-RX를 확인합니다.':'다음 단계에서 HDBaseT·광 카드에 연결할 전송기를 고릅니다.'}</p></aside>`;
    }
    function cardsViewV4(){
      const slotList=currentSlots(),model=state.model,layout=rackLayout(model),plan=slotPlanFor(model),count=plan?.[0]||0;
      const inputSlots=slotList.filter(item=>item.dir==='input'),outputSlots=slotList.filter(item=>item.dir==='output');
      const inputCards=inputSlots.filter(item=>slotCard(item.id)).length,outputCards=outputSlots.filter(item=>slotCard(item.id)).length;
      const columns=rackColumns(model,layout);
      const shortLabel=slot=>slot.id.replace(/^in-/,'IN ').replace(/^out-/,'OUT ').toUpperCase();
      const changed=changedSlot;changedSlot=null;
      // 슬롯 상태(2-3, 사용자 결정 2026-09-27): 빈칸=흰색(+는 호버·포커스에만), 카드=실제 사진, 블랭크=blankPlates(사용자가 고른 슬롯에만), 선택 중=파란 테두리.
      const slotButton=slot=>{
        const rawValue=state.placements[slot.id],isBlank=rawValue==='BLANK',c=isBlank?null:slotCard(slot.id),selecting=modalSlot===slot.id;
        const stateClass=c?'rt-rack-slot-filled':isBlank?'rt-rack-slot-blank':'rt-rack-slot-empty';
        const label=c?`${c[0]} 장착됨 · 눌러서 변경`:isBlank?'블랭크 커버 · 눌러서 변경':'비어 있음 · 눌러서 카드 선택';
        return `<button type="button" class="rt-rack-slot ${stateClass} ${selecting?'rt-rack-slot-selecting':''} ${changed===slot.id?'rt-rack-slot-changed':''}" data-slot="${slot.id}"${rawValue?' draggable="true"':''} aria-label="${esc(slot.label)}, ${label}" title="${esc(slot.label)}${c?` · ${c[0]}`:isBlank?' · 블랭크 커버':''}"><span class="rt-rack-slot-no rt-rack-slot-no-${slot.dir}" aria-hidden="true">${shortLabel(slot)}</span>${c?`<img draggable="false" class="rt-faceplate" src="${cardAsset(c[0])}" alt="">`:isBlank?`<img draggable="false" class="rt-faceplate rt-blank-plate" src="${blankPlates[state.family]}" alt="">`:'<span class="rt-rack-slot-add" aria-hidden="true">+</span>'}</button>`;
      };
      const bank=(dir,items)=>`<section class="rt-rack-bank rt-rack-bank-${dir}" aria-label="${dir==='input'?'입력':'출력'} 카드 슬롯"><div class="rt-rack-bank-title"><strong>${dir==='input'?'입력':'출력'}</strong><span>${items.filter(item=>slotCard(item.id)).length} / ${items.length}</span></div><div class="rt-rack-grid">${items.map(slotButton).join('')}</div></section>`;
      const photo=rearPhotos[model];
      const zoneRect=(dir,[x0,y0,x1,y1],items)=>{const [w,h]=photo.size,own=state.family==='SPX'&&layout==='vs',cols=own?items.length:columns,rows=Math.ceil(items.length/cols);return `<section class="rt-rack-zone rt-rack-zone-${dir}" aria-label="${dir==='input'?'입력':'출력'} 카드 슬롯" style="left:${(x0/w*100).toFixed(3)}%;top:${(y0/h*100).toFixed(3)}%;width:${((x1-x0)/w*100).toFixed(3)}%;height:${((y1-y0)/h*100).toFixed(3)}%;--rt-rack-zone-rows:${rows}${own?`;--rt-rack-columns:${cols}`:''}"><div class="rt-rack-grid">${items.map(slotButton).join('')}</div></section>`};
      const zone=(dir,items)=>{const rects=Array.isArray(photo[dir][0])?photo[dir]:[photo[dir]],size=Math.ceil(items.length/rects.length);return rects.map((rect,index)=>zoneRect(dir,rect,items.slice(index*size,(index+1)*size))).join('')};
      const photoRack=photo?`<figure class="rt-rack-photo rt-rack-${layout} rt-rack-family-${state.family}" style="--rt-rack-columns:${columns};--rt-slot-ratio:${slotRatios[state.family]||9.7};--rt-photo-ratio:${(photo.size[0]/photo.size[1]).toFixed(4)}"><img class="rt-rack-photo-image" src="${photo.src}" alt="${esc(model)} 후면 ${photo.kind==='그림'?'그림':'사진'}"><div class="rt-rack-photo-zones">${zone('input',inputSlots)}${zone('output',outputSlots)}</div><figcaption>후면 ${photo.kind||'사진'} · ${photo.manual||'XDM 국문 매뉴얼'}${photo.page?` p.${photo.page}`:''} · 선택한 카드만 표시</figcaption></figure>`:'';
      const layoutText=!plan?'슬롯 구성 검토용 논리 도식':state.family==='SPX'?`${layout==='vs'?'왼쪽':'상단'} 입력 ${plan[0]}슬롯(카드당 8포트) / ${layout==='vs'?'오른쪽':'하단'} 출력 ${plan[1]}슬롯(카드당 10~12포트)`:`${layout==='vt'?'상단':'왼쪽'} 입력 ${plan[0]}슬롯 / ${layout==='vt'?'하단':'오른쪽'} 출력 ${plan[1]}슬롯 · 카드당 4채널`;
      const completion=RtCore.completionFor(state);
      // 완성 배너(제목 위)·범례·채우기 줄(2-3, 사용자 결정 2026-09-27).
      const doneBanner=completion.total&&!completion.empty?`<div class="rt-slot-done-banner">✓ ${completion.total}개 슬롯을 모두 채웠습니다 · 구성 완성</div>`:'';
      const legend=`<div class="rt-slot-legend"><span><i class="rt-slot-legend-dot rt-slot-legend-empty"></i>빈 슬롯</span><span><i class="rt-slot-legend-dot rt-slot-legend-installed"></i>장착한 카드</span><span><i class="rt-slot-legend-dot rt-slot-legend-blank"></i>블랭크 커버</span><span><i class="rt-slot-legend-dot rt-slot-legend-selecting"></i>선택 중</span></div>`;
      const fillBar=completion.empty?`<div class="rt-slot-fillbar"><span>비어 있는 슬롯 <b>${completion.empty}개</b> — 카드를 더 넣지 않을 슬롯은 블랭크 커버로 막아 구성을 완성하세요.</span><button type="button" class="rt-button rt-primary" data-action="fill-blanks">남은 ${completion.empty}칸 블랭크로 채우기</button></div>`:'';
      return doneBanner+heading('03 / 카드 슬롯','후면의 빈 슬롯을 눌러 카드를 장착하세요.',`${esc(model)} · ${layoutText}`)+`<div class="rt-config-stage"><section class="rt-rack-canvas"><div class="rt-rack-toolbar"><div><span class="rt-eyebrow">후면</span><h3>${esc(model)}</h3></div><div class="rt-frame-count"><span><b>${inputCards}</b> / ${inputSlots.length} 입력</span><span><b>${outputCards}</b> / ${outputSlots.length} 출력</span></div></div><div class="rt-rack-scroll">${photoRack||`<div class="rt-rack rt-rack-${layout}" style="--rt-rack-columns:${columns};--rt-rack-rows:${Math.max(1,Math.ceil(inputSlots.length/columns))*2};--rt-bank-slots:${columns};--rt-slot-ratio:${slotRatios[state.family]||9.7}"><span class="rt-rack-ear" aria-hidden="true"></span><div class="rt-rack-body">${bank('input',inputSlots)}${bank('output',outputSlots)}<div class="rt-rack-psu" aria-hidden="true"><strong>RTCOM</strong><span>${esc(model)}</span><i></i><small>제어</small><i></i><small>전원</small></div></div><span class="rt-rack-ear" aria-hidden="true"></span></div>`}</div>${photo||layout!=='h'?'<p class="rt-rack-scroll-hint">좌우로 밀어서 후면 전체를 볼 수 있습니다.</p>':''}${count?'':'<p class="rt-stage-warning">이 프레임은 제조사 후면 도면과 카드 허용표를 확보하기 전까지 논리 도식으로 표시합니다. 물리 설치 위치로 사용하지 마세요.</p>'}${count&&!photo?`<p class="rt-rack-note">${state.family==='VDM'?'VDM 매뉴얼에는 이 프레임의 선 도면만 있어, 슬롯 수는 매뉴얼 기준으로 하고 배치는 도면을 단순화한 그림으로 표시합니다.':'이 프레임은 매뉴얼에 후면 사진이 없어 슬롯 배치를 그림으로 표시합니다.'}</p>`:''}${legend}${cardInfoBar()}${fillBar}</section>${configurationSummary()}</div>${cardChoiceModal()}`;
    }
    function powerNotice(){
      const count=Object.values(state.links).filter(link=>link.device?.startsWith('XDM-CTR100 · ')).reduce((sum,link)=>sum+link.count,0);
      // 0.72 XDM-PSU(사용자 결정 2026-09-28): CIS100·COS100에 연결한 CTR100은 XDM-PSU가 전원을 공급한다(POH는 Tx 1대당, PHX는 COS100 1장당).
      const power=count?RtCore.bom(state).filter(row=>row.category==='전원 장비'):[],qty=model=>power.find(row=>row.model.startsWith(model))?.quantity||0;
      return count?`<div class="rt-power-notice"><span>전원 공급</span><div><strong>XDM-CTR100 ${count}대 · XDM-PSU로 전원 공급(개별 어댑터 불필요)</strong><p>XDM-PSU ${qty('XDM-PSU')}대 · XDM-POH ${qty('XDM-POH')}개(CIS100 → POH → CTR100 Tx, Tx 1대당 1개) · XDM-PHX ${qty('XDM-PHX')}개(PSU → 2핀 전원선 → COS100 → CAT → CTR100 Rx, COS100 1장당 1개)를 BOM에 자동 추가했습니다. 매트릭스 카드 구성에서는 XDM-CTR100 PSE를 사용할 수 없습니다.</p></div></div>`:'';
    }
    // 04 전송기(2-2, Analog Way 구조 — 시안 configurator-aw-style.html?step=4): 왼쪽 목록(카드별 묶음 제목+선택 행) | 오른쪽 고정 미리보기(세그먼트로 고른 슬롯의 연결 흐름).
    // 01/02와 같은 rt-cg-split/rt-cg-list/rt-cg-row/rt-cg-preview/rt-cg-dot/rt-cg-seg 틀을 그대로 쓰고, 이 화면에만 있는 모양(묶음 제목+채널 선택, 흐름 그림, 접이식 라인업)만 새로 더한다.
    function linksViewV4(){
      const remote=currentSlots().filter(slot=>['CAT','FIBER'].includes(slotCard(slot.id)?.[3]));
      const hdmiExtend=currentSlots().filter(slot=>{const c=slotCard(slot.id);return c&&c[3]==='HDMI'&&choices(slot,c).includes(RtCore.psePair)});
      const allSlots=[...remote,...hdmiExtend];
      // linkPreviewSlot은 previewSide와 같은 순수 화면 상태다. 가족·모델 변경 때 null로 되돌아가고(클릭 디스패처),
      // 카드 제거 등으로 지금 미리보고 있던 슬롯이 목록에서 사라지면 렌더링 시점에 첫 슬롯으로 다시 잡는다.
      if(allSlots.length&&!allSlots.some(s=>s.id===linkPreviewSlot))linkPreviewSlot=allSlots[0].id;
      const shortLabel=slot=>slot.id.replace(/^in-/,'IN ').replace(/^out-/,'OUT ').toUpperCase();
      const dirWord=slot=>slot.dir==='input'?'입력':'출력';
      const row=(slot,option,link)=>{
        const info=extenderInfo[option],selected=link.device===option;
        return `<button type="button" class="rt-cg-row" data-link-device="${esc(option)}" data-owner="${slot.id}" aria-pressed="${selected}"><span class="rt-cg-row-head"><strong>${esc(info?.model||option)}${info?.recommended?'<em>기본 연동</em>':''}<small>${esc(info?.role||'호환 전송 장비')}</small></strong><span class="rt-cg-dot" aria-hidden="true"></span></span>${info?`<ul class="rt-cg-row-specs">${info.specs.slice(0,2).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}</button>`;
      };
      const none=(slot,link)=>`<button type="button" class="rt-cg-row" data-link-device="" data-owner="${slot.id}" aria-pressed="${!link.device}"><span class="rt-cg-row-head"><strong>연결하지 않음</strong><span class="rt-cg-dot" aria-hidden="true"></span></span><ul class="rt-cg-row-specs"><li>이 카드의 포트를 다른 장비와 직접 연결</li></ul></button>`;
      const countSelect=slot=>{const c=slotCard(slot.id),link=state.links[slot.id]||{device:'',count:0,distance:'30'};return `<select data-link="count" data-owner="${slot.id}" ${link.device?'':'disabled'}>${Array.from({length:c[2]+1},(_,i)=>`<option value="${i}" ${link.count===i?'selected':''}>${i} / ${c[2]}채널</option>`).join('')}</select>`};
      const group=slot=>{
        const c=slotCard(slot.id),opts=choices(slot,c),link=state.links[slot.id]||{device:'',count:0,distance:'30'};
        const rows=opts.length?`${opts.map(option=>row(slot,option,link)).join('')}${none(slot,link)}`:'<div class="rt-notice">이 카드와 전송 장비의 직접 호환 관계는 아직 확인되지 않았습니다.</div>';
        return `<div class="rt-cg-link-group" data-owner-group="${slot.id}"><div class="rt-cg-link-group-head"><button type="button" class="rt-cg-link-group-title" data-link-preview="${slot.id}" aria-pressed="${slot.id===linkPreviewSlot}"><strong>${shortLabel(slot)} · ${esc(c[0])} · ${dirWord(slot)} ${c[2]}채널</strong></button><label class="rt-link-count">연결 채널${countSelect(slot)}</label></div><div class="rt-cg-link-group-rows" role="list">${rows}</div></div>`;
      };
      const lineupCard=item=>`<article class="rt-ext-lineup-card"><span class="rt-ext-option-image"><img src="${item.image}" alt="${esc(item.model)} 제품 사진" loading="lazy"></span><strong>${esc(item.model)}</strong><small>${esc(item.role)}</small><span class="rt-ext-pair">연동 · ${esc(item.pair)}</span><p>${esc(item.note)}</p><em>${item.page?`카탈로그 p.${item.page}`:item.source||'알티컴 홈페이지'}</em></article>`;
      const lineupSection=(family,title,text,items)=>`<section class="rt-ext-lineup" aria-labelledby="rt-ext-lineup-title"><div class="rt-ext-lineup-head"><div><span class="rt-eyebrow">${family} 전송기 라인업</span><h3 id="rt-ext-lineup-title">${title}</h3></div><p>${text}</p></div><div class="rt-ext-lineup-grid">${items.map(lineupCard).join('')}</div></section>`;
      const lineup=state.family==='XDM'?lineupSection('XDM','XDM 연동 전송기','HDBaseT 카드(CIS100·COS100)와 광 카드(FIS100·FOS100)에 연결하는 전송기입니다. 근거: RTCom 종합 카탈로그 p.10~12',extenderLineup):state.family==='VDM'?lineupSection('VDM','VDM 연동 전송기','HDBaseT 카드(CIS4-U·COS4-U)와 광 카드(FIS4-U·FOS4-U)에 연결하는 전송기입니다. 근거: 사용자 확인, 알티컴 홈페이지 VDM EXTENDER',vdmExtenderLineup):'';
      // 전송기 라인업(2-2 "판 아래 접이식 영역"): 처음부터 펼쳐 둔다 — e2e가 스크롤해서 사진 로딩을 확인하므로 클릭 없이 보여야 한다.
      const lineupWrap=lineup?`<details open class="rt-ext-lineup-details"><summary>연동 전송기 라인업 펼치기/접기</summary>${lineup}</details>`:'';
      // SPX는 HDBaseT가 아니라 CATx(SPX-COS12 ↔ SPX-RX)로 전송한다(사용자 확인 2026-09-27 "SPX는 HDBaseT 전송이 아니야"). 안내 문구의 카드 이름을 제품군에 맞춘다.
      const remoteName=state.family==='SPX'?'CATx 카드':'HDBaseT·광 카드';
      const empty=`<div class="rt-empty rt-link-empty"><strong>현재 구성에는 ${remoteName}가 없습니다.</strong><p>${state.family==='SPX'?'SPX-COS12(CATx 출력) 카드를 장착하면 SPX-RX가 자동으로 연결되고 여기서 채널 수를 바꿀 수 있습니다.':state.family==='VDM'?'CIS4-U·COS4-U(HDBaseT) 또는 FIS4-U·FOS4-U(광) 카드를 장착하면 CT104-U·CR104-U·FT101-U·FR101-U가 자동으로 연결되고 여기서 채널 수를 바꿀 수 있습니다.':'XDM-CIS100·COS100(HDBaseT) 또는 XDM-FIS100·FOS100(광) 카드를 장착하면 CTR100·FT101·FR101이 자동으로 연결되고 여기서 바꿀 수 있습니다.'}</p><button type="button" class="rt-button" data-jump="2">카드 슬롯으로 돌아가기</button></div>`;
      // 왼쪽 목록: 원격(CAT·광) 카드 묶음 → (있으면) HDMI 카드 연장 묶음(우산 아래). "현재 구성에는 HDBaseT·광 카드가 없습니다" 안내는
      // remote가 없을 때만 뜨고(명세 5번), HDMI 연장 슬롯만 있으면 그 묶음은 그대로 함께 보여준다(옛 화면도 두 안내가 함께 있을 수 있었다).
      const hdmiGroup=hdmiExtend.length?`<div class="rt-cg-link-umbrella"><div class="rt-cg-link-umbrella-head"><span class="rt-eyebrow">HDMI 연장 · 선택</span><h4>HDMI 카드 연장(선택)</h4><p>HDMI 입력·출력 포트를 멀리 연결해야 하면 CTR100 PSE와 CTR100을 한 쌍으로 씁니다. 전원은 PSE 쪽에만 연결하고, 두 제품 모두 DIP 스위치로 TX/RX를 설정합니다.</p></div>${hdmiExtend.map(group).join('')}</div>`:'';
      const listBody=`${remote.length?remote.map(group).join(''):empty}${hdmiGroup}`;
      // 오른쪽 미리보기: 세그먼트(01/02의 rt-cg-seg와 같은 틀, 슬롯이 여러 개일 수 있어 줄바꿈만 허용) + 연결 흐름 + 채널 수.
      const segLabel=slot=>`${shortLabel(slot)}${hdmiExtend.includes(slot)?' (HDMI)':''}`;
      const seg=allSlots.length?`<span class="rt-cg-seg rt-cg-seg-link" role="group" aria-label="미리보기 카드 선택">${allSlots.map(slot=>`<button type="button" class="${slot.id===linkPreviewSlot?'rt-cg-seg-on':''}" data-link-preview="${slot.id}">${segLabel(slot)}</button>`).join('')}</span>`:'';
      // 흐름: 입력은 소스→전송기→케이블·거리→카드, 출력은 그 반대(명세 2-2). 전송기를 고르지 않았으면 케이블·전송기 구간 없이 소스/디스플레이↔카드만 보여준다.
      const flowFor=slot=>{
        const c=slotCard(slot.id),link=state.links[slot.id]||{device:'',count:0,distance:'30'},info=link.device?extenderInfo[link.device]:null;
        const cardNode=`<div class="rt-link-flow-node rt-link-flow-card"><img src="${cardAsset(c[0])}" alt="${esc(c[0])}"><strong>${esc(c[0])}</strong><small>${shortLabel(slot)} · ${link.count}채널</small></div>`;
        const endpointNode=`<div class="rt-link-flow-node rt-link-flow-endpoint"><span class="rt-link-flow-icon" aria-hidden="true">${slot.dir==='input'?'▶':'🖥'}</span><strong>${slot.dir==='input'?'소스 장비':'디스플레이'}</strong></div>`;
        const arrow='<span class="rt-link-flow-arrow" aria-hidden="true">→</span>';
        if(!info)return `<div class="rt-link-flow">${slot.dir==='input'?endpointNode+arrow+cardNode:cardNode+arrow+endpointNode}</div>`;
        const imgs=(info.images||(info.image?[info.image]:[])).filter(Boolean);
        const extNode=`<div class="rt-link-flow-node rt-link-flow-ext">${imgs.length?`<span class="rt-link-flow-ext-imgs">${imgs.map(src=>`<img src="${src}" alt="">`).join('')}</span>`:''}<strong>${esc(info.model)}</strong><small>${esc(info.role)}</small></div>`;
        // 케이블·거리 표기는 extenderInfo[device].specs에 이미 있는 문장에서 그대로 뽑는다(새 숫자를 만들지 않는다).
        const cableLabel=(info.specs||[]).find(s=>/\d+\s*(?:cm|mm|km|m)\b/.test(s))||info.specs?.[0]||'';
        const cableNode=`<div class="rt-link-flow-cable"><small>${esc(cableLabel)}</small></div>`;
        return `<div class="rt-link-flow">${slot.dir==='input'?[endpointNode,arrow,extNode,cableNode,cardNode].join(''):[cardNode,cableNode,extNode,arrow,endpointNode].join('')}</div>`;
      };
      const previewBody=()=>{
        const slot=allSlots.find(s=>s.id===linkPreviewSlot);
        if(!slot)return '<div class="rt-cg-preview-placeholder">카드를 장착하면 연결 흐름이 여기에 표시됩니다.</div>';
        const c=slotCard(slot.id),link=state.links[slot.id]||{device:'',count:0,distance:'30'};
        return `${seg}${flowFor(slot)}<div class="rt-link-preview-meta"><strong>채널 ${link.count} / ${c[2]} 연결</strong><span>${shortLabel(slot)} · ${esc(c[0])}</span></div>`;
      };
      // powerNotice()는 링크 전체를 합산한 안내라 슬롯마다 다시 보여주면 그대로 반복돼 어색하다(명세는 "흐름 아래"를 우선 시도하라고 하지만,
      // 채널 수는 미리보기 안에 이미 있고 전원 안내는 카드마다 똑같아 판 전체 아래 한 번만 두는 쪽을 선택했다 — 구현 문서에 남긴 편차).
      // rt-link-preview: 01/02의 오른쪽 미리보기는 사진 한 장이라 820px 이하 max-height:260px 안에 들어가지만,
      // 04의 연결 흐름(세그먼트+노드 여러 개)은 그보다 쉽게 커져서 넘친다 — 이 표시가 있을 때만 높이 제한을 풀어준다(styles.css).
      return heading('04 / 전송기','카드에 연결할 전송 장비를 확인하세요.',remote.length?`${remoteName} ${remote.length}장에 기본 전송기를 연결했습니다. 필요하면 ${state.family==='XDM'?'벽부형이나 ':''}채널 수를 바꾸세요.`:`${remoteName}를 장착하면 연동 전송기가 자동으로 연결됩니다.`)+`<div class="rt-cg-split"><div class="rt-cg-list" role="list">${listBody}</div><div class="rt-cg-preview rt-link-preview">${previewBody()}</div></div>${powerNotice()}${lineupWrap}`;
    }
    function bom(){return RtCore.bom(state).map(row=>[row.category,row.model,row.quantity])}
    function table(){return `<div class="rt-table-wrap"><table><thead><tr><th>구분</th><th>모델</th><th>수량</th></tr></thead><tbody>${bom().map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`}
    function reviewViewV2(){const t=totals(),slotList=currentSlots(),inputCards=slotList.filter(slot=>slot.dir==='input'&&slotCard(slot.id)).length,outputCards=slotList.filter(slot=>slot.dir==='output'&&slotCard(slot.id)).length;return heading('05 / 구성 검토','장착한 카드 구성을 확인하세요.','프레임, 입력 카드, 출력 카드와 전송 장비 수량을 검토합니다.')+`<div class="rt-review-head"><div class="rt-review-stat">선택 프레임<strong>${state.model}</strong></div><div class="rt-review-stat">장착 카드<strong>${inputCards} IN / ${outputCards} OUT</strong></div><div class="rt-review-stat">구성 채널<strong>${t.input} IN / ${t.output} OUT</strong></div></div><h3 class="rt-review-title">장비 목록</h3>${table()}${validationView()}<div class="rt-notice">${state.family==='XDM'&&slotList[0].id==='in-1'?`${state.model}은 입력 카드 ${slotList.filter(slot=>slot.dir==='input').length}장과 출력 카드 ${slotList.filter(slot=>slot.dir==='output').length}장, 카드당 4채널을 기준으로 검토합니다.`:'현재 모델은 슬롯 구조 확인이 더 필요합니다.'}</div>`}
    function exportView(){const data=RtCore.document(state);const content=state.format==='PDF'?`<div class="rt-paper-title">Matrix Configuration</div><p class="rt-caption">${state.family} / ${state.model}</p><div class="rt-line"></div>${table()}<p class="rt-board-note">미검증 검토용 초안 · 실제 설치 승인 자료가 아닙니다.</p>`:`<pre>${esc(state.format==='JSON'?JSON.stringify(data,null,2):RtCore.csv(state))}</pre>`;return heading('06 / 내보내기','구성을 저장하고 공유하세요.','연락처 입력 없이 구성 요약과 장비 목록을 내보내는 흐름입니다.')+`<div class="rt-export"><div class="rt-export-options">${[['PDF','구성 요약 · 슬롯·전송기 연결'],['CSV','장비 목록 · 모델별 수량'],['JSON','구성 저장 · 다시 불러오기']].map(([id,n])=>`<button type="button" class="rt-format" data-format="${id}" aria-pressed="${state.format===id}"><div><strong>${id}</strong><span>${n}</span></div><span class="rt-radio" aria-hidden="true">${state.format===id?'✓':''}</span></button>`).join('')}<p class="rt-board-note">내보낸 자료는 미검증 검토용 초안입니다.<br>PDF는 인쇄 창에서 PDF로 저장하세요.</p></div><div class="rt-paper"><div class="rt-preview-label"><span>RTCOM</span><span class="rt-pill">초안 미리보기</span></div>${content}</div></div><button type="button" class="rt-button rt-primary" data-tool="export">${state.format==='PDF'?'검토용 보고서 인쇄 / PDF':'검토용 '+state.format+' 다운로드'}</button>`}
    // 단계 탭(밑줄형, 2-1): 완료 단계는 ✓ + rt-step-done, 현재 단계는 rt-step-current(파란 원·넓은 칸). data-jump 동작·aria-current는 그대로 둔다.
    const shortLabels=['제품군','프레임','카드','전송기','검토','출력'];
    function render(){
      nav.innerHTML=labels.map((label,i)=>`<button type="button" class="rt-step ${i<state.step?'rt-step-done':''} ${i===state.step?'rt-step-current':''}" data-jump="${i}" aria-label="${i+1}단계 ${label}" ${i===state.step?'aria-current="step"':''} ${i>state.maxStep?'disabled':''}><i aria-hidden="true">${i<state.step?'✓':String(i+1).padStart(2,'0')}</i><span class="rt-full-label">${label}</span><span class="rt-short-label" aria-hidden="true">${shortLabels[i]}</span></button>`).join('');
      if(state.step!==2)modalSlot=null;
      main.innerHTML=[familyView,chassisViewV2,cardsViewV4,linksViewV4,reviewViewV2,exportView][state.step]();
      openCardModal();
      root.querySelector('.rt-summary').innerHTML=`<strong>${state.family}</strong>${state.model?' / '+state.model:' 제품군'}<br>${state.step>1?'카드 구성 검토 중':'카테고리: 매트릭스'}`;
      const next=root.querySelector('[data-action=next]');
      next.disabled=state.step===1&&!state.model;
      const nextLabels=['프레임 선택','카드 슬롯 구성','전송기 연결','구성 검토','출력 미리보기','처음으로'];
      // 03 카드 슬롯(2-3): 완성이면 "선택 완료 · 전송기 연결", 빈칸이 남으면 "빈칸 N개 남음 · 그래도 다음". 이동은 막지 않는다.
      let nextLabel=nextLabels[state.step];
      if(state.step===2&&state.model){const completion=RtCore.completionFor(state);nextLabel=completion.empty?`빈칸 ${completion.empty}개 남음 · 그래도 다음`:'선택 완료 · 전송기 연결'}
      next.querySelector('span').textContent=nextLabel;
      root.querySelector('[data-action=back]').hidden=state.step===0;
      updateToolbar();syncNavHistory();
    }
    function changed(){recordHistory();const active=document.activeElement;let focusSelector='';if(active&&root.contains(active)){if(active.dataset.link)focusSelector=`select[data-owner="${active.dataset.owner}"][data-link="${active.dataset.link}"]`;else if(active.dataset.linkDevice!==undefined)focusSelector=`button[data-owner="${active.dataset.owner}"][data-link-device="${active.dataset.linkDevice}"]`;else for(const key of ['family','model','slot','card','format','jump'])if(active.dataset[key]!==undefined){focusSelector=`button[data-${key}="${active.dataset[key]}"]`;break}}render();if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:true});persist()}
    let focusSlotAfterRender=null;
    function focusSlot(id){if(id)root.querySelector(`button[data-slot="${id}"]`)?.focus({preventScroll:true})}
    // 0.55 슬롯 끌어 옮기기(마우스): 장착한 슬롯을 같은 방향(입력↔입력, 출력↔출력) 슬롯에 놓으면 옮기거나 맞바꾼다.
    // 휴대폰은 끌기 대신 카드 팝업의 "다른 슬롯으로 이동"을 쓴다.
    let dragFrom=null;
    const slotDir=id=>id?.startsWith('in-')?'input':id?.startsWith('out-')?'output':null;
    const clearDrop=()=>root.querySelectorAll('.rt-rack-slot-drop,.rt-rack-slot-dragging').forEach(el=>el.classList.remove('rt-rack-slot-drop','rt-rack-slot-dragging'));
    root.addEventListener('dragstart',event=>{const b=event.target.closest?.('button[data-slot][draggable="true"]');if(!b)return;dragFrom=b.dataset.slot;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragFrom);b.classList.add('rt-rack-slot-dragging')});
    root.addEventListener('dragover',event=>{const b=event.target.closest?.('button[data-slot]');if(!b||!dragFrom||b.dataset.slot===dragFrom||slotDir(b.dataset.slot)!==slotDir(dragFrom))return;event.preventDefault();event.dataTransfer.dropEffect='move';root.querySelectorAll('.rt-rack-slot-drop').forEach(el=>el!==b&&el.classList.remove('rt-rack-slot-drop'));b.classList.add('rt-rack-slot-drop')});
    root.addEventListener('dragleave',event=>{const b=event.target.closest?.('button[data-slot]');if(b&&!b.contains(event.relatedTarget))b.classList.remove('rt-rack-slot-drop')});
    root.addEventListener('drop',event=>{const b=event.target.closest?.('button[data-slot]');const from=dragFrom;dragFrom=null;clearDrop();if(!b||!from)return;event.preventDefault();const moved=RtCore.moveCard(state,from,b.dataset.slot);if(!moved)return;state=moved;changedSlot=b.dataset.slot;changed();announce(`${b.dataset.slot.replace(/^in-/,'입력 슬롯 ').replace(/^out-/,'출력 슬롯 ')}(으)로 옮겼습니다.`)});
    root.addEventListener('dragend',()=>{dragFrom=null;clearDrop()});
    // 0.55 Delete 키로 카드 빼기(사용자 요청 "프레임 뒤에서 카드를 선택하고 del키를 누르면 삭제"): 슬롯에 초점이 있거나
    // 그 슬롯의 카드 팝업이 열려 있을 때 Delete(맥은 Backspace)를 누르면 슬롯을 비운다. 실행 취소로 되돌릴 수 있다.
    root.addEventListener('keydown',event=>{
      if(event.key!=='Delete'&&event.key!=='Backspace')return;
      if(event.target.closest?.('input,select,textarea,[contenteditable="true"]'))return;
      const slotButton=event.target.closest?.('button[data-slot]');
      const id=slotButton?slotButton.dataset.slot:event.target.closest?.('.rt-card-modal')?modalSlot:null;
      if(!id||state.step!==2||!Object.prototype.hasOwnProperty.call(state.placements,id))return;
      event.preventDefault();
      const was=state.placements[id];
      if(modalSlot)closeCardModal(id);
      delete state.placements[id];delete state.links[id];
      state.slot=id;changedSlot=id;focusSlotAfterRender=id;syncPorts();changed();
      announce(`${id.replace(/^in-/,'입력 슬롯 ').replace(/^out-/,'출력 슬롯 ')}에서 ${was==='BLANK'?'블랭크 커버':was}를 뺐습니다. 실행 취소로 되돌릴 수 있습니다.`);
    });
    function openCardModal(){
      const dialog=main.querySelector('.rt-card-modal');
      if(!dialog){if(focusSlotAfterRender){const id=focusSlotAfterRender;focusSlotAfterRender=null;requestAnimationFrame(()=>focusSlot(id))}return}
      dialog.addEventListener('cancel',event=>{event.preventDefault();closeCardModal()});
      dialog.addEventListener('click',event=>{if(event.target===dialog)closeCardModal()});
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
      requestAnimationFrame(()=>(dialog.querySelector('.rt-card-choice[aria-pressed="true"]')||dialog.querySelector('.rt-card-choice'))?.focus());
    }
    function closeCardModal(id=modalSlot){
      modalSlot=null;
      const dialog=main.querySelector('.rt-card-modal');
      if(dialog){if(dialog.open&&typeof dialog.close==='function')dialog.close();dialog.remove()}
      focusSlot(id);
    }
    // 휴대폰 뒤로가기: 단계를 옮길 때마다 브라우저 방문 기록을 남겨(주소는 그대로) 뒤로가기가 사이트 밖이 아닌 이전 단계로 가게 한다.
    // 카드 선택 창은 기록을 남기지 않는다. 최신 모바일 브라우저는 뒤로가기로 열린 창(dialog)을 먼저 닫는다.
    let navStep=null,restoringNav=false;
    function syncNavHistory(){
      if(navStep===null)window.history.replaceState({rtStep:state.step},'',location.href);
      else if(!restoringNav&&state.step!==navStep)window.history.pushState({rtStep:state.step},'',location.href);
      navStep=state.step;
    }
    // 로고(RTCOM Matrix Configurator)를 누르면 확인 후 첫 화면(제품군 선택)으로 간다. 구성은 지우지 않는다.
    document.querySelector('.rt-brand-lockup')?.addEventListener('click',async event=>{
      event.preventDefault();
      if(state.step===0){window.scrollTo({top:0,behavior:'smooth'});return}
      if(!await rtConfirm({title:'처음 화면으로 갈까요?',message:'지금까지 구성한 내용은 그대로 저장되어 있어 다시 이어서 할 수 있습니다.',ok:'이동'}))return;
      modalSlot=null;state.step=0;changed();window.scrollTo({top:0,behavior:'smooth'});
    });
    window.addEventListener('popstate',event=>{
      const step=event.state?.rtStep;
      if(!Number.isInteger(step)||step===state.step||step>state.maxStep)return;
      if(modalSlot)closeCardModal(modalSlot);
      restoringNav=true;state.step=step;changed();restoringNav=false;
    });
    // 제품정보(0.19) 시리즈 상세의 "구성기에서 구성하기": 해당 제품군을 고르고 프레임 선택 단계로 간다.
    root.addEventListener('rt-configure-family',async event=>{
      const family=event.detail;
      if(!families[family])return;
      if(state.family!==family){if(!await confirmReset())return;state.family=family;state.model=null;state.placements={};state.portAssignments={};state.links={};state.slot='in-a'}
      modalSlot=null;state.maxStep=Math.max(state.maxStep,1);state.step=1;changed();window.scrollTo({top:0});
    });
    root.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button||!root.contains(button)||button.disabled)return;
      if(button.dataset.requirementAdd){
        const direction=button.dataset.requirementAdd,key=direction==='input'?'inputs':'outputs';
        state.requirements[key].push({id:`req-${direction}-${Date.now()}`,direction,signalType:'HDMI',quantity:1,resolution:'',frameRate:'',distance:null,txRequired:false,rxRequired:false});
        changed();return;
      }
      if(button.dataset.requirementRemove){
        for(const key of ['inputs','outputs'])state.requirements[key]=state.requirements[key].filter(item=>item.id!==button.dataset.requirementRemove);
        changed();
      }
    });
    root.addEventListener('click',async event=>{const b=event.target.closest('button');if(!b||!root.contains(b)||b.disabled)return;
      if(b.dataset.cardInfo){openCardInfo(b.dataset.cardInfo);return}
      // 02 프레임 미리보기 정면/후면 토글: 화면 상태만 바꾸는 순수 토글이라 실행 취소·자동 저장 대상이 아니다.
      // 0.55 수량 버튼: 팝업을 다시 그리지 않고 숫자와 버튼 상태만 바꾼다(실행 취소·자동 저장 대상 아님).
      const syncExtQty=id=>{const box=root.querySelector(`.rt-card-modal [data-ext-qty-box="${id}"]`);if(!box)return;const c=card(id),dev=extChoice(id,modalSlot),n=extQty(id,modalSlot),off=!dev,unit=dev===RtCore.psePair?'쌍':'대';box.toggleAttribute('data-off',off);box.querySelector('output').textContent=off?0:n;box.querySelector('[data-ext-qty-step="-1"]').disabled=off||n<=1;box.querySelector('[data-ext-qty-step="1"]').disabled=off||n>=c[2];box.querySelector('small').textContent=`카드 1장당 · 최대 ${c[2]}${unit}`};
      if(b.dataset.extCard){modalExt[b.dataset.extCard]=b.dataset.extDevice;root.querySelectorAll(`.rt-card-modal [data-ext-card="${b.dataset.extCard}"]`).forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.extDevice===b.dataset.extDevice)));syncExtQty(b.dataset.extCard);return}
      if(b.dataset.extQtyStep){const id=b.dataset.extQtyCard,c=card(id);modalExtQty[id]=Math.min(c[2],Math.max(1,extQty(id,modalSlot)+Number(b.dataset.extQtyStep)));syncExtQty(id);return}
      if(b.dataset.cardQtyStep){const bar=root.querySelector('.rt-card-qty'),max=Number(bar?.dataset.qtyMax)||1,id=b.dataset.qtyCard,others=qtySum()-(modalQtys[id]||0);modalQtys[id]=Math.min(max-others,Math.max(0,(modalQtys[id]||0)+Number(b.dataset.cardQtyStep)));if(!modalQtys[id])delete modalQtys[id];const total=qtySum();root.querySelectorAll('[data-qty-out]').forEach(out=>{const n=modalQtys[out.dataset.qtyOut]||0;out.textContent=n;const box=out.parentElement;box.querySelector('[data-card-qty-step="-1"]').disabled=n<=0;box.querySelector('[data-card-qty-step="1"]').disabled=total>=max});root.querySelectorAll('[data-qty-total]').forEach(el=>{el.textContent=`장착${total?` · ${total}장`:''}`});root.querySelectorAll('[data-action="fill-qty"]').forEach(el=>{el.disabled=!total});return}
      // 0.70 순서대로 장착: 목록 순서로 카드별 수량만큼 이어 붙인 순서를, 선택한 슬롯부터 같은 방향 빈 슬롯에 차례로 넣는다.
      if(b.dataset.action==='fill-qty'){const order=[...root.querySelectorAll('.rt-card-modal [data-qty-out]')].map(out=>out.dataset.qtyOut),seq=order.flatMap(id=>Array(modalQtys[id]||0).fill(id));if(!seq.length)return;const reopen=modalSlot;modalSlot=null;modalQtys={};focusSlotAfterRender=reopen;changedSlot=state.slot;const devices=Object.fromEntries([...new Set(seq)].map(id=>[id,extChoice(id,state.slot)])),qtys=Object.fromEntries([...new Set(seq)].map(id=>[id,extQty(id,state.slot)]));modalExt={};modalExtQty={};const targets=RtCore.fillTargets(state,state.slot,seq.length);targets.forEach((id,i)=>{const value=seq[i],selectedCard=card(value);state.placements[id]=value;const link=selectedCard?linkFor(id,value,devices[value],qtys[value]):null;if(link)state.links[id]=link;else delete state.links[id]});syncPorts();changed();announce(`${[...new Set(seq)].map(id=>`${id} ${seq.filter(x=>x===id).length}장`).join(', ')}을 순서대로 넣었습니다.`);return}
      if(b.dataset.cgSide){previewSide=b.dataset.cgSide;render();return}
      // 04 전송기 오른쪽 미리보기 세그먼트(왼쪽 묶음 제목 버튼도 같은 속성을 쓴다): previewSide와 같은 순수 화면 토글이다.
      if(b.dataset.linkPreview){linkPreviewSlot=b.dataset.linkPreview;render();return}
      if(b.dataset.family){if(state.family!==b.dataset.family){if(!await confirmReset())return;state.family=b.dataset.family;state.model=null;state.placements={};state.portAssignments={};state.links={};state.maxStep=0;state.slot='in-a'}previewSide='front';linkPreviewSlot=null;changed();return}if(b.dataset.model){if(state.model!==b.dataset.model){if(!confirmReset())return;state.model=b.dataset.model;state.placements={};state.portAssignments={};state.links={};state.maxStep=1;state.slot=currentSlots()[0].id}previewSide='front';linkPreviewSlot=null;changed();return}if(b.dataset.slot){state.slot=b.dataset.slot;modalSlot=b.dataset.slot;modalQtys={};modalExt={};modalExtQty={};changed();return}if(b.dataset.modalClose!==undefined){closeCardModal();return}if(b.dataset.linkDevice!==undefined){const id=b.dataset.owner,old=state.links[id]||{device:'',count:0,distance:'30'},slot=currentSlots().find(item=>item.id===id),c=slot&&slotCard(slot.id);if(!c||(b.dataset.linkDevice&&!choices(slot,c).includes(b.dataset.linkDevice)))return;linkPreviewSlot=id;if(old.device===b.dataset.linkDevice){render();return}old.device=b.dataset.linkDevice;old.count=old.device?(old.count||c[2]):0;state.links[id]=old;syncPorts();changed();return}if(b.dataset.card){const reopen=modalSlot;modalSlot=null;if(state.placements[state.slot]===b.dataset.card){const nextDev=extChoice(b.dataset.card,state.slot),nextQty=extQty(b.dataset.card,state.slot),cur=state.links[state.slot];if((cur?.device||'')!==nextDev||(nextDev&&cur?.count!==nextQty)){const link=linkFor(state.slot,b.dataset.card,nextDev,nextQty);if(link)state.links[state.slot]=link;else delete state.links[state.slot];modalExt={};modalExtQty={};focusSlotAfterRender=reopen;syncPorts();changed();announce(`${b.dataset.card} 연동 전송기를 ${link?`${extenderInfo[link.device]?.model||link.device} ${link.count}${link.device===RtCore.psePair?'쌍':'대'}`:'연결 안 함'}으로 바꿨습니다.`);return}closeCardModal(reopen);return}focusSlotAfterRender=reopen;changedSlot=state.slot;const targets=RtCore.fillTargets(state,state.slot,modalQtys[b.dataset.card]||1);modalQtys={};const selectedCard=b.dataset.card==='BLANK'?null:card(b.dataset.card),device=selectedCard?extChoice(b.dataset.card,state.slot):'',qty=selectedCard?extQty(b.dataset.card,state.slot):0;modalExt={};modalExtQty={};for(const id of targets){state.placements[id]=b.dataset.card;const link=selectedCard?linkFor(id,b.dataset.card,device,qty):null;if(link)state.links[id]=link;else delete state.links[id]}syncPorts();changed();if(targets.length>1)announce(`${b.dataset.card==='BLANK'?'블랭크 커버':b.dataset.card} ${targets.length}개를 채웠습니다.`);return}if(b.dataset.format){state.format=b.dataset.format;changed();return}if(b.dataset.jump!==undefined){const n=Number(b.dataset.jump);if(n<=state.maxStep){state.step=n;changed()}return}if(b.dataset.action==='remove'){focusSlotAfterRender=modalSlot;changedSlot=state.slot;modalSlot=null;delete state.placements[state.slot];delete state.links[state.slot];syncPorts();changed();return}
      // "남은 N칸 블랭크로 채우기"(2-3): 빈 슬롯만 BLANK로 바꾸고, 이미 넣은 카드는 그대로 둔다. 실행 취소 1단계.
      if(b.dataset.action==='fill-blanks'){const filled=RtCore.fillBlanks(state);state.placements=filled.placements;syncPorts();changed();return}
      if(b.dataset.action==='back'){state.step=Math.max(0,state.step-1);changed();return}if(b.dataset.action==='next'||b.dataset.action==='preview-next'){state.step=state.step===5?0:state.step+1;state.maxStep=Math.max(state.maxStep,state.step);changed()}});
    root.addEventListener('change',event=>{const select=event.target;if(!select.dataset.link)return;const id=select.dataset.owner;const old=state.links[id]||{device:'',count:0,distance:'30'};if(select.dataset.link==='device'){old.device=select.value;old.count=select.value?Math.max(old.count,1):0}else if(select.dataset.link==='count'){old.count=Number(select.value)}else old.distance=select.value;state.links[id]=old;syncPorts();changed()});
    function updateRequirementField(target){
      const field=target.dataset.requirementField;
      if(!field)return false;
      const item=[...state.requirements.inputs,...state.requirements.outputs].find(value=>value.id===target.dataset.owner);
      if(!item)return false;
      if(field==='quantity')item.quantity=Math.min(999,Math.max(1,Number(target.value)||1));
      else if(field==='distance')item.distance=target.value===''?null:Math.min(2000,Math.max(0,Number(target.value)||0));
      else if(field==='txRequired'||field==='rxRequired')item[field]=target.checked;
      else item[field]=target.value;
      return true;
    }
    function updatePortField(target){
      const field=target.dataset.portField,key=target.dataset.owner;
      if(!field||!state.portAssignments[key])return false;
      if(field==='quantity')state.portAssignments[key].quantity=target.checked?1:0;
      else state.portAssignments[key][field]=target.value;
      return true;
    }
    root.addEventListener('input',event=>{if(updateRequirementField(event.target)||updatePortField(event.target))persist()});
    root.addEventListener('change',event=>{if(updateRequirementField(event.target)||updatePortField(event.target))changed()});
    root.addEventListener('focusout',event=>{if(event.target.matches('input[data-requirement-field],input[data-port-field]'))changed()});
    const storageKey='rtcom.configuration.v1';
    let history=[],historyIndex=-1;
    const status=root.querySelector('#save-status');
    function announce(message){status.textContent=message}
    // 0.55: 브라우저 기본 confirm 창(주소가 제목으로 나오고 모양을 바꿀 수 없음) 대신 사이트 글래스 스타일 확인 창을 쓴다(사용자 요청 "팝업이 이쁘게 나오게해줘").
    // Promise<boolean>을 돌려준다. Esc·바깥 누르기·취소는 false, 확인은 true.
    function rtConfirm({title,message,ok='확인',cancel='취소',tone='info'}){
      return new Promise(resolve=>{
        const dialog=document.createElement('dialog');
        dialog.className=`rt-confirm rt-confirm-${tone}`;
        dialog.setAttribute('aria-labelledby','rt-confirm-title');
        const icon=tone==='warn'?'<path d="M12 8v5M12 16.5v.5" stroke-linecap="round"/><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/>':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5" stroke-linecap="round"/>';
        dialog.innerHTML=`<div class="rt-confirm-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg></div><h3 id="rt-confirm-title">${esc(title)}</h3>${String(message||'').split('\n').map(line=>`<p>${esc(line)}</p>`).join('')}<div class="rt-confirm-actions"><button type="button" class="rt-confirm-cancel" value="cancel">${esc(cancel)}</button><button type="button" class="rt-confirm-ok" value="ok">${esc(ok)}</button></div>`;
        let done=false;
        const finish=result=>{if(done)return;done=true;if(dialog.open)dialog.close();dialog.remove();resolve(result)};
        dialog.addEventListener('click',event=>{const b=event.target.closest('button');if(b)finish(b.value==='ok');else if(event.target===dialog)finish(false)});
        dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false)});
        root.appendChild(dialog);
        if(typeof dialog.showModal==='function'){dialog.showModal();dialog.querySelector('.rt-confirm-ok').focus()}
        else{dialog.remove();resolve(window.confirm([title,message].filter(Boolean).join('\n')))}
      });
    }
    function confirmReset(){return Object.keys(state.placements).length?rtConfirm({title:'구성을 바꿀까요?',message:'제품군이나 프레임을 바꾸면 고른 카드와 전송기가 초기화됩니다.\n실행 취소로 되돌릴 수 있습니다.',ok:'변경',tone:'warn'}):Promise.resolve(true)}
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
      const names={ERROR:'오류',WARNING:'경고',UNVERIFIED:'미확정',VALID:'충족'};
      return `<section class="rt-validation" aria-label="검토 결과"><h3>검토 결과 <span class="rt-pill">${names[result.status]}</span></h3><p>슬롯 구성과 카드·전송 장비의 확인 상태를 표시합니다.</p><ul>${result.issues.map(i=>`<li data-level="${i.level}"><strong>${names[i.level]}</strong><span>${esc(i.message)}${i.evidence?` <small>근거: ${esc(i.evidence)}</small>`:''}</span></li>`).join('')}</ul><a href="docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md" target="_blank" rel="noopener">제품 근거 및 확인 필요 사항 보기 ↗</a></section>`;
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
      // 블랭크 커버를 넣은 슬롯도 보고서에 남긴다(0.37 검수: BOM에는 수량만 있고 어느 슬롯인지 보이지 않았음).
      const rows=currentSlots().filter(s=>slotCard(s.id)||state.placements[s.id]==='BLANK').map(s=>{
        if(state.placements[s.id]==='BLANK')return `<tr><td>${s.label}</td><td>블랭크 커버</td><td>0</td><td>-</td><td>-</td></tr>`;
        const c=slotCard(s.id),l=state.links[s.id];
        return `<tr><td>${s.label}</td><td>${esc(c[0])}</td><td>${c[2]}</td><td>${l?.device?esc(l.device):'미지정'}</td><td>${l?.device?l.count:0}</td></tr>`;
      }).join('');
      document.getElementById('print-report').innerHTML=`<h1>RTCOM Matrix Configuration</h1><p><strong>미검증 검토용 초안 · 설치 및 구매 승인 자료가 아닙니다.</strong></p><p>${esc(state.family)} / ${esc(state.model||'프레임 미선택')} · ${new Date().toLocaleString('ko-KR')}</p><h2>장비 목록</h2>${table()}<h2>카드 슬롯 구성</h2><table><thead><tr><th>슬롯</th><th>카드</th><th>채널</th><th>전송 장비</th><th>연결 채널</th></tr></thead><tbody>${rows||'<tr><td colspan="5">장착한 카드가 없습니다.</td></tr>'}</tbody></table>${validationView()}<p>카탈로그 버전: ${RtCore.catalogVersion} · 케이블·전원·기본 포함품은 별도 확인이 필요합니다.</p>`;
    }
    window.addEventListener('beforeprint',report);
    root.addEventListener('click',async event=>{
      const button=event.target.closest('[data-tool]');
      if(!button||button.disabled)return;
      const action=button.dataset.tool;
      if(action==='undo'||action==='redo'){
        const next=historyIndex+(action==='undo'?-1:1);
        if(next<0||next>=history.length)return;
        historyIndex=next;state=JSON.parse(history[next]);render();saveLocal();return;
      }
      if(action==='reset'){
        if(!await rtConfirm({title:'새 구성을 시작할까요?',message:'현재 구성은 실행 취소로 되돌릴 수 있습니다.',ok:'새로 시작',tone:'warn'}))return;
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
        if(Object.keys(state.placements).length&&!await rtConfirm({title:'불러온 구성으로 바꿀까요?',message:'현재 작업이 파일의 구성으로 바뀝니다.\n실행 취소로 되돌릴 수 있습니다.',ok:'바꾸기',tone:'warn'}))return;
        state=candidate;changed();announce(candidate.notice||'JSON 구성을 불러왔습니다. 검토 결과를 현재 기준으로 다시 계산했습니다.');
      }catch(error){announce('불러오기 실패: '+error.message)}
    });
    function initialize(){
      let message='이 브라우저에 자동 저장됩니다. 다른 기기로 옮길 때는 JSON 백업을 사용하세요.';
      try{
        const saved=localStorage.getItem(storageKey);
        if(saved){state=RtCore.parse(saved);message=state.notice||'이 브라우저에 저장된 구성을 복원했습니다.'}
      }catch(error){message='저장된 구성을 복원하지 못했습니다. '+error.message+' JSON 백업이 있으면 불러오세요.'}
      recordHistory();render();announce(message);
    }

    initialize();
  })();
