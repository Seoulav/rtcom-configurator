// Publish only configurator runtime files; exclude reference PDF, design archives and local backups.
const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve('dist');
// 이전 빌드에서 지워지거나 이름이 바뀐 파일(예: hd-104u.json → hd-14u.json)이 dist에 그대로 남아
// 옛 제품 상세가 계속 열리는 일이 없도록, 매번 dist를 비우고 새로 만든다.
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
const cardAssets=fs.readdirSync('output/design/assets/cards').map(name=>`output/design/assets/cards/${name}`);
const frameAssets=fs.readdirSync('output/design/assets/frames').map(name=>`output/design/assets/frames/${name}`);
const extenderAssets=fs.readdirSync('output/design/assets/extenders').map(name=>`output/design/assets/extenders/${name}`);
// 0.19 공개 제품정보: 목록·상세 JSON과 제품 이미지. 비공개 AV Portal이 이 공개 파일을 읽는다.
const productData=fs.readdirSync('data/products').filter(name=>name.endsWith('.json')).map(name=>`data/products/${name}`);
const productAssets=fs.readdirSync('output/design/assets/products').map(name=>`output/design/assets/products/${name}`);
// 제조사 문서 PDF(사용자 결정 2026-09-28): 폴더 전체가 아니라 data/products/*.json의 documents[].file에 등록된 PDF만 공개한다.
// 폴더에 있어도 등록되지 않은 PDF와 docs/RTcom_catalogue_2026_46p.pdf(전체 카탈로그 원본)는 배포하지 않는다.
const productDocs=[...new Set(productData.flatMap(file=>(JSON.parse(fs.readFileSync(file,'utf8')).documents||[]).map(doc=>doc.file).filter(Boolean)))].map(name=>`output/design/assets/docs/${name}`);
for(const file of ['index.html','src/catalog.js','src/core.js','src/app.js','src/products.js','src/styles.css','fonts/PretendardVariable.woff2','fonts/OFL.txt','output/design/assets/xdm.jpg','output/design/assets/spx.jpg','output/design/assets/vdm.jpg',...cardAssets,...frameAssets,...extenderAssets,...productData,...productAssets,...productDocs,'docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md']){
 const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);
}
// 0.6의 포털 주소(/products, /tools/matrix-configurator)로 들어온 방문자를 구성기 첫 화면으로 보낸다.
const legacyRoutes=[['products','../'],['tools/matrix-configurator','../../']];
for(const [route,base] of legacyRoutes){
 const target=path.join(output,route,'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>RTCOM 매트릭스 구성기로 이동</title><meta http-equiv="refresh" content="0; url=${base}"><link rel="canonical" href="${base}"><script>location.replace(${JSON.stringify(base)}+location.hash)</script></head>
<body><p>매트릭스 구성기가 첫 화면으로 옮겨졌습니다. <a href="${base}">매트릭스 구성기로 이동</a></p></body></html>
`);
}
// 사이트 안의 없는 주소(예전 링크, 뒤로가기로 돌아간 옛 경로)는 GitHub Pages가 404.html을 보여 준다. 구성기 첫 화면으로 보낸다.
fs.writeFileSync(path.join(output,'404.html'),`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>RTCOM 매트릭스 구성기로 이동</title><script>(function(){var base=['/rtcom-configurator/','/rtcom-av-design/'].find(function(item){return location.pathname.indexOf(item)===0})||'/';location.replace(base+location.hash)})()</script></head>
<body><p>요청한 주소가 없습니다. <a href="/rtcom-configurator/">매트릭스 구성기로 이동</a></p></body></html>
`);
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Static site prepared in dist/');
