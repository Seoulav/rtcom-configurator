// Publish only configurator runtime files; exclude reference PDF, design archives and local backups.
const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve('dist');
fs.mkdirSync(output,{recursive:true});
const cardAssets=fs.readdirSync('output/design/assets/cards').map(name=>`output/design/assets/cards/${name}`);
const rearAssets=['xdm-12-rear.jpg','xdm-20-rear.jpg','xdm-36-rear.jpg','xdm-72-rear.jpg','xdm-144-rear.jpg'].map(name=>`output/design/assets/${name}`);
for(const file of ['index.html','src/catalog.js','src/core.js','src/app.js','src/styles.css','output/design/assets/xdm.jpg',...rearAssets,'output/design/assets/spx.jpg','output/design/assets/vdm.jpg',...cardAssets,'docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md']){
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
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Static site prepared in dist/');
