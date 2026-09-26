// Publish only configurator runtime files; exclude reference PDF, design archives and local backups.
const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve('dist');
fs.mkdirSync(output,{recursive:true});
const cardAssets=fs.readdirSync('output/design/assets/cards').map(name=>`output/design/assets/cards/${name}`);
const frameAssets=fs.readdirSync('output/design/assets/frames').map(name=>`output/design/assets/frames/${name}`);
const extenderAssets=fs.readdirSync('output/design/assets/extenders').map(name=>`output/design/assets/extenders/${name}`);
for(const file of ['index.html','src/catalog.js','src/core.js','src/app.js','src/styles.css','output/design/assets/xdm.jpg','output/design/assets/spx.jpg','output/design/assets/vdm.jpg',...cardAssets,...frameAssets,...extenderAssets,'docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md']){
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
