const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const read=file=>fs.readFileSync(file,'utf8');
const runtimeScripts=['src/catalog.js','src/core.js','src/app.js'];
const loadCatalog=()=>{const context={globalThis:{}};vm.runInNewContext(read('src/catalog.js'),context);return context.globalThis.RtCatalog};

test('index.html is a configurator-only page that keeps the legacy anchors',()=>{
  const html=read('index.html');
  for(const id of ['rtcom-design','matrix-configurator','print-report','rtcom-assets'])assert.match(html,new RegExp(`id="${id}"`));
  assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(match=>match[1]),runtimeScripts);
  assert.doesNotMatch(html,/data-route-view|data-route-link|equipment-library|\.pdf/);
  assert.match(html,/<a class="rt-portal-link" href="https:\/\/seoulav\.github\.io\/AV-Portal\/" target="_blank" rel="noopener">/);
});

test('runtime code has no in-app navigation that would break relative asset paths',()=>{
  for(const file of runtimeScripts)assert.doesNotMatch(read(file),/pushState|replaceState/,`${file} must not change the document URL`);
});

test('product library sources and the catalog PDF are no longer part of the site',()=>{
  for(const file of ['src/library.js','src/product-catalog.js','src/product-search.js','src/search-synonyms.js','src/catalog-validator.js','src/portal.js','output/design/assets/library'])assert.equal(fs.existsSync(file),false,`${file} should be removed`);
  const runtime=[read('index.html'),read('src/styles.css'),...runtimeScripts.map(read)].join('\n');
  assert.doesNotMatch(runtime,/RtProductCatalog|RtProductSearch|rtcom-catalog-2026|assets\/library/);
});

test('every XDM card and documented rear photo has an image asset',()=>{
  const catalog=loadCatalog();
  const cards=[...catalog.XDM.input,...catalog.XDM.output];
  assert.ok(cards.length>0);
  for(const card of cards){const id=Array.isArray(card)?card[0]:card.id;assert.ok(fs.existsSync(`output/design/assets/cards/${id}.webp`),`missing card faceplate for ${id}`)}
  assert.ok(fs.existsSync('output/design/assets/cards/XDM-BLANK.webp'),'missing blank slot cover');
  assert.match(read('src/app.js'),/const blankPlate='output\/design\/assets\/cards\/XDM-BLANK\.webp'/);
  const frames=[...read('src/app.js').matchAll(/'(output\/design\/assets\/frames\/[^']+)'/g)].map(match=>match[1]);
  assert.ok(frames.length>=2);
  for(const frame of frames)assert.ok(fs.existsSync(frame),`missing frame photo ${frame}`);

});

test('rear photo slot zones stay inside each photo and match the card faceplate ratio',()=>{
  const source=read('src/app.js');
  const literal=source.slice(source.indexOf('const rearPhotos=')+'const rearPhotos='.length,source.indexOf('};',source.indexOf('const rearPhotos='))+1);
  const rearPhotos=new Function(`return ${literal}`)();
  const catalog=loadCatalog();
  assert.deepEqual(Object.keys(rearPhotos),['XDM-12','XDM-20','XDM-36','XDM-72','XDM-144']);
  const slotCount={'XDM-12':3,'XDM-20':5,'XDM-36':9,'XDM-72':18,'XDM-144':36};
  for(const [model,photo] of Object.entries(rearPhotos)){
    assert.ok(catalog.XDM.models.includes(model));
    assert.ok(fs.existsSync(photo.src),`missing rear photo ${photo.src}`);
    const [width,height]=photo.size;
    const columns=model==='XDM-12'?1:Math.min(18,slotCount[model]),rows=slotCount[model]/columns;
    for(const dir of ['input','output']){
      const [x0,y0,x1,y1]=photo[dir];
      assert.ok(x0>=0&&y0>=0&&x1<=width&&y1<=height&&x0<x1&&y0<y1,`${model} ${dir} zone must stay inside the photo`);
      const slotWidth=(x1-x0)/columns,slotHeight=(y1-y0)/rows,ratio=model==='XDM-12'?slotWidth/slotHeight:slotHeight/slotWidth;
      assert.ok(ratio>8.5&&ratio<11,`${model} ${dir} slot ratio ${ratio.toFixed(2)} should match a 9.7:1 faceplate`);
    }
  }
});

test('static package ships only configurator files and redirects legacy portal URLs',()=>{
  execFileSync(process.execPath,['scripts/package-site.cjs'],{stdio:'ignore'});
  const files=[];
  const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);entry.isDirectory()?walk(full):files.push(path.relative('dist',full).split(path.sep).join('/'))}};
  walk('dist');
  assert.equal(files.some(file=>file.endsWith('.pdf')),false,'catalog PDF must not be published');
  assert.equal(files.some(file=>file.startsWith('output/design/assets/library/')),false);
  for(const file of ['index.html','.nojekyll',...runtimeScripts,'src/styles.css'])assert.ok(files.includes(file),`dist is missing ${file}`);
  const html=read('dist/index.html');
  for(const [,ref] of html.matchAll(/(?:src|href)="((?:src|output)\/[^"]+)"/g))assert.ok(files.includes(ref),`dist/index.html references missing ${ref}`);
  for(const [,ref] of read('src/app.js').matchAll(/'(output\/design\/assets\/frames\/[^']+)'/g))assert.ok(files.includes(ref),`dist is missing ${ref}`);
  assert.ok(files.some(file=>/^output\/design\/assets\/cards\/XDM-[A-Z]+100\.webp$/.test(file)),'dist must ship card faceplates');
  assert.ok(files.includes('output/design/assets/cards/XDM-BLANK.webp'),'dist must ship the blank slot cover');
  for(const [route,base] of [['products','../'],['tools/matrix-configurator','../../']]){
    const stub=read(`dist/${route}/index.html`);
    assert.match(stub,new RegExp(`url=${base.replaceAll('.','\\.')}`));
    assert.match(stub,/location\.replace\(.*location\.hash\)/);
    assert.doesNotMatch(stub,/<script src=/,'legacy URL must not load the app from a nested path');
  }
});

test('configurator catalog and persistence contracts remain unchanged',()=>{
  const families=loadCatalog();
  assert.equal(Object.keys(families).length,3);
  assert.equal(Object.values(families).reduce((sum,family)=>sum+family.models.length,0),21);
  assert.equal(Object.values(families).reduce((sum,family)=>sum+family.input.length+family.output.length,0),26);
  assert.match(read('src/app.js'),/const storageKey='rtcom\.configuration\.v1'/);
  assert.match(read('src/core.js'),/const catalogVersion = '2026-09-18-draft\.1'/);
  assert.match(read('src/core.js'),/const schemaVersion = 3/);
});
