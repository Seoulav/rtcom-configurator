#!/usr/bin/env node
// XDM-PSU 앞면·뒷면 평면 그림(0.105, 사용자 요청 2026-09-28 "02 PORTMAP을 앞면 뒤면을 아래 시그널 플로우 그대로 사용 및 계승해서 앞면 뒷면 만들어줘").
// 03 Signal Flow(src/products.js psuDiagram)와 같은 색·부품 모양(회색 금속 몸체, RJ45, 초록 피닉스, AC 인렛)으로 그리고,
// 제조사 도면(xdm-psu-front.webp·xdm-psu-rear.webp)의 배치(앞면 로고·채널 LED 16개, 뒷면 POH 8·PHX 8·AC 입력)를 따른다.
// 실행: NODE_PATH=$(npm root -g) node scripts/tools/draw_xdm_psu_panels.cjs  → 임시 PNG를 만든 뒤 python(PIL)으로 webp 저장
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const {chromium}=require('playwright');
const OUT='output/design/assets/products';
const BODY='#eceff4',EDGE='#8e97a6',INK='#1f2532',SUB='#687386';
const W=1400,H=300;
const rj45=(x,y,w=34,h=28)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fff" stroke="#3a4150" stroke-width="2.4"/><rect x="${x+w*0.3}" y="${y+h*0.62}" width="${w*0.4}" height="${h*0.26}" fill="#3a4150"/>`;
const screw=(cx,cy)=>`<circle cx="${cx}" cy="${cy}" r="8" fill="#3a4150"/><path d="M${cx-4} ${cy}h8M${cx} ${cy-4}v8" stroke="#8e97a6" stroke-width="1.6"/>`;
function rear(){
  let b=`<rect x="14" y="14" width="${W-28}" height="${H-28}" rx="10" fill="${BODY}" stroke="${EDGE}" stroke-width="3"/>`;
  for(let i=0;i<16;i++){
    const x=40+i*70,poh=i<8;
    b+=`<rect x="${x+3}" y="32" width="64" height="${H-64}" rx="4" fill="#f7f8fa" stroke="#b8bfcb" stroke-width="1.6"/>`+screw(x+35,50)+screw(x+35,H-50);
    b+=`<text x="${x+35}" y="84" text-anchor="middle" font-size="15" font-weight="800" fill="${INK}">${poh?'POH':'PHX'}</text>`;
    if(poh){
      b+=`<text x="${x+35}" y="106" text-anchor="middle" font-size="11" fill="${SUB}">CIS Card</text>`+rj45(x+18,114);
      b+=`<text x="${x+35}" y="170" text-anchor="middle" font-size="11" fill="${SUB}">Extender</text>`+rj45(x+18,178);
    }else{
      b+=`<text x="${x+35}" y="134" text-anchor="middle" font-size="11" fill="${SUB}">COS Card</text>`;
      b+=`<rect x="${x+24}" y="144" width="24" height="34" rx="3" fill="#34C759" stroke="#1c7a36" stroke-width="2"/><rect x="${x+30}" y="150" width="12" height="9" fill="#0f3d1c"/><rect x="${x+30}" y="164" width="12" height="9" fill="#0f3d1c"/>`;
      b+=`<text x="${x+15}" y="159" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}">+</text><text x="${x+15}" y="175" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}">−</text>`;
    }
  }
  // AC 입력(인렛 + 퓨즈 서랍)
  b+=`<text x="1270" y="70" text-anchor="middle" font-size="15" font-weight="800" fill="${INK}">100~240VAC</text><text x="1270" y="90" text-anchor="middle" font-size="13" fill="${SUB}">50~60Hz</text>`;
  b+=`<rect x="1222" y="104" width="96" height="78" rx="8" fill="#fff" stroke="#3a4150" stroke-width="2.6"/><path d="M1240 118h60l-8 22h-44z" fill="none" stroke="#3a4150" stroke-width="2"/><rect x="1250" y="124" width="8" height="12" fill="#3a4150"/><rect x="1266" y="122" width="8" height="12" fill="#3a4150"/><rect x="1282" y="124" width="8" height="12" fill="#3a4150"/>`;
  b+=`<rect x="1242" y="150" width="56" height="22" rx="3" fill="#e0463c"/><text x="1270" y="166" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">FUSE</text>`;
  b+=`<rect x="1232" y="192" width="76" height="40" rx="6" fill="#fff" stroke="#3a4150" stroke-width="2.2"/><rect x="1248" y="200" width="44" height="24" rx="3" fill="#3a4150"/><text x="1270" y="216" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">I / O</text>`;
  b+=`<text x="1270" y="258" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}">XDM-PSU</text>`;
  return b;
}
function front(){
  const ear=x=>`<rect x="${x}" y="10" width="44" height="${H-20}" rx="6" fill="#dfe3ea" stroke="${EDGE}" stroke-width="2.4"/><circle cx="${x+22}" cy="46" r="9" fill="#fff" stroke="#3a4150" stroke-width="2.4"/><circle cx="${x+22}" cy="${H-46}" r="9" fill="#fff" stroke="#3a4150" stroke-width="2.4"/>`;
  let b=ear(4)+ear(W-48);
  b+=`<rect x="44" y="14" width="${W-88}" height="${H-28}" rx="8" fill="${BODY}" stroke="${EDGE}" stroke-width="3"/>`;
  b+=`<text x="112" y="100" font-size="38" font-weight="900" font-style="italic" fill="#F28C28" letter-spacing="-0.5">Digital Extender<tspan font-size="18" dy="-16">®</tspan></text>`;
  b+=`<rect x="1196" y="62" width="112" height="44" rx="4" fill="#1f2532"/><text x="1252" y="94" text-anchor="middle" font-size="28" font-weight="800" fill="#fff" letter-spacing="1">XDM</text>`;
  for(let i=0;i<16;i++){
    const cx=770+i*33;
    b+=`<circle cx="${cx}" cy="166" r="11" fill="#34C759" opacity=".18"/><circle cx="${cx}" cy="166" r="7" fill="#34C759" stroke="#1c7a36" stroke-width="1.6"/><text x="${cx}" y="198" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">${i+1}</text>`;
  }
  b+=`<text x="112" y="252" font-size="20" font-weight="800" fill="${INK}">XDM-PSU</text><text x="232" y="252" font-size="19" fill="${SUB}">16 Channel Modular Power Supply System for XDM Extenders</text>`;
  return b;
}
(async()=>{
  const browser=await chromium.launch({executablePath:fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined});
  const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'psu-'));
  for(const [name,draw] of [['xdm-psu-front-art',front],['xdm-psu-rear-art',rear]]){
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}svg{display:block;font-family:Pretendard,"Apple SD Gothic Neo","Noto Sans KR",Arial,sans-serif}</style><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${draw()}</svg>`);
    const png=path.join(tmp,`${name}.png`);
    await page.screenshot({path:png,clip:{x:0,y:0,width:W,height:H}});
    execFileSync('python3',['-c',`from PIL import Image;Image.open(${JSON.stringify(png)}).convert('RGB').save(${JSON.stringify(path.join(OUT,name+'.webp'))},'WEBP',quality=92,method=6)`]);
    console.log(`${OUT}/${name}.webp ${W}x${H}`);
  }
  await browser.close();
})();
