#!/usr/bin/env node
// SPX-R6(6 HDMI Extender Module Chassis) 전면·후면 평면 그림(0.155, 사용자 결정 2026-09-29 "평면 그래픽").
// 사용자 제공 SPX-R6 제품 사양서(1쪽, 제품 상세 카탈로그 버튼으로 공개)의 실물 사진(전면)과 연결도(후면)를 배치 근거로 삼는다.
// 사진·연결도에는 AmberTech 로고가 찍혀 있어 그대로 쓰지 않고, SPX 프레임 그림(draw_xdm_spx_front_frames.cjs)과 같은
// 검은 몸체(draw_vdm_frames.cjs C 팔레트)로 다시 그린다. 로고는 그리지 않고, 사진에 보이는 글자(SPX-R6 · 6 HDMI Extender Module Chassis,
// FW, IR IN·Ctrl, MENU·CANCEL, HDMI IN·CAT OUT)만 옮긴다. 모듈 칸 번호(파란 원 1~6)는 단자 지도 설명을 위해 더한 표시다.
// 좌표 단위: 폭 483 × 높이 48(사진 전면 가로:세로 약 10:1). 렌더링은 긴 변 2000px(2000×199) → 제품 데이터 portMap 좌표 = 단위 × 2000/483.
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_spx_r6_panels.cjs  → output/design/assets/products/spx-r6-{front,rear}-art.webp (python PIL 필요)
const path=require('path');
const P=require('./draw_vdm_frames.cjs');
const {C,f,rect,text,screw,rj45,hdmi,usb,render}=P;
const W=483,H=48;
const LCD='#9ccc3c',LCD_D='#5f8a1c',KEY='#eef1f5',BLUE='#007aff';
// 배치(단위). 전면은 사진 비율(얼굴 폭 기준 LCD 0.20~0.34, 방향 버튼 0.48, MENU·CANCEL 0.54·0.57, 모델명 0.72, FW 0.905, IR 0.937·0.958)을 따른다.
const FRONT={lcd:[97,15,66,18],pad:[232,24],menu:261,cancel:276,name:348,fw:437,irIn:452,irCtrl:464};
// 후면은 연결도(전원 칸 1개 + 모듈 칸 6개, 칸마다 왼쪽 HDMI IN · 오른쪽 CAT OUT)를 따른다.
const POWER_W=33,BAY_W=(W-POWER_W)/6;
const bayX=i=>POWER_W+i*BAY_W;
const HDMI_FX=0.21,RJ_FX=0.73;
const jack=(cx,cy,r)=>`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${C.port}" stroke="${C.metal}" stroke-width="${f(r*0.35)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*0.38)}" fill="#3a4150"/>`;
const key=(cx,cy,s)=>rect(cx-s/2,cy-s/2,s,s,KEY,'#8e97a6',0.35,0.8);
const tri=(cx,cy,s,dir)=>{const d={up:[[0,-1],[-1,0.7],[1,0.7]],down:[[0,1],[-1,-0.7],[1,-0.7]],left:[[-1,0],[0.7,-1],[0.7,1]],right:[[1,0],[-0.7,-1],[-0.7,1]]}[dir];return `<polygon points="${d.map(([x,y])=>`${f(cx+x*s)},${f(cy+y*s)}`).join(' ')}" fill="${KEY}"/>`};

function front(){
  let s=rect(0.5,0.5,W-1,H-1,C.body,C.edge,0.7,2.2);
  for(const [x,y] of [[6,6],[W-6,6],[6,H-6],[W-6,H-6]])s+=`<circle cx="${x}" cy="${y}" r="1.1" fill="#0b0c0f"/>`;
  // LCD 표시창(초록 글자판)
  const [lx,ly,lw,lh]=FRONT.lcd;
  s+=rect(lx-2,ly-2,lw+4,lh+4,'#15171c',C.edge,0.5,1.2)+rect(lx,ly,lw,lh,LCD,LCD_D,0.5,0.6);
  // 방향 버튼(상하좌우 + 가운데)과 바깥 삼각 표시
  const [px,py]=FRONT.pad,k=5.6,g=6.4;
  s+=key(px,py,k)+key(px,py-g,k)+key(px,py+g,k)+key(px-g,py,k)+key(px+g,py,k);
  s+=tri(px,py-g-5.2,1.8,'up')+tri(px,py+g+5.2,1.8,'down')+tri(px-g-5.2,py,1.8,'left')+tri(px+g+5.2,py,1.8,'right');
  for(const [x,label] of [[FRONT.menu,'MENU'],[FRONT.cancel,'CANCEL']])s+=key(x,py-1.5,5.6)+text(x,py+6.4,label,2.7,C.ink,'text-anchor="middle" font-weight="800"');
  // 모델명
  s+=text(FRONT.name,26,'SPX-R6',11,C.ink,'text-anchor="middle" font-weight="900" letter-spacing="0.2"');
  s+=text(FRONT.name,34.5,'6 HDMI Extender Module Chassis',4.2,C.sub,'text-anchor="middle" font-weight="700"');
  // FW(펌웨어 단자)·IR IN·IR Ctrl
  s+=text(FRONT.fw,18,'FW',3.2,C.ink,'text-anchor="middle" font-weight="800"')+usb(FRONT.fw-3.4,21.5,6.8,3.6);
  s+=text((FRONT.irIn+FRONT.irCtrl)/2,15.5,'IR',3.2,C.ink,'text-anchor="middle" font-weight="800"');
  s+=`<path d="M${FRONT.irIn-3} 14.4h2.4M${FRONT.irCtrl+0.6} 14.4h2.4M${FRONT.irIn-3} 14.4v2.2M${FRONT.irCtrl+3} 14.4v2.2" stroke="${C.sub}" stroke-width="0.4" fill="none"/>`;
  s+=jack(FRONT.irIn,23.4,2.2)+jack(FRONT.irCtrl,23.4,2.2);
  s+=text(FRONT.irIn,31,'IN',2.8,C.ink,'text-anchor="middle" font-weight="800"')+text(FRONT.irCtrl,31,'Ctrl',2.8,C.ink,'text-anchor="middle" font-weight="800"');
  return s;
}
function rear(){
  let s=rect(0.5,0.5,W-1,H-1,C.body,C.edge,0.7,2.2);
  // 전원 칸: 원형 전원 입력 단자(연결도의 외부 어댑터 연결)
  s+=rect(2,2.5,POWER_W-3,H-5,C.panel,C.line,0.4,1.2);
  const pcx=POWER_W/2+0.5,pcy=H/2;
  s+=`<circle cx="${f(pcx)}" cy="${f(pcy)}" r="8" fill="${C.port}" stroke="${C.metal}" stroke-width="1.4"/><circle cx="${f(pcx)}" cy="${f(pcy)}" r="5.6" fill="none" stroke="#5d6573" stroke-width="0.6"/>`;
  for(const [dx,dy] of [[-2.4,-2.4],[2.4,-2.4],[-2.4,2.4],[2.4,2.4]])s+=`<circle cx="${f(pcx+dx)}" cy="${f(pcy+dy)}" r="0.9" fill="${C.metal}"/>`;
  s+=`<path d="M${f(pcx-1.2)} ${f(pcy-6.2)}h2.4v1.6h-2.4z" fill="${C.metal}"/>`;
  // 모듈 칸 6개: 칸마다 HDMI IN · CAT OUT, 손나사 2개, 칸 번호(파란 원)
  for(let i=0;i<6;i++){
    const x=bayX(i);
    s+=rect(x+1,2.5,BAY_W-2,H-5,C.bay,C.edge,0.45,1.2);
    s+=screw(x+4.2,7,1.5)+screw(x+BAY_W-4.2,7,1.5);
    const hx=x+BAY_W*HDMI_FX,rx=x+BAY_W*RJ_FX;
    s+=text(hx,15.5,'HDMI IN',3.3,C.ink,'text-anchor="middle" font-weight="800"')+text(rx,11.5,'CAT OUT',3.3,C.ink,'text-anchor="middle" font-weight="800"');
    s+=hdmi(hx-6.2,20,12.4,5.4)+rj45(rx-6.6,14.5,13.2,12);
    s+=`<circle cx="${f(x+BAY_W/2)}" cy="37.6" r="4.2" fill="${BLUE}" stroke="#fff" stroke-width="0.6"/>`+text(x+BAY_W/2,39.4,String(i+1),5,'#fff','text-anchor="middle" font-weight="800"');
  }
  return s;
}
module.exports={W,H,FRONT,POWER_W,BAY_W,bayX,HDMI_FX,RJ_FX};
if(require.main===module){
  process.chdir(path.resolve(__dirname,'../..'));
  render([{name:'../products/spx-r6-front-art',size:[W,H],body:front},{name:'../products/spx-r6-rear-art',size:[W,H],body:rear}]).then(()=>{
    const k=2000/W,px=v=>Math.round(v*k);
    console.log('portMap 좌표(px):',JSON.stringify({
      front:{irIn:[px(FRONT.irIn-3),px(FRONT.irIn+3)],irCtrl:[px(FRONT.irCtrl-3),px(FRONT.irCtrl+3)],fw:[px(FRONT.fw-4),px(FRONT.fw+4)],lcd:[px(FRONT.lcd[0]-2),px(FRONT.lcd[0]+FRONT.lcd[2]+2)],keys:[px(FRONT.pad[0]-14),px(FRONT.cancel+5)]},
      rear:{hdmi1:[px(bayX(0)+BAY_W*HDMI_FX-6.6),px(bayX(0)+BAY_W*HDMI_FX+6.6)],cat1:[px(bayX(0)+BAY_W*RJ_FX-7),px(bayX(0)+BAY_W*RJ_FX+7)],bays:[px(bayX(0)+1),px(W-1)],power:[px(2),px(POWER_W-1)]}
    }));
  });
}
