// Browser smoke test for the packaged site. Serves dist/ under a GitHub Pages style base path.
// Usage: node scripts/package-site.cjs && node scripts/e2e-smoke.cjs  (requires the playwright package)
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
let chromium;
// 로컬 node_modules에 playwright가 없으면 전역 설치(npm root -g)에서 찾는다(사용자 환경에 전역 설치가 있을 때).
try{({chromium}=require('playwright'))}
catch{
  try{
    const {execFileSync}=require('node:child_process');
    const globalRoot=execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim();
    ({chromium}=require(require('node:path').join(globalRoot,'playwright')));
  }catch{
    console.error('playwright 패키지가 없어 브라우저 검사를 건너뜁니다. 설치 후 다시 실행하세요: npm i --no-save playwright');
    process.exit(2);
  }
}
const BASE='/rtcom-configurator/';
const dist=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.md':'text/markdown','.json':'application/json','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  const url=decodeURIComponent(new URL(req.url,'http://x').pathname);
  if(!url.startsWith(BASE)){res.writeHead(404).end();return}
  let file=path.join(dist,url.slice(BASE.length));
  if(!file.startsWith(dist)){res.writeHead(403).end();return}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
    if(!url.endsWith('/')){res.writeHead(301,{Location:`${url}/`}).end();return}
    file=path.join(file,'index.html');
  }
  // GitHub Pages처럼 사이트 안의 없는 파일에는 404.html을 404 상태로 보여 준다.
  if(!fs.existsSync(file)){const page=path.join(dist,'404.html');res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(fs.existsSync(page)?fs.readFileSync(page):'');return}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));
});
const results=[];
const check=(name,ok,detail='')=>{results.push({name,ok,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?` — ${detail}`:''}`)};
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`,home=`${origin}${BASE}`;
  // 이 샌드박스는 /opt/pw-browsers/chromium에 크로미움을 미리 설치해 둔다(playwright install 실행 금지). CHROMIUM_PATH로 재정의할 수 있다.
  const fallbackChromium='/opt/pw-browsers/chromium';
  const options={executablePath:process.env.CHROMIUM_PATH||(fs.existsSync(fallbackChromium)?fallbackChromium:undefined)};
  const browser=await chromium.launch(options);
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const page=await context.newPage();
    const failed=[],errors=[];
    page.on('response',response=>{if(response.status()>=400&&!response.url().includes('/no-such-page/'))failed.push(`${response.status()} ${response.url().replace(origin,'')}`)});
    page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.accept());
    const brokenImages=()=>page.$$eval('img',images=>images.filter(image=>image.complete&&image.naturalWidth===0&&image.loading!=='lazy').map(image=>image.getAttribute('src')));

    await page.goto(home,{waitUntil:'networkidle'});
    check('첫 화면에 구성기가 표시됨',await page.locator('#matrix-configurator h1').isVisible());
    await page.click('button[data-family="XDM"]');
    await page.click('[data-action="next"]');
    check('섀시 선택 화면에 XDM 프레임 6종 표시(XDM-288 제외)',await page.locator('button[data-model]').count()===6);
    await page.click('button[data-model="XDM-144"]');
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    // 사용자 결정 2026-09-27: 빈 슬롯은 흰 빈칸이다. 블랭크 커버 그림은 사용자가 팝업에서 고른 슬롯에만 붙는다(자동으로 씌우지 않는다).
    check('빈 슬롯 72개는 흰 빈칸으로 표시되고 블랭크 커버는 하나도 자동으로 씌워지지 않음',await page.locator('.rt-rack-slot-empty').count()===72&&await page.locator('.rt-rack-slot-blank').count()===0);
    check('빈칸이 있으면 03 단계 다음 버튼은 "빈칸 N개 남음"으로 표시됨',(await page.locator('[data-action="next"] span').first().textContent())==='빈칸 72개 남음 · 그래도 다음');
    await page.locator('button[data-slot="in-1"]').click();
    check('빈 슬롯을 누르면 카드 선택 팝업이 열리고 파란 테두리로 선택 중 표시됨',await page.locator('.rt-card-modal[open]').isVisible()&&await page.locator('button[data-slot="in-1"].rt-rack-slot-selecting').count()===1);
    check('팝업 맨 위에 블랭크 커버(0포트)가 있고 그 아래 구분 제목과 카드 목록이 옴',(await page.locator('.rt-card-modal .rt-card-choice').first().getAttribute('data-card'))==='BLANK'&&await page.locator('.rt-card-modal .rt-card-choice-sep').count()===1);
    await page.keyboard.press('Escape');
    check('Esc로 팝업을 닫으면 누른 슬롯으로 포커스 복귀',await page.locator('.rt-card-modal').count()===0&&await page.evaluate(()=>document.activeElement?.dataset?.slot)==='in-1');
    await page.locator('button[data-slot="in-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="BLANK"]').click();
    check('팝업에서 블랭크 커버를 고르면 그 슬롯만 블랭크 판넬로 바뀜',await page.locator('button[data-slot="in-1"].rt-rack-slot-blank img.rt-blank-plate').count()===1&&await page.locator('.rt-rack-slot-blank').count()===1&&await page.locator('.rt-rack-slot-empty').count()===71);
    await page.reload({waitUntil:'networkidle'});
    check('블랭크 선택은 새로고침 후에도 복원됨',await page.locator('button[data-slot="in-1"].rt-rack-slot-blank').count()===1);
    await page.locator('button[data-slot="in-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice').nth(1).click();
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice').nth(1).click();
    await page.waitForLoadState('networkidle');
    check('장착한 슬롯이 카드 판넬로 바뀌고 전환 효과가 적용됨(블랭크였던 in-1도 카드로 교체됨)',await page.locator('button[data-slot="out-1"].rt-rack-slot-filled.rt-rack-slot-changed').count()===1&&await page.locator('button[data-slot="in-1"].rt-rack-slot-filled').count()===1&&await page.locator('.rt-rack-slot-empty').count()===70);
    const placed=await page.locator('.rt-rack-slot-filled img.rt-faceplate').count();
    check('카드 선택 후 팝업이 닫히고 슬롯에 실물 판넬 이미지 표시',placed===2&&await page.locator('.rt-card-modal').count()===0,`${placed}개`);
    check('장착한 판넬 이미지가 정상 로드됨',await page.$$eval('.rt-rack-slot-filled img.rt-faceplate',images=>images.every(image=>image.naturalWidth>0)));
    check('구성 요약에 장착 카드가 표시됨',await page.locator('.rt-config-summary li').count()===2);
    check('구성 요약의 카드 판넬이 목록 폭에 맞춰 크게 표시됨',await page.$$eval('.rt-config-summary li',items=>items.every(item=>{const image=item.querySelector('img').getBoundingClientRect(),box=item.getBoundingClientRect();return image.width>=box.width*0.85})));
    check('XDM-144 후면 사진 위에 슬롯이 표시되고 사진이 정상 로드됨',await page.locator('.rt-rack-photo .rt-rack-slot').count()===72&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.locator('button[data-slot="in-2"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="XDM-CIS100"]').click();
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('CIS100 장착 시 전송기 단계에 XDM-CTR100(TX)이 4채널로 자동 연결됨',await page.locator('button[data-owner="in-2"][data-link-device="XDM-CTR100 · TX"][aria-pressed="true"]').count()===1&&await page.locator('select[data-owner="in-2"][data-link="count"]').inputValue()==='4');
    // 라인업 사진은 지연 로딩(loading=lazy)이라 화면에 보이도록 스크롤한 뒤 로딩이 끝나기를 기다린다.
    await page.locator('.rt-ext-lineup').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.querySelectorAll('.rt-ext-lineup-card img')].every(image=>image.complete&&image.naturalWidth>0),null,{timeout:10000}).catch(()=>{});
    check('전송기 단계에 XDM 연동 전송기 라인업 6종이 사진과 함께 표시됨',await page.locator('.rt-ext-lineup-card img').count()===6&&await page.$$eval('.rt-ext-lineup-card img',images=>images.every(image=>image.naturalWidth>0)));
    await page.locator('button[data-owner="in-1"][data-link-device="XDM-CTR100 PSE + XDM-CTR100"]').click();
    check('HDMI 카드에 CTR100 PSE + CTR100 한 쌍을 연결할 수 있고 CTR100 전원 경고 수에는 포함되지 않음',await page.locator('button[data-owner="in-1"][data-link-device="XDM-CTR100 PSE + XDM-CTR100"][aria-pressed="true"]').count()===1&&/XDM-CTR100 4대/.test(await page.locator('.rt-power-notice strong').innerText()));
    // 04 좌우 분할(0.38): 세그먼트를 눌러 오른쪽 미리보기를 in-2(XDM-CIS100)로 잡아 두고, 다른 세그먼트로 바꿨을 때 바뀌는지 본다.
    await page.click('.rt-cg-seg-link button[data-link-preview="in-2"]');
    check('04 세그먼트로 IN 2를 고르면 오른쪽 흐름이 XDM-CIS100을 보여줌',(await page.locator('.rt-link-flow-card strong').innerText())==='XDM-CIS100');
    await page.click('.rt-cg-seg-link button[data-link-preview="in-1"]');
    const linkPreviewCard=await page.locator('.rt-link-flow-card strong').innerText(),linkPreviewImg=await page.locator('.rt-link-flow-card img').getAttribute('src');
    check('04에서 오른쪽 세그먼트를 바꾸면 흐름이 해당 카드로 바뀐다',linkPreviewCard==='XDM-HI100'&&linkPreviewImg.includes('XDM-HI100'));
    const linksOverflow=await page.evaluate(()=>[...document.querySelectorAll('#matrix-configurator *')].map(el=>el.getBoundingClientRect().right-document.documentElement.clientWidth).filter(value=>value>1));
    check('390px에서 04 카드 폭이 화면 안에 들어간다',linksOverflow.length===0,`뷰포트 ${page.viewportSize().width}px, ${JSON.stringify(linksOverflow.slice(0,5).map(value=>value.toFixed(1)))}`);
    // 0.38 검수(Opus) 회귀: 560px 이하에서 흐름이 세로로 쌓이는지 확인한다(이 page는 390px 컨텍스트라 그대로 검사할 수 있다).
    const linkFlowDirection=await page.$eval('.rt-link-flow',el=>getComputedStyle(el).flexDirection);
    check('휴대폰(390px) 04에서 연결 흐름이 세로로 쌓임(flex-direction:column)',linkFlowDirection==='column',`flex-direction:${linkFlowDirection}`);
    await page.click('[data-action="back"]');
    await page.waitForLoadState('networkidle');
    const broken=await brokenImages();
    check('깨진 이미지 없음',broken.length===0,broken.join(', '));
    check('주소가 바뀌지 않음(상대경로 이미지 보호)',page.url()===home,page.url());
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    check('390px 화면에서 페이지 가로 넘침 없음',overflow<=0,`${overflow}px`);

    await page.reload({waitUntil:'networkidle'});
    check('새로고침 후 자동 저장 복원',await page.locator('.rt-rack-slot-filled img.rt-faceplate').count()===placed+1);

    for(const legacy of ['tools/matrix-configurator/','products/','tools/matrix-configurator']){
      await page.goto(`${home}${legacy}#matrix-configurator`,{waitUntil:'networkidle'});
      check(`옛 주소 /${legacy} → 구성기 첫 화면 이동`,page.url()===`${home}#matrix-configurator`&&await page.locator('#matrix-configurator h1').isVisible(),page.url());
    }
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="SPX"]');
    await page.click('[data-action="next"]');
    await page.click('button[data-model="SPX-M3236"]');
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('SPX-M3236은 입력 4·출력 3 슬롯이 모두 흰 빈칸으로 표시됨(블랭크 자동 없음)',await page.locator('.rt-rack-hs .rt-rack-slot-empty').count()===7&&await page.locator('.rt-rack-hs .rt-rack-slot-blank').count()===0);
    check('사진 슬롯 영역은 사진 높이 기준으로 배치됨(출력 영역 아래 끝 = 사진 677/772 지점)',await page.evaluate(()=>{const image=document.querySelector('.rt-rack-photo-image').getBoundingClientRect(),zone=document.querySelector('.rt-rack-zone-output').getBoundingClientRect();return Math.abs((zone.bottom-image.top)/image.height-677/772)<0.005}));
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="SPX-COS12"]').click();
    await page.mouse.move(2,2);
    await page.evaluate(()=>document.activeElement?.blur());
    check('장착한 카드 판넬 위의 슬롯 번호표는 숨겨져 첫 포트를 가리지 않음(빈 슬롯 번호표는 표시)',await page.evaluate(()=>{const filled=[...document.querySelectorAll('.rt-rack-slot-filled .rt-rack-slot-no')],empty=[...document.querySelectorAll('.rt-rack-slot-empty .rt-rack-slot-no')];return filled.length>0&&filled.every(label=>getComputedStyle(label).opacity==='0')&&empty.length>0&&empty.every(label=>getComputedStyle(label).opacity!=='0')}));
    // "남은 칸 블랭크로 채우기": 카드를 넣은 슬롯(out-1)은 그대로 두고 나머지 6칸만 블랭크로 바꾼다. 완성 배너가 뜨고, 실행 취소로 한 번에 되돌아간다.
    check('빈칸이 있으면 채우기 줄이 보임',(await page.locator('.rt-slot-fillbar span').first().textContent()).includes('6개'));
    await page.click('[data-action="fill-blanks"]');
    await page.waitForLoadState('networkidle');
    check('"남은 칸 블랭크로 채우기"는 빈 슬롯만 블랭크로 바꾸고 이미 넣은 카드는 그대로 둠',await page.locator('.rt-rack-slot-blank').count()===6&&await page.locator('button[data-slot="out-1"].rt-rack-slot-filled').count()===1&&await page.locator('.rt-rack-slot-empty').count()===0);
    check('모든 슬롯을 채우면 완성 배너와 "선택 완료" 다음 버튼이 표시됨',await page.locator('.rt-slot-done-banner').isVisible()&&(await page.locator('[data-action="next"] span').first().textContent())==='선택 완료 · 전송기 연결');
    await page.click('[data-tool="undo"]');
    await page.waitForLoadState('networkidle');
    check('실행 취소 1번으로 "채우기"가 통째로 되돌아감(블랭크 6개가 다시 빈칸으로)',await page.locator('.rt-rack-slot-blank').count()===0&&await page.locator('.rt-rack-slot-empty').count()===6&&await page.locator('button[data-slot="out-1"].rt-rack-slot-filled').count()===1&&await page.locator('.rt-slot-done-banner').count()===0);
    await page.click('[data-action="next"]');
    check('SPX-COS12 장착 시 SPX-RX가 12채널로 자동 연결됨',await page.locator('button[data-owner="out-1"][data-link-device="SPX-RX"][aria-pressed="true"]').count()===1&&await page.locator('select[data-owner="out-1"][data-link="count"]').inputValue()==='12');
    // 제품군을 바꾸면(확인 창 수락) 카드·전송기 선택이 초기화된다.
    await page.click('.rt-step[data-jump="0"]');
    await page.click('button[data-family="XDM"]');
    await page.waitForLoadState('networkidle');
    check('제품군을 바꾸면 카드·전송기 선택이 초기화됨',await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements)&&Object.keys(await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements)).length===0&&await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.family)==='XDM'&&await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.model)===null);
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="XDM"]');
    await page.click('[data-action="next"]');
    await page.click('button[data-model="XDM-12"]');
    await page.click('[data-action="next"]');
    const cardsUrl=page.url();
    await page.goBack();
    const onChassis=await page.locator('.rt-step[aria-current="step"]').getAttribute('data-jump')==='1';
    await page.goForward();
    check('뒤로가기·앞으로가기로 이전·다음 단계를 오가며 주소는 바뀌지 않음',onChassis&&await page.locator('.rt-step[aria-current="step"]').getAttribute('data-jump')==='2'&&page.url()===cardsUrl);
    let asked='';
    page.once('dialog',dialog=>{asked=dialog.message()});
    await page.click('.rt-brand-lockup');
    check('로고를 누르면 확인 창 뒤 첫 화면(제품군)으로 이동하고 구성은 유지됨',/처음 화면/.test(asked)&&await page.locator('.rt-step[aria-current="step"]').getAttribute('data-jump')==='0'&&await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.model)==='XDM-12'&&page.url()===cardsUrl);
    const missing=await page.goto(home+'no-such-page/deep',{waitUntil:'networkidle'});
    check('사이트 안의 없는 주소는 404.html이 구성기 첫 화면으로 보냄',missing&&page.url()===home&&await page.locator('#matrix-configurator').count()===1);
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="SPX"]');
    await page.click('[data-action="next"]');
    // 02 섀시(2-2, Analog Way 구조): 목록 행에는 사진이 없고, 고른 모델의 전면 사진이 오른쪽 고정 미리보기에 표시된다.
    check('SPX 섀시 5종 목록에 모두 사진 없이 이름·사양 행으로 표시됨',await page.locator('button[data-model]').count()===5&&await page.locator('button[data-model] img').count()===0);
    const spxModels=await page.locator('button[data-model]').evaluateAll(nodes=>nodes.map(node=>node.dataset.model));
    let spxPreviewOk=true;
    for(const model of spxModels){
      await page.click(`button[data-model="${model}"]`);
      const src=await page.locator('.rt-cg-preview img').getAttribute('src');
      if(!src||!src.includes(`/frames/spx-${model.slice(4).toLowerCase()}-front.webp`))spxPreviewOk=false;
    }
    check('섀시 목록에서 모델을 고를 때마다 오른쪽 미리보기가 그 모델의 전면 사진으로 바뀜(SPX 5종)',spxPreviewOk);
    await page.click('button[data-model="SPX-M2472"]');
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('SPX-M2472는 매뉴얼 후면 사진 위 세로 슬롯(입력 3·출력 6)으로 표시됨',await page.locator('.rt-rack-photo.rt-rack-vs .rt-rack-zone-input .rt-rack-slot').count()===3&&await page.locator('.rt-rack-photo.rt-rack-vs .rt-rack-zone-output .rt-rack-slot').count()===6&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="VDM"]');
    await page.click('[data-action="next"]');
    const vdmModels=await page.locator('button[data-model]').evaluateAll(nodes=>nodes.map(node=>node.dataset.model));
    let vdmFrontCount=0,vdm288Placeholder=false;
    for(const model of vdmModels){
      await page.click(`button[data-model="${model}"]`);
      const src=await page.$eval('.rt-cg-preview img',image=>image.getAttribute('src')).catch(()=>null);
      if(model==='VDM-288X')vdm288Placeholder=await page.locator('.rt-cg-preview-placeholder').isVisible();
      if(src&&src.includes('/frames/vdm-')&&src.endsWith('-front.webp'))vdmFrontCount++;
    }
    check('VDM 섀시 10종 중 9종(288X 제외)은 매뉴얼 전면 사진 또는 전면 도면을 미리보기에 표시함',vdmFrontCount===9);
    check('VDM-288X는 전면 사진이 없어 미리보기에 "사진 준비 중"이 표시됨',vdm288Placeholder);
    await page.click('button[data-model="VDM-16X"]');
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    // 슬롯 판과 후면 사진이 다 그려지기 전에 세면 가끔 실패했다(2026-09-27 한 번 재현). 슬롯 8칸과 사진 로딩을 기다린 뒤 검사한다.
    await page.waitForFunction(()=>{const image=document.querySelector('.rt-rack-photo-image');return document.querySelectorAll('.rt-rack-photo .rt-rack-slot').length>=8&&image&&image.complete&&image.naturalWidth>0},null,{timeout:10000}).catch(()=>{});
    check('VDM-16X는 매뉴얼 후면 사진 위에 입력 4·출력 4 슬롯이 모두 흰 빈칸으로 표시됨(블랭크 자동 없음)',await page.locator('.rt-rack-photo .rt-rack-slot-empty').count()===8&&await page.locator('.rt-rack-photo .rt-rack-slot-blank').count()===0&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.locator('button[data-slot="in-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="HIS4-U"]').click();
    check('VDM 보드를 장착하면 실물 판넬 사진이 표시됨',await page.$eval('button[data-slot="in-1"] img.rt-faceplate',image=>image.naturalWidth>0&&image.getAttribute('src').endsWith('HIS4-U.webp')));
    await page.locator('button[data-slot="in-2"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="CIS4-U"]').click();
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="FOS4-U"]').click();
    await page.click('[data-action="next"]');
    await page.locator('.rt-ext-lineup').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.querySelectorAll('.rt-ext-lineup-card img')].every(image=>image.complete&&image.naturalWidth>0),null,{timeout:10000}).catch(()=>{});
    check('VDM CIS4-U·FOS4-U 장착 시 CT104-U·FR101-U가 4채널로 자동 연결되고 VDM 전송기 라인업 4종이 표시됨',await page.locator('button[data-owner="in-2"][data-link-device="CT104-U"][aria-pressed="true"]').count()===1&&await page.locator('button[data-owner="out-1"][data-link-device="FR101-U"][aria-pressed="true"]').count()===1&&await page.locator('select[data-owner="in-2"][data-link="count"]').inputValue()==='4'&&await page.$$eval('.rt-ext-lineup-card img',images=>images.length===4&&images.every(image=>image.naturalWidth>0)));
    await page.click('[data-action="back"]');
    await page.click('[data-action="back"]');
    await page.click('button[data-model="VDM-256X"]');
    await page.click('[data-action="next"]');
    await page.locator('button[data-slot="out-64"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="COS4-U"]').click();
    check('VDM-256X는 매뉴얼 후면 도면(랙 2대) 위에 입력 64·출력 64 슬롯이고 64번 슬롯에 카드를 장착할 수 있음',await page.locator('.rt-rack-photo .rt-rack-zone').count()===4&&await page.locator('.rt-rack-slot').count()===128&&await page.locator('button[data-slot="out-64"].rt-rack-slot-filled').count()===1&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    // 0.19 알티컴 공개 제품정보: 같은 화면 안에서 #products 주소 조각으로만 전환한다.
    // 0.33 — 제품정보 글래스 디자인(rt-pg-*)으로 목록·상세 마크업이 바뀌었다.
    await page.click('a[data-view-tab="products"]');
    await page.waitForSelector('.rt-pg-gridcard');
    check('제품정보 탭을 누르면 구성기를 숨기고 제품 28종 목록을 표시',await page.locator('.rt-configurator-view').isHidden()&&await page.locator('.rt-pg-gridcard').count()===28);
    await page.click('[data-product-filter="extender"]');
    check('전송기 분류는 12종',await page.locator('.rt-pg-gridcard').count()===12);
    await page.click('[data-product-filter="all"]');
    await page.fill('[data-product-search]','QMS');
    check('검색어 QMS로 일체형 매트릭스 2종이 남음',await page.locator('.rt-pg-gridcard').count()===2);
    await page.fill('[data-product-search]','');
    await page.click('a.rt-pg-gridcard[href="#products/ct104-u-cr104-u"]');
    await page.waitForSelector('.rt-pg-tablewrap');
    check('제품 카드를 누르면 상세(사양 표·입출력·출처)를 표시',(await page.locator('#rt-pg-title').textContent()).includes('CT104-U')&&await page.locator('.rt-pg-tablewrap table tbody tr').count()>3);
    await page.click('.rt-pg-record summary');
    check('자료 출처·검토 기록을 펼치면 출처가 보임',await page.locator('.rt-pg-record[open]').count()===1&&(await page.locator('.rt-pg-record-body').textContent()).includes('카탈로그'));
    await page.waitForLoadState('networkidle');
    check('상세 이미지가 모두 열림',(await page.$$eval('.rt-pg-hero-item img',images=>images.filter(image=>!image.complete||image.naturalWidth===0).length))===0);
    // 0.39 — 01 위 사진 띠(돋보기): 사진을 누르면 라이트박스가 열리고, 그 안에서 다시 누르면 확대되고, Esc로 닫힌다.
    await page.locator('.rt-pg-hero-item').first().click();
    check('사진을 누르면 돋보기(라이트박스)가 화면 전체로 열림',await page.locator('.rt-pg-lightbox').isVisible()&&await page.$eval('.rt-pg-lightbox',el=>{const r=el.getBoundingClientRect();return r.width===document.documentElement.clientWidth&&r.height===window.innerHeight}));
    await page.locator('.rt-pg-lightbox-img').click({position:{x:15,y:15}});
    check('라이트박스 안에서 사진을 다시 누르면 확대됨',await page.locator('.rt-pg-lightbox-img.rt-pg-zoomed').count()===1);
    await page.keyboard.press('Escape');
    check('Esc를 누르면 돋보기가 닫힘',await page.locator('.rt-pg-lightbox').isHidden());
    // 0.21/0.33 연결 다이어그램: "02 신호 흐름"은 항상 자동 생성 SVG를 보여준다(전송기는 TX→케이블→RX 형태). 제조사 원본 사진이 있으면 기록 영역에 따로 둔다.
    await page.waitForSelector('.rt-pg-svg-wrap svg');
    check('CT104-U/CR104-U 상세에 TX·케이블·RX 연결 다이어그램이 보임',await page.locator('.rt-pg-svg-wrap svg').first().isVisible()&&(await page.locator('.rt-pg-legend').first().textContent()).includes('HDBaseT'));
    // 0.42 전송기 단자 지도: 송신기·수신기 사진 두 장에 번호표를 얹고(입출력 표 카드가 아니라), 사진이 정상으로 열린다.
    const extenderMaps=await page.$$eval('.rt-pg-panel svg[aria-label$="단자 지도"]',svgs=>svgs.map(svg=>svg.getAttribute('aria-label')));
    check('CT104-U/CR104-U 단자 지도가 송신기·수신기 사진 두 장으로 나옴',extenderMaps.length===2&&extenderMaps[0].includes('송신기 CT104-U')&&extenderMaps[1].includes('수신기 CR104-U'),JSON.stringify(extenderMaps));
    await page.goBack();
    await page.waitForSelector('.rt-pg-gridcard');
    check('뒤로가기로 상세에서 제품 목록으로 돌아감',new URL(page.url()).hash==='#products'&&await page.locator('.rt-pg-gridcard').count()===28);
    // 0.43 벽부형 단자 지도: 송신기·수신기 두 장, 세로 괄호(side left/right) 번호표 11개(0.46에서 HDMI IN 1·2를 한 번호로 묶음), 사진에 보이지 않는 옆면 단자 안내(note).
    await page.goto(`${home}#products/ft103-u-h-fr103-u`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const wallMap=await page.evaluate(()=>{const svgs=[...document.querySelectorAll('.rt-pg-panel svg[aria-label$="단자 지도"]')];return {maps:svgs.length,pins:svgs.reduce((n,svg)=>n+svg.querySelectorAll('circle').length,0),note:[...document.querySelectorAll('.rt-pg-hint')].some(el=>el.textContent.includes('옆면(사진에 보이지 않음)'))}});
    check('FT103-U-H/FR103-U 벽부형 단자 지도가 두 장·번호표 11개·옆면 단자 안내로 나옴',wallMap.maps===2&&wallMap.pins===11&&wallMap.note,JSON.stringify(wallMap));
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    check('HD-13U 상세는 02 신호 흐름에 자동 생성 SVG를 보여주고, 제조사 원본 다이어그램 버튼으로 기록 영역의 사진을 펼침',await page.locator('.rt-pg-svg-wrap svg').first().isVisible());
    // 0.47 오디오 설정: 병합(MUX)·추출(DEMUX)은 하나를 골라 쓴다(사용자 확인). 신호 흐름 문구와 07 카드 두 칸, 단자 지도 번호 순서(HDMI 입력 → 출력 → 오디오 → 전원)를 본다.
    const audioCard=await page.evaluate(()=>({modes:document.querySelectorAll('.rt-pg-audio .rt-pg-audio-mode').length,flow:document.querySelector('.rt-pg-svg-wrap svg')?.textContent.includes('또는 추출 중 선택'),order:[...document.querySelectorAll('.rt-pg-port b')].map(b=>b.textContent.trim()).slice(0,5).join('|')}));
    check('HD-13U 오디오 설정 카드가 병합·추출 두 칸으로 나오고 신호 흐름에 "선택"이 표시되며 단자 번호가 HDMI 입력·출력·오디오·전원 순',audioCard.modes===2&&audioCard.flow&&audioCard.order==='1HDMI IN|2HDMI OUT 1–3|3AUDIO IN|4AUDIO OUT|5DC 5V',JSON.stringify(audioCard));
    await page.click('[data-open-diagram]');
    await page.waitForSelector('.rt-pg-diagram-photo img');
    await page.waitForLoadState('networkidle');
    check('제조사 원본 다이어그램 버튼을 누르면 기록 영역이 펼쳐지고 카탈로그 원본 사진이 정상적으로 열림',await page.locator('.rt-pg-record[open]').count()===1&&await page.locator('.rt-pg-diagram-photo img').isVisible()&&await page.$eval('.rt-pg-diagram-photo img',img=>img.complete&&img.naturalWidth>0));
    check('연결 다이어그램에도 가로 스크롤이 생기지 않음',(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
    await page.goto(`${home}#products/vdm`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    check('시리즈(VDM)는 제조사 원본 다이어그램 버튼이 없고 02는 신호 구성 카드임(연결 다이어그램을 그리지 않음)',await page.locator('[data-open-diagram]').count()===0);
    check('제품 상세 주소(#products/vdm)로 바로 들어갈 수 있음',(await page.locator('#rt-pg-title').textContent()).includes('VDM'));
    await page.click('[data-configure-family="VDM"]');
    await page.waitForSelector('button[data-model]');
    check('시리즈 상세의 "구성기에서 구성하기"는 VDM 섀시 선택 단계로 이동',await page.locator('.rt-products-view').isHidden()&&await page.locator('[data-model="VDM-256X"]').count()===1);
    await page.click('a[data-view-tab="products"]');
    await page.waitForSelector('.rt-pg-gridcard');
    let productDialog=false;const onProductDialog=()=>{productDialog=true};page.on('dialog',onProductDialog);
    await page.click('.rt-brand-lockup');
    await page.waitForFunction(()=>!document.querySelector('.rt-configurator-view').hidden,null,{timeout:3000}).catch(()=>{});
    check('제품정보 화면에서 로고를 누르면 확인 창 없이 구성기로 돌아감',!productDialog&&await page.locator('.rt-configurator-view').isVisible()&&await page.locator('.rt-products-view').isHidden());
    page.off('dialog',onProductDialog);
    check('404 요청 없음',failed.length===0,failed.join(', '));
    check('자바스크립트 오류 없음',errors.length===0,errors.join(' | '));
    await context.close();
    // 0.38 검수(Opus)가 고친 두 가지(04 연결 흐름 한 줄, 미리보기 sticky)는 PC 폭(1280px)에서만 나타나는 문제였다.
    // 위 main 컨텍스트는 390px 고정이라 여기서 별도로 1280px 컨텍스트를 열어 확인한다.
    const pcContext=await browser.newContext({viewport:{width:1280,height:900}});
    const pc=await pcContext.newPage();
    await pc.goto(home,{waitUntil:'networkidle'});
    await pc.click('button[data-family="XDM"]');
    await pc.click('[data-action="next"]');
    await pc.click('button[data-model="XDM-36"]');
    await pc.click('[data-action="next"]');
    await pc.waitForLoadState('networkidle');
    // 왼쪽 목록이 오른쪽 미리보기보다 확실히 길어지도록 XDM-36의 입력 9칸 모두 CIS100, 출력 9칸 모두 COS100을 장착한다(sticky 검사용).
    for(let index=1;index<=9;index++){
      await pc.click(`button[data-slot="in-${index}"]`);
      await pc.click('.rt-card-modal .rt-card-choice[data-card="XDM-CIS100"]');
    }
    for(let index=1;index<=9;index++){
      await pc.click(`button[data-slot="out-${index}"]`);
      await pc.click('.rt-card-modal .rt-card-choice[data-card="XDM-COS100"]');
    }
    await pc.click('[data-action="next"]');
    await pc.waitForLoadState('networkidle');
    // .rt-link-flow는 align-items:center라 노드마다 높이가 달라도(엔드포인트·전송기·카드 사진 높이가 제각각) 한 줄이면 top은 다르고
    // "세로 중심"(top+height/2)은 같다. top 자체를 비교하면 정상 상태에서도 오탐 FAIL이 나서(직접 확인함), 세로 중심으로 비교한다.
    const flowNodes=await pc.$$eval('.rt-link-flow .rt-link-flow-node',nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {top:r.top,center:r.top+r.height/2}}));
    const centers=flowNodes.map(node=>node.center);
    const flowSpread=centers.length?Math.max(...centers)-Math.min(...centers):Infinity;
    check('PC(1280px) 04 연결 흐름 노드가 한 줄로 나옴(세로 중심 차이 2px 이하)',flowSpread<=2,`노드 ${flowNodes.length}개, 세로 중심 차이 ${flowSpread.toFixed(1)}px, top 목록 ${JSON.stringify(flowNodes.map(node=>Math.round(node.top)))}`);
    const [listHeight,previewHeight]=await pc.evaluate(()=>[document.querySelector('.rt-cg-list').getBoundingClientRect().height,document.querySelector('.rt-cg-preview.rt-link-preview').getBoundingClientRect().height]);
    if(listHeight>previewHeight){
      // sticky는 부모 컨테이너(.rt-cg-split, 높이 = 목록 높이)를 벗어나는 순간 풀린다. 문서 맨 아래(document.body.scrollHeight)까지
      // 스크롤하면 그 경계를 넘어가 버려(직접 확인함) 정상 상태에서도 오탐 FAIL이 난다. 목록 높이의 절반만큼만 스크롤해 안전하게 확인한다.
      // 페이지 절대 위치가 아니라 판(.rt-cg-split) 윗변 기준으로 재야, 머리 영역 높이가 바뀌어도 판 안쪽을 스크롤한 상태가 된다.
      const splitTop=await pc.$eval('.rt-cg-split:has(.rt-link-preview)',el=>el.getBoundingClientRect().top+window.scrollY);
      const scrollTarget=Math.round(splitTop+listHeight/2);
      await pc.evaluate((y)=>window.scrollTo(0,y),scrollTarget);
      await pc.waitForTimeout(150);
      const previewTop=await pc.$eval('.rt-cg-preview.rt-link-preview',el=>el.getBoundingClientRect().top);
      check('PC(1280px) 04 왼쪽 목록이 미리보기보다 길면 스크롤해도 미리보기가 8~16px에 붙어있음(sticky)',previewTop>=8&&previewTop<=16,`목록 ${listHeight.toFixed(0)}px > 미리보기 ${previewHeight.toFixed(0)}px, ${scrollTarget}px 스크롤 후 top ${previewTop.toFixed(1)}px`);
    }else{
      // 조건(목록 > 미리보기)이 안 맞으면 저절로 통과하는 일을 막기 위해 FAIL로 처리한다(사용자 지시).
      check('PC(1280px) 04 왼쪽 목록이 미리보기보다 길면 스크롤해도 미리보기가 8~16px에 붙어있음(sticky)',false,`조건 안 맞음 — 목록 ${listHeight.toFixed(0)}px <= 미리보기 ${previewHeight.toFixed(0)}px`);
    }
    await pcContext.close();
    // 터치 휴대폰(pointer:coarse)에서는 버튼 최소 높이 44px 규칙이 있다. 사진 슬롯이 겹치지 않고 판넬이 잘리지 않아야 한다.
    const phone=await browser.newContext({viewport:{width:416,height:900},deviceScaleFactor:3,isMobile:true,hasTouch:true});
    const mobile=await phone.newPage();
    await mobile.goto(home,{waitUntil:'networkidle'});
    await mobile.click('button[data-family="SPX"]');
    await mobile.click('[data-action="next"]');
    await mobile.click('button[data-model="SPX-M3236"]');
    await mobile.click('[data-action="next"]');
    await mobile.waitForLoadState('networkidle');
    const rows=await mobile.$$eval('.rt-rack-zone-input .rt-rack-slot',slots=>slots.map(slot=>slot.getBoundingClientRect()).map(rect=>[rect.top,rect.bottom]));
    const photoFits=await mobile.$eval('.rt-rack-photo',figure=>figure.getBoundingClientRect().right<=document.documentElement.clientWidth);
    check('터치 휴대폰에서 SPX-M3236 입력 슬롯 4개가 겹치지 않고 사진이 화면 폭 안에 들어감',rows.length===4&&rows.every((row,index)=>index===0||row[0]>=rows[index-1][1]-0.5)&&photoFits,JSON.stringify(rows.map(row=>row.map(Math.round))));
    await mobile.goto(home,{waitUntil:'networkidle'});
    await mobile.evaluate(()=>localStorage.clear());
    await mobile.goto(home,{waitUntil:'networkidle'});
    await mobile.click('button[data-family="XDM"]');
    await mobile.click('[data-action="next"]');
    await mobile.click('button[data-model="XDM-20"]');
    await mobile.click('[data-action="next"]');
    await mobile.evaluate(()=>document.querySelector('button[data-slot="out-2"]').click());
    await mobile.locator('.rt-card-modal .rt-card-choice[data-card="XDM-FOS100"]').click();
    await mobile.waitForTimeout(1000);
    const fit=await mobile.$eval('button[data-slot="out-2"]',slot=>{const s=slot.getBoundingClientRect(),i=slot.querySelector('img.rt-faceplate').getBoundingClientRect();return [s.width-i.width,s.height-i.height,Math.abs(s.left-i.left),Math.abs(s.top-i.top)]});
    check('터치 휴대폰에서 세로 슬롯에 장착한 판넬이 슬롯을 꽉 채움(좌우 끝 잘림 없음)',fit.every(value=>Math.abs(value)<0.6),JSON.stringify(fit.map(value=>value.toFixed(2))));
    // 출처(sources)에 슬래시로 이어진 긴 파일 경로(U09 근거 문서 등)가 있으면 줄바꿈 지점이 없어 가로로 넘칠 수 있다(사용자 제보, 라이브 사이트 점검).
    await mobile.goto(`${home}#products/ct104-u-cr104-u`,{waitUntil:'networkidle'});
    await mobile.waitForSelector('.rt-pg-record');
    await mobile.click('.rt-pg-record summary');
    await mobile.waitForSelector('.rt-pg-record[open]');
    check('휴대폰에서 출처의 긴 파일 경로도 화면 폭을 넘지 않음',(await mobile.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
    // 0.36 — HD-104U(새 실크 HD-14U)처럼 같은 제품의 다른 이름: 옛 주소가 정식 id로 이동하고 제품명에 두 이름이 함께 보인다.
    await mobile.goto(`${home}#products/hd-14u`,{waitUntil:'networkidle'});
    await mobile.waitForFunction(()=>location.hash==='#products/hd-104u'&&document.querySelector('#rt-pg-title'));
    check('옛 주소 #products/hd-14u가 HD-104U (HD-14U) 상세로 이동',(await mobile.$eval('#rt-pg-title',el=>el.textContent)).includes('HD-104U (HD-14U)'));
    // 카드 자체가 화면 밖으로 밀려나면 페이지 가로 스크롤 없이 오른쪽이 잘린다(0.33 검수에서 발견: 휴대폰 규칙이 PC 격자의 align-items:start를 물려받음).
    // 넓은 그림은 카드 안(.rt-pg-svg-wrap 등)에서만 좌우로 밀려야 한다. 6-B에서 새로 생긴 케이블(hoc-ux)·QMS 화면 구성 모드(qms-44ux) 템플릿과
    // EDID 로터리 스위치 카드(hd-13u)도 검사한다.
    for(const id of ['hd-210u','xdm','ct101-u-cr101-u','hoc-ux','qms-44ux','hd-13u']){
      await mobile.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await mobile.waitForSelector('.rt-pg-card');
      const over=await mobile.evaluate(()=>[...document.querySelectorAll('.rt-pg-card')].map(card=>Math.round(card.getBoundingClientRect().right-document.documentElement.clientWidth)).filter(value=>value>1));
      check(`휴대폰에서 ${id} 제품 카드가 모두 화면 폭 안에 들어감`,over.length===0,JSON.stringify(over));
    }
    await phone.close();
  }finally{
    await browser.close();
    server.close();
  }
  const failures=results.filter(result=>!result.ok).length;
  console.log(`\n${results.length-failures}/${results.length} passed`);
  process.exit(failures?1:0);
})().catch(error=>{console.error(error);server.close();process.exit(1)});
