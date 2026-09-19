// Publish only runtime files; exclude reference PDF, design archives and local backups.
const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve('dist');
fs.mkdirSync(output,{recursive:true});
for(const file of ['index.html','src/catalog.js','src/core.js','src/app.js','src/styles.css','output/design/assets/xdm.jpg','output/design/assets/spx.jpg','output/design/assets/vdm.jpg','docs/evidence/RTCOM_MATRIX_EVIDENCE_AND_GAPS.md']){
 const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Static site prepared in dist/');
