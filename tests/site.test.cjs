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
  // 뒤로가기용 방문 기록(0.14)은 허용하되, 주소는 항상 현재 주소(location.href) 그대로여야 한다.
  for(const file of runtimeScripts){
    const calls=[...read(file).matchAll(/(pushState|replaceState)\(([^)]*)\)/g)];
    for(const call of calls)assert.match(call[2],/,'',location\.href$/,`${file} must keep the document URL (${call[0]})`);
  }
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
  for(const id of ['SPX-HIS8','SPX-HOS10','SPX-HOS12','SPX-COS12','SPX-BLANK'])assert.ok(fs.existsSync(`output/design/assets/cards/${id}.webp`),`missing SPX card image ${id}`);
  for(const card of [...catalog.VDM.input,...catalog.VDM.output])assert.ok(fs.existsSync(`output/design/assets/cards/${card[0]}.webp`),`missing VDM faceplate for ${card[0]}`);
  assert.ok(fs.existsSync('output/design/assets/cards/VDM-BLANK.webp'),'missing VDM blank cover');
  for(const model of ['m810','m1620','m3236','m2472','m24120'])for(const side of ['front','rear'])assert.ok(fs.existsSync(`output/design/assets/frames/spx-${model}-${side}.webp`),`missing SPX ${model} ${side} photo`);
  for(const card of [...catalog.SPX.input,...catalog.SPX.output])assert.ok(fs.existsSync(`output/design/assets/cards/${card[0]}.webp`),`missing SPX faceplate for ${card[0]}`);
  const extenders=[...new Set([...read('src/app.js').matchAll(/'(output\/design\/assets\/extenders\/[^']+)'/g)].map(match=>match[1]))];
  assert.equal(extenders.length,6);
  for(const extender of extenders)assert.ok(fs.existsSync(extender),`missing extender photo ${extender}`);
  assert.match(read('src/app.js'),/const blankPlate='output\/design\/assets\/cards\/XDM-BLANK\.webp'/);
  const frames=[...read('src/app.js').matchAll(/'(output\/design\/assets\/frames\/[^']+)'/g)].map(match=>match[1]);
  assert.ok(frames.length>=2);
  for(const frame of frames)assert.ok(fs.existsSync(frame),`missing frame photo ${frame}`);

});

test('rear photo slot zones stay inside each photo and match the card faceplate ratio',()=>{
  const source=read('src/app.js');
  const literal=source.slice(source.indexOf('const rearPhotos=')+'const rearPhotos='.length,source.indexOf('};',source.indexOf('const rearPhotos='))+1);
  const rearPhotos=new Function('SPX_MANUAL','VDM_MANUAL',`return ${literal}`)('SPX 국문 사용자 매뉴얼(250805)','VDM 국문 매뉴얼 KV07');
  const catalog=loadCatalog();
  assert.deepEqual(Object.keys(rearPhotos),['XDM-12','XDM-20','XDM-36','XDM-72','XDM-144','VDM-16X','VDM-8X','VDM-32X','VDM-48X','VDM-64X','VDM-80X','VDM-128X','VDM-180X','VDM-256X','SPX-M810','SPX-M1620','SPX-M3236','SPX-M2472','SPX-M24120']);
  // [입력 슬롯, 출력 슬롯, 열 수(입력, 출력), 가로 판넬 여부]
  const layout={'XDM-12':[3,3,[1,1],true],'XDM-20':[5,5,[5,5]],'XDM-36':[9,9,[9,9]],'XDM-72':[18,18,[18,18]],'XDM-144':[36,36,[18,18]],'VDM-16X':[4,4,[4,4]],
    'VDM-8X':[2,2,[1,1],true],'VDM-32X':[8,8,[4,4]],'VDM-48X':[12,12,[4,4]],'VDM-64X':[16,16,[4,4]],'VDM-80X':[20,20,[11,11]],'VDM-128X':[32,32,[11,11]],'VDM-180X':[45,45,[15,15]],'VDM-256X':[64,64,[11,11]],
    'SPX-M810':[1,1,[1,1],true],'SPX-M1620':[2,2,[1,1],true],'SPX-M3236':[4,3,[1,1],true],'SPX-M2472':[3,6,[3,6]],'SPX-M24120':[3,10,[3,10]]};
  const faceplateRatio={XDM:9.7,VDM:5.7,SPX:13.8};
  // SPX-M1620 매뉴얼 후면 사진은 가로로 눌려 있다(사진 662×418, 실제 483×177mm). 사진 속 판넬 비율(약 9.8:1)로 확인한다.
  // VDM 후면 선 도면은 모델마다 보드 비율이 다르게 그려져 있어 도면 속 비율로 확인한다.
  const photoRatio={'SPX-M1620':9.8,'VDM-128X':3.9,'VDM-180X':8.2};
  for(const [model,photo] of Object.entries(rearPhotos)){
    const family=model.split('-')[0];
    assert.ok(catalog[family].models.includes(model));
    assert.ok(fs.existsSync(photo.src),`missing rear photo ${photo.src}`);
    const [width,height]=photo.size,[inputs,outputs,columns,horizontal]=layout[model];
    ['input','output'].forEach((dir,index)=>{
      const rects=Array.isArray(photo[dir][0])?photo[dir]:[photo[dir]];
      for(const [x0,y0,x1,y1] of rects){
      const count=(index?outputs:inputs)/rects.length,cols=columns[index],rows=Math.ceil(count/cols);
      assert.ok(x0>=0&&y0>=0&&x1<=width&&y1<=height&&x0<x1&&y0<y1,`${model} ${dir} zone must stay inside the photo`);
      const slotWidth=(x1-x0)/cols,slotHeight=(y1-y0)/rows,ratio=horizontal?slotWidth/slotHeight:slotHeight/slotWidth;
      const expected=photoRatio[model]||faceplateRatio[family];
      assert.ok(ratio>expected*0.85&&ratio<expected*1.15,`${model} ${dir} slot ratio ${ratio.toFixed(2)} should match a ${expected}:1 faceplate`);
      }
    });
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
  for(const [,ref] of read('src/app.js').matchAll(/'(output\/design\/assets\/extenders\/[^']+)'/g))assert.ok(files.includes(ref),`dist is missing ${ref}`);
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
  assert.equal(Object.values(families).reduce((sum,family)=>sum+family.models.length,0),22);
  assert.equal(Object.values(families).reduce((sum,family)=>sum+family.input.length+family.output.length,0),26);
  assert.match(read('src/app.js'),/const storageKey='rtcom\.configuration\.v1'/);
  assert.match(read('src/core.js'),/const catalogVersion = '2026-09-18-draft\.1'/);
  assert.match(read('src/core.js'),/const schemaVersion = 3/);
});
