#!/usr/bin/env node
// XDM·SPX 프레임 후면 평면 그림(사용자 요청 2026-09-28 "후면 장착시 프레임을 XDM,SPx,모두 프레임을 너가 만들어 변경해줘").
// 구성기 03 카드 슬롯 화면의 후면 사진(매뉴얼 사진, 해상도 낮음)을 VDM(0.111, scripts/tools/draw_vdm_frames.cjs)과 같은 평면 그림으로 바꾼다.
// - 좌표 단위는 원래 후면 사진 픽셀이다. 입력·출력 슬롯 영역은 src/app.js rearPhotos와 같고, 긴 변 2000px로 렌더링한 뒤
//   같은 배율로 늘린 좌표를 출력한다. XDM-216은 후면 사진이 없어 XDM-144와 같은 모양으로 한 줄(18칸)씩 늘려 그린다.
// - 부품은 각 매뉴얼 후면 사진을 따른다.
//   XDM(XDM 국문 매뉴얼 pp.8–11): 윗면·아랫면 통풍 슬랫, 제어 단자 DANTE(RJ45 2개)·LAN·RS-232·FIRMWARE, 전원 모듈 2개(IEC + 빨간 스위치 + 팬 타공, 100-240VAC 50/60Hz).
//   SPX(SPX 국문 사용자 매뉴얼 250805 pp.6–9): 검은 몸체, 제어 단자 LAN·RS232·S/P, 전원(빨간 스위치 + IEC), 큰 프레임은 통풍 슬랫과 손잡이.
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_xdm_spx_rear_frames.cjs [모델]
const P=require('./draw_vdm_frames.cjs');
const {C,f,rect,text,screw,bay,filler,rj45,db9,usb,iec,chassis,handle,render}=P;
const XDM_PALETTE={body:'#3a3f48',panel:'#31353d',bay:'#24272d',edge:'#5b626e',line:'#6a7280'};
const SPX_PALETTE={body:'#1d1f23',panel:'#18191d',bay:'#111215',edge:'#3d424b',line:'#4a505a'};

// ---------- 부품 ----------
// 슬롯 영역을 cols열로 나눠 빈 카드 슬롯을 그린다(칸 수 = 구성기 슬롯 수).
function slots([x0,y0,x1,y1],cols,count,vertical){
  const rows=Math.ceil(count/cols),cw=(x1-x0)/cols,ch=(y1-y0)/rows;let s='';
  for(let i=0;i<cols*rows;i++){const x=x0+(i%cols)*cw,y=y0+Math.floor(i/cols)*ch;s+=i<count?bay(x,y,cw,ch,vertical):filler(x,y,cw,ch)}
  return s;
}
// 빗살 통풍구(XDM 윗면·전원 위, SPX 대형 프레임).
function slats(x,y,w,h,n,tilt=0.35){
  let s=rect(x,y,w,h,C.panel,C.line,Math.min(w,h)*0.02,Math.min(w,h)*0.08);
  const step=w/n,t=h*tilt;
  for(let i=0;i<n;i++){const sx=x+step*(i+0.25);s+=`<path d="M${f(sx+t)} ${f(y+h*0.15)}L${f(sx)} ${f(y+h*0.85)}" stroke="${C.port}" stroke-width="${f(step*0.42)}" stroke-linecap="round"/>`}
  return s;
}
function vslats(x,y,w,h,n){let s=rect(x,y,w,h,C.panel,C.line,w*0.04,w*0.2);const step=h/n;for(let i=0;i<n;i++)s+=rect(x+w*0.2,y+step*(i+0.3),w*0.6,step*0.4,C.port,null,0,step*0.2);return s}
function redRocker(x,y,w,h){return rect(x,y,w,h,'#111','#3a4150',w*0.08,w*0.12)+rect(x+w*0.16,y+h*0.12,w*0.68,h*0.76,'#e0463c','#8f1f18',w*0.06,w*0.08)+rect(x+w*0.46,y+h*0.2,w*0.08,h*0.24,'#fff')+`<circle cx="${f(x+w/2)}" cy="${f(y+h*0.7)}" r="${f(w*0.1)}" fill="none" stroke="#fff" stroke-width="${f(w*0.05)}"/>`}
function perforation(x,y,w,h){
  let s='';const r=Math.min(w,h)*0.05,gx=r*3.1,gy=r*2.7,cols=Math.floor(w/gx),rows=Math.floor(h/gy);
  for(let j=0;j<rows;j++)for(let i=0;i<cols-(j%2);i++)s+=`<circle cx="${f(x+gx*(i+0.5+(j%2)*0.5))}" cy="${f(y+gy*(j+0.5))}" r="${f(r)}" fill="${C.port}"/>`;
  return s;
}
// XDM 전원 모듈: IEC 인렛 + 빨간 스위치 + 팬 타공 + 손잡이 + 손나사.
function xdmPsu(x,y,w,h){
  let s=rect(x,y,w,h,C.panel,C.line,Math.min(w,h)*0.02,Math.min(w,h)*0.04);
  const m=Math.min(w*0.22,h*0.5);
  s+=screw(x+w*0.05,y+h*0.45,h*0.07)+screw(x+w*0.95,y+h*0.45,h*0.07);
  s+=iec(x+w*0.1,y+h*0.3,m*0.62,m*0.8)+redRocker(x+w*0.1+m*0.7,y+h*0.32,m*0.46,m*0.74);
  s+=text(x+w*0.47,y+h*0.2,'100-240VAC 50/60Hz',h*0.085,C.sub,'font-weight="700"');
  s+=perforation(x+w*0.47,y+h*0.26,w*0.4,h*0.5);
  s+=rect(x+w*0.42,y+h*0.82,w*0.46,h*0.07,C.metal,'#6b7482',h*0.015,h*0.035);
  return s;
}
// 제어 단자(가로 줄·세로 칸). items: [라벨, 종류, 위치(0~1)]. 종류: rj45 · rj45x2 · db9 · usb
function port(kind,cx,cy,u){
  if(kind==='rj45')return rj45(cx-u*0.55,cy-u*0.5,u*1.1,u);
  if(kind==='rj45x2')return rj45(cx-u*1.2,cy-u*0.5,u*1.1,u)+rj45(cx+u*0.1,cy-u*0.5,u*1.1,u);
  if(kind==='db9')return db9(cx-u*0.9,cy-u*0.4,u*1.8,u*0.8);
  return usb(cx-u*0.35,cy-u*0.18,u*0.7,u*0.36);
}
function ctrlRow(x,y,w,h,items,plate=true){
  let s=plate?rect(x,y,w,h,C.panel,C.line,h*0.03,h*0.06):'';
  const u=h*0.4,lab=h*0.2;
  for(const [label,kind,fx] of items){const cx=x+w*fx;s+=port(kind,cx,y+h*0.6,u)+text(cx,y+h*0.24,label,lab,C.sub,'text-anchor="middle" font-weight="700"')}
  return s;
}
function ctrlCol(x,y,w,h,items,plate=true){
  let s=plate?rect(x,y,w,h,C.panel,C.line,w*0.03,w*0.08):'';
  const u=Math.min(w*0.34,h*0.075),lab=Math.min(w*0.15,u*0.45);
  for(const [label,kind,fy] of items){const cy=y+h*fy;s+=port(kind,x+w/2,cy,u)+text(x+w/2,cy+u*(kind==='rj45x2'?0.95:0.85),label,lab,C.sub,'text-anchor="middle" font-weight="700"')}
  return s;
}
const blank=(x,y,w,h,label)=>{const m=Math.min(w,h);let s=rect(x,y,w,h,C.panel,C.edge,m*0.012,m*0.02)+screw(x+m*0.06,y+m*0.06,m*0.035)+screw(x+w-m*0.06,y+m*0.06,m*0.035)+screw(x+m*0.06,y+h-m*0.06,m*0.035)+screw(x+w-m*0.06,y+h-m*0.06,m*0.035);if(label)s+=text(x+w/2,y+h*0.9,label,Math.min(w*0.07,h*0.03),C.sub,'text-anchor="middle" font-weight="800"');return s};
const rail=(x,y,w,h)=>rect(x,y,w,h,C.body,C.edge,h*0.04,0)+rect(x+w*0.38,y+h*0.36,w*0.24,h*0.28,C.metal,'#6b7482',h*0.04,h*0.14);
const XDM_CTRL_V=[['DANTE','rj45x2',0.2],['LAN','rj45',0.42],['RS-232','db9',0.6],['FIRMWARE','usb',0.76]];
const SPX_CTRL=[['LAN','rj45'],['RS232','db9'],['S/P','usb']];

// ---------- XDM ----------
// 큰 프레임(20·36·72·144·216) 공통: 윗면 슬랫 · 슬롯 · 오른쪽 제어 칸 · 아래 레일 · 슬랫 · 전원 모듈 2개.
function xdmTower(W,H,o){
  let s=chassis(W,H,Math.max(W,H)/400);
  s+=slats(4,3,W-8,o.top-6,Math.round(W/9));
  s+=slots(o.input,o.cols,o.count,true)+slots(o.output,o.cols,o.count,true);
  if(o.mid)s+=o.mid;
  const [cx0,cy0,cx1,cy1]=o.ctrl;s+=ctrlCol(cx0,cy0,cx1-cx0,cy1-cy0,XDM_CTRL_V);
  const b=o.bottom;
  s+=rail(4,b,W-8,H*0.03)+slats(8,b+H*0.035,W-16,H*0.045,Math.round(W/8));
  const py=b+H*0.085,ph=H-py-6;
  s+=xdmPsu(10,py,W/2-14,ph)+xdmPsu(W/2+4,py,W/2-14,ph);
  return s;
}
const XDM={
  'XDM-12':{size:[589,223],input:[8,32,294,119],output:[300,32,584,119],draw(){
    let s=chassis(589,223,1.6);
    s+=rect(4,4,581,24,C.panel,C.line,0.8,3)+text(14,21,'XDM-12',11,C.ink,'font-weight="900"');
    s+=slots(this.input,1,3,false)+slots(this.output,1,3,false)+rect(294.5,30,5,190,C.edge);
    s+=ctrlRow(8,121,286,27,[['DANTE','rj45x2',0.15],['LAN','rj45',0.4],['RS-232','db9',0.6],['FIRMWARE','usb',0.84]]);
    s+=blank(300,121,284,27);
    s+=xdmPsu(10,151,280,66)+xdmPsu(302,151,280,66);
    return s}},
  'XDM-20':{size:[525,478],input:[12,40,141,292],output:[273,40,410,292],draw(){return xdmTower(525,478,{top:40,input:this.input,output:this.output,cols:5,count:5,ctrl:[412,40,514,292],bottom:296,mid:blank(143,40,128,252)})}},
  'XDM-36':{size:[452,419],input:[9,34,214,252],output:[214,34,419,252],draw(){return xdmTower(452,419,{top:34,input:this.input,output:this.output,cols:9,count:9,ctrl:[420,34,448,252],bottom:256})}},
  'XDM-72':{size:[400,644],input:[5,46,372,242],output:[5,284,372,484],draw(){return xdmTower(400,644,{top:46,input:this.input,output:this.output,cols:18,count:18,ctrl:[373,46,396,484],bottom:488,mid:rail(5,244,367,38)})}},
  'XDM-144':{size:[366,1035],input:[8,44,336,392],output:[8,494,336,845],draw(){return xdmTower(366,1035,{top:44,input:this.input,output:this.output,cols:18,count:36,ctrl:[337,44,362,392],bottom:849,mid:rail(8,394,328,40)+slats(8,436,328,56,40)+rect(337,394,25,451,C.panel,C.edge,0.6,2)})}},
  // XDM-216: 후면 사진이 없어 XDM-144 모양에 슬롯 줄을 하나씩 더했다(입력·출력 각 18칸 × 3줄, 54슬롯).
  'XDM-216':{size:[366,1380],input:[8,44,336,566],output:[8,668,336,1190],draw(){return xdmTower(366,1380,{top:44,input:this.input,output:this.output,cols:18,count:54,ctrl:[337,44,362,566],bottom:1194,mid:rail(8,568,328,40)+slats(8,610,328,56,40)+rect(337,568,25,622,C.panel,C.edge,0.6,2)})}}
};

// ---------- SPX ----------
function spxPower(x,y,w,h){return rect(x,y,w,h,C.panel,C.line,w*0.03,w*0.08)+redRocker(x+w*0.22,y+h*0.1,w*0.56,h*0.28)+rect(x+w*0.18,y+h*0.44,w*0.64,h*0.08,C.port,C.metal,w*0.02,w*0.03)+iec(x+w*0.18,y+h*0.58,w*0.64,h*0.34)}
const SPX={
  'SPX-M810':{size:[1706,385],input:[210,60,1500,155],output:[210,155,1500,250],draw(){
    let s=chassis(1706,385,4)+rect(6,6,184,373,C.panel,C.edge,1.5,4)+rect(1516,6,184,373,C.panel,C.edge,1.5,4);
    s+=bay(200,14,1310,44,false);
    s+=slots(this.input,1,1,false)+slots(this.output,1,1,false);
    s+=ctrlRow(200,252,1310,86,SPX_CTRL.map(([l,k],i)=>[l,k,[0.47,0.57,0.71][i]]));
    s+=spxPower(1548,120,116,220);
    return s}},
  'SPX-M1620':{size:[662,418],input:[67,116,594,224],output:[67,224,594,332],draw(){
    let s=chassis(662,418,1.8);
    s+=handle(18,130,9,180);
    s+=bay(58,22,545,45,false)+bay(58,68,545,45,false);
    s+=slots(this.input,1,2,false)+slots(this.output,1,2,false);
    s+=ctrlRow(58,336,545,64,SPX_CTRL.map(([l,k],i)=>[l,k,[0.47,0.58,0.74][i]]));
    s+=spxPower(606,200,46,130);
    return s}},
  'SPX-M3236':{size:[1135,772],input:[124,16,932,236],output:[124,511,932,677],draw(){
    let s=chassis(1135,772,3);
    s+=vslats(22,20,40,732,34)+vslats(1073,20,40,732,34);
    s+=slots(this.input,1,4,false)+blank(114,240,828,267)+slots(this.output,1,3,false);
    s+=ctrlRow(114,680,828,82,SPX_CTRL.map(([l,k],i)=>[l,k,[0.45,0.55,0.66][i]]));
    s+=handle(982,270,14,190);
    s+=spxPower(952,500,62,160);
    return s}},
  'SPX-M2472':{size:[384,383],input:[3,40,63,323],output:[162,40,280,323],draw(){return spxTower(384,383,this,3,6,[64,40,161,323],[281,40,348,323],[350,40,381,323])}},
  'SPX-M24120':{size:[381,383],input:[2,40,62,322],output:[160,40,358,322],draw(){return spxTower(381,383,this,3,10,[63,40,159,322],null,[359,40,379,322])}}
};
// 세로 카드 SPX(M2472·M24120): 윗면 슬랫 · 입력 | MADE IN KOREA 빈 판 | 출력 | (빈 판) | 제어 칸 · 아래 레일 · 전원 + 슬랫.
function spxTower(W,H,d,inCount,outCount,gap,gap2,ctrl){
  let s=chassis(W,H,1.6);
  s+=slats(4,4,W-8,33,Math.round(W/8),0);
  s+=slots(d.input,inCount,inCount,true)+slots(d.output,outCount,outCount,true);
  s+=blank(gap[0],gap[1],gap[2]-gap[0],gap[3]-gap[1],'MADE IN KOREA');
  if(gap2)s+=blank(gap2[0],gap2[1],gap2[2]-gap2[0],gap2[3]-gap2[1]);
  const [x0,y0,x1,y1]=ctrl;s+=ctrlCol(x0,y0,x1-x0,y1-y0,SPX_CTRL.map(([l,k],i)=>[l,k,[0.4,0.55,0.7][i]]));
  s+=rail(4,325,W-8,14);
  s+=rect(8,342,58,36,C.panel,C.line,0.6,2)+text(37,350,'100-240VAC 50/60Hz',4.4,C.sub,'text-anchor="middle" font-weight="700"')+iec(14,353,18,22)+redRocker(40,354,14,20);
  s+=slats(70,342,W-78,36,Math.round((W-78)/7),0);
  return s;
}

if(require.main===module){
  const only=process.argv[2];
  const items=[...Object.entries(XDM).map(([m,d])=>({model:m,name:`${m.toLowerCase()}-rear-art`,size:d.size,input:d.input,output:d.output,body:()=>d.draw(),palette:XDM_PALETTE})),
    ...Object.entries(SPX).map(([m,d])=>({model:m,name:`${m.toLowerCase()}-rear-art`,size:d.size,input:d.input,output:d.output,body:()=>d.draw(),palette:SPX_PALETTE}))].filter(item=>!only||item.model===only);
  render(items);
}
