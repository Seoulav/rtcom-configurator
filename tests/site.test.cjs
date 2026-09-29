const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const read=file=>fs.readFileSync(file,'utf8');
const runtimeScripts=['src/catalog.js','src/card-specs.js','src/core.js','src/app.js','src/products.js'];
const loadCatalog=()=>{const context={globalThis:{}};vm.runInNewContext(read('src/catalog.js'),context);return context.globalThis.RtCatalog};

test('Pretendard Variable font and its OFL license are present and referenced by styles.css',()=>{
  assert.ok(fs.existsSync('fonts/PretendardVariable.woff2'),'fonts/PretendardVariable.woff2 must exist (0.19 이후 제품정보 글래스 디자인, self-hosted font)');
  assert.ok(fs.existsSync('fonts/OFL.txt'),'fonts/OFL.txt (SIL Open Font License) must ship alongside the font file');
  assert.match(read('fonts/OFL.txt'),/SIL OPEN FONT LICENSE/i);
  assert.match(read('src/styles.css'),/url\(["']?\.?\.?\/?fonts\/PretendardVariable\.woff2["']?\)\s*format\("woff2-variations"\)/);
});

test('index.html is a configurator-only page that keeps the legacy anchors',()=>{
  const html=read('index.html');
  for(const id of ['rtcom-design','matrix-configurator','print-report','rtcom-assets'])assert.match(html,new RegExp(`id="${id}"`));
  // 0.142 AI 검색(사내 베타) 스크립트는 라우터보다 먼저 #ai-token을 읽도록 맨 앞에 둔다(docs/implementation/AI_SEARCH_BETA.md).
  assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(match=>match[1]),['src/ai-search.js',...runtimeScripts]);
  assert.doesNotMatch(html,/data-route-view|data-route-link|equipment-library|\.pdf/);
  assert.match(html,/<a class="rt-portal-link" href="https:\/\/seoulav\.github\.io\/AV-Portal\/" target="_blank" rel="noopener">/);
});

test('runtime code has no in-app navigation that would break relative asset paths',()=>{
  // 뒤로가기용 방문 기록(0.14)은 허용하되, 주소는 항상 현재 주소(location.href) 그대로여야 한다.
  for(const file of runtimeScripts){
    const calls=[...read(file).matchAll(/(pushState|replaceState)\(([^)]*)\)/g)];
    for(const call of calls)assert.match(call[2],/,'',location\.href$/,`${file} must keep the document URL (${call[0]})`);
  }
  // 0.142 AI 검색은 ?ai=beta·#ai-token=을 지울 때 경로(location.pathname)는 그대로 둔다(상대 경로 자산이 깨지지 않게).
  for(const call of read('src/ai-search.js').matchAll(/replaceState\(([^;]*?)\);/g))assert.match(call[1],/^null,'',location\.pathname\+/,call[0]);
  assert.doesNotMatch(read('src/ai-search.js'),/pushState/);
});

test('product library sources and the catalog PDF are no longer part of the site',()=>{
  for(const file of ['src/library.js','src/product-catalog.js','src/product-search.js','src/search-synonyms.js','src/catalog-validator.js','src/portal.js','output/design/assets/library'])assert.equal(fs.existsSync(file),false,`${file} should be removed`);
  const runtime=[read('index.html'),read('src/styles.css'),...runtimeScripts.map(read)].join('\n');
  // 0.95: 전체 카탈로그(rtcom-catalog-2026.pdf)는 사용자 결정으로 제품정보 문서 버튼에서 다시 공개하므로 금지 목록에서 뺐다(카탈로그 공개 검사는 package-site 테스트에 있음).
  assert.doesNotMatch(runtime,/RtProductCatalog|RtProductSearch|assets\/library/);
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
  // 0.120: VDM 카드 판넬 사진은 모두 가로:세로 5.7:1(±3%)이어야 슬롯 칸에 늘어나지 않고 맞는다(HOS4S-UW 4.0, CIS4-U·COS4-U 5.2를 잘라 맞춤).
  const webpSize=file=>{const b=fs.readFileSync(file);const chunk=b.toString('ascii',12,16);if(chunk==='VP8X')return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];if(chunk==='VP8 ')return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];if(chunk==='VP8L'){const v=b.readUInt32LE(21);return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]}throw new Error('unknown webp '+file)};
  for(const id of [...catalog.VDM.input,...catalog.VDM.output].map(card=>card[0]).concat('VDM-BLANK')){const [w,h]=webpSize(`output/design/assets/cards/${id}.webp`);assert.ok(Math.abs(w/h/5.7-1)<0.03,`${id} faceplate ratio ${(w/h).toFixed(2)} should be 5.7:1`)}
  for(const model of ['8x','16x','32x','48x','64x','80x','128x','180x','256x'])assert.ok(fs.existsSync(`output/design/assets/frames/vdm-${model}-front-art.webp`)&&fs.existsSync(`output/design/assets/frames/vdm-${model}-rear-art.webp`),`missing VDM ${model} front/rear image`);
  // 0.135: 프레임 정면·후면은 모두 평면 그림(-art)을 쓰고 실물 사진은 쓰지 않는다(사용자 요청 2026-09-29). VDM 전면 9종·후면 9종.
  const vdmArt=[...read('src/app.js').matchAll(/frames\/(vdm-\d+x-(?:front|rear))-art\.webp/g)].map(match=>match[1]).sort();
  assert.deepEqual(vdmArt,[...['8x','16x','32x','48x','64x','80x','128x','180x','256x'].map(m=>`vdm-${m}-front`),...['8x','16x','32x','48x','64x','80x','128x','180x','256x'].map(m=>`vdm-${m}-rear`)].sort());
  // 0.113: XDM·SPX 후면(구성기 03 카드 슬롯)도 scripts/tools/draw_xdm_spx_rear_frames.cjs 평면 그림을 쓴다(XDM-216 포함 11종).
  const rearArt=[...read('src/app.js').matchAll(/frames\/((?:xdm|spx)-[a-z0-9]+)-rear-art\.webp/g)].map(match=>match[1]).sort();
  assert.deepEqual(rearArt,['spx-m1620','spx-m24120','spx-m2472','spx-m3236','spx-m810','xdm-12','xdm-144','xdm-20','xdm-216','xdm-36','xdm-72']);
  // 0.135: XDM·SPX 정면도 평면 그림(-front-art) 11종이고, 예전 실물 사진(-front.webp·-rear.webp)은 공개 폴더에 남기지 않는다.
  const frontArt=[...read('src/app.js').matchAll(/frames\/((?:xdm|spx)-[a-z0-9]+)-front-art\.webp/g)].map(match=>match[1]).sort();
  assert.deepEqual(frontArt,rearArt);
  const photos=fs.readdirSync('output/design/assets/frames').filter(name=>/^(xdm|spx)-.*-(front|rear)\.webp$|^vdm-(16x|48x)-(front|rear)\.webp$/.test(name));
  assert.deepEqual(photos,[],'frame real photos must not ship');
  for(const family of ['xdm','spx','vdm'])assert.ok(fs.existsSync(`output/design/assets/${family}.jpg`)&&!fs.existsSync(`output/design/assets/${family}-lineup-art.webp`),`${family} lineup must use the original catalog jpg`);
  for(const model of ['m810','m1620','m3236','m2472','m24120'])for(const side of ['front','rear'])assert.ok(fs.existsSync(`output/design/assets/frames/spx-${model}-${side}-art.webp`),`missing SPX ${model} ${side} art`);
  for(const card of [...catalog.SPX.input,...catalog.SPX.output])assert.ok(fs.existsSync(`output/design/assets/cards/${card[0]}.webp`),`missing SPX faceplate for ${card[0]}`);
  const extenders=[...new Set([...read('src/app.js').matchAll(/'(output\/design\/assets\/extenders\/[^']+)'/g)].map(match=>match[1]))];
  assert.equal(extenders.length,10,'XDM 6 + VDM 4 extender photos');
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
  assert.deepEqual(Object.keys(rearPhotos),['XDM-12','XDM-20','XDM-36','XDM-72','XDM-144','XDM-216','VDM-16X','VDM-8X','VDM-32X','VDM-48X','VDM-64X','VDM-80X','VDM-128X','VDM-180X','VDM-256X','SPX-M810','SPX-M1620','SPX-M3236','SPX-M2472','SPX-M24120']);
  // [입력 슬롯, 출력 슬롯, 열 수(입력, 출력), 가로 판넬 여부]
  const layout={'XDM-12':[3,3,[1,1],true],'XDM-20':[5,5,[5,5]],'XDM-36':[9,9,[9,9]],'XDM-72':[18,18,[18,18]],'XDM-144':[36,36,[18,18]],'XDM-216':[54,54,[18,18]],'VDM-16X':[4,4,[4,4]],
    'VDM-8X':[2,2,[1,1],true],'VDM-32X':[8,8,[4,4]],'VDM-48X':[12,12,[4,4]],'VDM-64X':[16,16,[4,4]],'VDM-80X':[20,20,[11,11]],'VDM-128X':[32,32,[11,11]],'VDM-180X':[45,45,[15,15]],'VDM-256X':[64,64,[11,11]],
    'SPX-M810':[1,1,[1,1],true],'SPX-M1620':[2,2,[1,1],true],'SPX-M3236':[4,3,[1,1],true],'SPX-M2472':[3,6,[3,6]],'SPX-M24120':[3,10,[3,10]]};
  const faceplateRatio={XDM:9.7,VDM:5.7,SPX:13.8};
  // SPX-M1620 매뉴얼 후면 사진은 가로로 눌려 있다(사진 662×418, 실제 483×177mm). 사진 속 판넬 비율(약 9.8:1)로 확인한다.
  // VDM 후면 선 도면은 모델마다 보드 비율이 다르게 그려져 있어 도면 속 비율로 확인한다.
  // 0.120: VDM 그림은 슬롯 칸을 카드 사진 비율(5.7:1)과 똑같이 그려 도면 비율 예외(128X 3.9, 180X 8.2)를 없앴고, VDM은 ±3% 안에 들어야 한다.
  const photoRatio={'SPX-M1620':9.8};
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
      const tolerance=family==='VDM'?0.03:0.15;
      assert.ok(ratio>expected*(1-tolerance)&&ratio<expected*(1+tolerance),`${model} ${dir} slot ratio ${ratio.toFixed(2)} should match a ${expected}:1 faceplate`);
      }
    });
  }
});

test('static package ships only configurator files and redirects legacy portal URLs',()=>{
  // 0.24: 이전 빌드에서 삭제·이름이 바뀐 파일이 dist에 남아 옛 제품 상세가 계속 열리지 않도록, 매번 dist를 비우고 다시 만든다.
  fs.mkdirSync('dist',{recursive:true});
  fs.writeFileSync('dist/hd-104u-stale-build-leftover.json','{}');
  execFileSync(process.execPath,['scripts/package-site.cjs'],{stdio:'ignore'});
  assert.equal(fs.existsSync('dist/hd-104u-stale-build-leftover.json'),false,'package-site.cjs must clear dist before rebuilding, not leave stale files from a previous build');
  const files=[];
  const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);entry.isDirectory()?walk(full):files.push(path.relative('dist',full).split(path.sep).join('/'))}};
  walk('dist');
  // 2026-09-28: 제조사 문서 PDF는 제품 데이터 documents[].file에 등록된 것만 output/design/assets/docs/에서 공개한다.
  // 0.95: 전체 카탈로그는 공용 파일 output/design/assets/docs/rtcom-catalog-2026.pdf로만 공개하고(사용자 결정 "전체 카탈로그 공개해도 돼"), docs/ 원본 경로는 배포하지 않는다.
  assert.ok(files.includes('output/design/assets/docs/rtcom-catalog-2026.pdf'),'shared full catalogue is published under the docs folder');
  // 0.97: 제품 상세는 제품별 발췌본을 쓰고, 46쪽 공용 파일은 제품 목록의 전체 카탈로그 버튼용으로만 남는다.
  const registeredDocs=new Set(['output/design/assets/docs/rtcom-catalog-2026.pdf',...fs.readdirSync('data/products').filter(name=>name.endsWith('.json')&&name!=='index.json').flatMap(name=>(JSON.parse(read(`data/products/${name}`)).documents||[]).map(doc=>doc.file).filter(Boolean)).map(name=>`output/design/assets/docs/${name}`)]);
  for(const file of files.filter(file=>file.endsWith('.pdf')))assert.ok(registeredDocs.has(file),`unregistered PDF must not be published: ${file}`);
  for(const file of registeredDocs)assert.ok(files.includes(file),`dist is missing registered document ${file}`);
  assert.equal(files.includes('docs/RTcom_catalogue_2026_46p.pdf'),false,'full catalogue PDF must not be published');
  assert.equal(files.some(file=>file.startsWith('output/design/assets/library/')),false);
  for(const file of ['index.html','.nojekyll','src/ai-search.js','data/ai-context.json',...runtimeScripts,'src/styles.css','fonts/PretendardVariable.woff2','fonts/OFL.txt'])assert.ok(files.includes(file),`dist is missing ${file}`);
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

test('public product data (0.19) is valid, brochure-level only and listed in index.json',()=>{
  const {build,EXCLUDED}=require('../scripts/build-product-index.cjs');
  const {index,errors,text}=build();
  assert.deepEqual(errors,[]);
  assert.equal(read('data/products/index.json'),text,'run node scripts/build-product-index.cjs');
  assert.equal(index.schema,'rtcom.products.v1');
  const count=group=>index.products.filter(product=>product.group===group).length;
  assert.deepEqual({series:count('series'),integrated:count('integrated'),distribution:count('distribution'),extender:count('extender'),cable:count('cable')},{series:3,integrated:2,distribution:8,extender:14,cable:4});
  for(const model of EXCLUDED)assert.equal(index.products.some(product=>product.model===model),false,`${model} is excluded like AV Portal`);
  for(const model of ['HD-104U','HD-108U','QMS-44UX','MR-4S'])assert.ok(index.products.some(product=>product.model===model),`missing ${model}`);
  for(const product of index.products)assert.ok(product.cardImage,`${product.id} needs a card image`);
  const html=read('index.html');
  assert.match(html,/<section class="rt-products-view" aria-label="알티컴 제품정보" hidden>/);
  assert.match(html,/<a data-view-tab="products" href="#products">/);
  execFileSync(process.execPath,['scripts/package-site.cjs'],{stdio:'ignore'});
  assert.ok(fs.existsSync('dist/data/products/index.json'));
  for(const product of index.products){
    assert.ok(fs.existsSync(`dist/data/products/${product.id}.json`),`dist is missing ${product.id}.json`);
    assert.ok(fs.existsSync(`dist/output/design/assets/products/${product.cardImage}`),`dist is missing ${product.cardImage}`);
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

test('every matrix card has a detail entry in card-specs.js sourced from the catalog',()=>{
  const catalog=loadCatalog();
  const context={globalThis:{}};vm.runInNewContext(read('src/card-specs.js'),context);
  const specs=context.globalThis.RtCardSpecs;
  const ids=Object.values(catalog).flatMap(family=>[...family.input,...family.output].map(card=>card[0]));
  assert.deepEqual(Object.keys(specs).sort(),[...ids].sort(),'card-specs.js must cover exactly the catalog cards');
  for(const id of ids){
    const entry=specs[id];
    if(entry.page)assert.ok(entry.specs.length>0,`${id} has a catalog page but no specs`);
    else if(entry.source)assert.ok(entry.specs.length>0&&!entry.missing,`${id} sourced from a manual must list specs and drop missing`);
    else assert.ok(entry.missing,`${id} without a catalog page or manual source must say which material is missing`);
    assert.doesNotMatch(JSON.stringify(entry),/up to/i,`${id} must use "최대" instead of "up to" (0.39 표기 규칙)`);
  }
  const app=read('src/app.js');
  assert.match(app,/data-card-info="\$\{c\[0\]\}"/,'03 카드 슬롯 must render input/output card info buttons');
  assert.match(app,/class="rt-summary-card" data-card-info=/,'내 구성 card rows must open card details');
  assert.match(app,/class="rt-card-choice-info" data-card-info="\$\{c\[0\]\}"/,'카드 선택창 must offer a 상세 보기 button per card (0.79)');
});

test('product document PDFs (2026-09-28) are validated before publishing',()=>{
  const {validate}=require('../scripts/build-product-index.cjs');
  const product=JSON.parse(read('data/products/hd-13u.json'));
  const ids=new Set(fs.readdirSync('data/products').filter(name=>name.endsWith('.json')&&name!=='index.json').map(name=>name.replace(/\.json$/,'')));
  const withDoc=doc=>({...product,documents:[...product.documents.filter(item=>item.type!==doc.type),doc]});
  const errorsFor=doc=>validate(withDoc(doc),'data/products/hd-13u.json',ids).join('\n');
  assert.match(errorsFor({type:'Manual',title:'x',file:'hd-13u-missing.pdf',note:''}),/문서 파일 없음/);
  assert.match(errorsFor({type:'Manual',title:'x',file:'HD-13U Manual.pdf',note:''}),/documents\.file 형식/);
  assert.match(errorsFor({type:'Manual',title:'x',file:'hd-104u-manual.pdf',note:''}),/documents\.file 형식/);
  assert.match(errorsFor({type:'Diagram',title:'x',file:'hd-13u-diagram.pdf',note:''}),/documents\.file은 Catalog/);
  assert.match(errorsFor({type:'Manual',title:'x',file:'hd-13u-manual.pdf',note:'사용자 제공, 배포 제외'}),/배포 제외·비공개/);
  const twoManuals={...product,documents:[...product.documents.filter(item=>item.type!=='Manual'),{type:'Manual',title:'a',file:'hd-13u-manual-a.pdf',note:''},{type:'Manual',title:'b',file:'hd-13u-manual-b.pdf',note:''}]};
  assert.match(validate(twoManuals,'data/products/hd-13u.json',ids).join('\n'),/label 필요/);
  // 0.95 공용 전체 카탈로그: Catalog에만 쓰고, page는 1~46 정수.
  assert.equal(errorsFor({type:'Catalog',title:'x',file:'rtcom-catalog-2026.pdf',page:34,note:''}),'');
  assert.match(errorsFor({type:'Manual',title:'x',file:'rtcom-catalog-2026.pdf',note:''}),/공용 문서/);
  assert.match(errorsFor({type:'Catalog',title:'x',file:'rtcom-catalog-2026.pdf',page:47,note:''}),/documents\.page/);
  const src=fs.readFileSync('src/products.js','utf8');
  assert.match(src,/target="_blank" rel="noopener"/,'document buttons open in a new tab without window.opener');
  assert.match(src,/download="\$\{esc\(doc\.file\)\}"/,'document buttons offer a direct download');
});

test('local input_doc workflow (2026-09-28) keeps user material out of Git and reports new files',()=>{
  const {spawnSync}=require('node:child_process');
  const os=require('node:os');
  const ignore=read('.gitignore');
  assert.match(ignore,/^input_doc\/\*$/m,'input_doc contents must be git-ignored');
  assert.match(ignore,/^!input_doc\/README\.md$/m,'input_doc/README.md must stay tracked');
  assert.ok(fs.existsSync('input_doc/README.md'));
  const settings=JSON.parse(read('.claude/settings.json'));
  const hook=settings.hooks.SessionStart[0].hooks[0];
  assert.equal(hook.type,'command');
  assert.match(hook.command,/scripts\/input-doc-status\.cjs/);
  for(const rule of ['Bash(git push --force *)','Bash(git reset --hard *)','Bash(git clean *)','Bash(git push origin main)'])assert.ok(settings.permissions.deny.includes(rule),`settings must deny ${rule} (CLAUDE.md Git 정책)`);
  assert.ok(fs.existsSync('.claude/skills/input-doc/SKILL.md'));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'input-doc-'));
  try{
    const run=()=>spawnSync(process.execPath,['scripts/input-doc-status.cjs'],{env:{...process.env,INPUT_DOC_DIR:dir},encoding:'utf8'});
    let out=run();
    assert.equal(out.status,0);assert.equal(out.stdout,'','no new files → no hook output');
    fs.writeFileSync(path.join(dir,'README.md'),'x');fs.mkdirSync(path.join(dir,'RTCOM'));fs.writeFileSync(path.join(dir,'RTCOM','done.pdf'),'x');
    assert.equal(run().stdout,'','README and already-sorted files are not new');
    fs.writeFileSync(path.join(dir,'HD-13U 매뉴얼.pdf'),'%PDF-1.4');
    out=run();assert.equal(out.status,0);
    const json=JSON.parse(out.stdout);
    assert.equal(json.hookSpecificOutput.hookEventName,'SessionStart');
    assert.match(json.hookSpecificOutput.additionalContext,/HD-13U 매뉴얼\.pdf/);
    assert.doesNotMatch(json.hookSpecificOutput.additionalContext,/done\.pdf/);
    const python=['python3','python'].find(cmd=>spawnSync(cmd,['--version']).status===0);
    if(python){
      const py=(...args)=>spawnSync(python,['scripts/input_doc.py',...args],{env:{...process.env,INPUT_DOC_DIR:dir},encoding:'utf8'});
      const scan=JSON.parse(py('scan').stdout);
      assert.equal(scan.files.length,1);
      assert.deepEqual(scan.files[0].guess.models,['HD-13U']);
      assert.equal(scan.files[0].guess.kind,'Manual');
      const moved=py('file','HD-13U 매뉴얼.pdf','--maker','RTCOM','--kind','Manual','--model','HD-13U','--version','Ver1.2');
      assert.equal(moved.status,0,moved.stderr);
      assert.ok(fs.existsSync(path.join(dir,'RTCOM','manual','RTcom_Manual_HD-13U_Ver1.2.pdf')));
      assert.match(fs.readFileSync(path.join(dir,'INDEX.md'),'utf8'),/HD-13U 매뉴얼\.pdf \| RTCOM\/manual\/RTcom_Manual_HD-13U_Ver1\.2\.pdf/);
      fs.writeFileSync(path.join(dir,'copy.pdf'),'%PDF-1.4');
      assert.equal(py('file','copy.pdf','--maker','RTCOM','--kind','Manual','--model','HD-13U').status,0);
      assert.ok(fs.existsSync(path.join(dir,'_duplicates','copy.pdf')),'same content goes to _duplicates, not a second archive copy');
      assert.notEqual(py('file',path.resolve('README.md'),'--maker','X','--kind','Other','--model','Y').status,0,'files outside input_doc are refused');
      assert.equal(run().stdout,'','after filing, nothing is new');
      // 반영 장부와 STATUS.md(사용자 요청 2026-09-28 "깃에 자료로서 올라간 내용들은 input_doc에서 알 수 있도록 표시")
      const ledger=JSON.parse(fs.readFileSync(path.join(dir,'.ledger.json'),'utf8'));
      assert.equal(ledger.entries.length,1,'filed material is added to the ledger once (duplicates are not)');
      assert.equal(ledger.entries[0].status,'pending');
      assert.match(fs.readFileSync(path.join(dir,'STATUS.md'),'utf8'),/⏳ 검토 전 \| RTCOM\/manual\/RTcom_Manual_HD-13U_Ver1\.2\.pdf/);
      const marked=py('mark','RTCOM/manual/RTcom_Manual_HD-13U_Ver1.2.pdf','--status','reflected','--where','data/products/hd-13u.json','--what','EDID 코드표','--release','0.99.0');
      assert.equal(marked.status,0,marked.stderr);
      assert.match(fs.readFileSync(path.join(dir,'STATUS.md'),'utf8'),/✅ 사이트에 반영 \| RTCOM\/manual\/RTcom_Manual_HD-13U_Ver1\.2\.pdf \| data\/products\/hd-13u\.json — EDID 코드표 \| 0\.99\.0/);
      assert.notEqual(py('mark','RTCOM/manual/RTcom_Manual_HD-13U_Ver1.2.pdf','--status','done').status,0,'unknown status is refused');
    }
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

test('input_doc reflection ledger (2026-09-28) is tracked, well-formed and never published',()=>{
  const ledger=JSON.parse(read('docs/evidence/input-doc-ledger.json'));
  assert.equal(ledger.schema,'rtcom.input-doc-ledger.v1');
  const statuses=Object.keys(ledger.statuses);
  const seen=new Set();
  for(const entry of ledger.entries){
    assert.match(entry.sha256,/^[0-9a-f]{16}$/,`${entry.file} needs a sha256 prefix`);
    assert.ok(!seen.has(entry.sha256),`${entry.file} is listed twice`);seen.add(entry.sha256);
    assert.ok(statuses.includes(entry.status),`${entry.file} has unknown status ${entry.status}`);
    assert.match(entry.file,/^[A-Z0-9_]+\/[a-z]+\/[^/]+$/,`${entry.file} must be a path inside input_doc/<제조사>/<종류>/`);
    if(entry.status==='reflected'||entry.status==='published')assert.ok(entry.reflected.length>0,`${entry.file} is ${entry.status} but says nowhere it was used`);
  }
  assert.ok(!fs.existsSync('dist/docs/evidence/input-doc-ledger.json'),'the ledger must not be shipped to Pages');
});

test('0.93: 04 제품 사양 조건 칸에 "모델A·모델B 공통" 표기가 없고 XDM-PSU는 전용 Signal Flow를 그린다',()=>{
  for(const file of fs.readdirSync('data/products').filter(name=>name.endsWith('.json')&&name!=='index.json')){
    const item=JSON.parse(read(`data/products/${file}`));
    for(const spec of item.specifications||[])for(const part of String(spec.condition||'').split(' · '))
      assert.doesNotMatch(part,/^\S+·\S+ 공통$/,`${file} ${spec.name}: 조건 칸의 "${part}" 표기는 지운다(사용자 요청 2026-09-28)`);
  }
  const products=read('src/products.js');
  assert.match(products,/if\(item\.id==='xdm-psu'\)return psuDiagram\(item\);/);
  assert.match(products,/'XDM-PSU · POH'/);assert.match(products,/'XDM-PSU · PHX'/);
});

test('0.97: 제품 상세 카탈로그는 제품별 발췌 PDF를 쓰고, 전체 카탈로그는 목록 버튼용으로 계속 공개한다',()=>{
  // 사용자 결정 2026-09-28 "제품별로 잘라 공개": scripts/tools/split_catalog_by_product.py가 46쪽판에서 해당 쪽만 뽑는다.
  for(const file of fs.readdirSync('data/products').filter(name=>name.endsWith('.json')&&name!=='index.json')){
    const item=JSON.parse(read(`data/products/${file}`));
    for(const doc of (item.documents||[]).filter(doc=>doc.type==='Catalog'&&doc.file)){
      assert.equal(doc.file,`${item.id}-catalog.pdf`,`${item.id} 카탈로그 버튼은 제품별 파일을 쓴다`);
      assert.equal('page' in doc,false,`${item.id} 제품별 파일에는 쪽 번호(page)를 두지 않는다`);
      assert.ok(fs.existsSync(`output/design/assets/docs/${doc.file}`),`${doc.file} must exist`);
    }
  }
  assert.match(read('scripts/package-site.cjs'),/'rtcom-catalog-2026\.pdf',\.\.\.productData/,'전체 카탈로그 공용 파일은 목록 버튼용으로 배포 목록에 남긴다');
});

test('0.112: HD-13U 카탈로그 팝업은 iframe 대신 저장소에 넣은 PDF.js로 그리고, 라이브러리·라이선스를 함께 배포한다',()=>{
  for(const file of ['src/vendor/pdfjs/pdf.min.mjs','src/vendor/pdfjs/pdf.worker.min.mjs','src/vendor/pdfjs/LICENSE'])assert.ok(fs.existsSync(file),`${file} must exist`);
  assert.match(read('src/vendor/pdfjs/LICENSE'),/Apache License/);
  const pkg=read('scripts/package-site.cjs');
  for(const file of ['pdf.min.mjs','pdf.worker.min.mjs','LICENSE'])assert.ok(pkg.includes(`'src/vendor/pdfjs/${file}'`),`package-site must publish ${file}`);
  const products=read('src/products.js');
  assert.match(products,/new Function\('u','return import\(u\)'\)/,'옛 브라우저가 products.js 전체를 못 읽지 않도록 import()를 감싼다');
  assert.doesNotMatch(products,/<iframe src="\$\{href\}"/,'PDF 팝업은 iframe을 쓰지 않는다');
  assert.match(read('scripts/serve.cjs'),/'\.mjs':'text\/javascript/,'로컬 서버가 .mjs를 자바스크립트로 보낸다');
});

test('0.124: 등록된 제품별 카탈로그는 모두 쪽 그림 팝업, 매뉴얼은 모두 PDF.js 팝업이고 긴 매뉴얼은 보이는 쪽만 그린다',()=>{
  let catalogs=0,manuals=0;
  for(const file of fs.readdirSync('data/products').filter(name=>name.endsWith('.json')&&name!=='index.json')){
    for(const doc of JSON.parse(read(`data/products/${file}`)).documents||[]){
      if(!doc.file||doc.page)continue;
      if(doc.type==='Catalog'){
        catalogs++;
        assert.equal(doc.preview,'image',`${file} 카탈로그는 이미지 방식`);
        const stem=doc.file.replace(/\.pdf$/,'');
        assert.deepEqual(doc.previewImages,doc.previewImages.map((_,i)=>`${stem}-p${i+1}.webp`),`${file} 쪽 그림 이름`);
        for(const name of doc.previewImages)assert.ok(fs.existsSync(`output/design/assets/products/${name}`),`${name} must exist`);
      }else if(doc.type==='Manual'){manuals++;assert.equal(doc.preview,'pdfjs',`${file} 매뉴얼은 PDF.js 방식`)}
    }
  }
  assert.ok(catalogs>=29&&manuals>=17,JSON.stringify({catalogs,manuals}));
  const products=read('src/products.js');
  assert.match(products,/new IntersectionObserver\(/,'매뉴얼은 화면에 보이는 쪽만 그린다');
  assert.match(products,/function freeDocPage\(/,'멀리 지나간 쪽 canvas는 비운다');
  assert.match(products,/state\.pdf\?\.destroy\(\)/,'팝업을 닫으면 PDF 문서를 푼다');
});

test('0.126: PC 문서 팝업은 기본 폭이 넓고 좌우 가장자리를 끌어 폭을 바꾸며, 고른 폭은 저장이 막혀도 동작한다',()=>{
  const products=read('src/products.js'),styles=read('src/styles.css');
  assert.match(styles,/\.rt-doc-zoom\{width:min\(1040px,calc\(100vw - 16px\)\)/,'PC 기본 폭 1040px');
  for(const side of ['left','right'])assert.ok(products.includes(`data-doc-resize="${side}"`),`${side} 끌기 막대`);
  assert.match(products,/function bindDocResize\(/);
  assert.match(products,/const readDocWidth=\(\)=>\{try\{/,'저장된 폭 읽기는 try로 감싼다');
  assert.match(products,/const saveDocWidth=w=>\{try\{/,'폭 저장은 try로 감싼다');
  assert.match(products,/new ResizeObserver\(/,'창 크기가 바뀌면 쪽을 다시 맞춘다');
  assert.match(styles,/@media\(max-width:560px\),\(pointer:coarse\)\{[^}]*\{padding:0\}#rtcom-design \.rt-doc-resize/,'휴대폰에서는 끌기 막대를 숨긴다');
});

test('0.121: HD-D102U Rack마운트는 HD-D102U와 서로 관련 제품으로 이어지고, 도면 그림만 공개하며 사용자 도면 PDF는 배포하지 않는다',()=>{
  const rack=JSON.parse(read('data/products/hd-d102u-rack.json')),base=JSON.parse(read('data/products/hd-d102u.json'));
  assert.equal(rack.model,'HD-D102U Rack마운트');
  assert.ok(rack.related.some(link=>link.relation==='WORKS_WITH'&&link.target==='hd-d102u'));
  assert.ok(base.related.some(link=>link.relation==='WORKS_WITH'&&link.target==='hd-d102u-rack'));
  for(const image of rack.images)assert.ok(fs.existsSync(`output/design/assets/products/${image.file}`),`${image.file} must exist`);
  assert.ok(rack.documents.every(doc=>!doc.file),'사용자 제공 도면 PDF는 공개 폴더에 올리지 않는다');
  assert.equal('drawing' in rack,false,'0.123: 실도면(치수 도면)은 넣지 않고 그래픽 이미지만 보여준다(사용자 요청 "실도면은하지말고 그래픽이미지만")');
  assert.ok(rack.images.every(image=>!/drawing|dims/.test(image.file)),'치수선이 있는 도면 그림은 쓰지 않는다');
  // 0.130(사용자 요청 2026-09-29 "윗면 옆면은 전부 삭제해줘 정면만 남겨줘", "XDM-PSU 그래픽컨셉을 계승해줘"): 정면 그림 한 장만 두고, 밝은 회색 금속 몸체로 그린다.
  assert.deepEqual(rack.images.map(image=>image.file),['hd-d102u-rack-front-art.webp']);
  assert.equal(rack.portMap.length,1,'단자 지도는 정면 한 장만');
  assert.equal(JSON.stringify(rack).includes('윗면')||JSON.stringify(rack).includes('옆면'),false,'윗면·옆면 표기는 남기지 않는다');
  for(const name of ['top','side'])assert.equal(fs.existsSync(`output/design/assets/products/hd-d102u-rack-${name}-art.webp`),false,`${name} 그림 파일은 지운다`);
  assert.match(read('scripts/tools/draw_hd_d102u_rack.cjs'),/const L=\{body:'#c5cbd5',ear:'#b1b8c4',rail:'#d0d5de'/,'그림은 밝은 회색 금속 계열이되 분배기 칸(#f7f8fa)보다 어두운 몸체·랙 귀·레일 색을 쓴다(0.135)');
  assert.match(read('scripts/tools/draw_hd_d102u_rack.cjs'),/card:'#f7f8fa'/,'분배기 칸은 밝은 색을 유지한다');
  const order=JSON.parse(read('data/products/index.json')).products.map(product=>product.id);
  assert.equal(order.indexOf('hd-d102u-rack'),order.indexOf('hd-d102u')+1,'목록에서 HD-D102U 바로 뒤에 보인다');
});

test('0.125: 제품정보 목록은 XDM이 맨 앞이고, 매트릭스 시리즈는 XDM · SPX · VDM 순서다',()=>{
  const ids=JSON.parse(read('data/products/index.json')).products.map(product=>product.id);
  assert.deepEqual(ids.slice(0,3),['xdm','spx','vdm']);
});

test('0.127: 01 제품군 미리보기에 프레임 선택 버튼이 있고 파란 버튼의 → 화살표가 버튼 글자색으로 보인다',()=>{
  // 사용자 요청 2026-09-28 "이것도 버튼 위로 배치하고 오른쪽 화살표도 보이게"
  const app=read('src/app.js'),css=read('src/styles.css');
  assert.match(app,/const familyNext=`<button type="button" class="rt-button rt-primary rt-cg-preview-next" data-action="preview-next">/);
  assert.match(app,/rt-cg-chips">\$\{pf\.tags\.map\(t=>`<em>\$\{esc\(t\)\}<\/em>`\)\.join\(''\)\}<\/div>\$\{familyNext\}/,'버튼은 태그 줄 바로 아래에 둔다');
  assert.match(css,/\.rt-button\.rt-primary \.rt-arrow\{color:currentColor/,'화살표는 버튼 글자색을 쓴다(강조색 파랑은 파란 버튼에 묻힘)');
});

test('0.128: 01 제품군에서는 아래 바 다음 버튼을 숨겨 프레임 선택 버튼이 중복되지 않는다',()=>{
  // 사용자 지적 2026-09-29 "버튼이 중복이다"
  const app=read('src/app.js'),css=read('src/styles.css');
  assert.match(app,/next\.hidden=state\.step<=1;/,'01 제품군·02 프레임 선택에서는 아래 바 다음 버튼을 숨긴다(0.135, 사용자 승인 2026-09-29 "02 아래 바 버튼 숨기기")');
  assert.match(css,/\.rt-button\[hidden\]\{display:none!important\}/,'hidden 속성이 display:flex 규칙에 밀리지 않게 한다');
});

test('0.129: 구성기 아래 바의 요약 글(제품군 / 모델 · 카테고리)은 없고, 01 제품군에서는 아래 바를 숨긴다',()=>{
  assert.doesNotMatch(read('index.html'),/class="rt-summary"/);
  const app=read('src/app.js');
  assert.doesNotMatch(app,/카테고리: 매트릭스/);
  assert.match(app,/querySelector\('\.rt-footer'\)\.hidden=state\.step===0/);
  assert.match(read('src/styles.css'),/\.rt-footer\[hidden\]\{display:none\}/);
});

test('0.132: 02 프레임 선택 미리보기 그림 높이는 랙 높이(U)에서 정하고 VDM·SPX·XDM 모든 프레임이 등록되어 있다',()=>{
  // 사용자 요청 2026-09-29 "VDM-8X는 다소 크다 … 적정한 크기 판단해서 이미지 개선해줘", "SPX, XDM도 비슷한 컨셉으로 수정해줘"
  const catalog=loadCatalog(),app=read('src/app.js'),css=read('src/styles.css');
  const table=app.match(/const frameRackU=\{([\s\S]*?)\};/)[1];
  for(const family of Object.values(catalog))for(const model of family.models)assert.match(table,new RegExp(`'${model}':\\d+`),`${model} must have a rack height in frameRackU`);
  assert.match(app,/frameShowHeight=model=>frameRackU\[model\]\?Math\.round\(90\+410\*Math\.log\(frameRackU\[model\]\/2\)\/Math\.log\(20\)\):0/);
  assert.match(app,/rt-cg-preview\$\{fh\?' rt-cg-scaled':''\}/);
  assert.match(css,/\.rt-cg-preview\.rt-cg-scaled img\{height:calc\(var\(--rt-fh\)\*1px\)/);
  // 크기 눈금: 작은 프레임은 작게, 큰 프레임은 크게(2U 90px … 40U 500px)
  const u=n=>Math.round(90+410*Math.log(n/2)/Math.log(20));
  assert.equal(u(2),90);assert.equal(u(40),500);assert.ok(u(3)<u(7)&&u(7)<u(12)&&u(38)<=u(40));
});
