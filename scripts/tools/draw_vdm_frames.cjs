#!/usr/bin/env node
// VDM 프레임 전면·후면 평면 그림(사용자 요청 2026-09-28 "XDM-PSU랙 만든것처럼 현재 VDM프레임 중 고해상도 사진이 없는건 전면/후면 모든 제품 만들어줘").
// 실물 사진이 있는 VDM-16X(전면·후면)와 VDM-48X(전면)는 그대로 두고, 매뉴얼(VDM 국문 매뉴얼 KV07 pp.12–20) 선 도면만 쓰던 나머지를
// 실물 사진(VDM-16X)과 같은 검은 몸체의 평면 그림으로 다시 그린다.
// - 좌표 단위는 원래 매뉴얼 도면의 픽셀이다. 후면 입력·출력 슬롯 영역(src/app.js rearPhotos)을 그대로 따라 그리고 SCALE배로 렌더링하므로,
//   app.js 좌표는 원래 값에 SCALE을 곱한 값이 된다(실행하면 새 좌표를 출력한다).
// - 부품 배치: 전면은 7" LCD 터치 스크린·전원 스위치·접이식 핸들(매뉴얼 1.4 Front View), 후면은 입력·출력 보드 슬롯,
//   오디오 매트릭스 라우터(5핀 피닉스), 통신 단자(HDMI·LAN·REMOTE·FIRMWARE), 전원 포트(1.5 Rear View, VDM-16X 실물 사진)다.
//   VDM-8X는 외부 DC 12V 전원(매뉴얼 2.2 VDM-8X 사양)이다.
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_vdm_frames.cjs  → 임시 PNG를 만든 뒤 python(PIL)으로 webp 저장
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const {chromium}=require('playwright');
const OUT='output/design/assets/frames';
const C={body:'#2a2e36',panel:'#22252c',bay:'#1a1c21',edge:'#474d59',line:'#5d6573',ink:'#eef1f5',sub:'#a3acba',screw:'#c9ced6',green:'#34C759',greenD:'#1c7a36',port:'#0e1014',metal:'#b9c0cb',screen:'#0b0f16'};
const f=n=>+n.toFixed(2);

// ---------- 공통 부품 ----------
const rect=(x,y,w,h,fill,stroke,sw,rx=0)=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(rx)}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${f(sw)}"`:''}/>`;
const text=(x,y,s,size,fill,opt='')=>`<text x="${f(x)}" y="${f(y)}" font-size="${f(size)}" fill="${fill}" ${opt}>${s}</text>`;
const screw=(cx,cy,r)=>`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${C.screw}" stroke="#8e97a6" stroke-width="${f(r*0.18)}"/><path d="M${f(cx-r*0.5)} ${f(cy)}h${f(r)}M${f(cx)} ${f(cy-r*0.5)}v${f(r)}" stroke="#6b7482" stroke-width="${f(r*0.22)}"/>`;
// 빈 카드 슬롯(블랭크 판넬 + 손나사 2개). vertical이면 위·아래, 아니면 좌·우에 나사.
function bay(x,y,w,h,vertical){
  const m=Math.min(w,h),r=m*0.16;
  let s=rect(x+m*0.04,y+m*0.04,w-m*0.08,h-m*0.08,C.bay,C.edge,m*0.035,m*0.06);
  s+=vertical?screw(x+w/2,y+m*0.3,r)+screw(x+w/2,y+h-m*0.3,r):screw(x+m*0.3,y+h/2,r)+screw(x+w-m*0.3,y+h/2,r);
  return s;
}
// 슬롯 영역을 cols열로 나눠 count칸은 빈 슬롯, 남는 칸은 extra(i, x,y,w,h)로 그린다(없으면 빈칸 판넬).
function zone([x0,y0,x1,y1],cols,count,vertical,extra){
  const rows=Math.ceil(count/cols),cw=(x1-x0)/cols,ch=(y1-y0)/rows;let s='';
  for(let i=0;i<cols*rows;i++){
    const x=x0+(i%cols)*cw,y=y0+Math.floor(i/cols)*ch;
    s+=i<count?bay(x,y,cw,ch,vertical):(extra?extra(i,x,y,cw,ch):filler(x,y,cw,ch));
  }
  return s;
}
const filler=(x,y,w,h)=>rect(x+Math.min(w,h)*0.04,y+Math.min(w,h)*0.04,w-Math.min(w,h)*0.08,h-Math.min(w,h)*0.08,C.panel,C.edge,Math.min(w,h)*0.03,Math.min(w,h)*0.05);
// 5핀 피닉스 단자 한 줄(오디오 매트릭스 라우터).
function phoenixRow(x,y,w,h,groups){
  let s=rect(x,y,w,h,C.green,C.greenD,h*0.08,h*0.12);
  const gw=w/groups;
  for(let g=0;g<groups;g++){for(let p=0;p<5;p++){const px=x+g*gw+gw*0.1+p*gw*0.16;s+=rect(px,y+h*0.25,gw*0.1,h*0.5,'#0f3d1c')}}
  return s;
}
function audioRouter(x,y,w,h,rows,groups,label=true){
  let s=rect(x,y,w,h,C.panel,C.line,Math.min(w,h)*0.012,Math.min(w,h)*0.02);
  const pad=w*0.08,top=label?h*0.06:h*0.03,gap=(h-top-h*0.03)/rows;
  if(label)s+=text(x+pad*0.6,y+top*0.75,'AUDIO',Math.min(top*0.7,w*0.08),C.sub,'font-weight="800"');
  for(let r=0;r<rows;r++)s+=phoenixRow(x+pad,y+top+r*gap+gap*0.18,w-pad*2,gap*0.64,groups);
  return s;
}
const rj45=(x,y,w,h)=>rect(x,y,w,h,C.metal,'#3a4150',w*0.06,w*0.08)+rect(x+w*0.18,y+h*0.18,w*0.64,h*0.64,C.port)+rect(x+w*0.34,y+h*0.62,w*0.32,h*0.2,C.metal);
const hdmi=(x,y,w,h)=>`<path d="M${f(x)} ${f(y)}h${f(w)}v${f(h*0.6)}l${f(-w*0.14)} ${f(h*0.4)}h${f(-w*0.72)}l${f(-w*0.14)} ${f(-h*0.4)}z" fill="${C.port}" stroke="${C.metal}" stroke-width="${f(h*0.12)}"/>`;
const db9=(x,y,w,h)=>`<path d="M${f(x)} ${f(y)}h${f(w)}l${f(-w*0.1)} ${f(h)}h${f(-w*0.8)}z" fill="${C.port}" stroke="${C.metal}" stroke-width="${f(h*0.1)}"/>`+screw(x-w*0.16,y+h/2,h*0.22)+screw(x+w*1.16,y+h/2,h*0.22);
const usb=(x,y,w,h)=>rect(x,y,w,h,C.port,C.metal,h*0.14,h*0.15);
const dcJack=(cx,cy,r)=>`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${C.port}" stroke="${C.metal}" stroke-width="${f(r*0.22)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*0.3)}" fill="${C.metal}"/>`;
// 통신 단자 판(가로): HDMI · LAN · REMOTE(RS-232) · FIRMWARE(USB). 라벨은 VDM-16X 실물 사진 기준.
function controlH(x,y,w,h){
  let s=rect(x,y,w,h,C.panel,C.line,h*0.03,h*0.06);
  const cy=y+h*0.58,ph=h*0.34,lab=Math.min(h*0.17,w*0.042),ly=y+h*0.3;
  const items=[['HDMI',0.14,(px)=>hdmi(px-w*0.08,cy-ph/2,w*0.16,ph*0.8)],['LAN',0.37,(px)=>rj45(px-w*0.07,cy-ph/2,w*0.14,ph)],['REMOTE',0.63,(px)=>db9(px-w*0.1,cy-ph*0.4,w*0.2,ph*0.8)],['FIRMWARE',0.87,(px)=>usb(px-w*0.045,cy-ph*0.2,w*0.09,ph*0.4)]];
  for(const [name,fx,draw] of items){const px=x+w*fx;s+=text(px,ly,name,lab,C.sub,'text-anchor="middle" font-weight="700"')+draw(px)}
  return s;
}
// 세로 통신 단자 판(대형 프레임의 남는 슬롯 칸).
function controlV(x,y,w,h){
  let s=rect(x+w*0.04,y+w*0.04,w*0.92,h-w*0.08,C.panel,C.line,w*0.035,w*0.06);
  const pw=w*0.62,px=x+(w-pw)/2,lab=Math.min(w*0.2,h*0.035);
  const items=[['HDMI',(py)=>hdmi(px,py,pw,pw*0.42)],['LAN',(py)=>rj45(px+pw*0.08,py,pw*0.84,pw*0.72)],['REMOTE',(py)=>db9(px+pw*0.18,py,pw*0.64,pw*0.4)],['USB',(py)=>usb(px+pw*0.3,py,pw*0.4,pw*0.22)]];
  items.forEach(([name,draw],i)=>{const py=y+h*(0.14+i*0.2);s+=text(x+w/2,py-lab*0.5,name,lab,C.sub,'text-anchor="middle" font-weight="700"')+draw(py)});
  return s;
}
// 전원 입력(IEC 인렛 n개 + 접지 단자). 이중화 전원(매뉴얼 Standard Dual Redundant Power).
function iec(x,y,w,h){return rect(x,y,w,h,'#101216',C.metal,w*0.06,w*0.1)+`<path d="M${f(x+w*0.2)} ${f(y+h*0.22)}h${f(w*0.6)}v${f(h*0.4)}l${f(-w*0.14)} ${f(h*0.18)}h${f(-w*0.32)}l${f(-w*0.14)} ${f(-h*0.18)}z" fill="${C.port}" stroke="#5d6573" stroke-width="${f(w*0.04)}"/>`+[0.35,0.5,0.65].map(fx=>rect(x+w*fx-w*0.04,y+h*0.36,w*0.08,h*0.18,C.metal)).join('')}
function powerH(x,y,w,h,n,label=true){
  let s=rect(x,y,w,h,C.panel,C.line,h*0.03,h*0.06);
  const ih=h*0.62,iw=Math.min(ih*0.78,w/(n+1.6)),gap=(w-iw*n-ih*0.5)/(n+2);
  if(label)s+=text(x+w*0.04,y+h*0.2,'100-240VAC 50/60Hz',h*0.13,C.sub,'font-weight="700"');
  for(let i=0;i<n;i++)s+=iec(x+gap*(i+1)+iw*i,y+h*0.3,iw,ih);
  s+=screw(x+w-gap-ih*0.25,y+h*0.62,ih*0.2);
  return s;
}
function fan(cx,cy,r){
  let s=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${C.bay}" stroke="${C.line}" stroke-width="${f(r*0.05)}"/>`;
  for(let k=1;k<=4;k++)s+=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*k/4.6)}" fill="none" stroke="${C.edge}" stroke-width="${f(r*0.05)}"/>`;
  s+=`<path d="M${f(cx-r*0.92)} ${f(cy)}H${f(cx+r*0.92)}M${f(cx)} ${f(cy-r*0.92)}V${f(cy+r*0.92)}" stroke="${C.edge}" stroke-width="${f(r*0.05)}"/>`;
  return s+`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*0.16)}" fill="${C.edge}"/>`;
}
function vents(x,y,w,h,cols,rows){
  let s='';const cw=w/cols,rh=h/rows;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)s+=rect(x+c*cw+cw*0.12,y+r*rh+rh*0.3,cw*0.76,rh*0.4,C.port,null,0,rh*0.2);
  return s;
}
const plate=(x,y,w,h)=>rect(x,y,w,h,C.panel,C.line,h*0.06,h*0.12)+text(x+w/2,y+h*0.66,'Manufactured and Assembled in Korea',Math.min(h*0.42,w/22),C.sub,'text-anchor="middle" font-weight="700"');
const chassis=(w,h,t)=>rect(t*0.5,t*0.5,w-t,h-t,C.body,C.edge,t,t*2);

// ---------- 후면 ----------
// 슬롯 영역은 src/app.js rearPhotos(원래 매뉴얼 도면 픽셀)과 같다.
const REAR={
  'VDM-8X':{size:[637,195],input:[3,8,318,118],output:[329,8,634,118],cols:1,slots:2,horizontal:true,draw(){
    // 아래 왼쪽: DC 12V 입력 2개 + 통신 단자, 아래 오른쪽: 오디오 매트릭스 라우터(입력·출력 피닉스 줄).
    let s=rect(3,120,315,66,C.panel,C.line,1.2,3);
    s+=text(16,136,'DC 12V',9,C.sub,'font-weight="700"')+dcJack(28,160,11)+dcJack(58,160,11);
    s+=controlH(84,124,228,58);
    s+=audioRouter(329,120,305,66,2,8);
    return s}},
  'VDM-32X':{size:[458,473],input:[8,10,165,459],output:[286,10,448,459],cols:4,slots:8,draw(){return center(165,10,286,459,2,8)}},
  'VDM-48X':{size:[448,677],input:[8,8,165,663],output:[282,8,442,663],cols:4,slots:12,draw(){return center(165,8,282,663,2,12)}},
  'VDM-64X':{size:[451,819],input:[8,8,165,802],output:[280,8,440,802],cols:4,slots:16,draw(){return center(165,8,280,802,2,16)}},
  'VDM-80X':{size:[239,631],input:[6,20,234,259],output:[6,330,234,570],cols:11,slots:20,draw(){
    let s=plate(50,5,140,12);
    s+=band(6,261,234,328,2,[[0.2,0.5]],2);
    s+=powerH(6,572,228,56,2);
    return s},extraIn:null,extraOut:(i)=>i===21?'control':null},
  'VDM-128X':{size:[477,1176],input:[3,12,453,489],output:[3,582,453,1061],cols:11,slots:32,draw(){
    let s=plate(120,0.5,236,11);
    s+=band(3,491,453,580,4,[],4);
    s+=rect(3,1063,450,110,C.panel,C.line,1.4,4)+text(228,1090,'100-240VAC 50/60Hz',11,C.sub,'text-anchor="middle" font-weight="700"');
    s+=powerGroup(30,1100,150,56,3)+powerGroup(296,1100,150,56,3);
    s+=rect(456,12,18,1049,C.panel,C.edge,1,3);
    return s},extraIn:(i)=>i===32?'control':null},
  'VDM-180X':{size:[170,636],input:[3,17,158,270],output:[3,336,158,591],cols:15,slots:45,draw(){
    let s=plate(22,3,126,11);
    s+=band(3,272,158,334,2,[],1);
    s+=controlV(158.5,150,10.5,118);
    s+=rect(158.5,336,10.5,255,C.panel,C.edge,0.6,1.5);
    s+=rect(3,593,164,40,C.panel,C.line,0.8,2)+text(8,603,'100-240VAC 50/60Hz',6,C.sub,'font-weight="700"');
    s+=powerGroup(56,606,58,24,3)+vents(6,607,46,22,3,3)+vents(118,607,46,22,3,3);
    return s}},
  'VDM-256X':{size:[472,777],input:[[6,12,228,325],[235,12,456,325]],output:[[6,388,228,700],[235,388,456,700]],cols:11,slots:32,draw(){
    let s='';
    for(const [x0,x1] of [[6,228],[235,456]]){
      s+=plate(x0+30,1,x1-x0-60,10);
      s+=band(x0,327,x1,386,4,[],2);
      s+=rect(x0,702,x1-x0,72,C.panel,C.line,1,3)+text((x0+x1)/2,716,'100-240VAC 50/60Hz',8,C.sub,'text-anchor="middle" font-weight="700"');
      s+=powerGroup(x0+10,726,(x1-x0)/2-18,40,3)+powerGroup((x0+x1)/2+8,726,(x1-x0)/2-18,40,3);
    }
    s+=rect(229,4,5,770,C.edge)+rect(458,12,11,688,C.panel,C.edge,0.8,2);
    return s},extraIn:(i,rack)=>i===32&&rack===1?'control':null}
};
// 16X~64X 가운데 칸: 명판 · 오디오 매트릭스 라우터(블록 2개, 블록마다 입력 N/2… 피닉스 줄) · 통신 단자 · 전원(IEC 2개).
function center(x0,y0,x1,y1,blocks,rows){
  const w=x1-x0,h=y1-y0,pad=w*0.05;let s=rect(x0,y0,w,h,C.panel,C.line,1,3);
  s+=plate(x0+pad,y0+pad,w-pad*2,w*0.13);
  const ctrlH=w*0.34,powH=w*0.4,top=y0+pad*2+w*0.13,bottom=y1-ctrlH-powH-pad*2.2;
  const bh=(bottom-top-pad*(blocks-1))/blocks;
  for(let b=0;b<blocks;b++)s+=audioRouter(x0+pad,top+b*(bh+pad),w-pad*2,bh,rows,4,b===0);
  s+=controlH(x0+pad,bottom+pad,w-pad*2,ctrlH);
  s+=powerH(x0+pad,bottom+pad*1.6+ctrlH,w-pad*2,powH,2);
  return s;
}
// 대형 프레임 가운데 띠: 오디오 매트릭스 라우터 줄 + 냉각 팬.
function band(x0,y0,x1,y1,fans,_,audioBlocks){
  const w=x1-x0,h=y1-y0;let s=rect(x0,y0,w,h,C.panel,C.line,Math.min(w,h)*0.015,3);
  if(fans===2&&audioBlocks<=2&&w<300){
    const r=Math.min(h*0.4,w*0.16);s+=fan(x0+w*0.2,y0+h/2,r)+fan(x0+w*0.8,y0+h/2,r);
    if(audioBlocks===2)s+=audioRouter(x0+w*0.36,y0+h*0.1,w*0.28,h*0.8,6,2,false);
    return s;
  }
  const ah=h*0.36;
  for(let b=0;b<audioBlocks;b++){const bw=(w-w*0.04)/audioBlocks;s+=audioRouter(x0+w*0.02+b*bw+bw*0.02,y0+h*0.06,bw*0.96,ah,2,4,false)}
  const r=Math.min(h*0.24,w/(fans*3.2));
  for(let i=0;i<fans;i++)s+=fan(x0+w*(i+0.5)/fans,y0+h*0.06+ah+(h-ah-h*0.06)/2,r);
  return s;
}
function powerGroup(x,y,w,h,n){return powerH(x,y,w,h,n,false)}

function rear(model){
  const d=REAR[model],[W,H]=d.size,t=Math.max(W,H)/400;
  let s=chassis(W,H,t);
  const vertical=!d.horizontal;
  const rects=dir=>Array.isArray(d[dir][0])?d[dir]:[d[dir]];
  for(const dir of ['input','output'])rects(dir).forEach((r,rack)=>{
    const want=dir==='input'?d.extraIn:d.extraOut;
    s+=zone(r,d.cols,d.slots,vertical,(i,x,y,w,h)=>want&&want(i,rack)==='control'?controlV(x,y,w,h):filler(x,y,w,h));
  });
  return s+d.draw();
}

// ---------- 전면 ----------
// 매뉴얼 1.4 Front View: ① 7" LCD 터치 스크린 ② 전원 On/Off 스위치 ③ 접이식 핸들. 로고·문구 배치는 VDM-16X 실물 사진을 따른다.
function screenUI(x,y,w,h){
  let s=rect(x,y,w,h,C.screen,'#3a4150',Math.min(w,h)*0.04,Math.min(w,h)*0.04);
  const p=Math.min(w,h)*0.1;
  s+=rect(x+p,y+p,w-p*2,h*0.14,'#1f6feb',null,0,h*0.03);
  for(let r=0;r<3;r++)for(let c=0;c<4;c++)s+=rect(x+p+c*(w-p*2)/4+w*0.01,y+p+h*0.22+r*h*0.2,(w-p*2)/4-w*0.02,h*0.14,r===0&&c===0?'#2ea043':'#1c2330',null,0,h*0.02);
  return s;
}
function rocker(x,y,w,h){return rect(x,y,w,h,'#111','#3a4150',w*0.08,w*0.12)+rect(x+w*0.18,y+h*0.12,w*0.64,h*0.76,C.green,C.greenD,w*0.06,w*0.08)+rect(x+w*0.44,y+h*0.2,w*0.12,h*0.22,'#fff')+`<circle cx="${f(x+w/2)}" cy="${f(y+h*0.7)}" r="${f(w*0.1)}" fill="none" stroke="#fff" stroke-width="${f(w*0.05)}"/>`}
function handle(x,y,w,h){return rect(x,y,w,h,C.metal,'#6b7482',w*0.14,w*0.5)+rect(x-w*0.3,y-w*0.3,w*1.6,w*1.2,'#8e97a6',null,0,w*0.3)+rect(x-w*0.3,y+h-w*0.9,w*1.6,w*1.2,'#8e97a6',null,0,w*0.3)}
function ear(x,y,w,h,holes){let s=rect(x,y,w,h,'#23262d',C.edge,w*0.06,w*0.12);holes.forEach(fy=>{s+=rect(x+w*0.3,y+h*fy-w*0.2,w*0.4,w*0.4,'#0b0c0f',null,0,w*0.2)});return s}
const logo=(x,y,size)=>text(x,y,`Digital Extender<tspan font-size="${f(size*0.45)}" dy="${f(-size*0.4)}">®</tspan>`,size,'#F28C28','font-weight="900" font-style="italic"');
const FRONT={
  'VDM-8X':{size:[626,193],draw(W,H){
    let s=chassis(W,H,1.6);
    s+=logo(24,40,20)+screenUI(205,30,215,130)+rocker(572,78,26,38)+text(585,70,'POWER',9,C.sub,'text-anchor="middle" font-weight="700"');
    s+=text(24,160,'VDM-8X',14,C.ink,'font-weight="900"')+text(24,180,'Digital Multi-format Modular Matrix Router 8X8',12,C.sub,'font-weight="700"')+text(604,180,'MADE IN KOREA',7,C.sub,'text-anchor="end" font-weight="700"');
    return s}},
  'VDM-32X':{size:[485,473],draw(W,H){return door(W,H,{ear:30,screen:[180,190,160,95],rocker:[393,208,26,46],handles:[[70,182,12,114],[440,182,12,114]],logo:[88,145,22],leds:[360,142,82],model:'VDM-32X',sub:'32X32 Cross-Platform Modular Matrix Router',textY:330})}},
  'VDM-64X':{size:[500,819],draw(W,H){return door(W,H,{ear:26,screen:[180,365,156,86],rocker:[385,388,24,40],handles:[[72,352,12,108],[432,352,12,108]],logo:[80,335,20],leds:[368,322,82],model:'VDM-64X',sub:'64X64 Cross-Platform Modular Matrix Router',textY:495})}},
  'VDM-128X':{size:[484,1176],draw(W,H){return door(W,H,{ear:18,screen:[115,190,106,82],rocker:[248,200,20,34],handles:[[78,296,10,60],[262,296,10,60]],logo:[70,160,22],leds:[232,146,42],model:'VDM-128X',sub:'128X128 Cross-Platform Modular Matrix Router',textY:436,bodyW:330})}},
  'VDM-256X':{size:[485,777],draw(W,H){return door(W,H,{ear:20,screen:[182,185,104,74],rocker:[310,186,18,30],handles:[[150,282,9,56],[320,282,9,56]],logo:[110,142,22],leds:[292,140,40],model:'VDM-256X',sub:'256X256 Cross-Platform Modular Matrix Router',textY:410})}},
  'VDM-80X':{size:[270,638],draw(W,H){return tower(W,H,{module:[16,6,238,172],screen:[112,70,110,66],model:'VDM-80X',sub:'80X80 Cross-Platform Modular Matrix Router',vents:[[26,232,218,110],[26,444,218,110],[26,562,218,60]],bolts:[410]})}},
  'VDM-180X':{size:[189,636],draw(W,H){return tower(W,H,{module:[14,4,162,128],screen:[68,24,106,82],model:'VDM-180X',sub:'180X180 Cross-Platform Modular Matrix Router',vents:[[20,550,150,64]],bolts:[357,600],logoY:186})}}
};
// 문형 전면(32X·64X·128X·256X): 랙 귀 + 넓은 판 + 스크린·스위치·핸들.
function door(W,H,o){
  const bw=o.bodyW?Math.min(W-o.ear*2,o.bodyW+o.ear*0):W-o.ear*2;
  let s=ear(0,0,o.ear,H,[0.06,0.5,0.94])+ear(W-o.ear,0,o.ear,H,[0.06,0.5,0.94]);
  s+=rect(o.ear,2,W-o.ear*2,H-4,C.body,C.edge,2,6);
  const [sx,sy,sw,sh]=o.screen,[rx,ry,rw,rh]=o.rocker,[lx,ly,ls]=o.logo,[ex,ey,ew]=o.leds;
  s+=logo(lx,ly,ls)+screenUI(sx,sy,sw,sh)+rocker(rx,ry,rw,rh);
  for(let i=0;i<4;i++)s+=rect(ex+i*ew/4,ey,ew/4-1.5,ew*0.07,i===0?C.green:'#39414e',null,0,1);
  for(const [hx,hy,hw,hh] of o.handles)s+=handle(hx,hy,hw,hh);
  s+=text(lx,o.textY,o.model,Math.max(ls*0.72,W*0.03),C.ink,'font-weight="900"')+text(W-o.ear-20,o.textY,o.sub,Math.max(ls*0.5,W*0.018),C.sub,'text-anchor="end" font-weight="700"');
  return s;
}
// 탑형 전면(80X·180X): 위 제어 모듈(스크린) + 아래 통풍 판.
function tower(W,H,o){
  const e=Math.max(10,W*0.05);
  let s=ear(0,0,e,H,[0.04,0.3,0.5,0.7,0.96])+ear(W-e,0,e,H,[0.04,0.3,0.5,0.7,0.96]);
  s+=rect(e,2,W-e*2,H-4,C.body,C.edge,1.6,4);
  const [mx,my,mw,mh]=o.module,[sx,sy,sw,sh]=o.screen;
  s+=rect(mx,my,mw-mx,mh-my,'#30343d',C.edge,1.4,4)+screenUI(sx-(W>200?40:0),sy,sw,sh);
  const fs=Math.min(13,(mw-mx)/12);
  s+=text(mx+6,mh-8-fs*0.9,o.model,fs,C.ink,'font-weight="900"')+text(mx+6,mh-6,o.sub,fs*0.5,C.sub,'font-weight="700"');
  s+=W>200?rocker(mw-40,sy+8,20,34):rocker(mx+6,sy+20,14,24);
  s+=logo(W/2,o.logoY||mh+34,Math.min(16,W*0.08)).replace('<text ','<text text-anchor="middle" ');
  for(const [vx,vy,vw,vh] of o.vents)s+=vents(vx,vy,vw,vh,W>200?7:5,Math.round(vh/14));
  for(const by of o.bolts)for(const fx of [0.2,0.5,0.8])s+=`<circle cx="${f(W*fx)}" cy="${by}" r="2.6" fill="#0b0c0f"/>`;
  s+=handle(e*0.3,H*0.22,e*0.4,H*0.12)+handle(W-e*0.7,H*0.22,e*0.4,H*0.12)+handle(e*0.3,H*0.66,e*0.4,H*0.12)+handle(W-e*0.7,H*0.66,e*0.4,H*0.12);
  return s;
}

// ---------- 렌더링 ----------
const TARGET=2000; // 긴 변 픽셀
(async()=>{
  const browser=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined});
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vdm-'));
  const only=process.argv[2];
  const jobs=[...Object.keys(FRONT).map(m=>[m,'front']),...Object.keys(REAR).map(m=>[m,'rear'])].filter(([m])=>!only||m===only);
  const coords={};
  for(const [model,side] of jobs){
    const d=side==='front'?FRONT[model]:REAR[model],[W,H]=d.size,k=TARGET/Math.max(W,H),pw=Math.round(W*k),ph=Math.round(H*k);
    const body=side==='front'?d.draw(W,H):rear(model);
    const page=await browser.newPage({viewport:{width:pw,height:ph},deviceScaleFactor:1});
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}svg{display:block;font-family:Pretendard,"Apple SD Gothic Neo","Noto Sans KR",Arial,sans-serif}</style><svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
    const name=`${model.toLowerCase()}-${side}-art`,png=path.join(tmp,`${name}.png`);
    await page.screenshot({path:png,clip:{x:0,y:0,width:pw,height:ph}});
    await page.close();
    execFileSync('python3',['-c',`from PIL import Image;Image.open(${JSON.stringify(png)}).convert('RGB').save(${JSON.stringify(path.join(OUT,name+'.webp'))},'WEBP',quality=90,method=6)`]);
    console.log(`${OUT}/${name}.webp ${pw}x${ph}`);
    if(side==='rear'){
      const sc=r=>Array.isArray(r[0])?r.map(sc):r.map(v=>Math.round(v*k));
      coords[model]={size:[pw,ph],input:sc(d.input),output:sc(d.output)};
    }
  }
  await browser.close();
  for(const [m,c] of Object.entries(coords))console.log(`${m} size:${JSON.stringify(c.size)},input:${JSON.stringify(c.input)},output:${JSON.stringify(c.output)}`);
})();
