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
  for(const card of cards){const id=Array.isArray(card)?card[0]:card.id;assert.ok(fs.existsSync(`output/design/assets/cards/${id}.jpg`),`missing card image for ${id}`)}
  const photoPages=read('src/app.js').match(/photoPages=\{([^}]*)\}/)[1];
  for(const [,model] of photoPages.matchAll(/'([^']+)':\d+/g))assert.ok(fs.existsSync(`output/design/assets/${model.toLowerCase()}-rear.jpg`),`missing rear photo for ${model}`);
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
