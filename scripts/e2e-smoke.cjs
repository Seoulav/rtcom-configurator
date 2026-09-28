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
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.md':'text/markdown','.json':'application/json','.webp':'image/webp','.pdf':'application/pdf'};
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
    // 0.55: 사이트 확인 창(dialog.rt-confirm)이 떴으면 확인을 누른다(뜨지 않으면 아무것도 하지 않음).
    const acceptConfirm=async()=>{if(await page.locator('dialog.rt-confirm[open]').count())await page.click('dialog.rt-confirm .rt-confirm-ok')};
    const brokenImages=()=>page.$$eval('img',images=>images.filter(image=>image.complete&&image.naturalWidth===0&&image.loading!=='lazy').map(image=>image.getAttribute('src')));

    await page.goto(home,{waitUntil:'networkidle'});
    check('첫 화면에 구성기가 표시됨',await page.locator('#matrix-configurator h1').isVisible());
    await page.click('button[data-family="XDM"]');
    await page.click('[data-action="next"]');
    check('프레임 선택 화면에 XDM 프레임 6종 표시(XDM-288 제외)',await page.locator('button[data-model]').count()===6);
    await page.click('button[data-model="XDM-144"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    // 사용자 결정 2026-09-27: 빈 슬롯은 빈 슬롯이다. 블랭크 커버 그림은 사용자가 팝업에서 고른 슬롯에만 붙는다(자동으로 씌우지 않는다).
    check('빈 슬롯 72개는 빈 슬롯으로 표시되고 블랭크 커버는 하나도 자동으로 씌워지지 않음',await page.locator('.rt-rack-slot-empty').count()===72&&await page.locator('.rt-rack-slot-blank').count()===0);
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
    check('전송기 단계에 XDM 연동 전송기 라인업 7종(0.72부터 XDM-PSU 포함)이 사진과 함께 표시됨',await page.locator('.rt-ext-lineup-card img').count()===7&&await page.$$eval('.rt-ext-lineup-card img',images=>images.every(image=>image.naturalWidth>0)));
    await page.locator('button[data-owner="in-1"][data-link-device="XDM-CTR100 PSE + XDM-CTR100"]').click();
    check('HDMI 카드에 CTR100 PSE + CTR100 한 쌍을 연결할 수 있고 CTR100 전원 경고 수에는 포함되지 않음',await page.locator('button[data-owner="in-1"][data-link-device="XDM-CTR100 PSE + XDM-CTR100"][aria-pressed="true"]').count()===1&&/XDM-CTR100 4대/.test(await page.locator('.rt-power-notice strong').innerText()));
    // 0.72 XDM-PSU(사용자 결정 2026-09-28): CIS100·COS100에 연결한 CTR100은 개별 어댑터 대신 XDM-PSU로 전원을 받고, 안내에 PSU·POH·PHX 수량이 나온다.
    const psuNotice=await page.locator('.rt-power-notice').innerText();
    check('04 전송기 전원 안내가 "XDM-PSU로 전원 공급(개별 어댑터 불필요)"와 XDM-POH·XDM-PHX 수량을 보여 줌',/XDM-PSU로 전원 공급/.test(psuNotice)&&/XDM-POH \d+개/.test(psuNotice)&&/XDM-PHX \d+개/.test(psuNotice)&&!/전원 직접 연결/.test(psuNotice),psuNotice.slice(0,160));
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
    await page.click('button[data-model="SPX-M3236"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('SPX-M3236은 입력 4·출력 3 슬롯이 모두 빈 슬롯으로 표시됨(블랭크 자동 없음)',await page.locator('.rt-rack-hs .rt-rack-slot-empty').count()===7&&await page.locator('.rt-rack-hs .rt-rack-slot-blank').count()===0);
    // 사진이 다 받아지기 전에 위치를 재면 높이가 0이라 가끔 실패했다(0.64 확인, 재실행 3회 모두 통과). 사진 로드를 최대 5초 기다린 뒤 잰다.
    await page.waitForFunction(()=>document.querySelector('.rt-rack-photo-image')?.naturalWidth>0,null,{timeout:5000}).catch(()=>{});
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
    // 0.64 SPX 04 전송기 안내는 "HDBaseT·광 카드"가 아니라 "CATx 카드"(SPX는 HDBaseT 전송이 아님, 사용자 확인 2026-09-27).
    const spxLinkText=await page.evaluate(()=>document.querySelector('.rt-configurator-view')?.innerText||'');
    check('SPX 04 전송기 안내가 "CATx 카드"로 표기되고 HDBaseT가 나오지 않음',spxLinkText.includes('CATx 카드')&&!spxLinkText.includes('HDBaseT'),spxLinkText.match(/.{0,30}(CATx 카드|HDBaseT).{0,30}/)?.[0]||'없음');
    check('SPX-COS12 장착 시 SPX-RX가 12채널로 자동 연결됨',await page.locator('button[data-owner="out-1"][data-link-device="SPX-RX"][aria-pressed="true"]').count()===1&&await page.locator('select[data-owner="out-1"][data-link="count"]').inputValue()==='12');
    // 제품군을 바꾸면(확인 창 수락) 카드·전송기 선택이 초기화된다.
    await page.click('.rt-step[data-jump="0"]');
    await page.click('button[data-family="XDM"]');
    // 0.55: 브라우저 기본 confirm 대신 사이트 확인 창(dialog.rt-confirm)이 뜬다. 제목·버튼을 확인하고 "변경"을 누른다.
    await page.waitForSelector('dialog.rt-confirm[open]');
    const resetAsk=await page.evaluate(()=>{const d=document.querySelector('dialog.rt-confirm[open]');return {title:d.querySelector('h3').textContent,ok:d.querySelector('.rt-confirm-ok').textContent,cancel:d.querySelector('.rt-confirm-cancel').textContent,modal:d.matches(':modal')}});
    check('제품군을 바꾸면 사이트 확인 창(제목·취소·변경 버튼, 모달)이 뜸',resetAsk.title==='구성을 바꿀까요?'&&resetAsk.ok==='변경'&&resetAsk.cancel==='취소'&&resetAsk.modal,JSON.stringify(resetAsk));
    await page.click('dialog.rt-confirm .rt-confirm-ok');
    await page.waitForLoadState('networkidle');
    check('제품군을 바꾸면 카드·전송기 선택이 초기화됨',await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements)&&Object.keys(await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements)).length===0&&await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.family)==='XDM'&&await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.model)===null);
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="XDM"]');
    await page.click('[data-action="next"]');
    await page.click('button[data-model="XDM-12"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    const cardsUrl=page.url();
    await page.goBack();
    const onChassis=await page.locator('.rt-step[aria-current="step"]').getAttribute('data-jump')==='1';
    await page.goForward();
    check('뒤로가기·앞으로가기로 이전·다음 단계를 오가며 주소는 바뀌지 않음',onChassis&&await page.locator('.rt-step[aria-current="step"]').getAttribute('data-jump')==='2'&&page.url()===cardsUrl);
    await page.click('.rt-brand-lockup');
    await page.waitForSelector('dialog.rt-confirm[open]');
    const asked=await page.locator('dialog.rt-confirm h3').textContent();
    // 취소를 누르면 창이 닫히고 그대로 남는다(Esc도 같음).
    await page.keyboard.press('Escape');
    const stayed=await page.locator('dialog.rt-confirm').count()===0&&await page.locator('.rt-step[aria-current="step"]').getAttribute('data-jump')!=='0';
    check('확인 창에서 Esc를 누르면 창이 닫히고 현재 단계에 머묾',stayed);
    await page.click('.rt-brand-lockup');
    await page.click('dialog.rt-confirm .rt-confirm-ok');
    check('로고를 누르면 확인 창 뒤 첫 화면(제품군)으로 이동하고 구성은 유지됨',/처음 화면/.test(asked)&&await page.locator('.rt-step[aria-current="step"]').getAttribute('data-jump')==='0'&&await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.model)==='XDM-12'&&page.url()===cardsUrl);
    // 0.55 수량 채우기·슬롯 이동(사용자 요청): XDM-36 입력 슬롯 1에서 수량 3으로 HI100을 고르면 1·2·3이 채워지고,
    // 팝업 "다른 슬롯으로 이동"과 끌어 옮기기로 같은 방향 슬롯끼리 옮길 수 있다.
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="XDM"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.click('button[data-model="XDM-36"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.locator('button[data-slot="in-1"]').click();
    // 0.70 카드별 수량(사용자 요청 "카드마다 수량 기입해서 순차적으로"): HI100 수량 3을 넣고 "순서대로 장착"을 누르면 선택한 슬롯부터 3칸이 채워진다.
    for(let i=0;i<3;i++)await page.locator('.rt-card-modal [data-card-qty-step="1"][data-qty-card="XDM-HI100"]').click();
    const qtyShown=await page.locator('.rt-card-modal [data-qty-out="XDM-HI100"]').textContent();
    await page.locator('.rt-card-modal [data-action="fill-qty"]').click();
    const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements);
    let moveState=await saved();
    check('카드 팝업에서 XDM-HI100 수량 3을 넣고 장착하면 선택한 슬롯부터 입력 슬롯 3칸이 채워짐',qtyShown==='3'&&moveState['in-1']==='XDM-HI100'&&moveState['in-2']==='XDM-HI100'&&moveState['in-3']==='XDM-HI100'&&!moveState['in-4'],JSON.stringify(moveState));
    // 0.55: XDM 세로 슬롯 카드 글자가 바로 읽히도록 90도(기존 -90도에서 180도) 회전, 작업 단계 표기는 한글.
    const xdmFace=await page.evaluate(()=>{const img=document.querySelector('button[data-slot="in-1"] img.rt-faceplate');const m=new DOMMatrix(getComputedStyle(img).transform);return {b:Math.round(m.b),eyebrow:document.querySelector('.rt-main .rt-eyebrow')?.textContent||'',bank:document.querySelector('.rt-rack-bank-title strong, .rt-frame-count')?.textContent||''}});
    check('XDM 세로 슬롯 카드는 90도로 돌아가 글자가 바로 보이고, 단계 제목·입출력 표기가 한글',xdmFace.b===1&&xdmFace.eyebrow.includes('03 / 카드 슬롯')&&!/INPUT|OUTPUT/.test(xdmFace.bank),JSON.stringify(xdmFace));
    // 0.106(사용자 요청 "다른 출력 슬롯으로 이동 탭은 없애도 될거 같아 내가 직접 드래그 이동이 가능하니까"): 팝업의 이동 드롭다운을 없애고 드래그로만 슬롯을 옮긴다.
    await page.dragAndDrop('button[data-slot="in-1"]','button[data-slot="in-5"]');
    moveState=await saved();
    check('장착한 카드를 끌어 같은 방향의 다른 슬롯에 놓으면 옮겨짐(팝업 "다른 슬롯으로 이동" 없이 드래그만으로)',!moveState['in-1']&&moveState['in-5']==='XDM-HI100',JSON.stringify(moveState));
    await page.dragAndDrop('button[data-slot="in-2"]','button[data-slot="in-7"]');
    await page.dragAndDrop('button[data-slot="in-3"]','button[data-slot="out-1"]');
    moveState=await saved();
    check('장착한 슬롯을 끌어 같은 방향 슬롯에 놓으면 옮겨지고, 반대 방향(출력)에는 놓이지 않음',!moveState['in-2']&&moveState['in-7']==='XDM-HI100'&&moveState['in-3']==='XDM-HI100'&&!moveState['out-1'],JSON.stringify(moveState));
    // 0.55 Delete 키(사용자 요청 "카드를 선택하고 del키를 누르면 삭제"): 슬롯에 초점이 있거나 그 슬롯 팝업이 열려 있을 때 비운다.
    await page.locator('button[data-slot="in-7"]').focus();
    await page.keyboard.press('Delete');
    await page.locator('button[data-slot="in-5"]').click();
    await page.waitForSelector('dialog.rt-card-modal[open]');
    await page.keyboard.press('Delete');
    moveState=await saved();
    const modalGone=await page.locator('dialog.rt-card-modal').count()===0;
    check('슬롯을 고르고 Delete 키를 누르면 카드가 빠짐(초점·팝업 모두)',!moveState['in-7']&&!moveState['in-5']&&moveState['in-3']==='XDM-HI100'&&modalGone,JSON.stringify({moveState,modalGone}));
    const missing=await page.goto(home+'no-such-page/deep',{waitUntil:'networkidle'});
    check('사이트 안의 없는 주소는 404.html이 구성기 첫 화면으로 보냄',missing&&page.url()===home&&await page.locator('#matrix-configurator').count()===1);
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="SPX"]');
    await page.click('[data-action="next"]');
    // 02 프레임(2-2, Analog Way 구조): 목록 행에는 사진이 없고, 고른 모델의 전면 사진이 오른쪽 고정 미리보기에 표시된다.
    check('SPX 프레임 5종 목록에 모두 사진 없이 이름·사양 행으로 표시됨',await page.locator('button[data-model]').count()===5&&await page.locator('button[data-model] img').count()===0);
    const spxModels=await page.locator('button[data-model]').evaluateAll(nodes=>nodes.map(node=>node.dataset.model));
    let spxPreviewOk=true;
    for(const model of spxModels){
      await page.click(`button[data-model="${model}"]`);
      const src=await page.locator('.rt-cg-preview img').getAttribute('src');
      if(!src||!src.includes(`/frames/spx-${model.slice(4).toLowerCase()}-front.webp`))spxPreviewOk=false;
    }
    check('프레임 목록에서 모델을 고를 때마다 오른쪽 미리보기가 그 모델의 전면 사진으로 바뀜(SPX 5종)',spxPreviewOk);
    await page.click('button[data-model="SPX-M2472"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    // 사진이 다 받아지기 전에 naturalWidth를 읽으면 0이라 가끔 실패했다(0.58 확인, 재실행 3회 모두 통과). 사진 로드를 최대 5초 기다린 뒤 본다.
    await page.waitForFunction(()=>document.querySelector('.rt-rack-photo-image')?.naturalWidth>0,null,{timeout:5000}).catch(()=>{});
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
    check('VDM 프레임 10종 중 9종(288X 제외)은 매뉴얼 전면 사진 또는 전면 도면을 미리보기에 표시함',vdmFrontCount===9);
    check('VDM-288X는 전면 사진이 없어 미리보기에 "사진 준비 중"이 표시됨',vdm288Placeholder);
    await page.click('button[data-model="VDM-16X"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    // 슬롯 판과 후면 사진이 다 그려지기 전에 세면 가끔 실패했다(2026-09-27 한 번 재현). 슬롯 8칸과 사진 로딩을 기다린 뒤 검사한다.
    await page.waitForFunction(()=>{const image=document.querySelector('.rt-rack-photo-image');return document.querySelectorAll('.rt-rack-photo .rt-rack-slot').length>=8&&image&&image.complete&&image.naturalWidth>0},null,{timeout:10000}).catch(()=>{});
    check('VDM-16X는 매뉴얼 후면 사진 위에 입력 4·출력 4 슬롯이 모두 빈 슬롯으로 표시됨(블랭크 자동 없음)',await page.locator('.rt-rack-photo .rt-rack-slot-empty').count()===8&&await page.locator('.rt-rack-photo .rt-rack-slot-blank').count()===0&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
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
    await page.click('button[data-model="VDM-256X"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.locator('button[data-slot="out-64"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="COS4-U"]').click();
    check('VDM-256X는 매뉴얼 후면 도면(랙 2대) 위에 입력 64·출력 64 슬롯이고 64번 슬롯에 카드를 장착할 수 있음',await page.locator('.rt-rack-photo .rt-rack-zone').count()===4&&await page.locator('.rt-rack-slot').count()===128&&await page.locator('button[data-slot="out-64"].rt-rack-slot-filled').count()===1&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    // 0.19 알티컴 공개 제품정보: 같은 화면 안에서 #products 주소 조각으로만 전환한다.
    // 0.33 — 제품정보 글래스 디자인(rt-pg-*)으로 목록·상세 마크업이 바뀌었다.
    await page.click('a[data-view-tab="products"]');
    await page.waitForSelector('.rt-pg-gridcard');
    check('제품정보 탭을 누르면 구성기를 숨기고 제품 30종 목록(0.64 SPX-TX/RX, 0.72 XDM-PSU 포함)을 표시',await page.locator('.rt-configurator-view').isHidden()&&await page.locator('.rt-pg-gridcard').count()===30);
    await page.click('[data-product-filter="extender"]');
    check('전송기 분류는 14종(0.64 SPX-TX/RX, 0.72 XDM-PSU 포함)',await page.locator('.rt-pg-gridcard').count()===14);
    await page.click('[data-product-filter="all"]');
    await page.fill('[data-product-search]','QMS');
    check('검색어 QMS로 일체형 매트릭스 2종이 남음',await page.locator('.rt-pg-gridcard').count()===2);
    await page.fill('[data-product-search]','');
    await page.click('a.rt-pg-gridcard[href="#products/ct104-u-cr104-u"]');
    await page.waitForSelector('.rt-pg-tablewrap');
    check('제품 카드를 누르면 상세(사양 표·입출력)를 표시',(await page.locator('#rt-pg-title').textContent()).includes('CT104-U')&&await page.locator('.rt-pg-tablewrap table tbody tr').count()>3);
    await page.click('.rt-pg-record summary');
    // 0.52: 이름을 "제조사 자료"로 바꾸고 표기 다름·참고 사항·출처·카탈로그 쪽 대조 표시를 화면에서 뺐다(사용자 요청).
    check('제조사 자료를 펼치면 입출력 단자 표가 보이고 표기 다름·출처는 보이지 않음',await page.locator('.rt-pg-record[open]').count()===1&&(await page.locator('.rt-pg-record summary').textContent()).startsWith('제조사 자료')&&(await page.locator('.rt-pg-record-body').textContent()).includes('HDMI')&&await page.locator('.rt-pg-diagram-mismatch').count()===0&&!(await page.locator('.rt-pg-record-body').textContent()).includes('종합 카탈로그')&&!(await page.locator('.rt-products-body').textContent()).includes('쪽 대조'));
    await page.waitForLoadState('networkidle');
    // 0.54 — "01 한눈에 보기" 위 사진 띠(0.39·0.49 사진 팝업·원형 돋보기)를 없애고, 02 Port Map에 실제 사진을 앞세웠다(사용자 요청 2026-09-27).
    check('01 한눈에 보기 위 사진 띠가 더 이상 없음',await page.locator('.rt-pg-hero').count()===0);
    // 0.21/0.33 연결 다이어그램: "03 Signal Flow"는 항상 자동 생성 SVG를 보여준다(전송기는 TX→케이블→RX 형태). 제조사 원본 사진이 있으면 기록 영역에 따로 둔다.
    await page.waitForSelector('.rt-pg-svg-wrap svg');
    check('CT104-U/CR104-U 상세에 TX·케이블·RX 연결 다이어그램이 보임',await page.locator('.rt-pg-svg-wrap svg').first().isVisible()&&(await page.locator('.rt-pg-legend').first().textContent()).includes('HDBaseT'));
    // 0.42 전송기 단자 지도: 송신기·수신기 사진 두 장에 번호표를 얹고(입출력 표 카드가 아니라), 사진이 정상으로 열린다.
    const extenderMaps=await page.$$eval('.rt-pg-panel svg[aria-label$="단자 지도"]',svgs=>svgs.map(svg=>svg.getAttribute('aria-label')));
    check('CT104-U/CR104-U 단자 지도가 송신기·수신기 사진 두 장으로 나옴',extenderMaps.length===2&&extenderMaps[0].includes('송신기 CT104-U')&&extenderMaps[1].includes('수신기 CR104-U'),JSON.stringify(extenderMaps));
    await page.goBack();
    await page.waitForSelector('.rt-pg-gridcard');
    check('뒤로가기로 상세에서 제품 목록으로 돌아감',new URL(page.url()).hash==='#products'&&await page.locator('.rt-pg-gridcard').count()===30);
    // 0.43 벽부형 단자 지도: 송신기·수신기 두 장, 세로 괄호(side left/right) 번호표 11개(0.46에서 HDMI IN 1·2를 한 번호로 묶음), 사진에 보이지 않는 옆면 단자 안내(note).
    await page.goto(`${home}#products/ft103-u-h-fr103-u`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const wallMap=await page.evaluate(()=>{const svgs=[...document.querySelectorAll('.rt-pg-panel svg[aria-label$="단자 지도"]')];return {maps:svgs.length,pins:svgs.reduce((n,svg)=>n+svg.querySelectorAll('circle').length,0),note:[...document.querySelectorAll('.rt-pg-hint')].some(el=>el.textContent.includes('옆면(사진에 보이지 않음)'))}});
    check('FT103-U-H/FR103-U 벽부형 단자 지도가 두 장·번호표 11개·옆면 단자 안내로 나옴',wallMap.maps===2&&wallMap.pins===11&&wallMap.note,JSON.stringify(wallMap));
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    check('HD-13U 상세는 03 Signal Flow에 자동 생성 SVG를 보여주고, 제조사 원본 다이어그램 버튼으로 기록 영역의 사진을 펼침',await page.locator('.rt-pg-svg-wrap svg').first().isVisible());
    // 0.47 오디오 설정: 병합(MUX)·추출(DEMUX)은 하나를 골라 쓴다(사용자 확인). 신호 흐름 문구와 07 카드 두 칸, 단자 지도 번호 순서(HDMI 입력 → 출력 → 오디오 → 전원)를 본다.
    const audioCard=await page.evaluate(()=>({modes:document.querySelectorAll('.rt-pg-audio .rt-pg-audio-mode').length,flow:[...document.querySelectorAll('.rt-pg-svg-wrap svg')].some(svg=>svg.textContent.includes('또는 추출 중 선택')),order:[...document.querySelectorAll('.rt-pg-port b')].map(b=>b.textContent.trim()).join('|')}));
    check('HD-13U 오디오 설정 카드가 병합·추출 두 칸으로 나오고 신호 흐름에 "선택"이 표시되며 단자 번호가 HDMI 입력·출력·오디오·정면 MODE·SET·전원 순(0.66 정면 번호 추가)',audioCard.modes===2&&audioCard.flow&&audioCard.order==='1HDMI IN|2HDMI OUT 1–3|3AUDIO IN|4AUDIO OUT|5MODE|6SET|7DC 5V',JSON.stringify(audioCard));
    // 0.59 — EDID 코드표가 길면(16행) 세로로 너무 길어지므로 좌우 두 표로 나눠 펼친다(사용자 요청 2026-09-27 "좌우표를 펼쳐서하면 줄여줘").
    const edidTables=await page.evaluate(()=>{const wrap=document.querySelector('.rt-pg-edid-tables');if(!wrap)return null;const tables=[...wrap.querySelectorAll('table')];return {count:tables.length,rows:tables.map(t=>t.querySelectorAll('tbody tr').length)}});
    check('HD-13U 06 EDID 설정 코드표가 좌우 두 표로 나뉨',edidTables&&edidTables.count===2&&edidTables.rows[0]===8&&edidTables.rows[1]===8,JSON.stringify(edidTables));
    // 0.58~0.59: 06 EDID 설정(항상 전체 폭)과 위 두 칸(01~05)의 높이 차이가 크지 않아야 오른쪽 칸에 빈 공간이 크게 남지 않는다(사용자 확인 2026-09-27 "06 EDID설정 깨진ㄷ").
    const colGap=await page.evaluate(()=>{const cols=[...document.querySelectorAll('.rt-pg-col')].map(c=>c.getBoundingClientRect().height);return Math.abs(cols[0]-cols[1])});
    check('HD-13U 01~05 두 칸의 높이 차이가 크지 않음(오른쪽 빈 공간 방지)',colGap<600,JSON.stringify({colGap}));
    // 0.66: 분배기 4종(HD-13U·HD-104U·HD-108U·HD-210U)은 HDS처럼 앞면·뒷면 합성 사진 한 장에 정면 로터리(·SET·MODE)까지 번호를 붙인다(사용자 지적 "3분배기 로터리 번호 표기 누락").
    // 0.68 XDM-FT101/FR101도 같은 방식(매뉴얼 Ver.1.3 전면 사진 + 후면, portMap.file로 합성 사진 선택): 4 MODE 로터리·5 S/P·6 DC IN.
    for(const [id,pins,front] of [['hd-13u',7,['MODE','SET']],['hd-104u',4,['EDID']],['hd-108u',4,['EDID']],['hd-210u',6,['EDID','MODE']],['xdm-ft101-fr101',6,['MODE','S/P']]]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-panel svg');
      // 첫 번째 단자 지도(송신기·단일 제품)의 번호만 센다. 2026-09-28부터 XDM-FT101/FR101은 수신기 뒷면 지도가 따로 이어진다.
      const dm=await page.evaluate(()=>({faces:document.querySelectorAll('.rt-pg-face').length,toggle:document.querySelectorAll('[data-pm-side]').length,pins:[...(document.querySelector('.rt-pg-ports')?.querySelectorAll('.rt-pg-port b')||[])].map(b=>b.textContent.trim().replace(/^\d+/,''))}));
      check(`${id} 단자 지도가 앞면·뒷면 합성 사진 한 장에 ${pins}개 번호(정면 ${front.join('·')} 포함, 전원 마지막)로 나옴`,dm.faces===0&&dm.toggle===0&&dm.pins.length===pins&&front.every(label=>dm.pins.includes(label))&&/^DC/.test(dm.pins[pins-1]),JSON.stringify(dm));
    }
    // 2026-09-28 RT컴 제공 고해상도 실물 사진: XDM-FR101 수신기 뒷면 단자 지도(번호 4개, 전원 마지막)와 XDM-CTR100·XDM-CT103 합성 사진.
    await page.goto(`${home}#products/xdm-ft101-fr101`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-ports');
    const frMap=await page.evaluate(()=>{const groups=[...document.querySelectorAll('.rt-pg-ports')];const rx=groups[1];return {maps:groups.length,pins:rx?[...rx.querySelectorAll('.rt-pg-port b')].map(b=>b.textContent.trim().replace(/^\d+/,'')):[],img:document.querySelector('.rt-pg-panel')?.closest('section')?.innerHTML.includes('xdm-fr101-rear.webp')}});
    check('XDM-FR101 수신기 뒷면 단자 지도가 번호 4개(HDMI OUT → 오디오 → 광 → DC IN)로 나옴',frMap.maps===2&&frMap.pins.join('|')==='HDMI OUT|AUDIO · RS-232|FIBER IN|DC IN'&&frMap.img,JSON.stringify(frMap));
    for(const [id,file] of [['xdm-ctr100','xdm-ctr100-rear.webp'],['xdm-ct103-cr103','xdm-ct103-front-rear.webp']]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-ports');
      const ok=await page.evaluate(f=>{const s=[...document.querySelectorAll('section')].find(s=>/Port Map/.test(s.querySelector('h2')?.textContent||''));return !!s&&s.innerHTML.includes(f)&&[...s.querySelectorAll('img,image')].every(i=>i.tagName!=='IMG'||i.naturalWidth>0)},file);
      check(`${id} 단자 지도가 RT컴 고해상도 사진 합성본(${file})으로 나옴`,ok);
    }
    // 0.55: 2U 미만(MR-4S)은 정면·후면 버튼 없이 정면 사진과 포트 연결면을 함께 보여준다(0.68부터 FT101은 합성 사진이라 MR-4S로 확인).
    await page.goto(`${home}#products/mr-4s`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-panel svg');
    const hdFaces=await page.evaluate(()=>({face:!!document.querySelector('.rt-pg-face:not([hidden]) img'),toggle:document.querySelectorAll('[data-pm-side]').length}));
    check('2U 미만 제품(MR-4S)은 정면 사진과 후면 단자 지도를 함께 보여주고 정면·후면 버튼이 없음',hdFaces.face&&hdFaces.toggle===0,JSON.stringify(hdFaces));
    await page.goto(`${home}#products/qms-88ux`,{waitUntil:'networkidle'});
    await page.waitForSelector('[data-pm-side="front"]');
    const beforeToggle=await page.evaluate(()=>({front:document.querySelector('[data-pm-face="front"]').hidden,rear:document.querySelector('[data-pm-face="rear"]').hidden}));
    await page.click('[data-pm-side="front"]');
    const afterToggle=await page.evaluate(()=>({front:document.querySelector('[data-pm-face="front"]').hidden,rear:document.querySelector('[data-pm-face="rear"]').hidden}));
    check('2U 이상 제품(QMS-88UX)은 정면·후면 버튼으로 후면 단자 지도와 정면 사진을 바꿔 봄',beforeToggle.front&&!beforeToggle.rear&&!afterToggle.front&&afterToggle.rear,JSON.stringify({beforeToggle,afterToggle}));
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    // 0.49 HDS-21U·HDS-42MU도 같은 방식(딥 스위치 1번 선택, 사용자 확인·매뉴얼 Ver.1.0). 신호 흐름 문구에는 HD-13U 전용 "(OUT 1)"이 붙지 않는다.
    // 0.58 두 제품은 07 오디오 설정 카드 대신 07 딥 스위치 설정 카드로 스위치 번호마다 OFF·ON 그림을 보여준다(사용자 요청 2026-09-27).
    // 0.68 HDS-21U 딥 스위치는 1 오디오·2 Priority 2개뿐이다(사용자 제공 매뉴얼 Ver.1.0 확인 2026-09-28, HDS-42MU 전용 3번 분배는 없음 — 0.64의 "3번 분배" 반영은 매뉴얼과 어긋나 되돌림). HDS-42MU는 1 오디오·2 Priority·3 분배 3개 그대로.
    for(const [id,rows] of [['hds-21u',2],['hds-42mu',3]]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-pg-title');
      const hdsDip=await page.evaluate(()=>({audio:document.querySelectorAll('.rt-pg-audio').length,rows:document.querySelectorAll('.rt-pg-dip .rt-pg-dip-row').length,svgs:document.querySelectorAll('.rt-pg-dip svg[aria-label^="딥 스위치"]').length,idx:document.querySelector('.rt-pg-dip .rt-pg-idx')?.textContent,first:document.querySelector('.rt-pg-dip .rt-pg-dip-row')?.textContent.includes('병합'),flow:[...document.querySelectorAll('.rt-pg-svg-wrap svg')].some(svg=>svg.textContent.includes('오디오 병합 또는 추출 중 선택')&&!svg.textContent.includes('(OUT 1)')),overflow:document.documentElement.scrollWidth>innerWidth+1}));
      check(`${id} 07 딥 스위치 설정 카드가 오디오 설정 카드를 대신하고 스위치 ${rows}개 행·OFF/ON 그림 ${rows*2}개, 신호 흐름에 "선택"이 표시됨`,hdsDip.audio===0&&hdsDip.rows===rows&&hdsDip.svgs===rows*2&&hdsDip.idx==='07'&&hdsDip.first&&hdsDip.flow&&!hdsDip.overflow,JSON.stringify(hdsDip));
    }
    // 0.58 매트릭스 신호 흐름: 입력이 한 점으로 모이지 않고 크로스포인트(입력 가로줄 × 출력 세로줄)에서 출력마다 입력을 고른 예시 점을 찍는다(사용자 지적 2026-09-27).
    for(const [id,ins,outs] of [['qms-44ux',4,4],['qms-88ux',8,8],['hds-42mu',4,2]]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-pg-title');
      const xp=await page.evaluate(()=>{const svg=[...document.querySelectorAll('.rt-pg-svg-wrap svg')].find(s=>s.textContent.includes('매트릭스')&&s.textContent.includes('선택 예시'));if(!svg)return null;return {picked:svg.querySelectorAll('circle[r="5"]').length,dots:svg.querySelectorAll('circle').length,caption:svg.textContent.includes('출력마다 입력 선택'),old:svg.textContent.includes('독립 출력')}});
      check(`${id} 신호 흐름이 크로스포인트(${ins}×${outs})와 출력별 선택 예시 점 ${outs}개로 그려짐`,!!xp&&xp.picked===outs&&xp.dots===ins*outs&&xp.caption&&!xp.old,JSON.stringify(xp));
    }
    // 0.59 EDID 로터리 대표 설정: 기본값과 자주 쓰는 코드(highlight)를 파란 16단 로터리 그림으로 보여준다(사용자 요청 2026-09-27).
    for(const [id,codes] of [['hd-13u','0,1,7'],['hds-42mu','0,3,9'],['ft103-u-h-fr103-u','0,3,6']]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-pg-title');
      const rot=await page.evaluate(()=>({codes:[...document.querySelectorAll('.rt-pg-edid .rt-pg-rotary-row .rt-pg-rotary svg')].map(svg=>svg.getAttribute('aria-label').replace(/\D/g,'')).join(','),def:document.querySelectorAll('.rt-pg-edid .rt-pg-rotary-row .rt-pg-rotary.is-default').length}));
      check(`${id} EDID 로터리 대표 설정 그림이 ${codes}번으로 나오고 기본값이 1개 표시됨`,rot.codes===codes&&rot.def===1,JSON.stringify(rot));
    }
    // 0.60 신호 흐름 잘림: AUDIO OUT 칩·"추출" 표시 등 그림 요소가 SVG 틀(viewBox) 밖으로 나가지 않는다(HDS-21U "추출" 잘림, 사용자 지적 2026-09-27). 글자 위쪽 여백은 1px까지 허용한다.
    for(const id of ['hds-21u','hds-42mu','hd-13u','qms-88ux','hd-210u']){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-pg-title');
      const clipped=await page.evaluate(()=>{const svg=[...document.querySelectorAll('.rt-pg-svg-wrap svg')].find(s=>s.textContent.includes('HDMI IN'));if(!svg)return ['svg 없음'];const vb=svg.viewBox.baseVal;return [...svg.querySelectorAll('text,rect')].filter(el=>{const bb=el.getBBox();return bb.x<vb.x-1||bb.y<vb.y-1||bb.x+bb.width>vb.x+vb.width+1||bb.y+bb.height>vb.y+vb.height+1}).map(el=>(el.textContent||el.tagName).slice(0,20))});
      check(`${id} 신호 흐름 그림 요소가 틀 밖으로 잘리지 않음`,clipped.length===0,JSON.stringify(clipped));
    }
    // 0.62 HDS-21U·HDS-42MU 딥 스위치 칸 순서: ON이 왼쪽, OFF가 오른쪽(dipSwitch.order, 사용자 요청 2026-09-27). HD-210U는 OFF → ON 그대로.
    for(const [id,first] of [['hds-21u','ON'],['hds-42mu','ON'],['hd-210u','OFF']]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-dip');
      const order=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-dip .rt-pg-dip-row')].map(row=>[...row.querySelectorAll('.rt-pg-dip-state em')].map(em=>em.textContent.split(' ')[0]).join('/')));
      check(`${id} 딥 스위치 칸이 ${first==='ON'?'ON → OFF':'OFF → ON'} 순서`,order.length>0&&order.every(o=>o===(first==='ON'?'ON/OFF':'OFF/ON')),JSON.stringify(order));
    }
    // 0.64 SPX-TX/RX 전송기(매뉴얼 Ver.2.0): 전송기 목록에 나오고, 단자 지도 2장(TX·RX), 딥 스위치(아래쪽이 ON) 1·2번 + 3·4번 EDID 조합 4칸, 신호 흐름은 HDBaseT가 아닌 CATx.
    await page.goto(`${home}#products/spx-rx-tx`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const spxrt=await page.evaluate(()=>({maps:document.querySelectorAll('.rt-pg-portmap svg image, .rt-pg-portmap image').length||document.querySelectorAll('[data-pm-map], .rt-pg-pm').length,rows:document.querySelectorAll('.rt-pg-dip .rt-pg-dip-row').length,combos:document.querySelectorAll('.rt-pg-dip-combos figure').length,down:document.querySelector('.rt-pg-dip h2')?.textContent.includes('아래쪽이 ON'),flow:[...document.querySelectorAll('.rt-pg-svg-wrap svg')].map(s=>s.textContent).join(' '),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length}));
    check('SPX-TX/RX 상세에 딥 스위치 3행(1·2번, 3·4번 조합 4칸, 아래쪽이 ON)과 CATx 신호 흐름이 나오고 깨진 사진이 없음',spxrt.rows===3&&spxrt.combos===4&&spxrt.down&&spxrt.flow.includes('CATx')&&!spxrt.flow.includes('HDBaseT')&&spxrt.broken===0,JSON.stringify({...spxrt,flow:spxrt.flow.slice(0,80)}));
    // 0.64 OBUX-1C Tx Mode 딥 스위치(매뉴얼 Ver.2.2): 검은 몸체 4핀, 1번 오디오 + 2·3·4번 EDID 조합 5칸(Through-pass EDID Fix 포함).
    await page.goto(`${home}#products/obux-1c`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-dip');
    const obux=await page.evaluate(()=>({rows:document.querySelectorAll('.rt-pg-dip .rt-pg-dip-row').length,combos:document.querySelectorAll('.rt-pg-dip-combos figure').length,fix:document.querySelector('.rt-pg-dip')?.textContent.includes('Through-pass EDID Fix')}));
    check('OBUX-1C 딥 스위치 설정이 1번 오디오와 2·3·4번 EDID 조합 5칸으로 나옴',obux.rows===2&&obux.combos===5&&obux.fix,JSON.stringify(obux));
    // 2026-09-28 OBUX-1C Tx 고해상도 실물 사진: 송신기 단자 지도가 앞면·뒷면 합성 사진 한 장에 번호 6개(Mode·S/P 포함), 수신기도 합성 사진에 번호 5개(S/P 포함).
    const obuxPm=await page.evaluate(()=>{const s=[...document.querySelectorAll('section')].find(s=>/Port Map/.test(s.querySelector('h2')?.textContent||''));return {tx:!!s?.innerHTML.includes('obux-1c-tx-front-rear.webp'),rx:!!s?.innerHTML.includes('obux-1c-rx-front-rear.webp'),ports:[...(s?.querySelectorAll('.rt-pg-ports')||[])].map(x=>x.children.length)}});
    // 2026-09-28 제조사 문서 PDF: documents[].file 수만큼 "제품 목록" 옆에 버튼(새 탭 보기 + 내려받기)이 나오고 링크가 PDF로 열림. 등록 파일이 없는 제품은 버튼 없음.
    // 0.105 샘플(HD-13U 카탈로그만): 새 탭 링크 대신 팝업(button[data-doc-preview])이고, 클릭하면 dialog.rt-doc-zoom이 그 파일을 iframe으로 연다.
    for(const id of ['hd-13u','hd-104u']){
      const expected=(JSON.parse(fs.readFileSync(`data/products/${id}.json`,'utf8')).documents||[]).filter(doc=>doc.file).length;
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-toolbar');
      const docs=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-toolbar .rt-pg-doc')].map(el=>{
        const open=el.querySelector('.rt-pg-doc-open');
        const popup=open?.tagName==='BUTTON'?open.getAttribute('data-doc-preview'):null;
        return {open:popup?true:open?.getAttribute('target')==='_blank'&&open?.relList.contains('noopener'),save:el.querySelector('.rt-pg-doc-save')?.hasAttribute('download'),href:popup?new URL(popup,document.baseURI).href:open?.href};
      }));
      const pdfOk=[];for(const doc of docs){const res=await page.request.get(doc.href);pdfOk.push(res.status()===200&&String(res.headers()['content-type']).includes('pdf'))}
      check(`${id} 제조사 문서 버튼 ${expected}개(새 탭 보기 또는 팝업·내려받기, PDF 응답)`,docs.length===expected&&docs.every(doc=>doc.open&&doc.save)&&pdfOk.every(Boolean),JSON.stringify({expected,docs,pdfOk}));
    }
    // 0.105 HD-13U 카탈로그 팝업: 버튼을 누르면 dialog가 열리고 iframe src가 카탈로그 PDF, 닫기 버튼으로 닫힌다.
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-toolbar');
    await page.click('button.rt-pg-doc-open[data-doc-preview]');
    await page.waitForSelector('dialog.rt-doc-zoom[open]');
    const docPopup=await page.evaluate(()=>({src:document.querySelector('dialog.rt-doc-zoom iframe')?.getAttribute('src'),title:document.querySelector('dialog.rt-doc-zoom .rt-flow-zoom-head b')?.textContent}));
    await page.click('dialog.rt-doc-zoom [data-zoom-close]');
    const closed=await page.evaluate(()=>!document.querySelector('dialog.rt-doc-zoom[open]'));
    check('HD-13U 카탈로그 팝업이 hd-13u-catalog.pdf를 iframe으로 열고 닫기로 닫힘',!!docPopup.src?.includes('hd-13u-catalog.pdf')&&!!docPopup.title&&closed,JSON.stringify({docPopup,closed}));
    check('OBUX-1C 송신기 단자 지도가 고해상도 앞뒤 합성 사진에 번호 6개, 수신기 5개(S/P 포함)로 나옴',obuxPm.tx&&obuxPm.rx&&obuxPm.ports.join()==='6,5',JSON.stringify(obuxPm));
    // 0.98 XDM-PSU 03 Signal Flow: 제조사 연결도처럼 프레임(CIS100·COS100) · PSU(POH·PHX) · CTR100 Tx/Rx를 장비 그림으로 그리고 케이블 위 점선이 흐른다. 움직임 줄이기 설정에서는 멈춘다.
    await page.goto(`${home}#products/xdm-psu`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-psu-anim');
    const psuFlow=await page.evaluate(()=>{const svg=document.querySelector('.rt-psu-anim').closest('svg'),t=svg.textContent;return {flows:svg.querySelectorAll('.rt-psu-flow').length,rev:svg.querySelectorAll('.rt-psu-flow.rt-psu-rev').length,anim:getComputedStyle(svg.querySelector('.rt-psu-flow')).animationName,labels:['XDM-CIS100','XDM-COS100','XDM-PSU · POH','XDM-PSU · PHX','Tx · 송신기','Rx · 수신기','2핀 전원선'].every(s=>t.includes(s))}});
    await page.emulateMedia({reducedMotion:'reduce'});
    const psuStill=await page.$eval('.rt-psu-flow',el=>getComputedStyle(el).animationName);
    await page.emulateMedia({reducedMotion:'no-preference'});
    check('XDM-PSU Signal Flow가 장비 그림(프레임·PSU·CTR100 Tx/Rx)과 흐르는 케이블 8가닥(Tx 전원은 역방향)으로 나오고, 움직임 줄이기에서는 멈춤',psuFlow.flows===8&&psuFlow.rev===1&&psuFlow.anim==='rt-psu-dash'&&psuFlow.labels&&psuStill==='none',JSON.stringify({psuFlow,psuStill}));
    // 0.99 COS100 1번 포트 피닉스 단자에 PHX 2핀 전원선이 꽂히고(사용자 확인 "COS PHNIX픽에 전원연결"), XDM-PSU만 "크게 보기" 확대 창이 있다.
    const cosPin=await page.$$eval('.rt-psu-cos-pin',els=>els.length);
    await page.click('[data-flow-zoom]');
    await page.waitForSelector('dialog.rt-flow-zoom[open]');
    await page.click('dialog.rt-flow-zoom [data-zoom-step="1"]');
    const zoom=await page.$eval('dialog.rt-flow-zoom',d=>({level:d.querySelector('[data-zoom-level]').textContent,svg:!!d.querySelector('.rt-psu-anim'),wider:d.querySelector('.rt-flow-zoom-body').scrollWidth>d.querySelector('.rt-flow-zoom-body').clientWidth}));
    await page.keyboard.press('Escape');
    const zoomClosed=await page.$eval('dialog.rt-flow-zoom',d=>!d.open);
    // 0.105 XDM-PSU: 머리 아이콘은 전원(번개) 모양, 02 Port Map은 Signal Flow와 같은 평면 그림(앞면·뒷면)에 번호 3개, 기준 문구는 "제조사 도면 기준 그림".
    const psuPanel=await page.evaluate(()=>{const s=[...document.querySelectorAll('section')].find(x=>/Port Map/.test(x.querySelector('h2')?.textContent||''));return {icon:!!document.querySelector('.rt-pg-swatch svg path[d^="M16.5 3"]'),rear:!!s?.innerHTML.includes('xdm-psu-rear-art.webp'),front:!!s?.innerHTML.includes('xdm-psu-front-art.webp'),pins:s?.querySelector('.rt-pg-ports')?.children.length,basis:/제조사 도면 기준 그림/.test(s?.querySelector('h2')?.textContent||'')}});
    check('XDM-PSU 머리 아이콘이 전원 모양이고 02 Port Map이 앞면·뒷면 평면 그림(번호 3개, "제조사 도면 기준 그림")으로 나옴',psuPanel.icon&&psuPanel.rear&&psuPanel.front&&psuPanel.pins===3&&psuPanel.basis,JSON.stringify(psuPanel));
    await page.goto(`${home}#products/xdm-ctr100`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-toolbar');
    const otherZoom=await page.$$eval('[data-flow-zoom]',els=>els.length);
    check('XDM-PSU Signal Flow: COS100 피닉스에 전원선 연결, "크게 보기" 창이 150%로 커지고 Esc로 닫힘, 다른 제품에는 확대 버튼 없음',cosPin===1&&zoom.level==='150%'&&zoom.svg&&zoom.wider&&zoomClosed&&otherZoom===0,JSON.stringify({cosPin,zoom,zoomClosed,otherZoom}));
    // 0.95 전체 카탈로그 공유(사용자 결정 2026-09-28 "전체 카탈로그 공개해도 돼"): 제품 상세 카탈로그 버튼은 공용 파일을 제품 쪽(#page=N)에서 열고, 내려받기는 파일 전체. 제품 목록에는 "전체 카탈로그" 버튼 하나.
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-toolbar [data-doc="Catalog"]');
    const cat=await page.$eval('.rt-pg-toolbar [data-doc="Catalog"]',el=>{const open=el.querySelector('.rt-pg-doc-open');return {open:open.getAttribute('href')||open.getAttribute('data-doc-preview'),save:el.querySelector('.rt-pg-doc-save').getAttribute('href'),text:el.textContent.trim()}});
    await page.goto(`${home}#products`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-grid');
    const listCat=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-toolbar .rt-pg-doc')].map(el=>({text:el.textContent.trim(),href:el.querySelector('.rt-pg-doc-open').getAttribute('href')})));
    const catRes=await page.request.get(new URL(cat.save,home).href);
    // 0.97 제품별 카탈로그(사용자 결정 2026-09-28 "제품별로 잘라 공개"): 제품 상세 버튼은 해당 쪽만 담은 hd-13u-catalog.pdf를 열고 받는다. 제품 목록의 전체 카탈로그 버튼은 46쪽 공용 파일 그대로다.
    const listRes=await page.request.get(new URL(listCat[0]?.href||'',home).href);
    check('HD-13U 카탈로그 버튼이 제품별 카탈로그(hd-13u-catalog.pdf)를 열고 받으며, 제품 목록 전체 카탈로그 버튼 1개는 46쪽 공용 파일(PDF)',cat.open==='output/design/assets/docs/hd-13u-catalog.pdf'&&cat.save==='output/design/assets/docs/hd-13u-catalog.pdf'&&!/쪽/.test(cat.text)&&catRes.status()===200&&String(catRes.headers()['content-type']).includes('pdf')&&listCat.length===1&&/전체 카탈로그/.test(listCat[0].text)&&listCat[0].href==='output/design/assets/docs/rtcom-catalog-2026.pdf'&&listRes.status()===200,JSON.stringify({cat,listCat,status:catRes.status(),list:listRes.status()}));
    // 0.64 XDM-FT101/FR101 EDID·오디오 로터리(매뉴얼 Ver.1.3): 0(기본값)·3·8번 대표 설정 그림.
    await page.goto(`${home}#products/xdm-ft101-fr101`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-edid');
    const ftRot=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-edid .rt-pg-rotary-row .rt-pg-rotary svg')].map(svg=>(svg.getAttribute('aria-label').match(/(\w)번$/)||[])[1]).join(','));
    check('XDM-FT101/FR101 EDID 설정에 로터리 전체 8칸(Source 0~3, Analog 8~B)이 나옴',ftRot==='0,1,2,3,8,9,A,B',ftRot);
    // 0.65 OBHD-2C EDID 로터리 → 0.70 매뉴얼 Ver.2.1 6쪽 번호표로 정정: 0 EXTERNAL~F RESERVED 16칸, D번(1080p 2CH, Default EDID 1920x1080@60Hz) 기본값.
    await page.goto(`${home}#products/obhd-2c`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-edid');
    await page.$eval('.rt-pg-edid img',img=>img.scrollIntoView());
    await page.waitForFunction(()=>document.querySelector('.rt-pg-edid img')?.naturalWidth>0);
    const obhd=await page.evaluate(()=>({codes:[...document.querySelectorAll('.rt-pg-edid .rt-pg-rotary-row .rt-pg-rotary svg')].map(svg=>(svg.getAttribute('aria-label').match(/(\w)번$/)||[])[1]).join(''),def:document.querySelector('.rt-pg-edid .rt-pg-rotary.is-default figcaption em')?.textContent,idx:document.querySelector('.rt-pg-edid')?.closest('section')?.querySelector('.rt-pg-idx')?.textContent,rows:document.querySelectorAll('.rt-pg-edid .rt-pg-tablewrap tbody tr').length,pending:document.body.textContent.includes('제조사 확인 전')}));
    check('OBHD-2C 06 EDID 설정에 MODE 로터리 0~F 16칸(매뉴얼 Ver.2.1: 0 EXTERNAL)과 D번 기본값, 코드표 16행이 나오고 "제조사 확인 전" 문구가 없음',obhd.codes==='0123456789ABCDEF'&&obhd.def==='D번 · 기본값'&&obhd.idx==='06'&&obhd.rows===16&&!obhd.pending,JSON.stringify(obhd));
    // 0.65 XDM-CTR100·CTR100 PSE 06 딥 스위치 설정(매뉴얼 Ver.1.4 5쪽, 사용자 요청 "ctr100, pse 모두 딥스위치 그려줘"): 1·2번 TX/RX 조합이 3번 전송 거리보다 먼저, 아래쪽이 ON, 검은 몸체.
    for(const id of ['xdm-ctr100','xdm-ctr100-pse']){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-dip');
      const ctr=await page.evaluate(()=>({heads:[...document.querySelectorAll('.rt-pg-dip .rt-pg-dip-head b')].map(b=>b.textContent).join('|'),combos:document.querySelectorAll('.rt-pg-dip-combos figure').length,idx:document.querySelector('.rt-pg-dip .rt-pg-idx')?.textContent,down:document.querySelector('.rt-pg-dip h2')?.textContent.includes('아래쪽이 ON'),tx:document.querySelector('.rt-pg-dip')?.textContent.includes('TX 모드')&&document.querySelector('.rt-pg-dip')?.textContent.includes('RX 모드')}));
      check(`${id} 06 딥 스위치 설정이 1·2번 TX/RX 모드 2칸 → 3번 전송 거리 순서, 아래쪽 ON으로 나옴`,ctr.heads==='1·2번|3번'&&ctr.combos===2&&ctr.idx==='06'&&ctr.down&&ctr.tx,JSON.stringify(ctr));
    }
    // 0.70 OBHD-2C 단자 지도: 매뉴얼 Ver.2.1 Tx·Rx 앞면·뒷면 합성 사진 두 장(portMap.file), Tx 6개(3 EDID S/W·4 MODE·5 S/P 포함, 전원 마지막)·Rx 4개.
    await page.goto(`${home}#products/obhd-2c`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-panel svg');
    const obhdPm=await page.evaluate(()=>({maps:document.querySelectorAll('.rt-pg-panel').length,pins:[...document.querySelectorAll('.rt-pg-port b')].map(b=>b.textContent.trim().replace(/^\d+/,''))}));
    check('OBHD-2C 단자 지도가 Tx(EDID S/W·MODE·S/P 포함 6개)·Rx(4개) 합성 사진 두 장으로 나옴',obhdPm.maps===2&&obhdPm.pins.length===10&&obhdPm.pins[2]==='EDID S/W'&&obhdPm.pins[3]==='MODE'&&obhdPm.pins[5]==='DC 5V'&&obhdPm.pins[9]==='DC 5V',JSON.stringify(obhdPm));
    // 0.70 구성기 개선(사용자 요청 2026-09-28): ① "섀시" 대신 "프레임 선택" ② 블랭크·빈 슬롯 IN/OUT 번호표 강조 ③ 카드별 수량 순서대로 장착 ④ 02 프레임 선택 아래 "함께 보면 좋은 제품" ⑤ 모든 프레임 빈 슬롯을 XDM-12처럼 어두운 공패널로.
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    for(const [fam,related] of [['SPX',2],['VDM',6],['XDM',6]]){ // 0.72 XDM은 XDM-PSU를 더해 6개
      await page.click(`button[data-family="${fam}"]`);await acceptConfirm();
      if(await page.locator('[data-action="next"]').isEnabled())await page.click('[data-action="next"]');
      await page.waitForSelector('.rt-rel-card');
      const rel=await page.evaluate(()=>({eyebrow:document.querySelector('.rt-main .rt-eyebrow')?.textContent,cards:[...document.querySelectorAll('.rt-rel-card')].map(a=>a.getAttribute('href')),noChassis:!document.body.innerText.includes('섀시')}));
      check(`${fam} 02 프레임 선택 아래 "함께 보면 좋은 제품" ${related}개(시리즈 상세 포함)가 제품정보로 연결되고, 화면에 "섀시" 표기가 없음`,rel.eyebrow==='02 / 프레임 선택'&&rel.cards.length===related&&rel.cards[0]===`#products/${fam.toLowerCase()}`&&rel.noChassis,JSON.stringify(rel));
      await page.click('[data-jump="0"]');
    }
    await page.click('[data-action="next"]');
    await page.click('button[data-model="XDM-36"]');await acceptConfirm();
    await page.click('[data-action="next"]');
    await page.locator('button[data-slot="in-2"]').click();
    await page.locator('.rt-card-modal [data-card-qty-step="1"][data-qty-card="XDM-HI100"]').click();
    await page.locator('.rt-card-modal [data-card-qty-step="1"][data-qty-card="XDM-HI100"]').click();
    await page.locator('.rt-card-modal [data-card-qty-step="1"][data-qty-card="XDM-DPI100"]').click();
    const fillLabel=await page.locator('.rt-card-modal [data-action="fill-qty"]').textContent();
    await page.locator('.rt-card-modal [data-action="fill-qty"]').click();
    const seq=await page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements);
    check('카드별 수량(HI100 2 + DPI100 1)을 넣고 순서대로 장착하면 IN 2부터 HI100·HI100·DPI100 순으로 들어감',fillLabel.includes('3장')&&seq['in-2']==='XDM-HI100'&&seq['in-3']==='XDM-HI100'&&seq['in-4']==='XDM-DPI100'&&!seq['in-1']&&!seq['in-5'],JSON.stringify({fillLabel,seq}));
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="BLANK"]').click();
    const look=await page.evaluate(()=>{const empty=document.querySelector('.rt-rack-slot-empty'),blankNo=document.querySelector('.rt-rack-slot-blank .rt-rack-slot-no'),inNo=document.querySelector('.rt-rack-slot-empty .rt-rack-slot-no-input');const bg=getComputedStyle(empty).backgroundImage,st=getComputedStyle(blankNo);return {darkEmpty:bg.includes('gradient')&&getComputedStyle(empty).backgroundColor!=='rgb(255, 255, 255)',blankColor:st.backgroundColor,blankFont:parseFloat(st.fontSize),inColor:inNo&&getComputedStyle(inNo).backgroundColor}});
    check('XDM-36 빈 슬롯은 XDM-12처럼 어두운 공패널이고, 블랭크 OUT 번호표는 11px 이상 주황·빈 IN 번호표는 파랑으로 강조됨',look.darkEmpty&&look.blankFont>=11&&look.blankColor==='rgb(232, 89, 12)'&&look.inColor==='rgb(0, 122, 255)',JSON.stringify(look));
    // 뒤쪽 검사(시리즈 상세 → 구성기 이동)가 확인 창 없이 이어지도록 이 검사에서 만든 XDM-36 구성을 비운다.
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    // 0.64 SPX는 HDBaseT가 아닌 CATx 전송(사용자 확인 2026-09-27): SPX 시리즈 상세 신호 범례와 SPX-TX/RX 어디에도 HDBaseT가 나오지 않는다.
    for(const id of ['spx','spx-rx-tx']){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-pg-title');
      const hb=await page.evaluate(()=>{const el=document.querySelector('.rt-products-view');const m=(el?.textContent||'').match(/.{0,40}HDBaseT.{0,40}/);return m?m[0]:false});
      check(`${id} 상세에 HDBaseT 표기가 없음(CATx 전송)`,!hb,String(hb));
    }
    // 0.61 HD-210U 딥 스위치 설정(매뉴얼 Ver.1.2 7쪽: 1번 오디오 병합, 2번 DDC). 병합만 되고 추출(AUDIO OUT)은 없다(사용자 확인 2026-09-27).
    await page.goto(`${home}#products/hd-210u`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const dip210=await page.evaluate(()=>({rows:document.querySelectorAll('.rt-pg-dip .rt-pg-dip-row').length,svgs:document.querySelectorAll('.rt-pg-dip svg[aria-label^="딥 스위치"]').length,idx:document.querySelector('.rt-pg-dip .rt-pg-idx')?.textContent,audioOut:[...document.querySelectorAll('.rt-pg-svg-wrap svg')].some(s=>s.textContent.includes('AUDIO OUT'))}));
    check('HD-210U 07 딥 스위치 설정이 1번 오디오 병합·2번 DDC 두 행(그림 4개)으로 나오고 신호 흐름에 AUDIO OUT이 없음',dip210.rows===2&&dip210.svgs===4&&dip210.idx==='07'&&!dip210.audioOut,JSON.stringify(dip210));
    // 0.61 HD-13U 07 오디오 설정은 06 EDID 설정 다음 전체 폭에 둔다(좁은 칸에서 추출 칸이 잘리고 번호가 07 → 06으로 뒤집히던 문제, 사용자 지적 2026-09-27).
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-audio');
    const audio13=await page.evaluate(()=>{const a=document.querySelector('.rt-pg-audio');const order=[...document.querySelectorAll('.rt-pg-card h2 .rt-pg-idx')].map(s=>s.textContent);return {inCol:!!a.closest('.rt-pg-col'),overflow:a.scrollWidth>a.clientWidth+1,after:order.indexOf('07')>order.indexOf('06')}});
    check('HD-13U 07 오디오 설정이 06 EDID 설정 다음 전체 폭에 나오고 잘리지 않음',!audio13.inCol&&!audio13.overflow&&audio13.after,JSON.stringify(audio13));
    // 0.61 HD-13U 오디오 설정 전면 패널 그림: 병합은 OUT 1 LED가 깜빡이고(rt-pg-led-blink), 추출은 켜진 채 깜빡이지 않는다(사용자 요청 2026-09-27 "DIP 이미지처럼 불 켜짐").
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-audio-steps');
    const panel13=await page.evaluate(()=>{const row=document.querySelector('.rt-pg-audio-steps');return {tiles:row.querySelectorAll('.rt-pg-rotary').length,blink:row.querySelectorAll('.rt-pg-led-blink').length,labels:[...row.querySelectorAll('svg')].map(s=>s.getAttribute('aria-label')).join('|')}});
    check('HD-13U 오디오 설정이 EDID 대표 설정과 같은 칸 4개(MODE 0번 → SET 누름 → 병합 깜빡임·추출 깜빡이지 않음)로 나옴',panel13.tiles===4&&panel13.blink===1&&panel13.labels==='MODE 로터리 0번|SET 버튼 누름|OUT 1 LED 깜빡임|OUT 1 LED 깜빡이지 않음',JSON.stringify(panel13));
    // 0.55 QMS-88UX 06 화면 구성 모드: 레이아웃 버튼을 누르면 해당 도해로 미리보기가 바뀐다(사용자 요청 2026-09-27).
    await page.goto(`${home}#products/qms-88ux`,{waitUntil:'networkidle'});
    await page.waitForSelector('[data-layout-chip]');
    const beforeLayout=await page.evaluate(()=>document.querySelector('[data-layout-name]').textContent);
    await page.locator('[data-layout-chip]',{hasText:'3-SIDE RIGHT'}).click();
    const afterLayout=await page.evaluate(()=>({name:document.querySelector('[data-layout-name]').textContent,on:document.querySelector('.rt-pg-layout-chip.on')?.textContent,rects:document.querySelector('[data-layout-preview]').querySelectorAll('svg rect').length}));
    check('QMS-88UX 06 화면 구성 모드에서 레이아웃 버튼을 누르면 미리보기 도해가 바뀜',beforeLayout==='QUAD'&&afterLayout.name==='3-SIDE RIGHT'&&afterLayout.on==='3-SIDE RIGHT'&&afterLayout.rects===4,JSON.stringify({beforeLayout,afterLayout}));
    // 0.66 — QMS-88UX 출력 9번에 매뉴얼 22~23쪽 Output Option 2·3(비율 유지 없이 그대로 8분할)을 레이아웃 목록 13번째로 추가(사용자 요청 2026-09-27 "출력9에 비율무시8분할도 추가해줘").
    await page.locator('[data-layout-chip]',{hasText:'8분할(비율무시)'}).click();
    const split8=await page.evaluate(()=>({name:document.querySelector('[data-layout-name]').textContent,rects:document.querySelector('[data-layout-preview]').querySelectorAll('svg rect').length}));
    check('QMS-88UX 06 화면 구성 모드에 "8분할(비율무시)" 레이아웃이 있고 8칸 도해로 미리보기됨',split8.name==='8분할(비율무시)'&&split8.rects===8,JSON.stringify(split8));
    // 0.90 — QMS-88UX DUAL 카드가 "듀얼 모드" 한 마디뿐이었다(사용자 질문 2026-09-28 "QMS-88Ux도 듀얼 출력되지 않아??"). 매뉴얼 KV.04 20~21쪽 근거로 2분할(PBP)·PIP 레이아웃 3종을 넣고, 카드 안에서만 미리보기가 바뀌는지 확인.
    const dualCard=page.locator('.rt-pg-vmode-card',{hasText:'DUAL'});
    await dualCard.locator('[data-layout-chip]',{hasText:'Vertical PBP'}).click();
    const dual=await dualCard.evaluate(card=>({chips:[...card.querySelectorAll('[data-layout-chip]')].map(b=>b.textContent),name:card.querySelector('[data-layout-name]')?.textContent,rects:card.querySelectorAll('[data-layout-preview] svg rect').length,text:card.querySelector('p')?.textContent||''}));
    const quadName=await page.locator('.rt-pg-vmode-card',{hasText:'QUAD'}).first().evaluate(card=>card.querySelector('[data-layout-name]')?.textContent);
    check('QMS-88UX 06 DUAL 카드에 PBP·PIP 레이아웃 3종이 있고 Vertical PBP를 누르면 2칸 도해로 바뀌며 QUAD 카드 미리보기는 그대로임',dual.chips.join('|')==='Horizontal PBP|Vertical PBP|Quad PBP, PIP'&&dual.name==='Vertical PBP'&&dual.rects===2&&/출력 9·10번/.test(dual.text)&&quadName==='8분할(비율무시)',JSON.stringify({dual,quadName}));
    // 0.62 — videoModes(QMS) 카드 4개+레이아웃 칩 12개까지 있어 05 옆 좁은 칸에 넣으면 글자가 카드 밖으로 넘쳤다(사용자 확인 2026-09-27 "06화면모드 짤린다"). 전체 폭 아래로 되돌려 카드 안에서 텍스트가 넘치지 않는지 확인.
    for(const id of ['qms-88ux','qms-44ux']){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-vmode-card');
      const vmodeOverflow=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-vmode-card')].map(card=>({card:Math.round(card.scrollWidth-card.clientWidth),p:[...card.querySelectorAll('p')].map(p=>Math.round(p.scrollWidth-p.clientWidth))})).filter(x=>x.card>1||x.p.some(v=>v>1)));
      check(`${id} 06 화면 구성 모드 카드 안 글자가 카드 밖으로 넘치지 않음(전체 폭 아래)`,vmodeOverflow.length===0,JSON.stringify(vmodeOverflow));
    }
    // 0.55~0.58 HDS-21U·HDS-42MU 단자 지도: 정면·후면 선택 버튼 없이 한 합성 사진(위 앞면, 아래 뒷면)에 번호가 이어지고, EDID 로터리·MODE 딥 스위치가 전원(마지막) 앞에 옴(사용자 요청 2026-09-27).
    for(const id of ['hds-21u','hds-42mu']){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-panel svg');
      const hdsMap=await page.evaluate(()=>({toggle:document.querySelectorAll('.rt-pg-seg span').length,pins:[...document.querySelectorAll('.rt-pg-port b')].map(b=>b.textContent.trim())}));
      check(`${id} 단자 지도가 선택 버튼 없이 한 사진(위 앞면, 아래 뒷면)에 EDID·MODE·전원 포함 8개 번호로 나옴`,hdsMap.toggle===1&&hdsMap.pins.length===8&&hdsMap.pins[5].includes('EDID')&&hdsMap.pins[6].includes('MODE')&&hdsMap.pins[7].includes('DC 5V'),JSON.stringify(hdsMap));
    }
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
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
    check('시리즈 상세의 "구성기에서 구성하기"는 VDM 프레임 선택 단계로 이동',await page.locator('.rt-products-view').isHidden()&&await page.locator('[data-model="VDM-256X"]').count()===1);
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
    // 자료 출처·검토 기록(입출력 단자 표만 남음, 0.52부터 표기 다름·참고 사항·출처는 화면에서 뺌)이 휴대폰에서 가로로 넘치지 않는지 확인한다.
    await mobile.goto(`${home}#products/ct104-u-cr104-u`,{waitUntil:'networkidle'});
    await mobile.waitForSelector('.rt-pg-record');
    await mobile.click('.rt-pg-record summary');
    await mobile.waitForSelector('.rt-pg-record[open]');
    check('휴대폰에서 자료 출처·검토 기록이 화면 폭을 넘지 않음',(await mobile.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
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
    // 0.57 — 05 옆으로 옮긴 06 카드(EDID 설정 등)가 순서 클래스 없이 order:0이 되어 휴대폰에서 맨 위(01보다 먼저)로 올라가던 문제 수정(사용자 확인 2026-09-27 "모바일에 제품 들어가면 6번부터 보여").
    await mobile.goto(`${home}#products/hd-210u`,{waitUntil:'networkidle'});
    await mobile.waitForSelector('.rt-pg-idx');
    const idxOrder=await mobile.evaluate(()=>[...document.querySelectorAll('.rt-pg-idx')].map(el=>({text:el.textContent,top:el.getBoundingClientRect().top})).sort((a,b)=>a.top-b.top).map(x=>x.text));
    check('휴대폰에서 HD-210U 제품 상세는 01부터 순서대로 보임(06이 맨 위로 올라가지 않음, 0.61부터 07 딥 스위치 설정 포함)',idxOrder.join(',')==='01,02,03,04,05,06,07',JSON.stringify(idxOrder));
    // 2026-09-28 "제조사 정보를 항상 열면은 표가 약간 찌그러지는 게 있는데" — 입출력 단자 표의 방향("입력"·"출력"·"입출력")·수량(숫자) 칸이
    // 신호·조건의 긴 문장에 밀려 좁은 화면에서 한 글자씩 줄바꿈되던 문제(전수 조사로 발견). 30개 제품 전체를 여러 폭에서 확인해 재발을 막는다.
    {
      const allIds=JSON.parse(fs.readFileSync('data/products/index.json','utf8')).products.map(p=>p.id);
      const wrappedFixedCells=[];
      for(const w of [320,375,480,600,834,1024]){
        const p=await browser.newPage({viewport:{width:w,height:900}});
        for(const id of allIds){
          await p.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
          const hasIo=await p.evaluate(()=>!![...document.querySelectorAll('h4')].find(x=>x.textContent.trim()==='입출력 단자'));
          if(!hasIo)continue;
          await p.evaluate(()=>{const details=[...document.querySelectorAll('h4')].find(x=>x.textContent.trim()==='입출력 단자').closest('details');if(details)details.open=true});
          const wrapped=await p.evaluate(()=>{
            const h4=[...document.querySelectorAll('h4')].find(x=>x.textContent.trim()==='입출력 단자');
            const table=h4.nextElementSibling.querySelector('table');
            const fixedLabels=new Set(['입력','출력','입출력']);
            const cells=[...table.querySelectorAll('thead th'),...table.querySelectorAll('tbody td')];
            return cells.filter(cell=>{
              const text=cell.textContent.trim();
              if(!(fixedLabels.has(text)||/^\d+$/.test(text)||['분류','방향','단자','수량'].includes(text)))return false;
              const textNode=[...cell.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
              if(!textNode)return false;
              const range=document.createRange();range.selectNodeContents(textNode);
              return range.getClientRects().length>1;
            }).map(cell=>cell.textContent.trim());
          });
          if(wrapped.length)wrappedFixedCells.push({w,id,wrapped});
        }
        await p.close();
      }
      check('입출력 단자 표에서 방향("입력"·"출력"·"입출력")·수량(숫자) 칸이 30개 제품·6개 화면 폭(320~1024px)에서 두 줄로 쪼개지지 않음',wrappedFixedCells.length===0,JSON.stringify(wrappedFixedCells));
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
