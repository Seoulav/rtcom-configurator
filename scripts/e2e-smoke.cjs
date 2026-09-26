// Browser smoke test for the packaged site. Serves dist/ under a GitHub Pages style base path.
// Usage: node scripts/package-site.cjs && node scripts/e2e-smoke.cjs  (requires the playwright package)
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
let chromium;
try{({chromium}=require('playwright'))}catch{
  console.error('playwright 패키지가 없어 브라우저 검사를 건너뜁니다. 설치 후 다시 실행하세요: npm i --no-save playwright');
  process.exit(2);
}
const BASE='/rtcom-configurator/';
const dist=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.md':'text/markdown'};
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
  const options=process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{};
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
    check('섀시 선택 화면에 XDM 프레임 카드 7종 표시',await page.locator('.rt-chassis-card').count()===7);
    await page.click('button[data-model="XDM-144"]');
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('빈 슬롯 72개가 모두 블랭크 커버로 채워짐',await page.locator('.rt-rack-slot-blank img.rt-blank-plate').count()===72);
    await page.locator('button[data-slot="in-1"]').click();
    check('빈 슬롯을 누르면 카드 선택 팝업이 열림',await page.locator('.rt-card-modal[open]').isVisible());
    await page.keyboard.press('Escape');
    check('Esc로 팝업을 닫으면 누른 슬롯으로 포커스 복귀',await page.locator('.rt-card-modal').count()===0&&await page.evaluate(()=>document.activeElement?.dataset?.slot)==='in-1');
    await page.locator('button[data-slot="in-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice').first().click();
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice').first().click();
    await page.waitForLoadState('networkidle');
    check('장착한 슬롯이 블랭크 커버에서 카드 판넬로 바뀌고 전환 효과가 적용됨',await page.locator('button[data-slot="out-1"].rt-rack-slot-filled.rt-rack-slot-changed').count()===1&&await page.locator('.rt-rack-slot-blank').count()===70);
    const placed=await page.locator('.rt-rack-slot-filled img.rt-faceplate').count();
    check('카드 선택 후 팝업이 닫히고 슬롯에 실물 판넬 이미지 표시',placed===2&&await page.locator('.rt-card-modal').count()===0,`${placed}개`);
    check('장착한 판넬 이미지가 정상 로드됨',await page.$$eval('.rt-rack-slot-filled img.rt-faceplate',images=>images.every(image=>image.naturalWidth>0)));
    check('구성 요약에 장착 카드가 표시됨',await page.locator('.rt-config-summary li').count()===2);
    check('XDM-144 후면 사진 위에 슬롯이 표시되고 사진이 정상 로드됨',await page.locator('.rt-rack-photo .rt-rack-slot').count()===72&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.locator('button[data-slot="in-2"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="XDM-CIS100"]').click();
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('CIS100 장착 시 전송기 단계에 XDM-CTR100(TX)이 4채널로 자동 연결됨',await page.locator('button[data-owner="in-2"][data-link-device="XDM-CTR100 · TX"][aria-pressed="true"]').count()===1&&await page.locator('select[data-owner="in-2"][data-link="count"]').inputValue()==='4');
    check('전송기 단계에 XDM 연동 전송기 라인업 6종이 사진과 함께 표시됨',await page.locator('.rt-ext-lineup-card img').count()===6&&await page.$$eval('.rt-ext-lineup-card img',images=>images.every(image=>image.naturalWidth>0)));
    await page.locator('button[data-owner="in-1"][data-link-device="XDM-CTR100 PSE + XDM-CTR100"]').click();
    check('HDMI 카드에 CTR100 PSE + CTR100 한 쌍을 연결할 수 있고 CTR100 전원 경고 수에는 포함되지 않음',await page.locator('button[data-owner="in-1"][data-link-device="XDM-CTR100 PSE + XDM-CTR100"][aria-pressed="true"]').count()===1&&/XDM-CTR100 4대/.test(await page.locator('.rt-power-notice strong').innerText()));
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
    check('SPX-M3236은 입력 4·출력 3 슬롯이 블랭크 커버로 표시됨',await page.locator('.rt-rack-hs .rt-rack-slot-blank img.rt-blank-plate').count()===7);
    check('사진 슬롯 영역은 사진 높이 기준으로 배치됨(출력 영역 아래 끝 = 사진 677/772 지점)',await page.evaluate(()=>{const image=document.querySelector('.rt-rack-photo-image').getBoundingClientRect(),zone=document.querySelector('.rt-rack-zone-output').getBoundingClientRect();return Math.abs((zone.bottom-image.top)/image.height-677/772)<0.005}));
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="SPX-COS12"]').click();
    await page.click('[data-action="next"]');
    check('SPX-COS12 장착 시 SPX-RX가 12채널로 자동 연결됨',await page.locator('button[data-owner="out-1"][data-link-device="SPX-RX"][aria-pressed="true"]').count()===1&&await page.locator('select[data-owner="out-1"][data-link="count"]').inputValue()==='12');
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
    const missing=await page.goto(home+'no-such-page/deep',{waitUntil:'networkidle'});
    check('사이트 안의 없는 주소는 404.html이 구성기 첫 화면으로 보냄',missing&&page.url()===home&&await page.locator('#matrix-configurator').count()===1);
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="SPX"]');
    await page.click('[data-action="next"]');
    check('SPX 섀시 5종 모두 매뉴얼 전면 사진이 표시됨',await page.$$eval('.rt-chassis-card img',images=>images.length===5&&images.every(image=>image.getAttribute('src').includes('/frames/spx-'))));
    await page.click('button[data-model="SPX-M2472"]');
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('SPX-M2472는 매뉴얼 후면 사진 위 세로 슬롯(입력 3·출력 6)으로 표시됨',await page.locator('.rt-rack-photo.rt-rack-vs .rt-rack-zone-input .rt-rack-slot').count()===3&&await page.locator('.rt-rack-photo.rt-rack-vs .rt-rack-zone-output .rt-rack-slot').count()===6&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="VDM"]');
    await page.click('[data-action="next"]');
    check('VDM 섀시 9종(288X 제외)은 매뉴얼 전면 사진 또는 전면 도면을 표시함',await page.$$eval('.rt-chassis-card img',images=>images.filter(image=>image.getAttribute('src').includes('/frames/vdm-')&&image.getAttribute('src').endsWith('-front.webp')).length===9));
    await page.click('button[data-model="VDM-16X"]');
    await page.click('[data-action="next"]');
    await page.waitForLoadState('networkidle');
    check('VDM-16X는 매뉴얼 후면 사진 위에 입력 4·출력 4 슬롯(블랭크 커버)이 표시됨',await page.locator('.rt-rack-photo .rt-rack-slot-blank').count()===8&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.locator('button[data-slot="in-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="HIS4-U"]').click();
    check('VDM 보드를 장착하면 실물 판넬 사진이 표시됨',await page.$eval('button[data-slot="in-1"] img.rt-faceplate',image=>image.naturalWidth>0&&image.getAttribute('src').endsWith('HIS4-U.webp')));
    await page.click('[data-action="back"]');
    await page.click('button[data-model="VDM-256X"]');
    await page.click('[data-action="next"]');
    await page.locator('button[data-slot="out-64"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="COS4-U"]').click();
    check('VDM-256X는 매뉴얼 후면 도면(랙 2대) 위에 입력 64·출력 64 슬롯이고 64번 슬롯에 카드를 장착할 수 있음',await page.locator('.rt-rack-photo .rt-rack-zone').count()===4&&await page.locator('.rt-rack-slot').count()===128&&await page.locator('button[data-slot="out-64"].rt-rack-slot-filled').count()===1&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    check('404 요청 없음',failed.length===0,failed.join(', '));
    check('자바스크립트 오류 없음',errors.length===0,errors.join(' | '));
    await context.close();
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
    await phone.close();
  }finally{
    await browser.close();
    server.close();
  }
  const failures=results.filter(result=>!result.ok).length;
  console.log(`\n${results.length-failures}/${results.length} passed`);
  process.exit(failures?1:0);
})().catch(error=>{console.error(error);server.close();process.exit(1)});
