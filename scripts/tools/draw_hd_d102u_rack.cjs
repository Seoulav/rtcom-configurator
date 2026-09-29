#!/usr/bin/env node
// HD-D102U Rack마운트 정면 평면 그림(사용자 요청 2026-09-28 "HD-D102U 연관제품으로 2분배기 프레임 추가 기존에 이미지 형태로 넣어줘 모델명은 HD-D102U Rack마운트").
// 사용자 제공 도면 "HD-D102U RACK · 최대 12개 장착가능"(PDF 1쪽, 배포 제외)의 정면을 mm 좌표 그대로 옮긴다. 치수: 폭 483 · 높이 177 · 고정 구멍 줄 간격 147.
// 0.130(사용자 요청 2026-09-29 "HD-D102U Rack마운트 이미지도 XDM-PSU 그래픽컨셉을 계승해줘", "윗면 옆면은 전부 삭제해줘 정면만 남겨줘"):
//  - 그래픽 컨셉은 XDM-PSU 그림(scripts/tools/draw_xdm_psu_panels.cjs)을 따른다: 밝은 회색 금속 몸체(#eceff4)·연한 랙 귀(#dfe3ea)·흰 모듈 카드,
//    구멍은 흰색에 어두운 테두리(#3a4150), 글자는 진한 남색(#1f2532). 이전의 검은 몸체(VDM·XDM·SPX 프레임 그림 방식)는 쓰지 않는다.
//  - 윗면·옆면 그림은 지우고 정면만 남겼다. 배치(mm 좌표)는 그대로라서 제품 데이터 portMap의 번호 좌표가 바뀌지 않는다.
// 0.133: 칸 번호를 파란 원 배지 + 흰 숫자로 키움(사용자 요청 2026-09-29 "분배기 장착 번호가 너무 작다 다른 색상으로 표기해서 눈의띄게 해줘").
// 0.134: 분배기 칸을 뺀 몸체·랙 귀·위아래 레일을 조금 어둡게(사용자 요청 2026-09-29 "분배기를 제외한 영역 색상 조금만 어둡게해줘"). 분배기 칸은 밝은 흰색 유지.
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_hd_d102u_rack.cjs  → output/design/assets/products/hd-d102u-rack-front-art.webp (python PIL 필요)
const path=require('path');
const P=require('./draw_vdm_frames.cjs');
const {f,rect,text,render}=P;
// XDM-PSU 그림과 같은 색(draw_xdm_psu_panels.cjs BODY·EDGE·INK·SUB 등)
const L={body:'#d5dae2',ear:'#c3c9d3',rail:'#dfe3ea',edge:'#7d8696',card:'#f7f8fa',cardLine:'#a9b1be',dark:'#3a4150',ink:'#1f2532'};
const hole=(cx,cy,r)=>`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#fff" stroke="${L.dark}" stroke-width="${f(r*0.4)}"/>`;
const slot=(cx,cy,w,h)=>rect(cx-w/2,cy-h/2,w,h,'#fff',L.dark,0.6,Math.min(w,h)/2);
const pin=(cx,cy,r)=>`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${L.dark}"/><path d="M${f(cx-r*0.55)} ${f(cy)}h${f(r*1.1)}M${f(cx)} ${f(cy-r*0.55)}v${f(r*1.1)}" stroke="${L.edge}" stroke-width="${f(r*0.22)}"/>`;
const PITCH=35.6,FIRST=47.6; // 칸 간격·첫 칸 중심(mm, 도면 실측)
const bayX=i=>FIRST+i*PITCH;

// 정면(483×177): 좌우 랙 귀(긴 구멍 2개씩) · 위아래 레일(칸마다 고정 구멍, 줄 간격 147) · HD-D102U 12칸(도면에 없는 실크 글자는 넣지 않는다).
function front(){
  let s=rect(0.5,0.5,482,176,L.body,L.edge,0.8,2.5);
  for(const x0 of [0.5,458.5]){s+=rect(x0,0.5,24,176,L.ear,L.edge,0.8,2);s+=slot(x0+12,38,7,4.2)+slot(x0+12,139,7,4.2)}
  s+=rect(25,0.5,433.5,28,L.rail,L.cardLine,0.55,1)+rect(25,148,433.5,28.5,L.rail,L.cardLine,0.55,1);
  for(let i=0;i<12;i++){
    const cx=bayX(i);
    s+=hole(cx,15,1.7)+hole(cx,162,1.7);
    s+=rect(cx-12.8,46.5,25.6,100.5,L.card,L.cardLine,0.6,1.2);
    for(const y of [66,81.7,96.6,111.5])s+=pin(cx,y,1.5);
    s+=rect(cx-1.3,125.5,2.6,3.6,'#fff',L.dark,0.5);
    // 장착 칸 번호: 작아서 안 보인다는 지적(사용자 요청 2026-09-29)에 따라 파란 원 배지에 흰 굵은 숫자로 키운다(사이트 강조색 #007aff).
    s+=`<circle cx="${f(cx)}" cy="137" r="6.2" fill="#007aff" stroke="#fff" stroke-width="0.8"/>`+text(cx,139.6,String(i+1),7.4,'#fff','text-anchor="middle" font-weight="800"');
  }
  return s;
}
if(require.main===module){
  process.chdir(path.resolve(__dirname,'../..'));
  render([{name:'../products/hd-d102u-rack-front-art',size:[483,177],body:front}]);
}
