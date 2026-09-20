const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');

test('portal exposes the three approved routes and preserves DOM anchors',()=>{
  const html=read('index.html');
  for(const route of ['/','/products','/tools/matrix-configurator'])assert.match(html,new RegExp(`data-route-view="${route.replaceAll('/','\\/')}"`));
  for(const id of ['rtcom-design','equipment-library','matrix-configurator'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/src\/portal\.js/);
});

test('router supports history navigation, active state and repository base paths',()=>{
  const portal=read('src/portal.js');
  assert.match(portal,/pushState/);
  assert.match(portal,/popstate/);
  assert.match(portal,/aria-current/);
  assert.match(portal,/src\/portal\.js/);
});

test('static package creates direct-load entries for clean routes',()=>{
  const pack=read('scripts/package-site.cjs');
  assert.match(pack,/\['products','\.\.\/'\]/);
  assert.match(pack,/\['tools\/matrix-configurator','\.\.\/\.\.\/'\]/);
  assert.match(pack,/'src\/portal\.js'/);
});

test('product inventory remains 31 products in five data categories',()=>{
  const library=read('src/library.js');
  const inventory=library.slice(library.indexOf('const products=['),library.indexOf('const categories='));
  const ids=[...inventory.matchAll(/\{id:'([^']+)',category:'([^']+)'/g)];
  assert.equal(ids.length,31);
  assert.deepEqual([...new Set(ids.map(match=>match[2]))].sort(),['cable','distribution','extender','integrated','matrix']);
  assert.equal((library.match(/\['(?:all|matrix|integrated|distribution|extender|cable)'/g)||[]).length,6);
});

test('configurator catalog and persistence contracts remain unchanged',()=>{
  const context={globalThis:{}};
  vm.runInNewContext(read('src/catalog.js'),context);
  const families=context.globalThis.RtCatalog;
  assert.equal(Object.keys(families).length,3);
  assert.equal(Object.values(families).reduce((sum,family)=>sum+family.models.length,0),21);
  assert.equal(Object.values(families).reduce((sum,family)=>sum+family.input.length+family.output.length,0),26);
  assert.match(read('src/app.js'),/const storageKey='rtcom\.configuration\.v1'/);
  assert.match(read('src/core.js'),/const catalogVersion = '2026-09-18-draft\.1'/);
  assert.match(read('src/core.js'),/const schemaVersion = 3/);
});
