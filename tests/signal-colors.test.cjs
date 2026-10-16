// 0.242 신호 색 통일: 구성기 신호 배지(--rt-sig)와 제품정보 신호 구성도(--pg-sig-*)·전송기 그림 케이블 색이
// 사용자 구성도 범례(2026-10-16 제공: 광 #00B0F0, SDI #000000, LAN #00B050)와 HDMI 빨강 #E5242B(범례 #FF0000을 흰 글자 대비 4.5 이상으로 다듬은 값), DP 짙은 주황 #C55A11로 같은지 확인한다.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'src','styles.css'),'utf8');
const products=fs.readFileSync(path.join(root,'src','products.js'),'utf8');
const LEGEND={hdmi:'#E5242B',dp:'#C55A11',sdi:'#000000',cat:'#00B050',fiber:'#00B0F0'};

test('구성기 신호 배지 색이 범례 값과 같음',()=>{
  const sig=key=>(css.match(new RegExp(`\\[data-sig="${key}"\\][^{]*\\{--rt-sig:(#[0-9A-Fa-f]{6})\\}`))||[])[1];
  assert.equal(sig('hdmi'),LEGEND.hdmi);
  assert.equal(sig('dp'),LEGEND.dp);
  assert.equal(sig('sdi'),LEGEND.sdi);
  assert.equal(sig('hdbt'),LEGEND.cat);
  assert.equal(sig('fiber'),LEGEND.fiber);
});

test('제품정보 신호 구성도 색(--pg-sig-*)이 구성기와 같음',()=>{
  for(const [key,value] of Object.entries(LEGEND))assert.ok(css.includes(`--pg-sig-${key}:${value};`),`--pg-sig-${key}:${value}`);
});

test('전송기 그림의 광·CAT 케이블 색이 범례 값과 같음',()=>{
  assert.ok(products.includes(`COLOR_FIBER='${LEGEND.fiber}'`));
  assert.ok(products.includes(`COLOR_COPPER='${LEGEND.cat}'`));
});
