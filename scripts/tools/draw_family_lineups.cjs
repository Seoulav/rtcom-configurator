#!/usr/bin/env node
// 01 제품군 미리보기 대표 그림(XDM·SPX·VDM 제품군 그래픽 라인업)(사용자 요청 2026-09-29 "프레임 실물 이미지는 사용하지 말자 전부 그래픽이미지로 변경해줘").
// 예전 xdm.jpg·spx.jpg·vdm.jpg(카탈로그의 실물 사진, SPX에는 전송기 박스도 섞여 있음)를 대신해, 프레임 정면 평면 그림(output/design/assets/frames/*-front-art.webp)을
// 뒤 줄·앞 줄로 겹쳐 세운 제품군 그림을 만든다. 프레임 높이는 02 프레임 선택 미리보기와 같은 랙 높이(U) 로그 눈금(src/app.js frameShowHeight)이다.
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_family_lineups.cjs  → output/design/assets/{xdm,spx,vdm}-lineup-art.webp (python PIL 필요)
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const {chromium}=require('playwright');
process.chdir(path.resolve(__dirname,'../..'));
const FR='output/design/assets/frames/';
const RACK_U={'XDM-12':4,'XDM-20':9,'XDM-36':9,'XDM-72':16,'XDM-144':29,'XDM-216':40,'SPX-M810':2,'SPX-M1620':4,'SPX-M3236':7,'SPX-M2472':8,'SPX-M24120':8,'VDM-8X':3,'VDM-16X':7,'VDM-32X':12,'VDM-48X':19,'VDM-64X':24,'VDM-80X':27,'VDM-128X':37,'VDM-180X':38,'VDM-256X':39};
const showHeight=m=>Math.round(90+410*Math.log(RACK_U[m]/2)/Math.log(20));
// rows: 뒤 줄부터 그린다. drop: 그 줄의 바닥선을 아래로 내리는 양(px), overlap: 옆 프레임과 겹치는 비율, gap: 겹침 대신 벌리는 간격(px)
const FAMILIES={
  xdm:{rows:[{models:['XDM-216','XDM-144','XDM-72'],overlap:0.2,gap:26,drop:0},{models:['XDM-36','XDM-20','XDM-12'],overlap:0.18,gap:22,drop:120}]},
  spx:{rows:[{models:['SPX-M24120','SPX-M2472','SPX-M3236'],overlap:0.1,gap:30,drop:0},{models:['SPX-M1620','SPX-M810'],overlap:0.1,gap:34,drop:96}]},
  vdm:{rows:[{models:['VDM-256X','VDM-180X','VDM-128X','VDM-80X','VDM-64X'],overlap:0.12,gap:24,drop:0},{models:['VDM-32X','VDM-16X','VDM-8X'],overlap:0.12,gap:24,drop:104}]}
};
const dataUri=file=>`data:image/webp;base64,${fs.readFileSync(file).toString('base64')}`;
const size=file=>{const out=execFileSync('python3',['-c',`from PIL import Image;print(*Image.open(${JSON.stringify(file)}).size)`],{encoding:'utf8'}).trim().split(' ').map(Number);return out};
function layout(fam){
  const items=[];let maxRight=0,maxBottom=0;
  const rowInfo=fam.rows.map(row=>{
    const boxes=row.models.map(m=>{const file=`${FR}${m.toLowerCase()}-front-art.webp`,[w0,h0]=size(file),h=showHeight(m),w=Math.round(h*w0/h0);return {m,file,w,h}});
    const total=boxes.reduce((sum,b,i)=>sum+b.w+(i?row.gap-b.w*row.overlap:0),0);
    return {row,boxes,total};
  });
  const width=Math.max(...rowInfo.map(r=>r.total));
  const tallest=Math.max(...rowInfo.flatMap(r=>r.boxes.map(b=>b.h)));
  rowInfo.forEach(({row,boxes,total})=>{
    let x=(width-total)/2;
    boxes.forEach((b,i)=>{if(i)x+=row.gap-b.w*row.overlap;items.push({...b,x:Math.round(x),y:Math.round(tallest-b.h+row.drop)});x+=b.w});
  });
  items.forEach(it=>{maxRight=Math.max(maxRight,it.x+it.w);maxBottom=Math.max(maxBottom,it.y+it.h)});
  return {items,width:Math.round(maxRight),height:Math.round(maxBottom)};
}
(async()=>{
  const browser=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined});
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lineup-'));
  for(const [name,fam] of Object.entries(FAMILIES)){
    const {items,width,height}=layout(fam),pad=48,W=width+pad*2,H=height+pad*2;
    const body=items.map(it=>`<image href="${dataUri(it.file)}" x="${it.x+pad}" y="${it.y+pad}" width="${it.w}" height="${it.h}" filter="url(#sh)"/>`).join('');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="sh" x="-10%" y="-10%" width="125%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#141a28" flood-opacity="0.32"/></filter></defs><rect width="${W}" height="${H}" fill="#fff"/>${body}</svg>`;
    const k=Math.min(1,1800/W);
    const page=await browser.newPage({viewport:{width:Math.round(W*k),height:Math.round(H*k)},deviceScaleFactor:1});
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}svg{display:block;width:${Math.round(W*k)}px;height:${Math.round(H*k)}px}</style>${svg}`);
    const png=path.join(tmp,`${name}.png`);
    await page.screenshot({path:png,clip:{x:0,y:0,width:Math.round(W*k),height:Math.round(H*k)}});
    await page.close();
    const out=`output/design/assets/${name}-lineup-art.webp`;
    execFileSync('python3',['-c',`from PIL import Image;Image.open(${JSON.stringify(png)}).convert('RGB').save(${JSON.stringify(out)},'WEBP',quality=90,method=6)`]);
    console.log(`${out} ${Math.round(W*k)}x${Math.round(H*k)} (${items.length}종)`);
  }
  await browser.close();
})();
