#!/usr/bin/env node
// HD-D102U Rack마운트 평면 그림(사용자 요청 2026-09-28 "HD-D102U 연관제품으로 2분배기 프레임 추가 기존에 이미지 형태로 넣어줘 모델명은 HD-D102U Rack마운트").
// 사용자 제공 도면 "HD-D102U RACK · 최대 12개 장착가능"(PDF 1쪽, 배포 제외)의 정면·윗면·옆면을 mm 좌표 그대로 옮겨
// VDM·XDM·SPX 프레임 그림과 같은 검은 몸체 평면 그림으로 그린다. 치수: 폭 483 · 높이 177 · 깊이 282 · 고정 구멍 줄 간격 147.
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_hd_d102u_rack.cjs  → output/design/assets/products/hd-d102u-rack-*.webp
const path=require('path');
const P=require('./draw_vdm_frames.cjs');
const {C,f,rect,text,screw,render}=P;
const PALETTE={body:'#1d1f23',panel:'#18191d',bay:'#101114',edge:'#3d424b',line:'#555c68'};
const hole=(cx,cy,r)=>`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#fff" stroke="${C.edge}" stroke-width="${f(r*0.35)}"/>`;
const slot=(cx,cy,w,h)=>rect(cx-w/2,cy-h/2,w,h,'#fff',C.edge,Math.min(w,h)*0.18,Math.min(w,h)/2);
const dim=(x1,y1,x2,y2,label,vertical)=>{
  const tick=vertical?`M${f(x1-2)} ${f(y1)}h4M${f(x2-2)} ${f(y2)}h4`:`M${f(x1)} ${f(y1-2)}v4M${f(x2)} ${f(y2-2)}v4`;
  const tx=vertical?`<text x="${f(x1-3)}" y="${f((y1+y2)/2)}" font-size="9" fill="#4a6fa5" text-anchor="middle" transform="rotate(-90 ${f(x1-3)} ${f((y1+y2)/2)})">${label}</text>`:`<text x="${f((x1+x2)/2)}" y="${f(y1+11)}" font-size="9" fill="#4a6fa5" text-anchor="middle">${label}</text>`;
  return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}${tick}" stroke="#4a6fa5" stroke-width="0.4" fill="none"/>`+tx;
};
const PITCH=35.6,FIRST=47.6; // 칸 간격·첫 칸 중심(mm, 도면 실측)
const bayX=i=>FIRST+i*PITCH;

// 정면(483×177): 좌우 랙 귀(긴 구멍 2개씩) · 위아래 레일(칸마다 고정 나사 구멍, 줄 간격 147) · HD-D102U 12칸(도면에 없는 실크 글자는 넣지 않는다).
function front(){
  let s=rect(0.5,0.5,482,176,C.body,C.edge,0.8,2.5);
  for(const x0 of [0.5,458.5]){s+=rect(x0,0.5,24,176,'#24262b',C.edge,0.6,2);s+=slot(x0+12,38,7,4.2)+slot(x0+12,139,7,4.2)}
  s+=rect(25,0.5,433.5,28,C.panel,C.line,0.5,1)+rect(25,148,433.5,28.5,C.panel,C.line,0.5,1);
  for(let i=0;i<12;i++){
    const cx=bayX(i);
    s+=hole(cx,15,1.5)+hole(cx,162,1.5);
    s+=rect(cx-12.8,46.5,25.6,100.5,C.bay,C.line,0.55,1.2);
    for(const y of [66,81.7,96.6,111.5])s+=`<circle cx="${f(cx)}" cy="${y}" r="0.9" fill="#7f8896"/>`;
    s+=rect(cx-1.3,125.5,2.6,3.6,'none','#7f8896',0.5);
    s+=text(cx,142,String(i+1),4.2,C.sub,'text-anchor="middle" font-weight="700"');
  }
  return s;
}
// 윗면(483×282): 뒤쪽 판(칸 사이 세로 긴 구멍 13개, 고정 구멍) · 앞쪽 12칸(칸마다 통풍 슬릿) · 앞 플랜지.
function top(){
  let s=rect(26,0.5,432,280,C.body,C.edge,0.8,2);
  s+=rect(0.5,270,482,11.5,'#24262b',C.edge,0.6,1.5);
  for(const x of [35.6,448])for(const y of [34,85])s+=slot(x,y,6,3.6);
  for(let i=0;i<13;i++)s+=rect(61.5+i*30-1.6,20,3.2,98,'#0b0c0e',C.line,0.35,1.4);
  s+=`<path d="M26 199H458" stroke="${C.line}" stroke-width="0.6"/>`;
  for(let i=0;i<12;i++){
    const cx=bayX(i);
    s+=rect(cx-16,202,32,68,C.panel,C.line,0.45,1);
    for(let r=0;r<11;r++)s+=rect(cx-10,207+r*5.6,20,2.4,'#0b0c0e',null,0,1.2);
  }
  return s;
}
// 옆면(282×177): 앞 판(82) · 비스듬한 보강판 · 바닥 받침(깊이 282)과 고정 나사.
function side(){
  let s=`<path d="M0.5 0.5H82V29L182 148H281.5V176.5H0.5Z" fill="${C.body}" stroke="${C.edge}" stroke-width="0.8" stroke-linejoin="round"/>`;
  s+=`<path d="M0.5 29H82M0.5 148H182M82 148V176.5M182 148V176.5" stroke="${C.line}" stroke-width="0.6"/>`;
  for(const [x,y] of [[11,14],[70,14],[11,163],[70,163],[92,163],[171,163]])s+=screw(x,y,3.2);
  return s;
}
// 설명용 치수선을 넣은 치수 그림(정면 + 폭·높이·고정 구멍 줄 간격).
function frontDims(){
  return `<g transform="translate(38 4)">${front()}</g>`+dim(38,188,521,188,'483 mm')+dim(30,4,30,181,'177 mm',true)+dim(16,19,16,166,'147 mm',true);
}
if(require.main===module){
  process.chdir(path.resolve(__dirname,'../..'));
  const out=name=>`../products/${name}`;
  render([
    {name:out('hd-d102u-rack-front-art'),size:[483,177],body:front,palette:PALETTE},
    {name:out('hd-d102u-rack-top-art'),size:[483,282],body:top,palette:PALETTE},
    {name:out('hd-d102u-rack-side-art'),size:[282,177],body:side,palette:PALETTE},
    {name:out('hd-d102u-rack-dims-art'),size:[525,202],body:frontDims,palette:PALETTE}
  ]);
}
