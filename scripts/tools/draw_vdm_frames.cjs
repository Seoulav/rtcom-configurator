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
// 부품 함수와 render()는 XDM·SPX 후면 그림(scripts/tools/draw_xdm_spx_rear_frames.cjs)도 함께 쓴다.
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
// 0.120 VDM 카드 판넬 사진 비율(HIS4-U 929×162 등, 가로:세로 5.7:1). 모든 슬롯 칸을 이 비율로 그린다.
const CARD_RATIO=5.7;
const r2=n=>Math.round(n*100)/100;
// 세로 카드(16X~64X): 왼쪽 입력 | 가운데 칸 | 오른쪽 출력(입력과 좌우 대칭). 칸 높이 = 칸 너비 × 5.7.
// 0.179(사용자 요청 2026-09-29 "VDM 후면 그림도 실제 비율로 다시 그려줘"): H(목표 전체 높이)를 주면 슬롯 칸 모양(5.7:1)은 그대로 두고
// 모자란 높이를 위 통풍구(30%)와 슬롯 아래 통풍 판(70%)에 나눠 채운다. 가운데 칸(오디오·통신·전원)은 아래 통풍 판 끝까지 늘어난다.
function vsFrame(o){
  const cw=(o.inX[1]-o.inX[0])/o.cols,zh=cw*CARD_RATIO*o.rows,extra=o.H?Math.max(0,o.H-(o.top+zh+o.bottom)):0;
  const top=r2(o.top+extra*0.3),y1=r2(top+zh),H=o.H?o.H:r2(y1+o.bottom),outX=[r2(o.W-o.inX[1]),r2(o.W-o.inX[0])],foot=r2(H-y1-o.bottom);
  return {size:[o.W,H],input:[o.inX[0],top,o.inX[1],y1],output:[outX[0],top,outX[1],y1],cols:o.cols,slots:o.cols*o.rows,draw(){
    let s=top>=18?vents(10,4,o.W-20,top-7,Math.round(o.W/18),Math.max(2,Math.round((top-7)/10))):'';
    if(foot>6)for(const [x0,x1] of [o.inX,outX])s+=rect(x0,y1+2,x1-x0,foot-2,C.panel,C.edge,0.8,3)+vents(x0+4,y1+6,x1-x0-8,foot-10,Math.round((x1-x0)/14),Math.max(2,Math.round((foot-10)/9)));
    return s+center(o.inX[1],top,outX[0],foot>6?r2(H-o.bottom):y1,o.blocks,o.audioRows)}};
}
// 가로로 쌓는 대형 프레임(80X 이상): 위 명판 · 입력 · 가운데 띠 · 출력 · 아래 전원. 칸 높이 = 칸 너비 × 5.7.
// 0.179: H를 주면 모자란 높이를 grow=[위, 가운데 띠, 아래] 비율로 나눈다. 위는 명판 아래 통풍구, 아래는 전원 아래 통풍구로 그린다.
function vtFrame(o){
  const cw=(o.racks[0][1]-o.racks[0][0])/o.cols,zh=cw*CARD_RATIO*o.rows;
  const extra=o.H?Math.max(0,o.H-(o.top+zh*2+o.mid+o.bottom)):0,[gt,gm]=o.grow||[0,1,0];
  const top=r2(o.top+extra*gt),mid=r2(o.mid+extra*gm);
  const g={in0:top,in1:r2(top+zh)};g.out0=r2(g.in1+mid);g.out1=r2(g.out0+zh);g.H=o.H?o.H:r2(g.out1+o.bottom);
  const zones=(a,b)=>o.racks.length>1?o.racks.map(([x0,x1])=>[x0,a,x1,b]):[o.racks[0][0],a,o.racks[0][1],b];
  const ventStrip=(y0,y1)=>y1-y0>6?o.racks.map(([x0,x1])=>rect(x0,y0,x1-x0,y1-y0,C.panel,C.edge,0.8,3)+vents(x0+4,y0+3,x1-x0-8,y1-y0-6,Math.round((x1-x0)/14),Math.max(2,Math.round((y1-y0-6)/9)))).join(''):'';
  return {size:[o.W,g.H],input:zones(g.in0,g.in1),output:zones(g.out0,g.out1),cols:o.cols,slots:o.slots,draw(){return ventStrip(o.top,top-2)+o.draw(g)+ventStrip(g.out1+o.bottom,g.H-3)},extraIn:o.extraIn,extraOut:o.extraOut};
}
const REAR={
  'VDM-8X':{size:[637,195],input:[3,8,318,118],output:[329,8,634,118],cols:1,slots:2,horizontal:true,draw(){
    // 아래 왼쪽: DC 12V 입력 2개 + 통신 단자, 아래 오른쪽: 오디오 매트릭스 라우터(입력·출력 피닉스 줄).
    let s=rect(3,120,315,66,C.panel,C.line,1.2,3);
    s+=text(16,136,'DC 12V',9,C.sub,'font-weight="700"')+dcJack(28,160,11)+dcJack(58,160,11);
    s+=controlH(84,124,228,58);
    s+=audioRouter(329,120,305,66,2,8);
    return s}},
  // 0.120(사용자 요청 2026-09-28 "VDM카드를 정교하게 맞춰줘"): 슬롯 한 칸의 세로:가로(가로 카드는 가로:세로)를 VDM 카드 판넬 사진 비율 CARD_RATIO(5.7:1)와 똑같이 맞춘다.
  // 그전에는 매뉴얼 도면 좌표를 그대로 써서 칸 비율이 16X 6.2 · 64X 5.1 · 128X 3.9 · 180X 8.2 · 256X 5.2로 달라 카드 사진이 늘어나거나 눌렸다.
  // 칸 너비(열 수·좌우 위치)는 도면 배치를 따르고, 높이는 칸 너비 × 5.7로 계산해 그림 전체 높이를 정한다(vsFrame·vtFrame).
  'VDM-16X':vsFrame({W:449,H:317,inX:[2,165],cols:4,rows:1,top:24,bottom:3,blocks:2,audioRows:4}),
  'VDM-32X':vsFrame({W:458,H:554,inX:[8,165],cols:4,rows:2,top:10,bottom:12,blocks:2,audioRows:8}),
  'VDM-48X':vsFrame({W:448,H:859,inX:[8,165],cols:4,rows:3,top:8,bottom:12,blocks:2,audioRows:12}),
  // 64X는 4단이라 칸 너비를 도면(39)보다 좁혀(35) 전체 높이를 도면과 비슷하게 유지하고, 그만큼 가운데 칸을 넓혔다.
  // 0.179: H는 실제 후면 비율(몸체 폭 440mm ÷ 카탈로그 높이, 256X는 랙 2대 880mm ÷ 39U)에 맞춘 전체 높이다.
  'VDM-64X':vsFrame({W:451,H:1093,inX:[8,147],cols:4,rows:4,top:8,bottom:16,blocks:2,audioRows:16}),
  'VDM-80X':vtFrame({W:239,H:651,grow:[0,1,0],racks:[[6,234]],cols:11,rows:2,slots:20,top:20,mid:71,bottom:61,draw(g){
    let s=plate(50,5,140,12);
    s+=band(6,g.in1+2,234,g.out0-2,2,[],2);
    s+=powerH(6,g.out1+2,228,g.H-g.out1-5,2);
    return s},extraOut:(i)=>i===21?'control':null}),
  'VDM-128X':vtFrame({W:477,H:1782,grow:[0.3,0.4,0.3],racks:[[3,453]],cols:11,rows:3,slots:32,top:12,mid:93,bottom:115,draw(g){
    let s=plate(120,0.5,236,11);
    s+=band(3,g.in1+2,453,g.out0-2,4,[],4);
    const py=g.out1+2;
    s+=rect(3,py,450,110,C.panel,C.line,1.4,4)+text(228,py+27,'100-240VAC 50/60Hz',11,C.sub,'text-anchor="middle" font-weight="700"');
    s+=powerGroup(30,py+37,150,56,3)+powerGroup(296,py+37,150,56,3);
    s+=rect(456,12,18,g.out1-12,C.panel,C.edge,1,3);
    return s},extraIn:(i)=>i===32?'control':null}),
  'VDM-180X':vtFrame({W:170,H:652,grow:[0.35,0.3,0.35],racks:[[3,158]],cols:15,rows:3,slots:45,top:17,mid:66,bottom:45,draw(g){
    let s=plate(22,3,126,11);
    s+=band(3,g.in1+2,158,g.out0-2,2,[],1);
    const zh=g.in1-g.in0;
    s+=controlV(158.5,g.in0+zh*0.4,10.5,zh*0.58);
    s+=rect(158.5,g.out0,10.5,g.out1-g.out0,C.panel,C.edge,0.6,1.5);
    const py=g.out1+2;
    s+=rect(3,py,164,40,C.panel,C.line,0.8,2)+text(8,py+10,'100-240VAC 50/60Hz',6,C.sub,'font-weight="700"');
    s+=powerGroup(56,py+13,58,24,3)+vents(6,py+14,46,22,3,3)+vents(118,py+14,46,22,3,3);
    return s}}),
  'VDM-256X':vtFrame({W:472,H:930,grow:[0.3,0.4,0.3],racks:[[6,228],[235,456]],cols:11,rows:3,slots:32,top:12,mid:63,bottom:77,draw(g){
    let s='';
    for(const [x0,x1] of [[6,228],[235,456]]){
      s+=plate(x0+30,1,x1-x0-60,10);
      s+=band(x0,g.in1+2,x1,g.out0-2,4,[],2);
      const py=g.out1+2;
      s+=rect(x0,py,x1-x0,72,C.panel,C.line,1,3)+text((x0+x1)/2,py+14,'100-240VAC 50/60Hz',8,C.sub,'text-anchor="middle" font-weight="700"');
      s+=powerGroup(x0+10,py+24,(x1-x0)/2-18,40,3)+powerGroup((x0+x1)/2+8,py+24,(x1-x0)/2-18,40,3);
    }
    s+=rect(229,4,5,g.H-8,C.edge)+rect(458,12,11,g.out1-12,C.panel,C.edge,0.8,2);
    return s},extraIn:(i,rack)=>i===32&&rack===1?'control':null})
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
  // 0.135(사용자 요청 2026-09-29 "프레임 실물 이미지는 사용하지 말자 전부 그래픽이미지로 변경해줘"): 실물 사진(16X·48X 전면)을 같은 스타일의 평면 그림으로 바꾼다. 크기는 카탈로그 mm(483×310.3, 483×843.75).
  'VDM-16X':{size:[483,310],draw(W,H){return door(W,H,{ear:26,screen:[168,92,150,96],rocker:[360,120,24,44],handles:[[68,92,11,112],[404,92,11,112]],logo:[64,52,24],leds:[340,44,80],model:'VDM-16X',sub:'16X16 Cross-Platform Modular Matrix Router',textY:268})}},
  'VDM-48X':{size:[483,844],draw(W,H){return tower(W,H,{module:[26,8,457,262],screen:[236,70,200,120],model:'VDM-48X',sub:'48X48 Cross-Platform Modular Matrix Router',vents:[[40,318,403,190],[40,540,403,190],[40,752,403,72]],bolts:[520,738],logoY:290})}},
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
  const fs=Math.min(W>400?24:13,(mw-mx)/12); // 0.135: 폭 400 넘는 탑형(VDM-48X)은 글자·로고를 키운다
  s+=text(mx+6,mh-8-fs*0.9,o.model,fs,C.ink,'font-weight="900"')+text(mx+6,mh-6,o.sub,fs*0.5,C.sub,'font-weight="700"');
  s+=W>400?rocker(mw-46,sy+12,26,44):W>200?rocker(mw-40,sy+8,20,34):rocker(mx+6,sy+20,14,24);
  s+=logo(W/2,o.logoY||mh+34,Math.min(W>400?28:16,W*0.08)).replace('<text ','<text text-anchor="middle" ');
  for(const [vx,vy,vw,vh] of o.vents)s+=vents(vx,vy,vw,vh,W>200?7:5,Math.round(vh/14));
  for(const by of o.bolts)for(const fx of [0.2,0.5,0.8])s+=`<circle cx="${f(W*fx)}" cy="${by}" r="2.6" fill="#0b0c0f"/>`;
  s+=handle(e*0.3,H*0.22,e*0.4,H*0.12)+handle(W-e*0.7,H*0.22,e*0.4,H*0.12)+handle(e*0.3,H*0.66,e*0.4,H*0.12)+handle(W-e*0.7,H*0.66,e*0.4,H*0.12);
  return s;
}

// ---------- 렌더링 ----------
// items: {name, size:[W,H], body:()=>svg 문자열, palette?, input?, output?}. 긴 변 TARGET픽셀로 렌더링해 OUT/<name>.webp로 저장하고,
// input·output(원래 좌표)이 있으면 같은 배율로 늘린 새 좌표를 돌려준다. palette는 그 그림에서만 C 색을 덮어쓴다(XDM·SPX 몸체 색).
const TARGET=2000; // 긴 변 픽셀
const BASE={...C};
async function render(items){
  const browser=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined});
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'frame-art-'));
  const coords={};
  for(const item of items){
    const [W,H]=item.size,k=TARGET/Math.max(W,H),pw=Math.round(W*k),ph=Math.round(H*k);
    Object.assign(C,BASE,item.palette||{});
    const body=item.body();
    const page=await browser.newPage({viewport:{width:pw,height:ph},deviceScaleFactor:1});
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}svg{display:block;font-family:Pretendard,"Apple SD Gothic Neo","Noto Sans KR",Arial,sans-serif}</style><svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
    const png=path.join(tmp,`${item.name}.png`);
    await page.screenshot({path:png,clip:{x:0,y:0,width:pw,height:ph}});
    await page.close();
    execFileSync(process.env.PYTHON||'python3',['-c',`from PIL import Image;Image.open(${JSON.stringify(png)}).convert('RGB').save(${JSON.stringify(path.join(OUT,item.name+'.webp'))},'WEBP',quality=90,method=6)`]);
    console.log(`${OUT}/${item.name}.webp ${pw}x${ph}`);
    if(item.input){
      const sc=r=>Array.isArray(r[0])?r.map(sc):r.map(v=>Math.round(v*k));
      coords[item.name]={size:[pw,ph],input:sc(item.input),output:sc(item.output)};
    }
  }
  Object.assign(C,BASE);
  await browser.close();
  for(const [m,c] of Object.entries(coords))console.log(`${m} size:${JSON.stringify(c.size)},input:${JSON.stringify(c.input)},output:${JSON.stringify(c.output)}`);
  return coords;
}
module.exports={C,f,rect,text,screw,bay,zone,filler,phoenixRow,audioRouter,rj45,hdmi,db9,usb,dcJack,controlH,controlV,iec,powerH,fan,vents,plate,chassis,handle,ear,render,screenUI,rocker,logo,door,tower};
if(require.main===module){
  const only=process.argv[2];
  const items=[...Object.keys(FRONT).map(m=>({name:`${m.toLowerCase()}-front-art`,size:FRONT[m].size,body:()=>FRONT[m].draw(...FRONT[m].size),model:m})),
    ...Object.keys(REAR).map(m=>({name:`${m.toLowerCase()}-rear-art`,size:REAR[m].size,body:()=>rear(m),input:REAR[m].input,output:REAR[m].output,model:m}))].filter(item=>!only||item.model===only);
  render(items);
}
