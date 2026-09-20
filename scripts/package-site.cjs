// Publish only runtime files; exclude reference PDF, design archives and local backups.
const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve('dist');
fs.mkdirSync(output,{recursive:true});
const cardAssets=fs.readdirSync('output/design/assets/cards').map(name=>`output/design/assets/cards/${name}`);
const libraryAssets=fs.readdirSync('output/design/assets/library').map(name=>`output/design/assets/library/${name}`);
const catalogSource=fs.readdirSync('docs').find(name=>name.toLowerCase().endsWith('.pdf'));
const rearAssets=['xdm-12-rear.jpg','xdm-20-rear.jpg','xdm-36-rear.jpg','xdm-72-rear.jpg','xdm-144-rear.jpg'].map(name=>`output/design/assets/${name}`);
for(const file of ['index.html','src/catalog.js','src/core.js','src/app.js','src/library.js','src/portal.js','src/styles.css','output/design/assets/xdm.jpg',...rearAssets,'output/design/assets/spx.jpg','output/design/assets/vdm.jpg',...cardAssets,...libraryAssets,'docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md']){
 const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);
}
const html=fs.readFileSync('index.html','utf8');
for(const [route,base] of [['products','../'],['tools/matrix-configurator','../../']]){
 const target=path.join(output,route,'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html.replace('<head>',`<head><base href="${base}">`));
}
if(catalogSource){const target=path.join(output,'output/design/assets/rtcom-catalog-2026.pdf');fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join('docs',catalogSource),target);}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Static site prepared in dist/');
