#!/usr/bin/env node
// XDM·SPX 프레임 정면 평면 그림(사용자 요청 2026-09-29 "프레임 실물 이미지는 사용하지 말자 전부 그래픽이미지로 변경해줘").
// 구성기 02 프레임 선택 미리보기에서 실물 사진으로 남아 있던 XDM 6종·SPX 5종 정면을, VDM 정면 그림(scripts/tools/draw_vdm_frames.cjs)과 같은
// 진한 회색 몸체·랙 귀·LCD 화면 스타일의 평면 그림으로 바꾼다.
// - 크기(가로:세로)는 제품 데이터 lineup의 mm 값(XDM 482.6 × 177~1777.2, SPX 483 × 88.1~365)을 그대로 쓴다.
// - 배치·글자는 예전 실물 사진에 보이던 것만 옮긴다: XDM은 LCD와 "XDM nn / ULTRA HD MODULAR MATRIX ROUTER", 대형 XDM은 옆 손잡이,
//   SPX는 왼쪽 위 RTcom 로고·LCD·"SPX-Mnnn / 4K Scaling Matrix"(M810·M1620 오른쪽, M3236 가운데 아래, M2472·M24120 오른쪽 아래).
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_xdm_spx_front_frames.cjs  → output/design/assets/frames/{xdm,spx}-*-front-art.webp (python PIL 필요)
const path=require('path');
const P=require('./draw_vdm_frames.cjs');
const {C,f,rect,text,handle,ear,chassis,screenUI,render}=P;
const ORANGE='#F28C28';
// 왼쪽 위 RTcom 로고(SPX·XDM 사진의 RT 표시): "RT"는 주황, "com"은 흰색, 아래에 작은 Right technology.
const rtcom=(x,y,size)=>text(x,y,`<tspan fill="${ORANGE}">RT</tspan>com`,size,C.ink,'font-weight="900"')+text(x+size*0.1,y+size*0.5,'Right technology',size*0.36,C.sub,'font-weight="700"');
const xdmName=n=>`<tspan font-style="italic" fill="${ORANGE}">X</tspan>DM ${n}`;
// XDM: 랙 귀(긴 구멍) + 넓은 판 + LCD + 모델명·문구(가운데). 옆 손잡이는 대형(72 이상)만.
function xdm(model,o){
  const [W,H]=o.size;
  return {size:o.size,draw(){
    let s=ear(0,0,o.ear,H,o.holes)+ear(W-o.ear,0,o.ear,H,o.holes);
    s+=rect(o.ear,2,W-o.ear*2,H-4,C.body,C.edge,2,6);
    s+=rtcom(o.ear+16,o.logoY,o.logoSize||13);
    s+=screenUI(...o.screen);
    s+=text(W/2,o.textY,xdmName(model.replace('XDM-','')),o.font,C.ink,'text-anchor="middle" font-weight="900"');
    s+=text(W/2,o.textY+o.font*0.62,'ULTRA HD MODULAR MATRIX ROUTER',o.font*0.36,C.sub,'text-anchor="middle" font-weight="700"');
    for(const [hx,hy,hw,hh] of o.handles||[])s+=handle(hx,hy,hw,hh);
    return s}};
}
// SPX: 진한 몸체 + 왼쪽 위 RTcom 로고 + LCD 터치 스크린 + 모델명(SPX-Mnnn, M은 주황) + "4K Scaling Matrix"(4K는 주황).
const spxName=n=>`SPX-<tspan fill="${ORANGE}">M</tspan>${n}`;
const scaling=(x,y,size,anchor,extra='')=>text(x,y,`<tspan fill="${ORANGE}">4K</tspan> ${extra}Scaling Matrix`,size,C.ink,`text-anchor="${anchor}" font-weight="800"`);
function spx(model,o){
  const [W,H]=o.size,n=model.replace('SPX-M','');
  return {size:o.size,draw(){
    let s=o.ear?ear(0,0,o.ear,H,o.holes)+ear(W-o.ear,0,o.ear,H,o.holes)+rect(o.ear,2,W-o.ear*2,H-4,C.body,C.edge,2,6):chassis(W,H,3);
    if(!o.ear)for(const [cx,cy] of [[14,12],[W-14,12],[14,H-12],[W-14,H-12]])s+=`<circle cx="${f(cx)}" cy="${f(cy)}" r="3" fill="#0b0c0f"/>`;
    s+=rtcom(o.logo[0],o.logo[1],o.logo[2]);
    s+=rect(o.screen[0]-6,o.screen[1]-6,o.screen[2]+12,o.screen[3]+12,'#1b1e25',C.edge,1.4,6)+rect(...o.screen,C.screen,'#3a4150',1.2,3);
    s+=text(o.name[0],o.name[1],spxName(n),o.name[2],C.ink,`text-anchor="${o.anchor}" font-weight="900"`);
    s+=scaling(o.name[0],o.name[1]+o.name[2]*0.62+2,o.name[2]*0.42,o.anchor,o.sub||'');
    for(const [hx,hy,hw,hh] of o.handles||[])s+=handle(hx,hy,hw,hh);
    return s}};
}
const FRONT={
  'XDM-12':xdm('XDM-12',{size:[482.6,177],ear:20,holes:[0.2,0.8],logoY:34,screen:[150,22,182,102],textY:150,font:22}),
  'XDM-20':xdm('XDM-20',{size:[482.6,399.2],ear:20,holes:[0.1,0.5,0.9],logoY:52,screen:[150,90,182,112],textY:270,font:26}),
  'XDM-36':xdm('XDM-36',{size:[482.6,399.2],ear:20,holes:[0.1,0.5,0.9],logoY:52,screen:[120,80,242,134],textY:280,font:26}),
  'XDM-72':xdm('XDM-72',{size:[482.6,710.4],ear:22,holes:[0.05,0.35,0.65,0.95],logoY:70,logoSize:16,screen:[140,150,202,112],textY:330,font:26,handles:[[46,430,12,140],[424,430,12,140]]}),
  'XDM-144':xdm('XDM-144',{size:[482.6,1288.2],ear:22,holes:[0.03,0.3,0.5,0.7,0.97],logoY:84,logoSize:20,screen:[150,190,182,96],textY:372,font:34,handles:[[46,760,12,170],[424,760,12,170]]}),
  'XDM-216':xdm('XDM-216',{size:[482.6,1777.2],ear:22,holes:[0.03,0.25,0.5,0.75,0.97],logoY:84,logoSize:20,screen:[150,220,182,96],textY:412,font:34,handles:[[46,1040,12,190],[424,1040,12,190]]}),
  'SPX-M810':spx('SPX-M810',{size:[483,88.1],logo:[22,30,14],screen:[186,14,112,58],name:[456,50,22],anchor:'end'}),
  'SPX-M1620':spx('SPX-M1620',{size:[483,177],logo:[24,44,16],screen:[150,30,186,110],name:[459,96,24],anchor:'end'}),
  'SPX-M3236':spx('SPX-M3236',{size:[483,310.3],ear:26,holes:[0.1,0.5,0.9],logo:[52,52,17],screen:[150,66,183,120],name:[241.5,250,25],anchor:'middle',handles:[[70,100,12,110],[401,100,12,110]]}),
  'SPX-M2472':spx('SPX-M2472',{size:[483,365],ear:26,holes:[0.06,0.5,0.94],logo:[54,58,18],screen:[176,84,132,74],name:[452,318,17],anchor:'end',sub:'24 input '}),
  'SPX-M24120':spx('SPX-M24120',{size:[483,365],ear:26,holes:[0.06,0.5,0.94],logo:[54,58,18],screen:[176,84,132,74],name:[452,318,17],anchor:'end',sub:'24 input '})
};
if(require.main===module){
  process.chdir(path.resolve(__dirname,'../..'));
  const only=process.argv[2];
  render(Object.keys(FRONT).filter(m=>!only||m===only).map(m=>({name:`${m.toLowerCase()}-front-art`,size:FRONT[m].size,body:()=>FRONT[m].draw()})));
}
