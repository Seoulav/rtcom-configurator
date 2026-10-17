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
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.md':'text/markdown','.json':'application/json','.webp':'image/webp','.pdf':'application/pdf'};
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
// 0.173 03 카드 슬롯은 ① 카드 장착 → ② 신호 입력 → 04 전송기 순서다(카드가 있을 때). 04로 가는 검사는 이 도우미로 두 화면을 차례로 넘긴다.
const nextToLinks=async pg=>{await pg.click('[data-action="next"]');if(await pg.locator('[data-signal-count]').count())await pg.click('[data-action="next"]');await pg.waitForLoadState('networkidle')};
// 0.239 AMX 코드 잠금 검사용: dist의 control-example.js에 있는 AMX_LOCK을 테스트 비밀번호 변환값으로 바꾼다(dist는 빌드 산출물이며 배포하지 않는다).
const AMX_TEST_PASSWORD='e2e-amx-pass-0238';
const patchAmxLock=async()=>{
  const ce=require('../src/control-example.js');
  const file=path.join(dist,'src','control-example.js');
  const src=fs.readFileSync(file,'utf8');
  const re=/^(\s*)const AMX_LOCK=.*;$/m;
  if(!re.test(src))throw new Error('dist/src/control-example.js에서 AMX_LOCK 줄을 찾지 못했습니다');
  const cfg=JSON.stringify(await ce.makeLock(AMX_TEST_PASSWORD,{iterations:1000}));
  fs.writeFileSync(file,src.replace(re,(_,ind)=>`${ind}const AMX_LOCK=${cfg};`));
};
(async()=>{
  await patchAmxLock();
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
    // 0.128 01 제품군에는 미리보기의 "프레임 선택" 버튼 하나만 보인다(사용자 요청 2026-09-28 "이것도 버튼 위로 배치하고 오른쪽 화살표도 보이게", 지적 2026-09-29 "버튼이 중복이다").
    // 버튼은 태그 줄 아래에 있고 → 화살표가 버튼 글자색(흰색)으로 보이며(예전에는 강조색 파랑이라 파란 버튼에 묻힘), 아래 바 다음 버튼은 01에서 숨는다. 0.135부터 02 프레임 선택도 미리보기 버튼 하나만 두고(사용자 승인 2026-09-29 "02 아래 바 버튼 숨기기") 아래 바 다음 버튼을 숨긴다. 숨어 있어도 화살표 색은 흰색이다.
    const familyNext=await page.evaluate(()=>{const visible=el=>!!el&&el.offsetParent!==null&&getComputedStyle(el).display!=='none',button=document.querySelector('.rt-cg-preview [data-action="preview-next"]'),chips=document.querySelector('.rt-cg-preview .rt-cg-chips'),foot=document.querySelector('.rt-footer [data-action="next"]');if(!button||!chips||!foot)return null;const arrow=button.querySelector('.rt-arrow'),color=el=>getComputedStyle(el).color;return {visibleNext:[...document.querySelectorAll('[data-action="next"],[data-action="preview-next"]')].filter(visible).length,below:button.getBoundingClientRect().top>=chips.getBoundingClientRect().bottom-1,text:button.textContent.trim(),panelArrow:color(arrow),buttonInk:color(button),footVisible:visible(foot)}});
    // 0.129 아래 바 요약 글("XDM / XDM-72 · 카테고리: 매트릭스") 삭제(사용자 요청 2026-09-29 "이거 삭제해줘"): 01에서는 아래 바 전체가 숨고, 요약 글은 어느 단계에도 없다.
    const footStep1=await page.evaluate(()=>({bar:document.querySelector('.rt-footer').offsetParent!==null,summary:!!document.querySelector('.rt-summary'),text:document.body.innerText.includes('카테고리: 매트릭스')}));
    check('01 제품군에서 아래 바(요약 글 "카테고리: 매트릭스")가 보이지 않음',!footStep1.bar&&!footStep1.summary&&!footStep1.text,JSON.stringify(footStep1));
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.waitForSelector('button[data-model]');
    const footBar2=await page.evaluate(()=>{const f=document.querySelector('.rt-footer'),a=f.querySelector('.rt-actions').getBoundingClientRect(),r=f.getBoundingClientRect();return {bar:f.offsetParent!==null,right:Math.round(r.right-a.right),left:Math.round(a.left-r.left),text:f.innerText.includes('XDM /')}});
    check('02부터 아래 바에는 이전·다음 버튼만 있고(넓은 화면은 오른쪽 정렬, 좁은 화면은 전체 폭) 요약 글은 없음',footBar2.bar&&!footBar2.text&&footBar2.left>=footBar2.right,JSON.stringify(footBar2));
    const footStep2=await page.evaluate(()=>{const foot=document.querySelector('.rt-footer [data-action="next"]'),arrow=foot.querySelector('.rt-arrow');return {visible:foot.offsetParent!==null,arrow:getComputedStyle(arrow).color,ink:getComputedStyle(foot).color,text:arrow.textContent}});
    check('01 제품군에는 태그 줄 아래 "프레임 선택" 버튼 하나만 보이고(아래 바 버튼은 숨김) 02로 이동하며, → 화살표가 흰색으로 보이며 02에서도 아래 바 다음 버튼은 숨음',!!familyNext&&familyNext.visibleNext===1&&familyNext.footVisible===false&&familyNext.below&&familyNext.text.startsWith('프레임 선택')&&familyNext.panelArrow==='rgb(255, 255, 255)'&&familyNext.panelArrow===familyNext.buttonInk&&footStep2.visible===false&&footStep2.arrow==='rgb(255, 255, 255)'&&footStep2.arrow===footStep2.ink&&footStep2.text==='→'&&(await page.locator('.rt-main .rt-eyebrow').first().textContent()).includes('02 / 프레임 선택'),JSON.stringify({familyNext,footStep2}));
    await page.click('[data-action="back"]');
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    check('프레임 선택 화면에 XDM 프레임 6종 표시(XDM-288 제외)',await page.locator('button[data-model]').count()===6);
    await page.click('button[data-model="XDM-144"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
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
    // 0.205 출력 카드 선택 팝업 팁의 HOS100·WOS100 기능 팝업 버튼: 눌러도 카드 선택 팝업은 그대로 남는다.
    const tipFeatures=await page.$$eval('.rt-card-modal .rt-output-tips [data-card-feature]',els=>els.map(e=>e.dataset.cardFeature).join());
    await page.click('.rt-card-modal .rt-output-tips [data-card-feature="hos-multiview"]');
    const tipHos=await page.locator('dialog.rt-hos-modal[open]').count();
    await page.keyboard.press('Escape');
    check('XDM 출력 카드 선택 팝업 팁에 HOS100 멀티뷰·WOS100 레이어 버튼이 있고, 멀티뷰 팝업을 닫으면 카드 선택 팝업이 남음',tipFeatures==='hos-multiview,layer-compare'&&tipHos===1&&await page.locator('.rt-card-modal[open]').count()===1,tipFeatures);
    await page.locator('.rt-card-modal .rt-card-choice').nth(1).click();
    await page.waitForLoadState('networkidle');
    check('장착한 슬롯이 카드 판넬로 바뀌고 전환 효과가 적용됨(블랭크였던 in-1도 카드로 교체됨)',await page.locator('button[data-slot="out-1"].rt-rack-slot-filled.rt-rack-slot-changed').count()===1&&await page.locator('button[data-slot="in-1"].rt-rack-slot-filled').count()===1&&await page.locator('.rt-rack-slot-empty').count()===70);
    const placed=await page.locator('.rt-rack-slot-filled img.rt-faceplate').count();
    check('카드 선택 후 팝업이 닫히고 슬롯에 실물 판넬 이미지 표시',placed===2&&await page.locator('.rt-card-modal').count()===0,`${placed}개`);
    check('장착한 판넬 이미지가 정상 로드됨',await page.$$eval('.rt-rack-slot-filled img.rt-faceplate',images=>images.every(image=>image.naturalWidth>0)));
    check('구성 요약에 장착 카드가 표시됨',await page.locator('.rt-config-summary li').count()===2);
    // 0.166(사용자 요청 "그냥 모델명(HDMI) X 수량만"): 0.17의 "판넬 사진 크게" 대신 사진 없이 모델명·수량 한 줄로 바뀌었다.
    check('구성 요약 카드 행은 판넬 사진 없이 모델명과 수량(× N)만 한 줄로 표시됨',await page.$$eval('.rt-config-summary li',items=>items.every(item=>!item.querySelector('img')&&/× \d+$/.test(item.textContent.trim()))));
    check('XDM-144 후면 그림 위에 슬롯이 표시되고 그림이 정상 로드됨',await page.locator('.rt-rack-photo .rt-rack-slot').count()===72&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.locator('button[data-slot="in-2"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="XDM-CIS100"]').click();
    // 0.219 시안 C(사용자 선택 2026-10-14 "C만 진행"): 장착 슬롯 태그에 채널 범위, 완성도 막대는 슬롯마다 한 칸(카드 칸은 신호 색), 내 구성에 연동 전송기 묶음.
    const planC=await page.evaluate(()=>{const segs=[...document.querySelectorAll('.rt-completion-slots i')],sig=segs.filter(i=>i.dataset.sig);return {tag:document.querySelector('.rt-rack-slot[data-slot="in-2"] .rt-slot-tag')?.textContent.replace(/\s+/g,' ').trim()||'',slots:document.querySelectorAll('.rt-rack-photo .rt-rack-slot').length,segs:segs.length,filled:document.querySelectorAll('.rt-rack-slot-filled').length,sig:sig.length,hdbt:getComputedStyle(sig.find(i=>i.dataset.sig==='hdbt')||document.body).backgroundColor,links:[...document.querySelectorAll('.rt-summary-links .rt-summary-link')].map(li=>li.textContent.replace(/\s+/g,' ').trim())}});
    check('시안 C: IN 2 태그에 CH 5–8, 완성도 막대가 슬롯 수(72)만큼 칸이고 카드 칸은 신호 색(HDBT 초록), 내 구성에 "CIS100 IN 2 → XDM-CTR100 · TX × 4" 연동 전송기 행',/^IN 2 ?CIS100 ?CH 5–8$/.test(planC.tag)&&planC.segs===planC.slots&&planC.slots===72&&planC.sig===planC.filled&&planC.hdbt==='rgb(0, 176, 80)'&&planC.links.some(t=>/^CIS100 ?IN 2 ?→ ?XDM-CTR100 · TX ?× 4$/.test(t)),JSON.stringify(planC));
    await nextToLinks(page);
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
    // 0.227: 넘침이 생기면 원인 요소를 바로 알 수 있게 가로 스크롤 상자 밖에서 화면 오른쪽을 넘은 요소를 함께 적는다(검사 기준은 그대로).
    const overflowCulprits=overflow>0?await page.evaluate(()=>{const w=innerWidth,clipped=el=>{for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll'||o==='hidden'||o==='clip')return true}return false};return [...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width&&r.right>w+0.5&&!clipped(el)&&s.display!=='none'&&s.visibility!=='hidden'}).slice(0,8).map(el=>`${typeof el.className==='string'?el.className:el.tagName} right=${el.getBoundingClientRect().right.toFixed(1)} fs=${getComputedStyle(el).fontSize} ws=${getComputedStyle(el).whiteSpace} "${(el.textContent||'').trim().slice(0,20)}"`)}):[];
    check('390px 화면에서 페이지 가로 넘침 없음',overflow<=0,`${overflow}px${overflowCulprits.length?` · 원인 후보: ${JSON.stringify(overflowCulprits)}`:''}`);

    await page.reload({waitUntil:'networkidle'});
    check('새로고침 후 자동 저장 복원',await page.locator('.rt-rack-slot-filled img.rt-faceplate').count()===placed+1);

    for(const legacy of ['tools/matrix-configurator/','products/','tools/matrix-configurator']){
      await page.goto(`${home}${legacy}#matrix-configurator`,{waitUntil:'networkidle'});
      check(`옛 주소 /${legacy} → 구성기 첫 화면 이동`,page.url()===`${home}#matrix-configurator`&&await page.locator('#matrix-configurator h1').isVisible(),page.url());
    }
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="SPX"]');
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.click('button[data-model="SPX-M3236"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.waitForLoadState('networkidle');
    check('SPX-M3236은 입력 4·출력 3 슬롯이 모두 빈 슬롯으로 표시됨(블랭크 자동 없음)',await page.locator('.rt-rack-hs .rt-rack-slot-empty').count()===7&&await page.locator('.rt-rack-hs .rt-rack-slot-blank').count()===0);
    // 사진이 다 받아지기 전에 위치를 재면 높이가 0이라 가끔 실패했다(0.64 확인, 재실행 3회 모두 통과). 사진 로드를 최대 5초 기다린 뒤 잰다.
    await page.waitForFunction(()=>document.querySelector('.rt-rack-photo-image')?.naturalWidth>0,null,{timeout:5000}).catch(()=>{});
    check('사진 슬롯 영역은 사진 높이 기준으로 배치됨(출력 영역 아래 끝 = 사진 677/772 지점)',await page.evaluate(()=>{const image=document.querySelector('.rt-rack-photo-image').getBoundingClientRect(),zone=document.querySelector('.rt-rack-zone-output').getBoundingClientRect();return Math.abs((zone.bottom-image.top)/image.height-677/772)<0.005}));
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="SPX-COS12"]').click();
    await page.mouse.move(2,2);
    await page.evaluate(()=>document.activeElement?.blur());
    // 0.170(사용자 선택 2026-09-29 2안 "이걸로 가자", "XDM-HI100과 HIS100 구별점을 줘야할 거 같아"): 0.17의 "장착 슬롯 번호표 숨김" 대신 장착 슬롯은 번호와 모델을 한 태그(IN 1 | HI100)로 늘 보여 주고, 빈 슬롯 번호표도 그대로 보인다.
    const slotTags=await page.evaluate(()=>{const filled=[...document.querySelectorAll('.rt-rack-slot-filled')],empty=[...document.querySelectorAll('.rt-rack-slot-empty .rt-rack-slot-no')];return {filled:filled.length,tagged:filled.filter(b=>{const t=b.querySelector('.rt-rack-slot-no.rt-slot-tag');return t&&getComputedStyle(t).opacity==='1'&&/^(IN|OUT) \d+/.test(t.querySelector('.rt-slot-tag-n')?.textContent||'')&&(t.querySelector('.rt-slot-tag-s')?.textContent||'').length>0}).length,empty:empty.length,emptyShown:empty.every(l=>getComputedStyle(l).opacity!=='0')}});
    check('장착한 슬롯은 번호와 모델을 한 태그로 늘 보여 주고(빈 슬롯 번호표도 표시)',slotTags.filled>0&&slotTags.tagged===slotTags.filled&&slotTags.empty>0&&slotTags.emptyShown,JSON.stringify(slotTags));
    // "남은 칸 블랭크로 채우기": 카드를 넣은 슬롯(out-1)은 그대로 두고 나머지 6칸만 블랭크로 바꾼다. 완성 배너가 뜨고, 실행 취소로 한 번에 되돌아간다.
    check('빈칸이 있으면 채우기 줄이 보임',(await page.locator('.rt-slot-fillbar span').first().textContent()).includes('6개'));
    await page.click('[data-action="fill-blanks"]');
    await page.waitForLoadState('networkidle');
    check('"남은 칸 블랭크로 채우기"는 빈 슬롯만 블랭크로 바꾸고 이미 넣은 카드는 그대로 둠',await page.locator('.rt-rack-slot-blank').count()===6&&await page.locator('button[data-slot="out-1"].rt-rack-slot-filled').count()===1&&await page.locator('.rt-rack-slot-empty').count()===0);
    check('모든 슬롯을 채우면 완성 배너와 "선택 완료" 다음 버튼이 표시됨',await page.locator('.rt-slot-done-banner').isVisible()&&(await page.locator('[data-action="next"] span').first().textContent())==='선택 완료 · 신호 입력');
    await page.click('[data-tool="undo"]');
    await page.waitForLoadState('networkidle');
    check('실행 취소 1번으로 "채우기"가 통째로 되돌아감(블랭크 6개가 다시 빈칸으로)',await page.locator('.rt-rack-slot-blank').count()===0&&await page.locator('.rt-rack-slot-empty').count()===6&&await page.locator('button[data-slot="out-1"].rt-rack-slot-filled').count()===1&&await page.locator('.rt-slot-done-banner').count()===0);
    await nextToLinks(page);
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
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.click('button[data-model="XDM-12"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
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
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.click('button[data-model="XDM-36"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.locator('button[data-slot="in-1"]').click();
    // 0.70 카드별 수량(사용자 요청 "카드마다 수량 기입해서 순차적으로"): HI100 수량 3을 넣고 "순서대로 장착"을 누르면 선택한 슬롯부터 3칸이 채워진다.
    for(let i=0;i<3;i++)await page.locator('.rt-card-modal [data-card-qty-step="1"][data-qty-card="XDM-HI100"]').click();
    const qtyShown=await page.locator('.rt-card-modal [data-qty-out="XDM-HI100"]').textContent();
    // 0.115: 팝업 아래 줄은 슬롯 비우기(Del)가 왼쪽, 장착이 오른쪽(사용자 요청 "하단에 장착을 우측으로 배치하고 델리트키는 왼쪽에 배치해줘").
    const footOrder=await page.evaluate(()=>{const foot=document.querySelector('.rt-card-modal-foot'),r=foot.querySelector('[data-action="remove"]').getBoundingClientRect(),f=foot.querySelector('[data-action="fill-qty"]').getBoundingClientRect(),box=foot.getBoundingClientRect();return {removeLeft:Math.round(r.left-box.left),fillRight:Math.round(box.right-f.right),order:r.right<=f.left}});
    check('카드 팝업 아래 줄에서 슬롯 비우기(Del)는 왼쪽, 장착 버튼은 오른쪽에 있음',footOrder.order&&footOrder.removeLeft<40&&footOrder.fillRight<40,JSON.stringify(footOrder));
    await page.locator('.rt-card-modal [data-action="fill-qty"]').click();
    const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements);
    let moveState=await saved();
    check('카드 팝업에서 XDM-HI100 수량 3을 넣고 장착하면 선택한 슬롯부터 입력 슬롯 3칸이 채워짐',qtyShown==='3'&&moveState['in-1']==='XDM-HI100'&&moveState['in-2']==='XDM-HI100'&&moveState['in-3']==='XDM-HI100'&&!moveState['in-4'],JSON.stringify(moveState));
    // 0.137 → 0.175(사용자 결정 2026-09-29 안 A "현재 N장 장착 대신 수량 칸에 N"): 팝업을 다시 열면 수량 칸이 장착된 장수(3)에서 시작하고 − 로 그 아래로 줄지 않는다.
    // + 로 4를 만들고 장착하면 연 슬롯(IN 2)을 덮어쓰지 않고 다음 빈 슬롯(IN 4)에 1장만 더 들어간다.
    await page.locator('button[data-slot="in-2"]').click();
    const haveQty=await page.evaluate(()=>{const out=document.querySelector('.rt-card-modal [data-qty-out="XDM-HI100"]');return {n:out?.textContent,minus:out?.parentElement.querySelector('[data-card-qty-step="-1"]').disabled,note:!!document.querySelector('.rt-card-modal .rt-card-have')}});
    await page.locator('.rt-card-modal [data-card-qty-step="1"][data-qty-card="XDM-HI100"]').click();
    const haveQty2=await page.locator('.rt-card-modal [data-qty-out="XDM-HI100"]').textContent();
    await page.locator('.rt-card-modal [data-action="fill-qty"]').click();
    const addState=await saved();
    check('카드 팝업을 다시 열면 XDM-HI100 수량 칸이 장착된 3에서 시작하고(− 잠김, 따로 쓴 "현재 N장 장착" 없음) 4로 늘려 장착하면 IN 4에만 1장이 더 들어감',haveQty.n==='3'&&haveQty.minus===true&&!haveQty.note&&haveQty2==='4'&&['in-1','in-2','in-3','in-4'].every(id=>addState[id]==='XDM-HI100')&&!addState['in-5'],JSON.stringify({haveQty,haveQty2,addState}));
    await page.locator('button[data-slot="in-4"]').click();
    await page.locator('.rt-card-modal [data-action="remove"]').click();
    moveState=await saved();
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
    // 0.113 XDM·SPX 후면 평면 그림: 02 프레임 선택의 후면 미리보기가 모두 -rear-art.webp(긴 변 2000px, 대체 문구 "그림")이고, XDM-216도 후면 그림 위에 슬롯 108칸이 나온다.
    // 0.116: 정면·후면을 함께 보여 주고(stack·row), 대형 프레임만 정면/후면 버튼(toggle)으로 한 장씩 본다. 아래 도우미는 두 방식 모두에서 한쪽 이미지를 읽는다.
    const previewImage=async side=>{
      if(!await page.locator(`.rt-cg-preview img[data-cg-img="${side}"]`).count()){if(!await page.locator(`[data-cg-side="${side}"]`).count())return null;await page.click(`[data-cg-side="${side}"]`)}
      await page.waitForFunction(s=>{const image=document.querySelector(`.rt-cg-preview img[data-cg-img="${s}"]`);return image&&image.complete&&image.naturalWidth>0},side,{timeout:5000}).catch(()=>{});
      const info=await page.$eval(`.rt-cg-preview img[data-cg-img="${side}"]`,image=>({src:image.getAttribute('src'),w:image.naturalWidth,h:image.naturalHeight,alt:image.alt})).catch(()=>null);
      if(await page.locator('[data-cg-side="front"]').count())await page.click('[data-cg-side="front"]');
      return info;
    };
    const previewLayout=()=>page.evaluate(()=>document.querySelector('.rt-cg-duo-row')?'row':document.querySelector('.rt-cg-duo-stack')?'stack':document.querySelector('.rt-cg-seg')?'toggle':'none');
    const rearArtOk=async family=>{
      await page.evaluate(()=>localStorage.clear());
      await page.goto(home,{waitUntil:'networkidle'});
      await page.click(`button[data-family="${family}"]`);
      await page.click('.rt-cg-preview [data-action="preview-next"]');
      let ok=0;const toggles=[];const models=await page.locator('button[data-model]').evaluateAll(nodes=>nodes.map(node=>node.dataset.model));
      for(const model of models){
        await page.click(`button[data-model="${model}"]`);
        if(await previewLayout()==='toggle')toggles.push(model);
        const art=await previewImage('rear');
        if(art&&art.src.endsWith(`/frames/${model.toLowerCase()}-rear-art.webp`)&&Math.max(art.w,art.h)===2000&&art.alt.endsWith('그림'))ok++;
      }
      return [ok,models.length,toggles];
    };
    const [xdmArt,xdmCount,xdmToggles]=await rearArtOk('XDM');
    check('XDM 프레임 6종(216 포함) 후면 미리보기가 모두 평면 그림(긴 변 2000px)으로 표시됨',xdmCount===6&&xdmArt===6,`${xdmArt}/${xdmCount}`);
    check('XDM 02 미리보기는 대형 XDM-144·216도 정면/후면 버튼 없이 정면·후면을 함께 보여 줌(0.137)',JSON.stringify(xdmToggles)==='[]',JSON.stringify(xdmToggles));
    await page.click('button[data-model="XDM-216"]');await acceptConfirm();
    // 0.114: 02 프레임 선택 미리보기 캡션 아래 "다음 · 카드 슬롯 구성" 버튼(사용자 요청 "프레임 선택후 다음 이동 버튼을 여기에 넣어줘")으로 03 카드 슬롯으로 넘어간다.
    const previewNext=await page.evaluate(()=>{const button=document.querySelector('.rt-cg-preview [data-action="preview-next"]'),cap=document.querySelector('.rt-cg-preview-cap');if(!button||!cap)return null;const b=button.getBoundingClientRect(),c=cap.getBoundingClientRect();return {enabled:!button.disabled,below:b.top>=c.bottom-1,text:button.textContent.trim()}});
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.waitForSelector('.rt-rack-photo');
    check('02 프레임 선택 미리보기 캡션 아래 "다음" 버튼으로 03 카드 슬롯으로 이동함',previewNext?.enabled&&previewNext.below&&previewNext.text.startsWith('다음')&&(await page.locator('.rt-main .rt-eyebrow').first().textContent()).includes('03 / 카드 슬롯'),JSON.stringify(previewNext));
    await page.waitForFunction(()=>document.querySelector('.rt-rack-photo-image')?.naturalWidth>0,null,{timeout:5000}).catch(()=>{});
    check('XDM-216은 후면 그림 위에 입력 54·출력 54 슬롯으로 표시됨(캡션 "후면 그림")',await page.locator('.rt-rack-photo .rt-rack-zone-input .rt-rack-slot').count()===54&&await page.locator('.rt-rack-photo .rt-rack-zone-output .rt-rack-slot').count()===54&&(await page.locator('.rt-rack-photo figcaption').textContent()).startsWith('후면 그림'));
    // 0.117 카드 팝업 연동 전송기(사용자 요청 "특정 컨버터를 선택할 수 있게끔"): 카드 아래 칩으로 전송기를 고르고 장착하면 그 전송기가 슬롯에 연결된다.
    const links=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.links);
    await page.locator('button[data-slot="in-1"]').click();
    const cisChips=await page.$$eval('.rt-card-modal [data-ext-card="XDM-CIS100"]',chips=>chips.map(chip=>({dev:chip.dataset.extDevice,on:chip.getAttribute('aria-pressed'),def:!!chip.querySelector('em')})));
    await page.locator('.rt-card-modal [data-ext-card="XDM-CIS100"][data-ext-device="XDM-CT103"]').click();
    // 0.118 전송기 수량(사용자 요청 "전송기 부분도 수량을 선택할 수 있게 … 물량 산출서"): 카드 1장당 수량을 4에서 2로 줄이면 링크 2대·BOM XDM-CT103 2대.
    const extQtyStart=await page.locator('.rt-card-modal [data-ext-qty-out="XDM-CIS100"]').textContent();
    await page.locator('.rt-card-modal [data-ext-qty-step="-1"][data-ext-qty-card="XDM-CIS100"]').click();
    await page.locator('.rt-card-modal [data-ext-qty-step="-1"][data-ext-qty-card="XDM-CIS100"]').click();
    const extQtyNow=await page.locator('.rt-card-modal [data-ext-qty-out="XDM-CIS100"]').textContent();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="XDM-CIS100"]').click();
    const bomCt103=await page.evaluate(()=>RtCore.bom(JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state).find(row=>row.model==='XDM-CT103')?.quantity||0);
    let linkState=await links();
    check('카드 팝업 전송기 수량을 4→2로 줄여 장착하면 CT103 2대로 연결되고 물량 산출서(BOM)에 XDM-CT103 2대가 잡힘',extQtyStart==='4'&&extQtyNow==='2'&&linkState['in-1']?.count===2&&bomCt103===2,JSON.stringify({extQtyStart,extQtyNow,link:linkState['in-1'],bomCt103}));
    check('카드 팝업에서 XDM-CIS100 아래 연동 전송기(CTR100 TX 기본·CT103·연결 안 함) 중 CT103을 고르고 장착하면 CT103으로 연결됨',cisChips.length===3&&cisChips[0].dev==='XDM-CTR100 · TX'&&cisChips[0].on==='true'&&cisChips[0].def&&cisChips[2].dev===''&&linkState['in-1']?.device==='XDM-CT103',JSON.stringify({cisChips,link:linkState['in-1']}));
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal [data-ext-card="XDM-HOS100"][data-ext-device="XDM-CTR100 PSE + XDM-CTR100"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="XDM-HOS100"]').click();
    await page.locator('button[data-slot="in-1"]').click();
    await page.locator('.rt-card-modal [data-ext-card="XDM-CIS100"][data-ext-device="XDM-CTR100 · TX"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="XDM-CIS100"]').click();
    linkState=await links();
    check('HDMI 카드(HOS100)는 CTR100 PSE 한 쌍을 골라 장착할 수 있고, 장착된 카드의 전송기를 팝업에서 바꾸면 바로 반영됨(수량 2 유지)',linkState['out-1']?.device==='XDM-CTR100 PSE + XDM-CTR100'&&linkState['out-1'].count===4&&linkState['in-1']?.device==='XDM-CTR100 · TX'&&linkState['in-1'].count===2&&await page.locator('.rt-card-modal').count()===0,JSON.stringify({out1:linkState['out-1'],in1:linkState['in-1']}));
    const [spxArt,spxCount,spxToggles]=await rearArtOk('SPX');
    check('SPX 프레임 5종 후면 미리보기가 모두 평면 그림(긴 변 2000px)으로 표시되고, 5종 모두 정면·후면을 함께 보여 줌',spxCount===5&&spxArt===5&&spxToggles.length===0,`${spxArt}/${spxCount} ${JSON.stringify(spxToggles)}`);
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="SPX"]');
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    // 02 프레임(2-2, Analog Way 구조): 목록 행에는 사진이 없고, 고른 모델의 전면 그림이 오른쪽 고정 미리보기에 표시된다.
    check('SPX 프레임 5종 목록에 모두 사진 없이 이름·사양 행으로 표시됨',await page.locator('button[data-model]').count()===5&&await page.locator('button[data-model] img').count()===0);
    const spxModels=await page.locator('button[data-model]').evaluateAll(nodes=>nodes.map(node=>node.dataset.model));
    let spxPreviewOk=true;
    for(const model of spxModels){
      await page.click(`button[data-model="${model}"]`);
      const src=await page.locator('.rt-cg-preview img[data-cg-img="front"]').getAttribute('src');
      if(!src||!src.includes(`/frames/spx-${model.slice(4).toLowerCase()}-front-art.webp`))spxPreviewOk=false;
    }
    check('프레임 목록에서 모델을 고를 때마다 오른쪽 미리보기가 그 모델의 전면 그림으로 바뀜(SPX 5종)',spxPreviewOk);
    await page.click('button[data-model="SPX-M2472"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.waitForLoadState('networkidle');
    // 사진이 다 받아지기 전에 naturalWidth를 읽으면 0이라 가끔 실패했다(0.58 확인, 재실행 3회 모두 통과). 사진 로드를 최대 5초 기다린 뒤 본다.
    await page.waitForFunction(()=>document.querySelector('.rt-rack-photo-image')?.naturalWidth>0,null,{timeout:5000}).catch(()=>{});
    check('SPX-M2472는 후면 그림 위 세로 슬롯(입력 3·출력 6)으로 표시됨',await page.locator('.rt-rack-photo.rt-rack-vs .rt-rack-zone-input .rt-rack-slot').count()===3&&await page.locator('.rt-rack-photo.rt-rack-vs .rt-rack-zone-output .rt-rack-slot').count()===6&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    await page.evaluate(()=>localStorage.clear());
    await page.goto(home,{waitUntil:'networkidle'});
    await page.click('button[data-family="VDM"]');
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    const vdmModels=await page.locator('button[data-model]').evaluateAll(nodes=>nodes.map(node=>node.dataset.model));
    let vdmFrontCount=0,vdm288Placeholder=false,vdmArt=0;const vdmToggles=[];
    for(const model of vdmModels){
      await page.click(`button[data-model="${model}"]`);
      const src=await page.$eval('.rt-cg-preview img',image=>image.getAttribute('src')).catch(()=>null);
      if(model==='VDM-288X')vdm288Placeholder=await page.locator('.rt-cg-preview-placeholder').isVisible();
      if(src&&src.includes('/frames/vdm-')&&/-front(-art)?\.webp$/.test(src))vdmFrontCount++;
      // 0.111 VDM 평면 그림: 실물 사진이 없는 전면 7종·후면 8종은 -art.webp 그림(긴 변 2000px)을 쓴다.
      if(await previewLayout()==='toggle')vdmToggles.push(model);
      for(const side of ['front','rear']){
        const art=await previewImage(side);
        if(art&&art.src.endsWith(`-${side}-art.webp`)&&Math.max(art.w,art.h)===2000&&art.alt.endsWith('그림'))vdmArt++;
      }
    }
    check('VDM 프레임 10종 중 9종(288X 제외)은 전면 사진 또는 전면 그림을 미리보기에 표시함',vdmFrontCount===9);
    check('VDM 전면 9종·후면 9종(0.135부터 실물 사진 없음)은 평면 그림(긴 변 2000px, 대체 문구 "그림")으로 표시함',vdmArt===18);
    check('VDM 02 미리보기는 대형 VDM-80X·128X·180X도 정면/후면 버튼 없이 정면·후면을 함께 보여 줌(0.137)',JSON.stringify(vdmToggles)==='[]',JSON.stringify(vdmToggles));
    check('VDM-288X는 전면 사진이 없어 미리보기에 "사진 준비 중"이 표시됨',vdm288Placeholder);
    await page.click('button[data-model="VDM-16X"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.waitForLoadState('networkidle');
    // 슬롯 판과 후면 사진이 다 그려지기 전에 세면 가끔 실패했다(2026-09-27 한 번 재현). 슬롯 8칸과 사진 로딩을 기다린 뒤 검사한다.
    await page.waitForFunction(()=>{const image=document.querySelector('.rt-rack-photo-image');return document.querySelectorAll('.rt-rack-photo .rt-rack-slot').length>=8&&image&&image.complete&&image.naturalWidth>0},null,{timeout:10000}).catch(()=>{});
    check('VDM-16X는 후면 그림(0.119, 카드 없는 빈 슬롯) 위에 입력 4·출력 4 슬롯이 모두 빈 슬롯으로 표시됨(블랭크 자동 없음)',await page.$eval('.rt-rack-photo-image',image=>image.getAttribute('src').endsWith('vdm-16x-rear-art.webp'))&&await page.locator('.rt-rack-photo .rt-rack-slot-empty').count()===8&&await page.locator('.rt-rack-photo .rt-rack-slot-blank').count()===0&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    // 0.245 VDM 출력 카드 선택 팝업 팁의 QOS4S-U 쿼드뷰 버튼(XDM HOS100 팁과 같은 방식): 레이아웃 팝업이 열리고 닫아도 카드 선택 팝업은 그대로 남는다.
    await page.locator('button[data-slot="out-1"]').click();
    const vdmTip=await page.$$eval('.rt-card-modal .rt-output-tips [data-card-feature]',els=>els.map(e=>e.dataset.cardFeature).join());
    await page.click('.rt-card-modal .rt-output-tips [data-card-feature="vdm-quadview"]');
    const vdmQv=await page.evaluate(()=>({n:document.querySelectorAll('dialog.rt-qv-modal[open]').length,layouts:document.querySelectorAll('dialog.rt-qv-modal .rt-qv-grid .rt-hos-layout').length}));
    await page.keyboard.press('Escape');
    const cardModalKept=await page.locator('.rt-card-modal[open]').count();
    await page.keyboard.press('Escape');
    check('VDM 출력 카드 선택 팝업 팁에 QOS4S-U 쿼드뷰 버튼이 있고, 레이아웃 팝업(8종)을 닫으면 카드 선택 팝업이 남음',vdmTip==='vdm-quadview'&&vdmQv.n===1&&vdmQv.layouts===8&&cardModalKept===1,JSON.stringify({vdmTip,vdmQv,cardModalKept}));
    await page.locator('button[data-slot="in-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="HIS4-U"]').click();
    check('VDM 보드를 장착하면 실물 판넬 사진이 표시됨',await page.$eval('button[data-slot="in-1"] img.rt-faceplate',image=>image.naturalWidth>0&&image.getAttribute('src').endsWith('HIS4-U.webp')));
    await page.locator('button[data-slot="in-2"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="CIS4-U"]').click();
    await page.locator('button[data-slot="out-1"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="FOS4-U"]').click();
    await nextToLinks(page);
    await page.locator('.rt-ext-lineup').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.querySelectorAll('.rt-ext-lineup-card img')].every(image=>image.complete&&image.naturalWidth>0),null,{timeout:10000}).catch(()=>{});
    check('VDM CIS4-U·FOS4-U 장착 시 CT104-U·FR101-U가 4채널로 자동 연결되고 VDM 전송기 라인업 4종이 표시됨',await page.locator('button[data-owner="in-2"][data-link-device="CT104-U"][aria-pressed="true"]').count()===1&&await page.locator('button[data-owner="out-1"][data-link-device="FR101-U"][aria-pressed="true"]').count()===1&&await page.locator('select[data-owner="in-2"][data-link="count"]').inputValue()==='4'&&await page.$$eval('.rt-ext-lineup-card img',images=>images.length===4&&images.every(image=>image.naturalWidth>0)));
    await page.click('[data-action="back"]');
    await page.click('[data-action="back"]');
    await page.click('button[data-model="VDM-256X"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.locator('button[data-slot="out-64"]').click();
    await page.locator('.rt-card-modal .rt-card-choice[data-card="COS4-U"]').click();
    check('VDM-256X는 후면 그림(랙 2대) 위에 입력 64·출력 64 슬롯이고 64번 슬롯에 카드를 장착할 수 있음',await page.locator('.rt-rack-photo .rt-rack-zone').count()===4&&await page.locator('.rt-rack-slot').count()===128&&await page.locator('button[data-slot="out-64"].rt-rack-slot-filled').count()===1&&await page.$eval('.rt-rack-photo-image',image=>image.naturalWidth>0));
    // 0.19 알티컴 공개 제품정보: 같은 화면 안에서 #products 주소 조각으로만 전환한다.
    // 0.33 — 제품정보 글래스 디자인(rt-pg-*)으로 목록·상세 마크업이 바뀌었다.
    await page.click('a[data-view-tab="products"]');
    await page.waitForSelector('.rt-pg-gridcard');
    check('제품정보 탭을 누르면 구성기를 숨기고 제품 33종 목록(0.64 SPX-TX/RX, 0.72 XDM-PSU, 0.121 HD-D102U Rack마운트, 0.157 SPX-R6, 0.223 XDM-MR4S 포함)을 표시',await page.locator('.rt-configurator-view').isHidden()&&await page.locator('.rt-pg-gridcard').count()===33);
    await page.click('[data-product-filter="extender"]');
    check('전송기 분류는 16종(0.64 SPX-TX/RX, 0.72 XDM-PSU, 0.157 SPX-R6, 0.223 XDM-MR4S 포함)',await page.locator('.rt-pg-gridcard').count()===16);
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
    // 0.178 가로 스크롤 그림의 "더 있음" 그러데이션은 스크롤하지 않는 바깥 틀(.rt-pg-svg-frame)에 붙는다(스크롤 칸 안에 두면 밀 때 가운데 세로 띠가 남음).
    check('가로 스크롤 그림은 모두 바깥 틀(.rt-pg-svg-frame) 안에 있고 스크롤 칸에는 그러데이션 표시가 없음(0.178)',await page.evaluate(()=>{const w=[...document.querySelectorAll('.rt-pg-svg-wrap')];return w.length>0&&w.every(e=>e.parentElement.classList.contains('rt-pg-svg-frame')&&!e.classList.contains('rt-has-more'))}));
    await page.goBack();
    await page.waitForSelector('.rt-pg-gridcard');
    check('제품정보 목록의 첫 카드는 XDM(0.125, 사용자 요청 "XDM이 처음으로 나오게해")',(await page.locator('.rt-pg-gridcard').first().getAttribute('href'))==='#products/xdm');
    check('뒤로가기로 상세에서 제품 목록으로 돌아감',new URL(page.url()).hash==='#products'&&await page.locator('.rt-pg-gridcard').count()===33);
    // 0.154 제품정보 프레임 정면·후면 팝업: 위아래로 쌓일 때 두 그림의 가로폭이 같아야 한다(사용자 요청 2026-09-29).
    await page.goto(`${home}#products/spx`,{waitUntil:'networkidle'});
    await page.click('[data-pg-frame="SPX-M1620"]');
    await page.waitForFunction(()=>[...document.querySelectorAll('.rt-frame-info-face img')].length===2&&[...document.querySelectorAll('.rt-frame-info-face img')].every(image=>image.complete&&image.naturalWidth>0),null,{timeout:10000}).catch(()=>{});
    const faceWidths=await page.$$eval('.rt-frame-info-face img',images=>images.map(image=>Math.round(image.getBoundingClientRect().width)));
    check('SPX-M1620 정면·후면 팝업의 두 그림 가로폭이 같음(0.154)',faceWidths.length===2&&Math.abs(faceWidths[0]-faceWidths[1])<=1,JSON.stringify(faceWidths));
    await page.keyboard.press('Escape');
    // 0.178 좌우로 놓이는 프레임(SPX-M2472 등)은 정면·후면 그림 높이가 같아야 한다(사용자 요청 2026-09-29 "모듈러 매트릭스 프레임 상하 높이 안맞는문제").
    await page.click('[data-pg-frame="SPX-M2472"]');
    await page.waitForFunction(()=>document.querySelector('.rt-frame-info-duo.rt-frame-info-row'),null,{timeout:10000}).catch(()=>{});
    const faceHeights=await page.$$eval('.rt-frame-info-face img',images=>images.map(image=>Math.round(image.getBoundingClientRect().height)));
    check('SPX-M2472 정면·후면 팝업(좌우 배치)의 두 그림 높이가 같음(0.178)',faceHeights.length===2&&faceHeights[0]>40&&Math.abs(faceHeights[0]-faceHeights[1])<=1,JSON.stringify(faceHeights));
    await page.keyboard.press('Escape');
    // 0.178 카드 라인업 썸네일은 휴대폰 브라우저 다크 모드에서도 어둡게 바뀌지 않는다(color-scheme:only light).
    check('카드 라인업 썸네일이 강제 다크 모드에서 빠짐(0.178)',await page.$eval('.rt-pg-cardrow img',img=>getComputedStyle(img).colorScheme.includes('only')));
    // 0.121·0.123·0.130 HD-D102U Rack마운트: 02 Port Map은 XDM-PSU 그림 방식의 정면 그래픽 이미지 1장만 두고(윗면·옆면은 삭제, 사용자 요청 2026-09-29) 실도면(치수 도면) 카드는 없다. HD-D102U와 관련 제품 링크.
    await page.goto(`${home}#products/hd-d102u-rack`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const rack=await page.evaluate(()=>({maps:document.querySelectorAll('.rt-pg-panel svg[aria-label$="단자 지도"]').length,drawing:!!document.querySelector('.rt-pg-drawing'),link:[...document.querySelectorAll('.rt-pg-hint a')].some(a=>a.getAttribute('href')==='#products/hd-d102u')}));
    check('HD-D102U Rack마운트 상세에 정면 그래픽 이미지 1장(윗면·옆면 없음)과 HD-D102U 관련 제품 링크가 보이고 실도면 카드는 없음',rack.maps===1&&!rack.drawing&&rack.link,JSON.stringify(rack));
    // 0.132 02 프레임 선택 미리보기 그림 크기는 랙 높이(U) 순서를 따른다(사용자 요청 2026-09-29 "VDM-8X는 다소 크다 … 나머지 VDM프레임 크기는 다소 작아서 … 적정한 크기 판단해서", "SPX, XDM도 비슷한 컨셉으로").
    // 제품군 목록은 작은 프레임부터 큰 프레임 순서라서, 그림 높이가 목록 순서대로 줄어들지 않아야 한다(예전에는 가장 작은 VDM-8X·SPX-M810·XDM-12가 패널 폭을 채워 가장 크게 보였다).
    await page.click('a[data-view-tab="configurator"]');
    await page.click('.rt-step[data-jump="0"]');
    await page.waitForSelector('button[data-family="VDM"]');
    const frameHeights={};
    for(const fam of ['VDM','SPX','XDM']){
      await page.click(`button[data-family="${fam}"]`);await acceptConfirm();
      await page.click('.rt-cg-preview [data-action="preview-next"]');
      await page.waitForSelector('button[data-model]');
      frameHeights[fam]=[];
      for(const model of await page.locator('button[data-model]').evaluateAll(nodes=>nodes.map(node=>node.dataset.model))){
        await page.click(`button[data-model="${model}"]`);await acceptConfirm();
        const h=await page.evaluate(()=>{const heights=[...document.querySelectorAll('.rt-cg-preview img[data-cg-img="front"]')].map(img=>img.getBoundingClientRect().height);return heights.length?Math.round(Math.max(...heights)):null});
        if(h)frameHeights[fam].push([model,h]);
      }
      await page.click('[data-jump="0"]');
    }
    const heightsRise=Object.values(frameHeights).every(list=>list.length>=5&&list.every(([,h],i)=>i===0||h>=list[i-1][1]-3));
    // 0.137(사용자 요청 "프레임앞뒤면 좌우 크기차이 있는 제품 SPX-M1620·M810·M2472·M24120"): 정면·후면을 위아래로 보이는 프레임은 후면 그림 폭이 정면 그림 폭과 같다.
    await page.click('button[data-family="SPX"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    const spxWidths={};
    for(const model of ['SPX-M810','SPX-M1620','SPX-M2472','SPX-M24120']){
      await page.click(`button[data-model="${model}"]`);await acceptConfirm();
      await page.waitForFunction(()=>['front','rear'].every(side=>{const image=document.querySelector(`.rt-cg-preview img[data-cg-img="${side}"]`);return image&&image.complete&&image.naturalWidth>0}),null,{timeout:10000}).catch(()=>{});
      spxWidths[model]=await page.evaluate(()=>['front','rear'].map(side=>Math.round(document.querySelector(`.rt-cg-preview img[data-cg-img="${side}"]`).getBoundingClientRect().width)));
    }
    check('SPX-M810·M1620·M2472·M24120 02 미리보기에서 정면·후면 그림 폭이 같음(2px 이내)',Object.values(spxWidths).every(([front,rear])=>front>0&&Math.abs(front-rear)<=2),JSON.stringify(spxWidths));
    await page.click('[data-jump="0"]');
    check('02 프레임 선택 미리보기 그림 높이가 작은 프레임에서 큰 프레임 순서로 커짐(VDM·SPX·XDM 랙 높이 순)',heightsRise&&frameHeights.VDM[0][1]<frameHeights.VDM.at(-1)[1]&&frameHeights.SPX[0][1]<frameHeights.SPX.at(-1)[1]&&frameHeights.XDM[0][1]<frameHeights.XDM.at(-1)[1],JSON.stringify(frameHeights));
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
    // 0.195 동작 모드 줄: QMS-44UX는 MATRIX·QUAD·WALL·DUAL 네 모드를 모두, QMS-88UX는 주 출력 모드(MATRIX·WALL)만 보여 주고
    // 출력 9·10번 전용 모드(QUAD·DUAL)는 멀티뷰 묶음에만 둔다. HDS-42MU처럼 videoModes가 없으면 모드 줄이 없다(사용자 지적 2026-10-01).
    for(const [id,modes] of [['qms-44ux','MATRIX,QUAD,WALL,DUAL'],['qms-88ux','MATRIX,WALL'],['hds-42mu','']]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-pg-title');
      const mode=await page.evaluate(()=>{const svg=[...document.querySelectorAll('.rt-pg-svg-wrap svg')].find(s=>s.textContent.includes('선택 예시'));const texts=[...(svg?.querySelectorAll('text')||[])].map(t=>t.textContent);const i=texts.indexOf('동작 모드 선택');return {strip:i>=0,modes:i<0?'':texts.filter(t=>/^(MATRIX|QUAD|WALL|DUAL)$/.test(t)).join(','),desc:!!document.querySelector('.rt-pg-flow-desc')}});
      check(`${id} 신호 흐름 동작 모드 줄이 ${modes||'없음'}으로 나오고 그림 설명이 있음`,mode.strip===!!modes&&mode.modes===modes&&mode.desc,JSON.stringify(mode));
    }
    // 0.195 전송기 그림: 케이블 범례는 점선, 펼치는 그림 설명에 입력·전송·출력이 들어간다(사용자 요청 2026-10-01).
    for(const id of ['ct104-u-cr104-u','xdm-ctr100','spx-r6']){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-pg-title');
      const ext=await page.evaluate(()=>({dash:document.querySelectorAll('.rt-pg-legend .rt-pg-legend-dash').length,desc:document.querySelector('.rt-pg-flow-desc')?.textContent||''}));
      check(`${id} 전송기 신호 흐름에 점선 케이블 범례와 그림 설명이 있음`,ext.dash>=1&&/전송/.test(ext.desc)&&/디스플레이/.test(ext.desc),JSON.stringify(ext).slice(0,200));
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
    // 0.239 AMX 코드 잠금: 잠겨 있을 때는 커맨드 문자열·HEX가 보이고 AMX 코드(SEND_STRING·NetLinx)는 없다. 틀린 비밀번호는 거절하고 맞으면 열리며 다시 잠글 수 있다.
    {
      await page.goto(`${home}#products/hds-42mu`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-control .rt-ce-cmd');
      const locked=await page.evaluate(()=>{const c=document.querySelector('.rt-pg-control');return {box:!!c.querySelector('[data-ce-lockbox]'),code:!!c.querySelector('[data-ce-text="amx"]'),send:/SEND_STRING|BUTTON_EVENT/.test(c.textContent),sw:/\*000CI02O02!/.test(c.textContent),hex:!!c.querySelector('.rt-ce-hex'),copy:!!c.querySelector('[data-ce-copy="sw"]')}});
      await page.fill('.rt-pg-control [data-ce-lockform] input','틀린 비밀번호');
      await page.click('.rt-pg-control [data-ce-lockform] button[type=submit]');
      await page.waitForFunction(()=>/맞지 않습니다/.test(document.querySelector('.rt-pg-control [data-ce-lockmsg]')?.textContent||''));
      const stillLocked=await page.locator('.rt-pg-control [data-ce-lockbox]').count()>0;
      await page.fill('.rt-pg-control [data-ce-lockform] input',AMX_TEST_PASSWORD);
      await page.click('.rt-pg-control [data-ce-lockform] button[type=submit]');
      await page.waitForSelector('.rt-pg-control [data-ce-text="amx"]');
      const opened=await page.evaluate(()=>({send:/SEND_STRING dvHDS42MU/.test(document.querySelector('.rt-pg-control [data-ce-text="amx"]').textContent),serial:/SET BAUD 9600/.test(document.querySelector('.rt-pg-control [data-ce-text="amx"]').textContent)&&!/IP_CLIENT_OPEN/.test(document.querySelector('.rt-pg-control').textContent),noLanChoice:!document.querySelector('.rt-pg-control [data-ce-comm="mode"]')&&/LAN 제어는 없습니다/.test(document.querySelector('.rt-pg-control').textContent),box:!!document.querySelector('.rt-pg-control [data-ce-lockbox]')}));
      await page.click('.rt-pg-control [data-ce-relock]');
      await page.waitForSelector('.rt-pg-control [data-ce-lockbox]');
      const relocked=await page.locator('.rt-pg-control [data-ce-text="amx"]').count()===0;
      check('AMX 코드 잠금: 잠겨 있으면 커맨드·HEX·복사만 보이고 SEND_STRING은 없음, 틀린 비밀번호는 거절, 맞으면 열리고(HDS는 RS-232 전용·LAN 선택 없음) 다시 잠글 수 있음',locked.box&&!locked.code&&!locked.send&&locked.sw&&locked.hex&&locked.copy&&stillLocked&&opened.send&&opened.serial&&opened.noLanChoice&&!opened.box&&relocked,JSON.stringify({locked,stillLocked,opened,relocked}));
      // XDM: "내 AMX 구성"은 잠겨도 담기·목록은 되고, 코드·복사·파일 저장은 잠금 뒤에만 보인다. 설정 명령의 SEND_STRING 줄도 잠겨 있다.
      await page.goto(`${home}#products/xdm`,{waitUntil:'networkidle'});
      await page.evaluate(()=>{try{localStorage.removeItem('rtcom.amxBasket.xdm.v1')}catch{}});
      await page.reload({waitUntil:'networkidle'});
      await page.waitForSelector('#rt-control [data-ce-basket]');
      await page.selectOption('#rt-control [data-ce-bsel]','conn');
      await page.locator('#rt-control [data-ce-badd]').click();
      const xdm=await page.evaluate(()=>{const c=document.querySelector('#rt-control');const b=c.querySelector('[data-ce-basket]');return {rows:b.querySelectorAll('.rt-ce-bklist li').length,boxes:c.querySelectorAll('[data-ce-lockbox]').length,code:!!b.querySelector('[data-ce-bkcode]'),copy:!!b.querySelector('[data-ce-bk="copy"],[data-ce-bk="download"]'),clear:!!b.querySelector('[data-ce-bk="clear"]'),send:/SEND_STRING|BUTTON_EVENT/.test(c.textContent),cmd:/\*255CI002O001-005!/.test(c.textContent),add:!!c.querySelector('[data-ce-badd]')}});
      check('XDM AMX 코드 잠금: 담기·담은 목록·커맨드는 보이고, 시작 코드·SEND_STRING·내 AMX 구성 코드·복사·파일 저장은 잠김',xdm.rows===1&&xdm.boxes===3&&!xdm.code&&!xdm.copy&&xdm.clear&&!xdm.send&&xdm.cmd&&xdm.add,JSON.stringify(xdm));
      // 이 탭에서 잠금을 열어 두면(sessionStorage) 아래 AMX 코드 검사가 그대로 이어진다.
      await page.fill('#rt-control [data-ce-basket] [data-ce-lockform] input',AMX_TEST_PASSWORD);
      await page.click('#rt-control [data-ce-basket] [data-ce-lockform] button[type=submit]');
      await page.waitForSelector('#rt-control [data-ce-bkcode]');
      const xdmOpen=await page.evaluate(()=>({boxes:document.querySelectorAll('#rt-control [data-ce-lockbox]').length,start:!!document.querySelector('#rt-control [data-ce-text="amx"]'),line:/SEND_STRING dvXDM/.test(document.querySelector('#rt-control [data-ce-bout]').textContent),dl:!!document.querySelector('#rt-control [data-ce-bk="download"]')}));
      check('XDM AMX 코드 잠금 해제: 시작 코드·SEND_STRING 줄·내 AMX 구성 코드·복사·파일 저장이 한꺼번에 열림',xdmOpen.boxes===0&&xdmOpen.start&&xdmOpen.line&&xdmOpen.dl,JSON.stringify(xdmOpen));
      // 0.239 통신 방식: LAN이 기본(IP_CLIENT_OPEN), 포트가 매뉴얼에 없는 XDM은 "확인 필요", IP·포트를 입력하면 그 자리에서 코드가 바뀌고 포커스가 유지되며, RS-232를 고르면 SET BAUD가 나온다.
      const lan0=await page.locator('#rt-control [data-ce-text="amx"]').innerText();
      await page.locator('#rt-control [data-ce-start] [data-ce-comm="ip"]').fill('10.1.2.3');
      await page.locator('#rt-control [data-ce-start] [data-ce-comm="port"]').focus();
      await page.keyboard.type('4001');
      const lan1=await page.locator('#rt-control [data-ce-text="amx"]').innerText();
      const focused=await page.evaluate(()=>document.activeElement?.dataset?.ceComm||'');
      const synced=await page.locator('#rt-control [data-ce-basket] [data-ce-comm="ip"]').inputValue();
      const bk=await page.locator('#rt-control [data-ce-bkcode]').innerText();
      await page.selectOption('#rt-control [data-ce-start] [data-ce-comm="mode"]','serial');
      const ser=await page.locator('#rt-control [data-ce-text="amx"]').innerText();
      const hidden=await page.locator('#rt-control [data-ce-start] .rt-ce-comm-lan').evaluate(e=>e.hidden);
      await page.selectOption('#rt-control [data-ce-start] [data-ce-comm="mode"]','lan');
      await page.goto(`${home}#products/spx`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-control [data-ce-text="amx"]');
      const spxLan=await page.locator('#rt-control [data-ce-text="amx"]').innerText();
      check('AMX 통신 방식: LAN이 기본(IP_CLIENT_OPEN)이고 XDM은 알티컴 회신 포트 23·동시 접속 1개 안내, IP·포트 입력이 그 자리에서 코드에 반영되고 포커스 유지, 내 AMX 구성과 동기, RS-232 선택 시 SET BAUD, SPX도 포트 23',/IP_CLIENT_OPEN\(dvXDM\.PORT/.test(lan0)&&/nDevicePort = 23 .*알티컴 회신/.test(lan0)&&/동시 접속 1개/.test(lan0)&&/'10\.1\.2\.3'/.test(lan1)&&/nDevicePort = 4001/.test(lan1)&&focused==='port'&&synced==='10.1.2.3'&&/nDevicePort = 4001/.test(bk)&&/SET BAUD 115200,N,8,1/.test(ser)&&!/IP_CLIENT_OPEN/.test(ser)&&hidden&&/nDevicePort = 23 .*알티컴 회신.*SPX 매뉴얼 46쪽/.test(spxLan),JSON.stringify({lan0:lan0.slice(0,60),focused,synced,hidden,spx:spxLan.includes('= 23')}));
      await page.evaluate(()=>{try{localStorage.removeItem('rtcom.amxBasket.xdm.v1')}catch{}});
    }
    // 0.229 HDS-42MU "AMX 통합 제어 커맨드 예시": 매뉴얼 9쪽 예시(*000CI02O02!, *000V54!)가 처음에 나오고, 입력·출력·볼륨을 바꾸면 커맨드와 AMX 코드가 바뀐다.
    await page.goto(`${home}#products/hds-42mu`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-control .rt-ce-cmd');
    const ceText=sel=>page.locator(`.rt-pg-control [data-ce-text="${sel}"]`).innerText();
    const ce0={sw:(await ceText('sw')).replace(/\s+/g,' '),vol:(await ceText('vol')).replace(/\s+/g,' '),amx:await ceText('amx')};
    check('HDS-42MU AMX 커맨드 카드가 매뉴얼 예시 *000CI02O02!·*000V54!와 AMX SEND_STRING을 보여 줌',/\*000CI02O02!/.test(ce0.sw)&&/\*000V54!/.test(ce0.vol)&&/SEND_STRING dvHDS42MU,"'\*000CI02O02!',\$0D"/.test(ce0.amx),JSON.stringify(ce0).slice(0,200));
    await page.click('.rt-pg-control [data-ce-cell="4,1"]');
    await page.fill('.rt-pg-control [data-ce-field="db"]','-3');
    await page.dispatchEvent('.rt-pg-control [data-ce-field="db"]','change');
    const ce1={grid:await page.locator('.rt-pg-control .rt-ce-cell').count(),cell:await page.locator('.rt-pg-control [data-ce-cell="4,1"]').innerText(),sw:(await ceText('sw')).replace(/\s+/g,' '),vol:(await ceText('vol')).replace(/\s+/g,' '),amx:await ceText('amx')};
    check('HDS-42MU AMX 커맨드 카드: 입력 4×출력 2 라우팅 표 8칸에서 IN 4 → OUT 1을 누르면 *000CI04O01!과 -3dB(*000V44!)·AMX 코드가 바뀜',ce1.grid===8&&/\*000CI04O01!/.test(ce1.cell)&&/\*000CI04O01!/.test(ce1.sw)&&/\*000V44!/.test(ce1.vol)&&/\*000CI04O01!/.test(ce1.amx),JSON.stringify(ce1).slice(0,300));
    await page.selectOption('.rt-pg-control [data-ce-field="input"]','3');
    await page.selectOption('.rt-pg-control [data-ce-field="output"]','2');
    const ce2={sel:await page.locator('.rt-pg-control .rt-ce-cell.is-sel').getAttribute('data-ce-cell'),sw:(await ceText('sw')).replace(/\s+/g,' ')};
    check('HDS-42MU AMX 커맨드 카드: 입력·출력 드롭다운을 바꾸면 표의 선택 칸과 커맨드(*000CI03O02!)가 같이 바뀜',ce2.sel==='3,2'&&/\*000CI03O02!/.test(ce2.sw),JSON.stringify(ce2));
    const ceOver=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,idx:document.querySelector('.rt-pg-control .rt-pg-idx')?.textContent}));
    check('HDS-42MU AMX 커맨드 카드 번호는 08이고 가로 넘침이 없음',ceOver.idx==='08'&&!ceOver.overflow,JSON.stringify(ceOver));
    // 0.229 HDS-21U 같은 카드: 입력 2×출력 1 표 2칸, 매뉴얼 예시 *000CI02O01!, 뮤트 *000V00!(표의 Mute 칸 값 0), AMX 버튼 3개.
    await page.goto(`${home}#products/hds-21u`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-control .rt-ce-cmd');
    const ce21={cells:await page.locator('.rt-pg-control .rt-ce-cell').count(),sw:(await ceText('sw')).replace(/\s+/g,' '),mute:(await ceText('mute')).replace(/\s+/g,' '),amx:await ceText('amx'),idx:await page.locator('.rt-pg-control .rt-pg-idx').innerText(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)};
    check('HDS-21U AMX 커맨드 카드: 표 2칸·*000CI02O01!(IN 2 → OUT 1)·뮤트 *000V00!·AMX 버튼 3개·가로 넘침 없음',ce21.cells===2&&/\*000CI02O01!/.test(ce21.sw)&&/\*000V00!/.test(ce21.mute)&&(ce21.amx.match(/BUTTON_EVENT/g)||[]).length===3&&!ce21.overflow,JSON.stringify(ce21).slice(0,260));
    // 0.231 QMS-88UX·QMS-44UX 같은 카드(매트릭스 표): 매뉴얼 예시 경로가 처음 선택돼 있고, 칸을 누르면 경로가 합쳐지고, "모든 출력에 연결"은 88UX 범위(O01-10)·44UX A 명령이 된다.
    for(const [id,first,addCell,after,allCmd,presets] of [['qms-88ux','*255CI04O01,I02O02!','1,3','*255CI04O01,I02O02,I01O03!','*255CI01O01-10!',3],['qms-44ux','*01CI04O01,I02O02!','1,3','*01CI04O01,I02O02,I01O03!','*01AI01!',0]]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-control .rt-ce-cmd');
      const route=()=>page.locator('.rt-pg-control [data-ce-text="route"]').innerText().then(t=>t.replace(/\s+/g,' '));
      const r0=await route();
      await page.click(`.rt-pg-control [data-ce-cell="${addCell}"]`);
      const r1=await route();
      await page.selectOption('.rt-pg-control [data-ce-field="allIn"]','1');
      await page.click('.rt-pg-control [data-ce-act="all"]');
      const r2=await route();
      const info=await page.evaluate(()=>({cells:document.querySelectorAll('.rt-pg-control .rt-ce-cell').length,presets:document.querySelectorAll('.rt-pg-control [data-ce-text^="preset-"]').length,pc:document.querySelector('.rt-pg-control [data-ce-text="preset-call"]')?.textContent.replace(/\s+/g,' ')||'',amx:document.querySelector('.rt-pg-control [data-ce-text="amx"]').textContent,idx:document.querySelector('.rt-pg-control .rt-pg-idx').textContent,overflow:document.documentElement.scrollWidth>innerWidth}));
      await page.selectOption('.rt-pg-control [data-ce-comm="mode"]','serial');
      const serialAmx=await page.locator('.rt-pg-control [data-ce-text="amx"]').innerText();
      check(`${id} AMX 커맨드 카드: 매뉴얼 예시 ${first}, 칸 추가 ${after}, 모든 출력에 ${allCmd}, 프리셋 ${presets}개, AMX 코드는 LAN이 기본이고 RS-232 선택 시 115200, 가로 넘침 없음`,r0.includes(first)&&r1.includes(after)&&r2.includes(allCmd)&&info.presets===presets&&(presets?info.pc.includes('*255PC01!'):true)&&/IP_CLIENT_OPEN/.test(info.amx)&&/SET BAUD 115200,N,8,1/.test(serialAmx)&&info.cells>=16&&!info.overflow,JSON.stringify({r0,r1,r2,...info,amx:undefined}).slice(0,320));
    }
    // 0.234 QMS 설정 명령 패널(명령 빌더): 명령을 고르고 값을 넣으면 매뉴얼 예시와 같은 명령이 만들어진다.
    for(const [id,steps] of [['qms-88ux',[['res','*255OSO01-10H10!'],['wall','*255OWO01-06M13H02V03O01O02O03O04O05O06!'],['mv','*255QM13L01S00!'],['tp','*255OTO01-04M06!']]],['qms-44ux',[['wm','*01WM01!'],['wmw','*01WM02P21!'],['tc','*01TCO01S02!'],['baud','*01@05!']]]]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-control [data-ce-bsel]');
      const seen=[];
      for(const [bid,expect] of steps){
        await page.selectOption('.rt-pg-control [data-ce-bsel]',bid);
        const text=(await page.locator('.rt-pg-control [data-ce-bout] .rt-ce-cmd').first().innerText()).replace(/\s+/g,' ');
        seen.push([bid,text.includes(expect)]);
      }
      let edited='';
      if(id==='qms-88ux'){
        await page.selectOption('.rt-pg-control [data-ce-bsel]','res');
        await page.fill('.rt-pg-control [data-ce-bp="out"]','4,8');
        await page.selectOption('.rt-pg-control [data-ce-bp="res"]','09');
        edited=(await page.locator('.rt-pg-control [data-ce-bout] .rt-ce-cmd').first().innerText()).replace(/\s+/g,' ');
      }
      const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      check(`${id} 설정 명령 패널: ${steps.map(x=>x[1]).join(' · ')}${id==='qms-88ux'?' · 값 직접 입력 *255OSO04O08H09!':''} 가 만들어지고 가로 넘침 없음`,seen.every(x=>x[1])&&(id!=='qms-88ux'||edited.includes('*255OSO04O08H09!'))&&!over,JSON.stringify({seen,edited,over}).slice(0,260));
    }
    // 0.245 VDM 시리즈 "07 쿼드뷰 시뮬레이터"(사용자 요청 2026-10-17 "VDM QOS4S-U 카드를 통해서 분할화면 연출이 가능한데 … 커맨드 제어와 화면 예시"): 레이아웃 8종 도해,
    // 레이아웃을 고르면 칸 수와 OQ 명령이 바뀌고(L07 → 2칸·*255OQO01L07!), 출력 번호·타이밍을 바꾸면 명령이 따라가며, 입력 연결 명령을 끌 수 있고,
    // AMX 구성에 담으면 아래 08 카드 "내 AMX 구성"에 쌓인다. QOS4S-U 카드 상세 팝업과 02 신호 구성 칸에서 레이아웃 팝업이 열린다.
    {
      await page.goto(`${home}#products/vdm`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-quad-sim [data-qv-layout]');
      const text=()=>page.locator('#rt-quad-sim [data-qv-cmd]').innerText().then(t=>t.replace(/\s+/g,' '));
      const cells=()=>page.locator('#rt-quad-sim .rt-qv-preview svg rect.rt-qv-cell').count();
      const first={idx:await page.locator('#rt-quad-sim .rt-pg-idx').textContent(),n:await page.locator('#rt-quad-sim [data-qv-layout]').count(),cells:await cells(),cmd:await text(),btn:await page.locator('[data-scroll-to="rt-quad-sim"]').count()};
      await page.click('#rt-quad-sim [data-qv-layout="L07"]');
      const side={cells:await cells(),cmd:await text(),labels:await page.locator('#rt-quad-sim .rt-qv-preview svg text').allTextContents()};
      await page.locator('#rt-quad-sim [data-qv="out"]').fill('2');await page.locator('#rt-quad-sim [data-qv="out"]').blur();await page.selectOption('#rt-quad-sim [data-qv="timing"]','T17');
      const edited=await text();
      await page.locator('#rt-quad-sim [data-qv-in="1"]').fill('7');await page.locator('#rt-quad-sim [data-qv-in="1"]').blur();
      const inputs=await text();
      await page.uncheck('#rt-quad-sim [data-qv="withRoute"]');
      const noRoute=await text();
      await page.click('#rt-quad-sim [data-qv-amx]');
      const basketText=await page.locator('#rt-control [data-ce-basket]').innerText();
      const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      check('VDM "07 쿼드뷰 시뮬레이터": 레이아웃 8종·기본 쿼드뷰 4칸과 입력 연결 4줄+타이밍+레이아웃 6줄, 상단 버튼',first.idx==='07'&&first.n===8&&first.cells===4&&first.btn===1&&first.cmd.includes('*255CI01O05!')&&first.cmd.includes('*255OQO01T00!')&&first.cmd.includes('*255OQO01L05!'),JSON.stringify(first));
      check('쿼드뷰 시뮬레이터: L07(좌우)을 고르면 2칸·입력 2줄·L07 명령이 나오고, 출력 2·타이밍 T17·C2 입력 7을 따라가며, 입력 연결을 끄면 OQ 2줄만 남음',side.cells===2&&side.labels.join()==='IN1,IN2'&&side.cmd.includes('*255OQO01L07!')&&!side.cmd.includes('CI03')&&edited.includes('*255OQO02T17!')&&edited.includes('*255OQO02L07!')&&inputs.includes('*255CI07O06!')&&!noRoute.includes('CI0')&&noRoute.includes('*255OQO02L07!'),JSON.stringify({side,edited:edited.slice(0,120),inputs:inputs.slice(0,120),noRoute}));
      check('쿼드뷰 시뮬레이터: AMX 구성에 담으면 아래 "내 AMX 구성"에 OQ 명령이 쌓이고 가로 넘침이 없음',basketText.includes('*255OQO02L07!')&&basketText.includes('*255OQO02T17!')&&!over,JSON.stringify({basket:basketText.slice(0,160),over}));
      await page.click('[data-pg-card="QOS4S-U"]');
      const cta=await page.locator('dialog[open] .rt-feature-cta [data-card-feature="vdm-quadview"]').count();
      await page.click('dialog[open] [data-card-feature="vdm-quadview"]');
      const pop=await page.evaluate(()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();return {title:d.querySelector('h3').textContent,layouts:d.querySelectorAll('.rt-qv-grid .rt-hos-layout').length,figs:d.querySelectorAll('.rt-qv-grid svg rect.rt-qv-cell').length,note:/알티컴 확인 대기/.test(d.textContent),go:!!d.querySelector('[data-qv-go]')}});
      await page.click('dialog[open] [data-qv-go]');
      const closed=await page.locator('dialog[open]').count();
      const sigBtn=await page.locator('svg [data-card-feature="vdm-quadview"][role="button"]').count();
      check('VDM QOS4S-U 카드 상세·02 신호 구성에서 쿼드뷰 레이아웃 팝업(8종·도해 칸 18개·알티컴 확인 대기 안내)이 열리고 "커맨드 만들기"는 팝업을 닫고 시뮬레이터로 이동함',cta===1&&pop.title==='VDM-QOS4S-U 쿼드뷰 레이아웃'&&pop.layouts===8&&pop.figs===18&&pop.note&&pop.go&&closed===0&&sigBtn===1,JSON.stringify({cta,pop,closed,sigBtn}));
    }
    // 0.245(사용자 요청 2026-10-17 "QMS-44UX 쿼드 뷰 입력 번호 표시 … 진행해줘"): QMS-44UX QUAD 카드에 칸 번호 안내 한 줄(출력 기준, 기본 입력 1~4번). 88UX·듀얼에는 이 줄이 없다.
    {
      await page.goto(`${home}#products/qms-44ux`,{waitUntil:'networkidle'});
      await page.waitForSelector('[data-layout-cellnote]');
      const note=await page.evaluate(()=>({n:document.querySelectorAll('[data-layout-cellnote]').length,inQuad:!!document.querySelector('.rt-pg-vmode-card [data-layout-cellnote]')&&/QUAD/.test(document.querySelector('[data-layout-cellnote]').closest('.rt-pg-vmode-card').textContent),text:document.querySelector('[data-layout-cellnote]').textContent}));
      await page.goto(`${home}#products/qms-88ux`,{waitUntil:'networkidle'});
      await page.waitForSelector('[data-layout-chip]');
      const none=await page.locator('[data-layout-cellnote]').count();
      check('QMS-44UX QUAD 카드에만 "칸 번호는 출력 번호 기준·기본 입력 1~4번" 안내 한 줄이 있음',note.n===1&&note.inQuad&&/출력 번호 기준/.test(note.text)&&/입력 1~4번/.test(note.text)&&none===0,JSON.stringify({note,none}));
    }
    // 0.235 모듈러 매트릭스 시리즈(XDM·SPX·VDM) AMX 커맨드 카드: 명령 묶음 선택, 예시 명령, VDM 번호 자릿수(2·3자리), SPX 문장형(Enter 없음).
    for(const [id,idx,steps] of [
      ['xdm','08',[['conn','*255CI002O001-005!'],['osdi','*255IDI001M01S"Camera 1"!'],['os','*255OSO001O002H11!'],['sys','*255?SID!']]],
      ['spx','07',[['conn','*255CI001O001-007!'],['ow','*255OWO001-004M09H02V02O001O002O003O004!'],['t_av','s in 1 av out 2!'],['t_wall','s wall 2 hdiv 3 vdiv 3 time 13 out 13!']]],
      ['vdm','08',[['c','*255CI01O01-07!'],['stat','*255?O07!'],['ot','*255OTO01-09T05P05!'],['oz','*255OZO01,O02!']]]]){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('#rt-control [data-ce-bsel]');
      const seen=[];
      for(const [bid,expect] of steps){
        await page.selectOption('#rt-control [data-ce-bsel]',bid);
        const text=(await page.locator('#rt-control [data-ce-bout] .rt-ce-cmd').first().innerText()).replace(/\s+/g,' ');
        seen.push([bid,text.includes(expect)]);
      }
      let extra='';
      if(id==='vdm'){
        await page.selectOption('#rt-control [data-ce-bvariant]','3');
        await page.selectOption('#rt-control [data-ce-bsel]','stat');
        extra=(await page.locator('#rt-control [data-ce-bout] .rt-ce-cmd').first().innerText()).replace(/\s+/g,' ');
      }
      if(id==='spx'){
        await page.selectOption('#rt-control [data-ce-bsel]','t_av');
        extra=await page.locator('#rt-control [data-ce-bout] .rt-ce-hex').innerText();
      }
      const info=await page.evaluate(()=>({idx:document.querySelector('#rt-control .rt-pg-idx').textContent,btn:!!document.querySelector('[data-scroll-to="rt-control"]'),sim:!!document.querySelector('#rt-layout-sim'),over:document.documentElement.scrollWidth>innerWidth,groups:document.querySelectorAll('#rt-control [data-ce-bsel] optgroup').length}));
      const extraOk=id==='vdm'?extra.includes('*255?O007!'):id==='spx'?/Enter가 적혀 있지 않아/.test(extra):true;
      check(`${id} AMX 커맨드 카드(${idx}): 명령 ${steps.map(x=>x[0]).join('·')} 예시 일치${id==='vdm'?' · 3자리 번호 *255?O007!':''}${id==='spx'?' · 문장형은 Enter 없음':''} · 묶음 선택·가로 넘침 없음`,seen.every(x=>x[1])&&extraOk&&info.idx===idx&&info.btn&&info.groups>=1&&!info.over&&(id!=='xdm'||info.sim),JSON.stringify({seen,extra:extra.slice(0,80),info}).slice(0,300));
    }
    // 0.239 XDM "내 AMX 구성": 07 시뮬레이터 커맨드와 08 설정 명령을 담아 한 개의 AMX 코드로 만들고, 순서 바꾸기·저장·파일 저장을 확인한다.
    {
      await page.goto(`${home}#products/xdm`,{waitUntil:'networkidle'});
      await page.evaluate(()=>{try{localStorage.removeItem('rtcom.amxBasket.xdm.v1')}catch{}});
      await page.reload({waitUntil:'networkidle'});
      await page.waitForSelector('#rt-control [data-ce-basket]');
      const emptyOk=/아직 담은 명령이 없습니다/.test(await page.locator('#rt-control [data-ce-basket]').innerText());
      await page.locator('#rt-layout-sim [data-ls-amx]').first().click();
      await page.selectOption('#rt-control [data-ce-bsel]','conn');
      await page.locator('#rt-control [data-ce-badd]').click();
      const rows=await page.locator('#rt-control .rt-ce-bklist li').count();
      const first=(await page.locator('#rt-control .rt-ce-bklist li code').first().innerText());
      const code1=await page.locator('#rt-control [data-ce-bkcode]').innerText();
      await page.locator('#rt-control [data-ce-bk="down"]').first().click();
      const moved=(await page.locator('#rt-control .rt-ce-bklist li code').first().innerText());
      const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#rt-control [data-ce-bk="download"]').click()]);
      await page.reload({waitUntil:'networkidle'});
      const keep=await page.locator('#rt-control .rt-ce-bklist li').count();
      const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      await page.locator('#rt-control [data-ce-bk="clear"]').click();
      const cleared=/아직 담은 명령이 없습니다/.test(await page.locator('#rt-control [data-ce-basket]').innerText());
      check('XDM 내 AMX 구성: 시뮬레이터·설정 명령을 담아 버튼 순서대로 AMX 코드가 만들어지고, 순서 바꾸기·파일 저장·새로고침 유지·비우기가 된다',emptyOk&&rows===2&&first.startsWith('*255OW')&&/BUTTON_EVENT\[dvTP,2\]/.test(code1)&&/SEND_STRING dvXDM,"'\*255OW/.test(code1)&&moved.startsWith('*255C')&&/\.axs$/.test(dl.suggestedFilename())&&keep===2&&cleared&&!over,JSON.stringify({emptyOk,rows,first:first.slice(0,20),moved:moved.slice(0,20),file:dl.suggestedFilename(),keep,cleared,over}));
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
    // 0.157 SPX-R6(사용자 제공 사양서): 전면·후면 평면 그림 단자 지도 2장(번호 5·4개), 모듈 6개 → SPX-RX 6대 Signal Flow, 로고 사진 없음.
    await page.goto(`${home}#products/spx-r6`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const r6=await page.evaluate(()=>{const s=[...document.querySelectorAll('section')].find(s=>/Port Map/i.test(s.querySelector('h2')?.textContent||''));const flow=[...document.querySelectorAll('.rt-pg-svg-wrap svg')].map(x=>x.textContent).join(' ');return {title:document.querySelector('#rt-pg-title')?.textContent,front:!!s?.innerHTML.includes('spx-r6-front-art.webp'),rear:!!s?.innerHTML.includes('spx-r6-rear-art.webp'),ports:[...(s?.querySelectorAll('.rt-pg-ports')||[])].map(x=>x.children.length),rx:(flow.match(/SPX-RX/g)||[]).length,module6:flow.includes('모듈 6'),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth,diagramBtn:!!document.querySelector('[data-open-diagram]'),diagram:!!document.querySelector('.rt-pg-diagram-photo img')?.getAttribute('src')?.includes('spx-r6-diagram.webp')}});
    check('SPX-R6 상세에 전면·후면 그림 단자 지도(번호 5·4개)와 모듈 6개 → SPX-RX 6대 신호 흐름, 로고를 지운 제조사 원본 다이어그램(0.158)이 나오고 깨진 사진이 없음',/SPX-R6/.test(r6.title||'')&&r6.front&&r6.rear&&r6.ports.join()==='5,4'&&r6.rx>=6&&r6.module6&&r6.broken===0&&!r6.overflow&&r6.diagramBtn&&r6.diagram,JSON.stringify(r6));
    // 0.200 SPX-R6 03 Signal Flow: TX 구성(기본)·RX 구성 버튼으로 바꿔 보고, RX 구성은 소스 → SPX-TX 6대 → 모듈 CAT IN → HDMI OUT → 디스플레이로 그린다.
    const r6Flow=await page.evaluate(()=>{const box=document.querySelector('.rt-pg-flow-modes');const face=k=>box?.querySelector(`[data-pm-face="${k}"]`);const before={tx:!face('tx')?.hidden,rx:!face('rx')?.hidden};box?.querySelector('[data-pm-side="rx"]')?.click();const rxText=face('rx')?.querySelector('svg')?.textContent||'';return {before,after:{tx:!face('tx')?.hidden,rx:!face('rx')?.hidden},tx:(rxText.match(/SPX-TX/g)||[]).length,catIn:rxText.includes('CAT IN → HDMI OUT'),pressed:box?.querySelector('[data-pm-side="rx"]')?.getAttribute('aria-pressed'),overflow:document.documentElement.scrollWidth>innerWidth}});
    check('SPX-R6 03 Signal Flow는 TX 구성이 기본이고 RX 구성 버튼을 누르면 SPX-TX 6대 → 모듈 CAT IN → HDMI OUT 그림으로 바뀜',r6Flow.before.tx&&!r6Flow.before.rx&&!r6Flow.after.tx&&r6Flow.after.rx&&r6Flow.tx>=6&&r6Flow.catIn&&r6Flow.pressed==='true'&&!r6Flow.overflow,JSON.stringify(r6Flow));
    // 0.223 XDM-MR4S: 사용자 제공 실물 사진(앞면·뒷면) 단자 지도와 장착 카드(XDM-CTR100·XDM-FT101/FR101) 관련 제품 연결(사용자 요청 2026-10-16).
    await page.goto(`${home}#products/xdm-mr4s`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const mr4=await page.evaluate(()=>{const s=[...document.querySelectorAll('section')].find(s=>/Port Map/i.test(s.querySelector('h2')?.textContent||''));const links=[...document.querySelectorAll('a[href*="#products/"]')].map(a=>a.getAttribute('href'));return {title:document.querySelector('#rt-pg-title')?.textContent,front:!!s?.innerHTML.includes('xdm-mr4s-front.webp'),rear:!!s?.innerHTML.includes('xdm-mr4s-rear.webp'),ports:[...(s?.querySelectorAll('.rt-pg-ports')||[])].map(x=>x.children.length),ctr:links.some(h=>h.endsWith('#products/xdm-ctr100')),ft:links.some(h=>h.endsWith('#products/xdm-ft101-fr101')),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth}});
    check('XDM-MR4S 상세에 앞면·뒷면 실물 사진 단자 지도(번호 5·5개)와 XDM-CTR100·XDM-FT101/FR101 관련 제품 링크가 나오고 깨진 사진이 없음',/XDM-MR4S/.test(mr4.title||'')&&mr4.front&&mr4.rear&&mr4.ports.join()==='5,5'&&mr4.ctr&&mr4.ft&&!mr4.broken&&!mr4.overflow,JSON.stringify(mr4));
    // 0.227 XDM-MR4S 03 Signal Flow(매트릭스 카드 ↔ MR4S 카드 4장)와 구성기 04 전송기 "XDM-MR4S 랙 장착" 스위치(사용자 결정 2026-10-16).
    const mr4Flow=await page.evaluate(()=>{const w=document.querySelector('.rt-pg-svg-wrap[aria-label^="XDM-MR4S Signal Flow"]');const t=w?.textContent||'';return {svg:!!w,cards:['XDM-FIS100','XDM-FOS100','XDM-CIS100','XDM-COS100'].every(c=>t.includes(c)),power:/원격 전원 공급 불가/.test(t)}});
    check('XDM-MR4S 03 Signal Flow에 매트릭스 카드 4종과 MR4S 카드 줄, 원격 전원 공급 불가 안내가 나옴',mr4Flow.svg&&mr4Flow.cards&&mr4Flow.power,JSON.stringify(mr4Flow));
    {
      const st={step:3,maxStep:3,family:'XDM',model:'XDM-12',requirements:{inputs:[],outputs:[]},placements:{'in-1':'XDM-CIS100','out-1':'XDM-COS100'},physicalSlots:{status:'unknown',slots:[]},portAssignments:{},links:{'in-1':{device:'XDM-CTR100 · TX',count:4,distance:'30'},'out-1':{device:'XDM-CTR100 · RX',count:4,distance:'30'}},slot:'in-1',format:'PDF'};
      await page.goto(home,{waitUntil:'networkidle'});
      await page.evaluate(s=>{localStorage.setItem('rtcom.configuration.v1',JSON.stringify({schemaVersion:3,catalogVersion:RtCore.catalogVersion,state:RtCore.checkState({...s,portAssignments:RtCore.syncPorts(s)})}))},st);
      await page.reload({waitUntil:'networkidle'});
      const before=await page.evaluate(()=>({sw:document.querySelector('[data-mr4s-toggle]')?.getAttribute('aria-checked'),power:!!document.querySelector('.rt-power-notice')}));
      await page.locator('[data-mr4s-toggle]').click();
      const after=await page.evaluate(()=>{const st=JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state;const rows=RtCore.bom(st);return {sw:document.querySelector('[data-mr4s-toggle]')?.getAttribute('aria-checked'),power:!!document.querySelector('.rt-power-notice'),mr4s:rows.find(r=>r.model.startsWith('XDM-MR4S'))?.quantity||0,psu:rows.some(r=>/^XDM-(PSU|POH|PHX)/.test(r.model)),overflow:document.documentElement.scrollWidth>innerWidth}});
      check('04 전송기 XDM-MR4S 랙 장착 스위치: 기본 꺼짐(XDM-PSU 안내), 켜면 CTR100 8대 → MR4S 2대를 BOM에 넣고 XDM-PSU·POH·PHX를 뺌',before.sw==='false'&&before.power&&after.sw==='true'&&!after.power&&after.mr4s===2&&!after.psu&&!after.overflow,JSON.stringify({before,after}));
      await page.evaluate(()=>localStorage.removeItem('rtcom.configuration.v1'));
    }
    // 0.201 SPX-TX/RX 03 Signal Flow 범례: 실효 전송 거리에 Belden 케이블 조건(7814A·10GXE02)이 남는다(사용자 요청 2026-10-04).
    await page.goto(`${home}#products/spx-rx-tx`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-legend');
    const txrxLegend=await page.evaluate(()=>document.querySelector('.rt-pg-legend')?.textContent||'');
    check('SPX-TX/RX 신호 흐름 범례의 실효 전송 거리에 Belden 7814A·10GXE02 조건이 보임',txrxLegend.includes('UTP CAT6 50m (Belden 7814A)')&&txrxLegend.includes('S/FTP CAT6A 70m (Belden 10GXE02)'),txrxLegend.slice(0,200));
    // 0.224 XDM 07 화면 연출 시뮬레이터(WOS100 월 오버레이): 기본 프리셋 커맨드가 가이드 문법으로 나오고, 창을 끌면 X 좌표와 커맨드가 함께 바뀐다.
    await page.goto(`${home}#products/xdm`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-layout-sim .rt-ls-canvas');
    await page.evaluate(()=>{try{localStorage.removeItem('rtcom.layoutSim.v1')}catch(e){}});
    await page.reload({waitUntil:'networkidle'});
    await page.waitForSelector('#rt-layout-sim [data-ls-win="1"]');
    const simBefore=await page.locator('#rt-layout-sim [data-ls-cmd]').innerText();
    // 0.233 레이어 번호(1 = 맨 위, 사용자 요청 2026-10-16): 기본 배치(P4321, PIP가 포트 14)에서 PIP(창 2)가 레이어 1, 전체 창 1이 레이어 2. 끌기 전에 잰다(PIP를 다른 카드로 옮기면 받는 포트가 바뀌어 순서도 바뀜).
    const simLayers=await page.evaluate(()=>({layers:[...document.querySelectorAll('#rt-layout-sim .rt-ls-win-layer')].map(e=>e.textContent),top:document.querySelector('#rt-layout-sim .rt-ls-win-layer.is-top')?.closest('.rt-ls-win')?.dataset.lsWin,chips:[...document.querySelectorAll('#rt-layout-sim .rt-ls-card')].map(e=>e.textContent.replace(/\s+/g,' ').trim()),span:document.querySelector('#rt-layout-sim .rt-ls-span')?.textContent||''}));
    await page.locator('#rt-layout-sim [data-ls-win="1"]').scrollIntoViewIfNeeded();
    const simWin=await page.locator('#rt-layout-sim [data-ls-win="1"]').boundingBox();
    await page.mouse.move(simWin.x+simWin.width/2,simWin.y+simWin.height/2);await page.mouse.down();
    await page.mouse.move(simWin.x+simWin.width/2-240,simWin.y+simWin.height/2,{steps:6});await page.mouse.up();
    const sim=await page.evaluate(()=>({cmd:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent,x:Number(document.querySelector('#rt-layout-sim [data-ls-win-field="x"][data-ls-win-index="1"]').value),cells:document.querySelectorAll('#rt-layout-sim .rt-ls-cell').length,btn:!!document.querySelector('[data-scroll-to="rt-layout-sim"]'),warn:document.querySelectorAll('#rt-layout-sim .rt-ls-warn li').length,overflow:document.documentElement.scrollWidth>innerWidth}));
    check('XDM 07 화면 연출 시뮬레이터: 기본 커맨드(2×2 월 전체 + PIP)가 가이드 OW 문법이고 PIP 창을 끌면 X와 커맨드가 바뀌며 레이어 배지는 PIP가 1번',simBefore==='*255OWO001-016W14H02V02P4321O001O002O003O004O005O006O007O008O009O010O011O012O013O014O015O016X0Y0W0H0I001O001O005O009O013X0Y0W7680H4320I002O014X5760Y3240W1920H1080!'&&sim.x<5760&&sim.cmd.includes(`X${sim.x}Y3240W1920H1080!`)&&sim.cells===4&&sim.btn&&simLayers.layers.join(',')==='레이어 2,레이어 1'&&simLayers.top==='1'&&!sim.overflow,JSON.stringify({before:simBefore.slice(-60),x:sim.x,cells:sim.cells,btn:sim.btn,warn:sim.warn,layers:simLayers}));
    // 0.235 카드별 레이어 사용량: 전체 창은 카드 4장을 모두 걸쳐 각 카드 1개씩, PIP는 카드 4에서 1개 더 → 카드 1~3은 1/4, 카드 4는 2/4.
    check('XDM 07 시뮬레이터 카드별 레이어 사용량: 카드 4장 칩(1/4·1/4·1/4·2/4)과 걸친 창 안내가 나옴',simLayers.chips.length===4&&simLayers.chips[0].startsWith('카드 1 1/4 사용 · 남음 3')&&simLayers.chips[3].startsWith('카드 4 2/4 사용 · 남음 2')&&simLayers.span.includes('창 1은 카드 1·2·3·4에 걸쳐 레이어 4개'),JSON.stringify(simLayers));
    // 0.225 "맨 위로": 전체 창(창 1)을 맨 위로 올리면 뒤로 가서 PIP가 포트 13, 전체 창이 1·5·9·14를 받는다(P4321).
    await page.evaluate(()=>{try{localStorage.removeItem('rtcom.layoutSim.v1')}catch(e){}});
    await page.reload({waitUntil:'networkidle'});
    await page.waitForSelector('#rt-layout-sim [data-ls-top="0"]');
    await page.click('#rt-layout-sim [data-ls-top="0"]');
    const topCmd=await page.evaluate(()=>document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent);
    check('XDM 07 시뮬레이터 "맨 위로": 창 1을 맨 위로 올리면 포트 배정과 커맨드 순서가 바뀜',/I002O013X5760Y3240W1920H1080I001O001O005O009O014X0Y0W7680H4320!$/.test(topCmd),topCmd.slice(-90));
    // 0.237 창 정렬: 창을 고르지 않으면 버튼이 꺼져 있고, PIP(창 2)를 고른 뒤 "월 가운데"를 누르면 분할점 위(X1920Y1080W3840H2160)로 옮겨 카드 4장에 걸침 안내가 나온다.
    await page.evaluate(()=>{try{localStorage.removeItem('rtcom.layoutSim.v1')}catch(e){}});
    await page.reload({waitUntil:'networkidle'});
    await page.waitForSelector('#rt-layout-sim [data-ls-win="1"]');
    await page.locator('#rt-layout-sim [data-ls-win="1"]').scrollIntoViewIfNeeded();
    await page.locator('#rt-layout-sim [data-ls-win="1"]').click();
    const alignBefore=await page.evaluate(()=>({n:document.querySelectorAll('#rt-layout-sim [data-ls-align]').length,disabled:[...document.querySelectorAll('#rt-layout-sim [data-ls-align]')].filter(b=>b.disabled).length}));
    await page.click('#rt-layout-sim [data-ls-align="center"]');
    const alignAfter=await page.evaluate(()=>({cmd:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent,span:document.querySelector('#rt-layout-sim .rt-ls-span')?.textContent||'',chips:[...document.querySelectorAll('#rt-layout-sim .rt-ls-card')].map(e=>e.textContent.replace(/\s+/g,' ').trim()),overflow:document.documentElement.scrollWidth>innerWidth}));
    check('XDM 07 시뮬레이터 창 정렬: 창을 고르면 버튼 3개가 켜지고, "월 가운데"는 PIP를 분할점 위(X1920Y1080W3840H2160)에 놓아 카드 4장에 걸침',alignBefore.n===3&&alignBefore.disabled===0&&/I002O\d{3}O\d{3}O\d{3}O\d{3}X1920Y1080W3840H2160/.test(alignAfter.cmd)&&alignAfter.span.includes('창 2은 카드 1·2·3·4에 걸쳐 레이어 4개')&&alignAfter.chips.every(c=>/2\/4 사용/.test(c))&&!alignAfter.overflow,JSON.stringify({alignBefore,cmd:alignAfter.cmd.slice(-90),span:alignAfter.span,chips:alignAfter.chips}));
    // 0.233 Delete 키(사용자 요청 2026-10-16): 창을 누른 뒤(끌지 않고) Delete → WOS100은 창을 지우고, HOS100 L00은 창을 끈다(W0000 H0000).
    await page.evaluate(()=>{try{localStorage.removeItem('rtcom.layoutSim.v1')}catch(e){}});
    await page.reload({waitUntil:'networkidle'});
    await page.waitForSelector('#rt-layout-sim [data-ls-win="1"]');
    await page.locator('#rt-layout-sim [data-ls-win="1"]').scrollIntoViewIfNeeded();
    await page.locator('#rt-layout-sim [data-ls-win="1"]').click();
    await page.keyboard.press('Delete');
    const delWos=await page.evaluate(()=>({wins:document.querySelectorAll('#rt-layout-sim .rt-ls-win').length,cmd:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent}));
    await page.click('#rt-layout-sim [data-ls-card="HOS100"]');
    await page.waitForSelector('#rt-layout-sim [data-ls-win="3"]');
    await page.locator('#rt-layout-sim [data-ls-win="3"]').scrollIntoViewIfNeeded();
    await page.locator('#rt-layout-sim [data-ls-win="3"]').click();
    await page.keyboard.press('Delete');
    const delHos=await page.evaluate(()=>({wins:document.querySelectorAll('#rt-layout-sim .rt-ls-win').length,cmd:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent,hint:document.querySelector('#rt-layout-sim .rt-pg-hint')?.textContent||''}));
    check('XDM 07 시뮬레이터 Delete 키: 창을 누른 뒤 Delete → WOS100은 PIP 창 삭제(창 1개·I001만), HOS100 L00은 창 4 끄기(W0000H0000·창 3개)',delWos.wins===1&&/I001O001O005O009O013X0Y0W7680H4320!$/.test(delWos.cmd)&&!/I002/.test(delWos.cmd)&&delHos.wins===3&&/O004X\d{4}Y\d{4}W0000H0000/.test(delHos.cmd),JSON.stringify({wos:delWos,hosCmd:delHos.cmd.slice(-60),hosWins:delHos.wins}));
    // 0.235 HOS100 표의 "×"(창 끄기) 버튼: 키보드 없이도 창을 끈다(터치 화면용). 이미 꺼진 창 4는 버튼이 없고, 창 1을 누르면 W0000H0000이 된다.
    const offBtn=await page.evaluate(()=>({has4:!!document.querySelector('#rt-layout-sim [data-ls-hos-off="3"]'),has1:!!document.querySelector('#rt-layout-sim [data-ls-hos-off="0"]'),incl:document.querySelectorAll('#rt-layout-sim .rt-ls-include').length}));
    await page.click('#rt-layout-sim [data-ls-hos-off="0"]');
    const offHos=await page.evaluate(()=>({wins:document.querySelectorAll('#rt-layout-sim .rt-ls-win').length,cmd:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent}));
    check('XDM 07 시뮬레이터 HOS100 표 "×": 끈 창은 버튼이 없고, 창 1을 누르면 W0000H0000으로 꺼져 창 2개만 남음("포함" 체크박스는 전체 커맨드 보기에서만 보임)',!offBtn.has4&&offBtn.has1&&offBtn.incl===0&&offHos.wins===2&&/O001X\d{4}Y\d{4}W0000H0000/.test(offHos.cmd),JSON.stringify({offBtn,wins:offHos.wins,cmd:offHos.cmd.slice(-80)}));
    await page.evaluate(()=>{try{localStorage.removeItem('rtcom.layoutSim.v1');localStorage.removeItem('rtcom.layoutSim.hos.v1');localStorage.removeItem('rtcom.layoutSim.card.v1')}catch(e){}});
    await page.reload({waitUntil:'networkidle'});
    await page.waitForSelector('#rt-layout-sim [data-ls-preset]');
    // 0.233 현장 메모 공개(사용자 결정 2026-10-16 "2안으로 전부 공개해"): 프리셋 원문과 참고 커맨드 접이식 칸.
    await page.selectOption('#rt-layout-sim [data-ls-preset]','memo-22x9x2');
    const memo=await page.evaluate(()=>({cmd:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent,notes:document.querySelector('#rt-layout-sim .rt-ls-notes')?.textContent||''}));
    check('XDM 07 시뮬레이터 현장 메모 프리셋이 회신 원문(O009-012·O000·X0Y295W1920H1571)과 같고 참고 커맨드 칸에 IV·IE 커맨드가 있음',memo.cmd==='*255OWO009-012W14H01V01P4321O000I001O009X0Y295W1920H1571I002O010X1920Y295W1920H1571!'&&memo.notes.includes('*255IVI001I002I003M03!')&&memo.notes.includes('*255IEI009M18!'),JSON.stringify({cmd:memo.cmd.slice(-60),notes:memo.notes.length}));
    await page.selectOption('#rt-layout-sim [data-ls-preset]','card-2x2-pip');
    // 0.225 HOS100 멀티뷰 모드: 카드 전환 버튼 → OQ L00 커맨드와 스위칭 커맨드 두 줄, 프리셋 PIP(L09)는 가이드 28쪽 원문과 같다.
    await page.click('#rt-layout-sim [data-ls-card="HOS100"]');
    await page.waitForSelector('#rt-layout-sim [data-ls-hos="layout"]');
    const hosDefault=await page.evaluate(()=>document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent);
    const hosLayers=await page.evaluate(()=>({badges:[...document.querySelectorAll('#rt-layout-sim .rt-ls-win-layer')].map(e=>e.textContent),cells:[...document.querySelectorAll('#rt-layout-sim td.rt-ls-stack b')].map(e=>e.textContent)}));
    await page.selectOption('#rt-layout-sim [data-ls-hos-preset]','hos-guide-pip');
    const hosPip=await page.evaluate(()=>({cmd:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent,fixed:document.querySelectorAll('#rt-layout-sim .rt-ls-win.is-fixed').length,free:document.querySelectorAll('#rt-layout-sim .rt-ls-win:not(.is-fixed)').length,overflow:document.documentElement.scrollWidth>innerWidth}));
    check('XDM 07 시뮬레이터 HOS100 모드: 사용자 배치(L00) 커맨드와 스위칭 커맨드가 나오고 PIP 프리셋이 가이드 원문과 같음',/\*255CI001O001,I002O002,I003O003,I004O004!/.test(hosDefault)&&/\*255OQO001M14L00P4321O001X0000Y0000W1920H1080/.test(hosDefault)&&hosPip.cmd.includes('*255OQO001M14L09X1920Y1080W1920H1080!')&&hosPip.fixed===1&&hosPip.free===1&&hosLayers.badges.join(',')==='레이어 4,레이어 3,레이어 2,레이어 1'&&hosLayers.cells.join(',')==='레이어 4,레이어 3,레이어 2,레이어 1'&&!hosPip.overflow,JSON.stringify({hosDefault:hosDefault.slice(0,120),fixed:hosPip.fixed,free:hosPip.free,layers:hosLayers}));
    // 0.226 전체 커맨드(두 카드): WOS100·HOS100 커맨드가 번호 순으로 모이고, 포트가 겹치면 경고와 "시작 포트를 17번으로" 버튼이 나오며 누르면 경고가 사라진다.
    await page.click('#rt-layout-sim [data-ls-card="ALL"]');
    await page.waitForSelector('#rt-layout-sim .rt-ls-allgrid');
    const allBefore=await page.evaluate(()=>({lines:document.querySelectorAll('#rt-layout-sim .rt-ls-cmdline').length,overlapBtn:!!document.querySelector('#rt-layout-sim [data-ls-hos-port]'),warn:document.querySelectorAll('#rt-layout-sim .rt-ls-warn li').length}));
    await page.click('#rt-layout-sim [data-ls-hos-port]');
    const allAfter=await page.evaluate(()=>({overlapBtn:!!document.querySelector('#rt-layout-sim [data-ls-hos-port]'),text:document.querySelector('#rt-layout-sim [data-ls-cmd]').textContent,overflow:document.documentElement.scrollWidth>innerWidth}));
    check('XDM 07 시뮬레이터 전체 커맨드: 두 카드 커맨드 3줄, 포트 겹침 경고 → 버튼으로 HOS100 시작 포트 17번',allBefore.lines===3&&allBefore.overlapBtn&&!allAfter.overlapBtn&&/\*255OQO017M14L09X1920Y1080W1920H1080!/.test(allAfter.text)&&/I001O017,I002O018!/.test(allAfter.text)&&!allAfter.overflow,JSON.stringify({before:allBefore,after:allAfter.text.slice(-80)}));
    await page.evaluate(()=>{try{localStorage.removeItem('rtcom.layoutSim.v1');localStorage.removeItem('rtcom.layoutSim.hos.v1');localStorage.removeItem('rtcom.layoutSim.card.v1');localStorage.removeItem('rtcom.layoutSim.include.v1')}catch(e){}});
    await page.evaluate(()=>{try{localStorage.removeItem('rtcom.layoutSim.v1')}catch(e){}});
    // 0.64 OBUX-1C Tx Mode 딥 스위치(매뉴얼 Ver.2.2): 검은 몸체 4핀, 1번 오디오 + 2·3·4번 EDID 조합 5칸(Through-pass EDID Fix 포함).
    await page.goto(`${home}#products/obux-1c`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-dip');
    const obux=await page.evaluate(()=>({rows:document.querySelectorAll('.rt-pg-dip .rt-pg-dip-row').length,combos:document.querySelectorAll('.rt-pg-dip-combos figure').length,fix:document.querySelector('.rt-pg-dip')?.textContent.includes('Through-pass EDID Fix')}));
    check('OBUX-1C 딥 스위치 설정이 1번 오디오와 2·3·4번 EDID 조합 5칸으로 나옴',obux.rows===2&&obux.combos===5&&obux.fix,JSON.stringify(obux));
    // 2026-09-28 OBUX-1C Tx 고해상도 실물 사진: 송신기 단자 지도가 앞면·뒷면 합성 사진 한 장에 번호 6개(Mode·S/P 포함), 수신기도 합성 사진에 번호 5개(S/P 포함).
    const obuxPm=await page.evaluate(()=>{const s=[...document.querySelectorAll('section')].find(s=>/Port Map/.test(s.querySelector('h2')?.textContent||''));return {tx:!!s?.innerHTML.includes('obux-1c-tx-front-rear.webp'),rx:!!s?.innerHTML.includes('obux-1c-rx-front-rear.webp'),ports:[...(s?.querySelectorAll('.rt-pg-ports')||[])].map(x=>x.children.length)}});
    // 2026-09-28 제조사 문서 PDF: documents[].file 수만큼 "제품 목록" 옆에 버튼(새 탭 보기 + 내려받기)이 나오고 링크가 PDF로 열림. 등록 파일이 없는 제품은 버튼 없음.
    // 0.105 샘플(HD-13U 카탈로그만): 새 탭 링크 대신 팝업(button[data-doc-preview])이고, 클릭하면 dialog.rt-doc-zoom이 PDF.js로 그 파일을 그린다(0.112).
    // 0.157: SPX-R6 사양서(카탈로그)·SPX 공통 매뉴얼·SPX-TX/RX 매뉴얼 공개(사용자 결정 2026-09-29)도 같은 방식으로 확인한다.
    for(const id of ['hd-13u','hd-104u','spx-r6','spx-rx-tx','spx']){
      const expected=(JSON.parse(fs.readFileSync(`data/products/${id}.json`,'utf8')).documents||[]).filter(doc=>doc.file).length;
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-toolbar');
      const docs=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-toolbar .rt-pg-doc:not([data-doc="official"])')].map(el=>{
        const open=el.querySelector('.rt-pg-doc-open');
        const popup=open?.tagName==='BUTTON'?open.getAttribute('data-doc-preview'):null;
        return {open:popup?true:open?.getAttribute('target')==='_blank'&&open?.relList.contains('noopener'),save:el.querySelector('.rt-pg-doc-save')?.hasAttribute('download'),href:popup?new URL(popup,document.baseURI).href:open?.href};
      }));
      const pdfOk=[];for(const doc of docs){const res=await page.request.get(doc.href);pdfOk.push(res.status()===200&&String(res.headers()['content-type']).includes('pdf'))}
      check(`${id} 제조사 문서 버튼 ${expected}개(새 탭 보기 또는 팝업·내려받기, PDF 응답)`,docs.length===expected&&docs.every(doc=>doc.open&&doc.save)&&pdfOk.every(Boolean),JSON.stringify({expected,docs,pdfOk}));
    }
    // 0.113 HD-13U 문서 팝업(사용자 결정 2026-09-28 "13u 메뉴얼은 pdf.js으로 카탈로그는 이미지 방식"):
    // 카탈로그는 미리 그린 쪽 그림(img, PDF.js를 불러오지 않음), 매뉴얼은 PDF.js로 쪽마다 canvas. 둘 다 iframe 없이 확대·원본·내려받기·닫기가 동작한다.
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-toolbar');
    const pdfjsRequests=[];const onReq=req=>{if(req.url().includes('/vendor/pdfjs/'))pdfjsRequests.push(req.url())};page.on('request',onReq);
    await page.click('[data-doc="Catalog"] button.rt-pg-doc-open[data-doc-kind="image"]');
    await page.waitForSelector('dialog.rt-doc-zoom[open] .rt-doc-pages img',{timeout:15000});
    await page.waitForFunction(()=>{const i=document.querySelector('dialog.rt-doc-zoom .rt-doc-pages img');return i&&i.complete&&i.naturalWidth>0&&!document.querySelector('dialog.rt-doc-zoom .rt-doc-status')},null,{timeout:15000});
    const catPopup=await page.evaluate(()=>{const d=document.querySelector('dialog.rt-doc-zoom');const i=d.querySelector('.rt-doc-pages img');return {imgs:d.querySelectorAll('.rt-doc-pages img').length,src:i.getAttribute('src'),natural:i.naturalWidth,w:i.getBoundingClientRect().width,canvas:!!d.querySelector('canvas'),iframe:!!d.querySelector('iframe'),links:[...d.querySelectorAll('.rt-doc-zoom-link')].map(a=>a.getAttribute('href'))}});
    await page.click('dialog.rt-doc-zoom [data-doc-zoom-step="1"]');
    const catZoomW=await page.$eval('dialog.rt-doc-zoom .rt-doc-pages img',i=>i.getBoundingClientRect().width);
    await page.click('dialog.rt-doc-zoom [data-zoom-close]');
    const catClosed=await page.evaluate(()=>!document.querySelector('dialog.rt-doc-zoom[open]'));
    check('HD-13U 카탈로그 팝업이 이미지 방식(hd-13u-catalog-p1.webp)으로 바로 보이고 PDF.js를 불러오지 않으며 확대·원본·내려받기·닫기가 동작',catPopup.imgs===1&&catPopup.src.includes('hd-13u-catalog-p1.webp')&&catPopup.natural>=1600&&!catPopup.canvas&&!catPopup.iframe&&catPopup.links.every(h=>h.includes('hd-13u-catalog.pdf'))&&catZoomW>catPopup.w*1.3&&catClosed&&!pdfjsRequests.length,JSON.stringify({catPopup,catZoomW,catClosed,pdfjsRequests}));
    await page.click('[data-doc="Manual"] button.rt-pg-doc-open[data-doc-kind="pdfjs"]');
    // 0.124 매뉴얼은 쪽마다 자리(.rt-doc-page)를 만들고 보이는 쪽과 앞뒤만 canvas로 그린다.
    await page.waitForFunction(()=>{const d=document.querySelector('dialog.rt-doc-zoom[open]');return d&&d.querySelectorAll('.rt-doc-page').length===11&&d.querySelector('.rt-doc-page[data-doc-page="1"] canvas')&&!d.querySelector('.rt-doc-status')},null,{timeout:30000});
    const manPopup=await page.evaluate(()=>{const d=document.querySelector('dialog.rt-doc-zoom');const c=d.querySelector('.rt-doc-page[data-doc-page="1"] canvas');return {pages:d.querySelectorAll('.rt-doc-page').length,w:c.getBoundingClientRect().width,drawn:c.width>0,iframe:!!d.querySelector('iframe'),links:[...d.querySelectorAll('.rt-doc-zoom-link')].map(a=>a.getAttribute('href'))}});
    await page.click('dialog.rt-doc-zoom [data-doc-zoom-step="1"]');
    await page.waitForFunction(w=>{const c=document.querySelector('dialog.rt-doc-zoom .rt-doc-page canvas');return c&&c.getBoundingClientRect().width>w*1.3},manPopup.w,{timeout:15000});
    await page.click('dialog.rt-doc-zoom [data-zoom-close]');
    page.off('request',onReq);
    check('HD-13U 매뉴얼 팝업이 PDF.js로 hd-13u-manual.pdf 11쪽 자리를 만들고 첫 쪽을 canvas에 그리며(iframe 없음) 확대·원본·내려받기가 동작',manPopup.pages===11&&manPopup.drawn&&!manPopup.iframe&&manPopup.links.every(h=>h.includes('hd-13u-manual.pdf'))&&pdfjsRequests.some(u=>u.endsWith('pdf.min.mjs')),JSON.stringify({manPopup,pdfjsRequests}));
    // 0.124 전 제품 확장(사용자 결정 2026-09-28 "전체 제품으로 넓혀서 올리기"): 여러 쪽 카탈로그(XDM 6쪽)는 그림 6장,
    // 103쪽 매뉴얼(VDM)은 보이는 쪽만 그려 canvas 수가 쪽 수보다 훨씬 적고, 끝으로 내리면 마지막 쪽이 그려지고 첫 쪽 canvas는 비워진다.
    await page.goto(`${home}#products/xdm`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-toolbar');
    await page.click('[data-doc="Catalog"] button.rt-pg-doc-open[data-doc-kind="image"]');
    await page.waitForFunction(()=>{const d=document.querySelector('dialog.rt-doc-zoom[open]');return d&&d.querySelectorAll('.rt-doc-pages img').length===9&&!d.querySelector('.rt-doc-status')},null,{timeout:15000});
    const xdmCat=await page.$$eval('dialog.rt-doc-zoom .rt-doc-pages img',imgs=>imgs.map(i=>i.getAttribute('src').split('/').pop()));
    await page.click('dialog.rt-doc-zoom [data-zoom-close]');
    // 0.151(#205)에서 XDM 카탈로그를 전송기 쪽까지 넣은 4~12쪽(9쪽)으로 늘렸다.
    check('XDM 카탈로그 팝업이 9쪽 그림(xdm-catalog-p1~p9.webp)으로 나옴',xdmCat.join()===[1,2,3,4,5,6,7,8,9].map(n=>`xdm-catalog-p${n}.webp`).join(),JSON.stringify(xdmCat));
    // 0.205(사용자 요청 2026-10-12): 제품정보 XDM 04 카드 상세(WOS100·HOS100)와 02 신호 구성 그림의 WOS100·HOS100 칸에서 기능 팝업이 열리고,
    // HOS100 팝업에는 레이아웃 6종과 레이어 2개(1·2번, 3·4번 짝)·4개일 때 쓸 수 없는 포트가 보이며, HOS100 카드 사양표에 "멀티뷰 포트 제한" 행이 있다.
    {
      const openCount=()=>page.locator('dialog[open]').count();
      // 0.209 XDM 커맨드 가이드(알티컴 1013판, 사용자 결정 2026-10-13 "공개 진행"): 제품 상세 문서 버튼에 "커맨드 가이드 보기 | 다운로드"가 있다.
      const xdmDocs=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-doc[data-doc="Manual"] .rt-pg-doc-open')].map(b=>(b.querySelector('b')||b).textContent.trim()+'>'+(b.dataset.docPreview||'')).join('|'));
      check('XDM 제품 상세 문서 버튼에 매뉴얼과 커맨드 가이드(PDF.js 팝업·다운로드)가 함께 있음',xdmDocs==='매뉴얼 보기>output/design/assets/docs/xdm-manual.pdf|커맨드 가이드 보기>output/design/assets/docs/xdm-command-guide.pdf'&&await page.locator('.rt-pg-doc-save[download="xdm-command-guide.pdf"]').count()===1,xdmDocs);
      await page.click('[data-pg-card="XDM-WOS100"]');
      const wosCta=await page.locator('dialog[open] .rt-feature-cta [data-card-feature="layer-compare"]').count();
      await page.click('dialog[open] [data-card-feature="layer-compare"]');
      const wosOpen={n:await openCount(),title:await page.locator('dialog[open] h3').last().textContent()};
      // 0.207(사용자 요청 2026-10-12 "wos 출력1개에 4K60 소스 4개를 VP처럼 레이어링", "선도 꼬여 있어"): 가로(PC)·세로(휴대폰) 그림 모두 디스플레이 1대에 레이어 창 4개,
      // 신호선은 한 방향 직선(가로 그림 H, 세로 그림 V)뿐이라 서로 교차하지 않는다. WOS100 사양표에 "레이어" 행이 있다.
      // 0.214(사용자 요청 2026-10-13 "출력 디스플레이를 4K 네 판으로 표시하고 레이어 4개를 연출한 화면으로 해줘"): 그림은 WOS100 카드 4장 → 4K 디스플레이 4대(2×2)이고 신호선은 16개다.
      // 같은 날 "HOS100카드와 컨셉과 아날로그웨이 브로셔와 잘 믹싱해봐": 핵심 수치 띠 4칸, 포트 조건 안내 상자, HOS100식 배치 예시 6종(모니터 그림)이 있다.
      const wosFig=await page.evaluate(()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();const r={};for(const svg of d.querySelectorAll('.rt-layer-figure svg')){const want=svg.classList.contains('rt-layer-svg-wide')?'H':'V';const ds=[...svg.querySelectorAll('path.rt-layer-route')].map(p=>p.getAttribute('d'));r[want]={wins:svg.querySelectorAll('.rt-layer-win').length,cards:svg.querySelectorAll('.rt-wos-card').length,panels:svg.querySelectorAll('.rt-wall-panel').length,routes:ds.length,straight:ds.every(x=>new RegExp('^M[\\d.]+ [\\d.]+ '+want+'[\\d.]+$').test(x)),visible:getComputedStyle(svg).display!=='none'}}r.keys=d.querySelectorAll('.rt-wos-keys li').length;r.layouts=[...d.querySelectorAll('.rt-wos-layout strong')].map(e=>e.textContent).join();r.monitors=d.querySelectorAll('.rt-wos-layout .rt-hos-fig svg').length;r.cells=d.querySelectorAll('.rt-wos-layout .rt-wos-cell').length;r.warn=d.querySelector('.rt-wos-warn')?.textContent||'';r.guide=d.querySelector('[data-cmd-guide]')?.getAttribute('href')||'';r.led=/LED 모드/.test(d.querySelector('.rt-wos-feats')?.textContent||'');r.chips=[...d.querySelectorAll('.rt-wos-ports')].map(ol=>[...ol.children].map(li=>li.className.replace('rt-hos-port-','')).join('/')).join(' ');r.spec=[...document.querySelectorAll('dialog[open]')][0].querySelector('th')&&[...[...document.querySelectorAll('dialog[open]')][0].querySelectorAll('th')].some(th=>th.textContent==='레이어');r.wosSync=(d.querySelector('.rt-wos-sync')||{}).textContent||'';r.syncRow=[...[...document.querySelectorAll('dialog[open]')][0].querySelectorAll('th')].some(th=>th.textContent==='출력 동기');return r});
      await page.keyboard.press('Escape');await page.keyboard.press('Escape');
      await page.click('[data-pg-card="XDM-HOS100"]');
      const hosInfo=await page.evaluate(()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();return {sync:[...d.querySelectorAll('th')].some(th=>th.textContent==='출력 동기'),row:[...d.querySelectorAll('th')].some(th=>th.textContent==='멀티뷰 포트 제한'),cta:!!d.querySelector('.rt-feature-cta [data-card-feature="hos-multiview"]')}});
      await page.click('dialog[open] [data-card-feature="hos-multiview"]');
      const hosPopup=await page.evaluate(()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();return {syncNote:(d.querySelector('.rt-hos-sync')||{}).textContent||'',title:d.querySelector('h3').textContent,layouts:[...d.querySelectorAll('.rt-hos-layout strong')].map(e=>e.textContent).join(),warn:d.querySelector('.rt-hos-warn').textContent,pip:[...d.querySelectorAll('.rt-hos-layout')].find(li=>li.querySelector('strong').textContent==='PIP').querySelectorAll('.rt-hos-port-off').length,quadDup:[...d.querySelectorAll('.rt-hos-layout')].find(li=>li.querySelector('strong').textContent==='Quad').querySelectorAll('.rt-hos-port-dup').length,monitors:d.querySelectorAll('.rt-hos-fig svg').length,cmdRows:d.querySelectorAll('.rt-hos-cmd tbody tr').length,guide:d.querySelector('[data-cmd-guide]')?.getAttribute('href')||'',cells:d.querySelectorAll('.rt-hos-fig .rt-hos-cell').length}});
      await page.keyboard.press('Escape');await page.keyboard.press('Escape');
      const sig=page.locator('svg [data-card-feature="hos-multiview"]');
      const sigInfo={wos:await page.locator('svg [data-card-feature="layer-compare"][role="button"][tabindex="0"]').count(),hos:await sig.count(),legend:await page.locator('.rt-pg-legend-feature').count()};
      await sig.click();const sigClick=await page.locator('dialog[open] h3').last().textContent();await page.keyboard.press('Escape');
      await page.locator('svg [data-card-feature="layer-compare"]').focus();await page.keyboard.press('Enter');const sigKey=await page.locator('dialog[open] h3').last().textContent();await page.keyboard.press('Escape');
      check('제품정보 XDM: WOS100 카드 상세에 레이어 팝업 버튼, HOS100 카드 상세에 멀티뷰 포트 제한 행과 멀티뷰 팝업 버튼(카드 팝업 위로 겹쳐 열림)',wosCta===1&&wosOpen.n===2&&/WOS100 레이어/.test(wosOpen.title)&&hosInfo.row&&hosInfo.cta,JSON.stringify({wosCta,wosOpen,hosInfo}));
      check('WOS100 레이어 팝업: WOS100 카드 4장이 4K 디스플레이 4대(2×2 비디오 월, 화면 표시 4개)에 4K/60 레이어 창 4개를 나눠 냄(0.214, 가로·세로 그림), 신호선 16개가 모두 한 방향 직선이라 교차 없음, 화면 폭에 맞는 그림 하나만 보임, 사양표 레이어 행, 핵심 수치 4칸·포트 조건 안내·배치 예시 6종(HOS100과 같은 모니터 그림 6장·칸 22개)·레이어를 쓰면 카드 4포트가 같은 화면(0.210 알티컴 확인) 안내와 포트 칩(6종 모두 1번 합성·2~4번 1번 동일)',wosFig.H?.wins===4&&wosFig.V?.wins===4&&wosFig.H.cards===4&&wosFig.V.cards===4&&wosFig.H.panels===4&&wosFig.V.panels===4&&wosFig.H.routes===16&&wosFig.V.routes===16&&wosFig.H.straight&&wosFig.V.straight&&wosFig.H.visible!==wosFig.V.visible&&wosFig.spec&&wosFig.keys===4&&wosFig.layouts==='자유 배치,배경 + PIP 3,PBP + PIP + 로고,쿼드,L자형,배경 + 하단 띠'&&wosFig.monitors===6&&wosFig.cells===22&&/레이어를 1개만 써도 2~4번 포트에 1번과 같은 합성 화면/.test(wosFig.warn)&&/HOS100\(레이어 2개면 짝 포트만 사용 불가\)과 다릅니다/.test(wosFig.warn)&&!/확인되지 않/.test(wosFig.warn)&&wosFig.chips===Array(6).fill('main/dup/dup/dup').join(' ')&&wosFig.guide.endsWith('xdm-command-guide.pdf#page=45')&&wosFig.led,JSON.stringify(wosFig));
      check('HOS100 멀티뷰 팝업: 레이아웃 6종(매뉴얼 KV08, QMS 06과 같은 모니터 그림 6장·칸 17개)·커맨드 레이아웃 14종 표(11행)·커맨드 가이드 26쪽 링크(0.209)과 레이어 2개면 짝 포트(2·4번) 불가·4개면 2~4번 1번과 같은 화면 안내',hosPopup.layouts==='Full 1~4,Quad,Bottom,Right,PIP,PBP'&&/1번을 분할하면 2번, 3번을 분할하면 4번을 사용할 수 없습니다/.test(hosPopup.warn)&&/2~4번 포트에 1번과 같은 화면/.test(hosPopup.warn)&&hosPopup.pip===2&&hosPopup.quadDup===3&&hosPopup.monitors===6&&hosPopup.cells===17&&hosPopup.cmdRows===11&&hosPopup.guide.endsWith('xdm-command-guide.pdf#page=26'),JSON.stringify(hosPopup));
      // 0.211 WOS100과 HOS100의 가장 큰 차이는 출력 동기(싱크): HOS100은 레이어를 만들 수 있으나 동기가 맞지 않아 LED 적용이 어렵고, WOS100은 2~3장으로 LED S-BOX 1·2에 나눠 보낼 때 카드 사이 동기가 맞는다(알티컴 확인, 사용자 전달 2026-10-13).
      check('WOS100·HOS100 출력 동기 차이(0.211): WOS100 LED 상자에 출력 동기 안내, 두 카드 사양에 "출력 동기" 행, HOS100 멀티뷰 팝업에 "LED 화면에는 WOS100" 안내 상자',/출력 동기\(싱크\)가 맞아 LED 화면에 씁니다/.test(wosFig.wosSync)&&wosFig.syncRow&&hosInfo.sync&&/LED 화면에는 WOS100을 씁니다/.test(hosPopup.syncNote)&&/2~3장으로 LED S-BOX 1·2/.test(hosPopup.syncNote)&&/2~3장으로 LED S-BOX 1·2/.test(wosFig.wosSync)&&/출력 동기\(싱크\)가 맞지 않아 LED/.test(hosPopup.syncNote),JSON.stringify({wosSync:wosFig.wosSync,syncRow:wosFig.syncRow,hosSync:hosInfo.sync,syncNote:hosPopup.syncNote}));
      check('제품정보 XDM 02 신호 구성: WOS100·HOS100 칸이 버튼(role·tabindex)이고 누르거나 Enter로 팝업이 열리며 범례에 안내가 있음',sigInfo.wos===1&&sigInfo.hos===1&&sigInfo.legend===1&&/HOS100 멀티뷰/.test(sigClick)&&/WOS100 레이어/.test(sigKey),JSON.stringify({sigInfo,sigClick,sigKey}));
    }
    await page.goto(`${home}#products/vdm`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-toolbar');
    const vdmStart=Date.now();
    await page.click('[data-doc="Manual"] button.rt-pg-doc-open[data-doc-kind="pdfjs"]');
    await page.waitForFunction(()=>document.querySelector('dialog.rt-doc-zoom[open] .rt-doc-page[data-doc-page="1"] canvas'),null,{timeout:30000});
    const vdmFirstMs=Date.now()-vdmStart;
    const vdmTop=await page.evaluate(()=>{const d=document.querySelector('dialog.rt-doc-zoom');return {pages:d.querySelectorAll('.rt-doc-page').length,canvases:d.querySelectorAll('.rt-doc-page canvas').length}});
    await page.evaluate(()=>{const b=document.querySelector('dialog.rt-doc-zoom .rt-doc-zoom-body');b.scrollTop=b.scrollHeight});
    await page.waitForFunction(()=>document.querySelector('dialog.rt-doc-zoom .rt-doc-page[data-doc-page="103"] canvas'),null,{timeout:30000});
    const vdmEnd=await page.evaluate(()=>{const d=document.querySelector('dialog.rt-doc-zoom');return {first:!!d.querySelector('.rt-doc-page[data-doc-page="1"] canvas'),canvases:d.querySelectorAll('.rt-doc-page canvas').length}});
    await page.click('dialog.rt-doc-zoom [data-zoom-close]');
    check('VDM 매뉴얼 103쪽 팝업이 보이는 쪽만 그리고(첫 화면 canvas 10장 이하) 끝으로 내리면 103쪽이 그려지며 첫 쪽 canvas는 비워짐',vdmTop.pages===103&&vdmTop.canvases>=1&&vdmTop.canvases<=10&&!vdmEnd.first&&vdmEnd.canvases<=10,JSON.stringify({vdmTop,vdmEnd,vdmFirstMs}));
    // 0.126 PC 문서 팝업 폭(사용자 요청 "팝업창의 가로폭이 너무 좁아", "마우스로 창 크기 가변가능할까?"): 기본 1040px,
    // 가장자리를 끌면 폭과 쪽 너비가 함께 바뀌고 다시 열어도 기억하며, 넓게 버튼은 화면 폭, 가장자리 두 번 누르기는 기본 폭. 휴대폰 폭에서는 끌기 막대가 없다.
    {
      const docPc=await browser.newContext({viewport:{width:1600,height:900}});
      const dp=await docPc.newPage();
      await dp.goto(`${home}#products/vdm`,{waitUntil:'networkidle'});
      const openMan=async()=>{await dp.click('[data-doc="Manual"] .rt-pg-doc-open');await dp.waitForFunction(()=>document.querySelector('dialog.rt-doc-zoom[open] .rt-doc-page[data-doc-page="1"] canvas'),null,{timeout:30000})};
      const size=()=>dp.evaluate(()=>{const d=document.querySelector('dialog.rt-doc-zoom');return {dlg:Math.round(d.getBoundingClientRect().width),page:Math.round(d.querySelector('.rt-doc-page').getBoundingClientRect().width)}});
      const pageAfter=w=>dp.waitForFunction(w=>{const d=document.querySelector('dialog.rt-doc-zoom');const c=d.querySelector('.rt-doc-page[data-doc-page="1"] canvas');return c&&Math.abs(d.getBoundingClientRect().width-w)<2&&Math.abs(c.getBoundingClientRect().width-(w-40))<4},w,{timeout:15000});
      await openMan();
      const def=await size();
      const bb=await (await dp.$('[data-doc-resize="right"]')).boundingBox();
      await dp.mouse.move(bb.x+4,bb.y+bb.height/2);await dp.mouse.down();await dp.mouse.move(bb.x+154,bb.y+bb.height/2,{steps:6});await dp.mouse.up();
      const dragW=(await size()).dlg;await pageAfter(dragW);
      await dp.keyboard.press('Escape');await openMan();
      const reopened=await size();
      await dp.click('dialog.rt-doc-zoom [data-doc-wide]');await pageAfter(1584);
      await dp.dblclick('[data-doc-resize="left"]');await pageAfter(1040);
      await dp.keyboard.press('Escape');
      await docPc.close();
      check('PC 매뉴얼 팝업이 기본 1040px이고 가장자리를 끌면 폭·쪽 너비가 함께 넓어지며 다시 열어도 기억, 넓게 버튼은 화면 폭, 두 번 누르면 기본 폭',def.dlg===1040&&def.page===1000&&dragW>=def.dlg+250&&reopened.dlg===dragW,JSON.stringify({def,dragW,reopened}));
      await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
      await page.click('[data-doc="Catalog"] button.rt-pg-doc-open');
      await page.waitForSelector('dialog.rt-doc-zoom[open] .rt-doc-pages img');
      const phone=await page.evaluate(()=>{const d=document.querySelector('dialog.rt-doc-zoom');return {handles:[...d.querySelectorAll('[data-doc-resize]')].map(h=>getComputedStyle(h).display),wide:getComputedStyle(d.querySelector('[data-doc-wide]')).display,dlg:Math.round(d.getBoundingClientRect().width),vw:innerWidth}});
      await page.click('dialog.rt-doc-zoom [data-zoom-close]');
      check('휴대폰 폭에서는 문서 팝업에 끌기 막대·넓게 버튼이 없고 창이 화면 폭(여백 16px)',phone.handles.every(d=>d==='none')&&phone.wide==='none'&&phone.dlg===phone.vw-16,JSON.stringify(phone));
    }
    check('OBUX-1C 송신기 단자 지도가 고해상도 앞뒤 합성 사진에 번호 6개, 수신기 5개(S/P 포함)로 나옴',obuxPm.tx&&obuxPm.rx&&obuxPm.ports.join()==='6,5',JSON.stringify(obuxPm));
    // 0.98 XDM-PSU 03 Signal Flow: 제조사 연결도처럼 프레임(CIS100·COS100) · PSU(POH·PHX) · CTR100 Tx/Rx를 장비 그림으로 그리고 케이블 위 점선이 흐른다. 움직임 줄이기 설정에서는 멈춘다.
    await page.goto(`${home}#products/xdm-psu`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-psu-anim');
    const psuFlow=await page.evaluate(()=>{const svg=document.querySelector('.rt-psu-anim').closest('svg'),t=svg.textContent;return {flows:svg.querySelectorAll('.rt-psu-flow').length,rev:svg.querySelectorAll('.rt-psu-flow.rt-psu-rev').length,anim:getComputedStyle(svg.querySelector('.rt-psu-flow')).animationName,labels:['XDM-CIS100','XDM-COS100','XDM-PSU · POH','XDM-PSU · PHX','TX · 송신기','RX · 수신기','2핀 전원선'].every(s=>t.includes(s))}});
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
    check('XDM-PSU Signal Flow: COS100 피닉스에 전원선 연결, "크게 보기" 창이 150%로 커지고 Esc로 닫힘, XDM-CTR100에는 확대 버튼 없음(0.196부터 PSE에는 있음)',cosPin===1&&zoom.level==='150%'&&zoom.svg&&zoom.wider&&zoomClosed&&otherZoom===0,JSON.stringify({cosPin,zoom,zoomClosed,otherZoom}));
    // 0.196 XDM-CTR100 PSE 03 Signal Flow: XDM-PSU와 같은 장비 그림·흐르는 케이블(조합 1·2, 조합 2의 전원은 역방향)·크게 보기, PSU 05 주요 기능 첫 줄은 "개별 전원 어댑터 불필요"(사용자 요청 2026-10-02).
    await page.goto(`${home}#products/xdm-ctr100-pse`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-psu-anim');
    const pseFlow=await page.evaluate(()=>{const svg=document.querySelector('.rt-psu-anim').closest('svg'),t=svg.textContent;return {flows:svg.querySelectorAll('.rt-psu-flow').length,rev:svg.querySelectorAll('.rt-psu-flow.rt-psu-rev').length,zoom:document.querySelectorAll('[data-flow-zoom]').length,labels:['조합 1','조합 2','TX · 송신기 (PSE)','RX · 수신기 (PD)','RX · 수신기 (PSE)','TX · 송신기 (PD)','CAT · 신호+전원(PoE)'].every(s=>t.includes(s)),desc:/XDM-PSU/.test(document.querySelector('.rt-pg-flow-desc')?.textContent||'')}});
    check('XDM-CTR100 PSE Signal Flow가 XDM-PSU와 같은 장비 그림(조합 1·2)·흐르는 케이블 10가닥(조합 2 전원 역방향)·크게 보기·그림 설명으로 나옴',pseFlow.flows===10&&pseFlow.rev===1&&pseFlow.zoom===1&&pseFlow.labels&&pseFlow.desc,JSON.stringify(pseFlow));
    await page.goto(`${home}#products/xdm-psu`,{waitUntil:'networkidle'});
    await page.waitForSelector('#rt-pg-title');
    const psuFirst=await page.evaluate(()=>{const s=[...document.querySelectorAll('section')].find(x=>/주요 기능/.test(x.querySelector('h2')?.textContent||''));return s?.querySelector('li')?.textContent.trim()});
    check('XDM-PSU 05 주요 기능 첫 줄이 "XDM-CTR100 개별 전원 어댑터 불필요"',/XDM-CTR100 개별 전원 어댑터 불필요/.test(psuFirst||''),psuFirst);
    // 0.95 전체 카탈로그 공유(사용자 결정 2026-09-28 "전체 카탈로그 공개해도 돼"): 제품 상세 카탈로그 버튼은 공용 파일을 제품 쪽(#page=N)에서 열고, 내려받기는 파일 전체. 제품 목록에는 "전체 카탈로그" 버튼 하나.
    await page.goto(`${home}#products/hd-13u`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-toolbar [data-doc="Catalog"]');
    const cat=await page.$eval('.rt-pg-toolbar [data-doc="Catalog"]',el=>{const open=el.querySelector('.rt-pg-doc-open');return {open:open.getAttribute('href')||open.getAttribute('data-doc-preview'),save:el.querySelector('.rt-pg-doc-save').getAttribute('href'),text:el.textContent.trim()}});
    await page.goto(`${home}#products`,{waitUntil:'networkidle'});
    await page.waitForSelector('.rt-pg-grid');
    const listCat=await page.evaluate(()=>[...document.querySelectorAll('.rt-pg-toolbar .rt-pg-doc:not([data-doc="official"])')].map(el=>({text:el.textContent.trim(),href:el.querySelector('.rt-pg-doc-open').getAttribute('href')})));
    const catRes=await page.request.get(new URL(cat.save,home).href);
    // 0.97 제품별 카탈로그(사용자 결정 2026-09-28 "제품별로 잘라 공개"): 제품 상세 버튼은 해당 쪽만 담은 hd-13u-catalog.pdf를 열고 받는다. 제품 목록의 전체 카탈로그 버튼은 46쪽 공용 파일 그대로다.
    const listRes=await page.request.get(new URL(listCat[0]?.href||'',home).href);
    check('HD-13U 카탈로그 버튼이 제품별 카탈로그(hd-13u-catalog.pdf)를 열고 받으며, 제품 목록 전체 카탈로그 버튼 1개는 46쪽 공용 파일(PDF)',cat.open==='output/design/assets/docs/hd-13u-catalog.pdf'&&cat.save==='output/design/assets/docs/hd-13u-catalog.pdf'&&!/쪽/.test(cat.text)&&catRes.status()===200&&String(catRes.headers()['content-type']).includes('pdf')&&listCat.length===1&&/전체 카탈로그/.test(listCat[0].text)&&listCat[0].href==='output/design/assets/docs/rtcom-catalog-2026.pdf'&&listRes.status()===200,JSON.stringify({cat,listCat,status:catRes.status(),list:listRes.status()}));
    // 0.198 공식 홈페이지 버튼: 공식 글이 있는 제품은 새 탭(rtcomav.com) 링크, 송·수신기는 두 글, 공식 글이 없는 제품은 버튼 없음.
    const official=async id=>{await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});await page.waitForSelector('.rt-pg-toolbar');await page.waitForTimeout(200);return page.evaluate(()=>[...document.querySelectorAll('.rt-pg-toolbar [data-doc="official"] a')].map(a=>({text:a.textContent.trim(),href:a.href,blank:a.target==='_blank'&&a.relList.contains('noopener')})))};
    const offHd=await official('hd-13u'),offFt=await official('ft101-u-fr101-u'),offR6=await official('spx-r6');
    check('0.198 공식 홈페이지 버튼: HD-13U 1개, FT101-U/FR101-U 2개(새 탭 rtcomav.com), SPX-R6 없음',offHd.length===1&&offHd[0].text==='공식 홈페이지'&&offFt.length===2&&offFt[1].text==='FR101-U'&&[...offHd,...offFt].every(l=>l.blank&&l.href.startsWith('http://rtcomav.com/kor/bbs/board.php?bo_table='))&&offR6.length===0,JSON.stringify({offHd,offFt,offR6}));
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
      if(await page.locator('.rt-cg-preview [data-action="preview-next"]').isEnabled())await page.click('.rt-cg-preview [data-action="preview-next"]');
      await page.waitForSelector('.rt-rel-card');
      const rel=await page.evaluate(()=>({eyebrow:document.querySelector('.rt-main .rt-eyebrow')?.textContent,cards:[...document.querySelectorAll('.rt-rel-card')].map(a=>a.getAttribute('href')),noChassis:!document.body.innerText.includes('섀시')}));
      check(`${fam} 02 프레임 선택 아래 "함께 보면 좋은 제품" ${related}개(시리즈 상세 포함)가 제품정보로 연결되고, 화면에 "섀시" 표기가 없음`,rel.eyebrow==='02 / 프레임 선택'&&rel.cards.length===related&&rel.cards[0]===`#products/${fam.toLowerCase()}`&&rel.noChassis,JSON.stringify(rel));
      await page.click('[data-jump="0"]');
    }
    await page.click('.rt-cg-preview [data-action="preview-next"]');
    await page.click('button[data-model="XDM-36"]');await acceptConfirm();
    await page.click('.rt-cg-preview [data-action="preview-next"]');
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
    for(const id of ['spx','spx-rx-tx','spx-r6']){
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
    // 0.155: WALL 카드에도 칩이 생겨(QMS-44UX와 같은 방식) QUAD 카드 안에서만 본다.
    const quadCard88=page.locator('.rt-pg-vmode-card',{hasText:'QUAD'}).first();
    const beforeLayout=await quadCard88.evaluate(card=>card.querySelector('[data-layout-name]').textContent);
    await quadCard88.locator('[data-layout-chip]',{hasText:'3-SIDE RIGHT'}).click();
    const afterLayout=await quadCard88.evaluate(card=>({name:card.querySelector('[data-layout-name]').textContent,on:card.querySelector('.rt-pg-layout-chip.on')?.textContent,rects:card.querySelector('[data-layout-preview]').querySelectorAll('svg rect.rt-pg-cell').length}));
    check('QMS-88UX 06 화면 구성 모드에서 레이아웃 버튼을 누르면 미리보기 도해가 바뀜',beforeLayout==='QUAD'&&afterLayout.name==='3-SIDE RIGHT'&&afterLayout.on==='3-SIDE RIGHT'&&afterLayout.rects===4,JSON.stringify({beforeLayout,afterLayout}));
    // 0.66 — QMS-88UX 출력 9번에 매뉴얼 22~23쪽 Output Option 2·3(비율 유지 없이 그대로 8분할)을 레이아웃 목록 13번째로 추가(사용자 요청 2026-09-27 "출력9에 비율무시8분할도 추가해줘").
    await quadCard88.locator('[data-layout-chip]',{hasText:'8분할(비율무시)'}).click();
    const split8=await quadCard88.evaluate(card=>({name:card.querySelector('[data-layout-name]').textContent,rects:card.querySelector('[data-layout-preview]').querySelectorAll('svg rect.rt-pg-cell').length}));
    check('QMS-88UX 06 화면 구성 모드에 "8분할(비율무시)" 레이아웃이 있고 8칸 도해로 미리보기됨',split8.name==='8분할(비율무시)'&&split8.rects===8,JSON.stringify(split8));
    // 0.90 — QMS-88UX DUAL 카드가 "듀얼 모드" 한 마디뿐이었다(사용자 질문 2026-09-28 "QMS-88Ux도 듀얼 출력되지 않아??"). 매뉴얼 KV.04 20~21쪽 근거로 2분할(PBP)·PIP 레이아웃 3종을 넣고, 카드 안에서만 미리보기가 바뀌는지 확인.
    const dualCard=page.locator('.rt-pg-vmode-card',{hasText:'DUAL'});
    await dualCard.locator('[data-layout-chip]',{hasText:'Vertical PBP'}).click();
    const dual=await dualCard.evaluate(card=>({chips:[...card.querySelectorAll('[data-layout-chip]')].map(b=>b.textContent),name:card.querySelector('[data-layout-name]')?.textContent,rects:card.querySelectorAll('[data-layout-preview] svg rect.rt-pg-cell').length,text:card.querySelector('p')?.textContent||''}));
    const quadName=await page.locator('.rt-pg-vmode-card',{hasText:'QUAD'}).first().evaluate(card=>card.querySelector('[data-layout-name]')?.textContent);
    check('QMS-88UX 06 DUAL 카드에 PBP·PIP 레이아웃 3종이 있고 Vertical PBP를 누르면 2칸 도해로 바뀌며 QUAD 카드 미리보기는 그대로임',dual.chips.join('|')==='Horizontal PBP|Vertical PBP|Quad PBP, PIP'&&dual.name==='Vertical PBP'&&dual.rects===2&&/출력 9·10번/.test(dual.text)&&quadName==='8분할(비율무시)',JSON.stringify({dual,quadName}));
    // 0.243 — QMS-88UX 쿼드 뷰·듀얼 카드의 입력 그룹 전환(매뉴얼 KV.04 22쪽: Q1 = 입력 1~4번, Q2 = 입력 5~8번). Q2를 누르면 도해 칸 번호가 5~8로 바뀐다.
    const cellLabels=card=>[...card.querySelectorAll('[data-layout-preview] svg text')].map(t=>t.textContent).join(',');
    await quadCard88.locator('[data-layout-chip]',{hasText:/^QUAD$/}).click();
    const q1Labels=await quadCard88.evaluate(cellLabels);
    await quadCard88.locator('[data-layout-group-btn="2"]').click();
    const q2=await quadCard88.evaluate(card=>({labels:[...card.querySelectorAll('[data-layout-preview] svg text')].map(t=>t.textContent).join(','),note:card.querySelector('[data-layout-group-note]')?.textContent||'',pressed:card.querySelector('[data-layout-group-btn="2"]').getAttribute('aria-pressed'),on:card.querySelector('.rt-pg-vmode-chips .on')?.textContent}));
    await quadCard88.locator('[data-layout-chip]',{hasText:'8분할(비율무시)'}).click();
    const split8Group=await quadCard88.evaluate(card=>({hidden:card.querySelector('[data-layout-groups]').hidden,labels:[...card.querySelectorAll('[data-layout-preview] svg text')].map(t=>t.textContent).join(',')}));
    await quadCard88.locator('[data-layout-chip]',{hasText:'3-SIDE RIGHT'}).click();
    const keepQ2=await quadCard88.evaluate(card=>({hidden:card.querySelector('[data-layout-groups]').hidden,labels:[...card.querySelectorAll('[data-layout-preview] svg text')].map(t=>t.textContent).join(',')}));
    await quadCard88.locator('[data-layout-group-btn="1"]').click();
    const backQ1=await quadCard88.evaluate(cellLabels);
    await dualCard.locator('[data-layout-group-btn="2"]').click();
    const dualQ2=await dualCard.evaluate(card=>[...card.querySelectorAll('[data-layout-preview] svg text')].map(t=>t.textContent).join(','));
    const wallHas=await page.locator('.rt-pg-vmode-card',{hasText:'WALL'}).first().evaluate(card=>!!card.querySelector('[data-layout-groups]'));
    await quadCard88.locator('[data-layout-chip]',{hasText:'8분할(비율무시)'}).click();
    check('QMS-88UX 쿼드 뷰·듀얼에서 Q2 버튼을 누르면 칸 번호가 입력 5~8번으로 바뀌고(8분할은 버튼 숨김·번호 1~8 그대로) Q1로 돌아오면 1~4이며 WALL 카드에는 버튼이 없음',
      q1Labels==='1,2,3,4'&&q2.labels==='5,6,7,8'&&/입력 5~8/.test(q2.note)&&q2.pressed==='true'&&q2.on==='QUAD'&&split8Group.hidden===true&&split8Group.labels==='1,2,3,4,5,6,7,8'&&keepQ2.hidden===false&&keepQ2.labels==='5,6,7,8'&&backQ1==='1,2,3,4'&&dualQ2==='5,6'&&wallHas===false,
      JSON.stringify({q1Labels,q2,split8Group,keepQ2,backQ1,dualQ2,wallHas}));
    // 0.152 — QMS-88UX WALL 요약이 "최대 3×3"뿐이었다(매뉴얼 KV.04 19쪽: 2×2 월 최대 2개, 월 1개면 최대 3×3·2×5).
    // 0.155(사용자 요청 2026-09-29 "QMS-44 비디오월 기능을 88에도 동일한 컨셉으로 만들어줘"): 0.152에서 두지 않았던 WALL 칩을 44UX처럼 넣었다. 2×2 + 2×2는 월 2개(8칸, 출력 1~8), 2×5는 10칸.
    const wallCard88=page.locator('.rt-pg-vmode-card',{hasText:'WALL'}).first();
    await wallCard88.locator('[data-layout-chip]',{hasText:'2×2 + 2×2'}).click();
    const wallTwo=await wallCard88.evaluate(card=>card.querySelectorAll('[data-layout-preview] svg rect.rt-pg-cell').length);
    await wallCard88.locator('[data-layout-chip]',{hasText:'2×5'}).click();
    const wall=await wallCard88.evaluate(card=>({text:card.querySelector('p')?.textContent||'',chips:[...card.querySelectorAll('[data-layout-chip]')].map(b=>b.textContent).join('|'),cells:card.querySelectorAll('[data-layout-preview] svg rect.rt-pg-cell').length}));
    check('QMS-88UX 06 WALL 카드에 2×2 월 2개·3×3·2×5가 적혀 있고 레이아웃 칩 4종(2×2 + 2×2는 8칸, 2×5는 10칸)으로 미리보기됨',/2×2 월 최대 2개/.test(wall.text)&&/3×3·2×5/.test(wall.text)&&wall.chips==='2×2|2×2 + 2×2|3×3|2×5'&&wallTwo===8&&wall.cells===10,JSON.stringify({wall,wallTwo}));
    // 0.159(사용자 요청 2026-09-29 "1TO1, ALL, 임의스위칭 이거는 빼고 그냥 크로스포인트 이미지만"): MATRIX 카드에는 칩 없이 크로스포인트 그림 한 장(QMS-44UX 출력 4칸, QMS-88UX 출력 8칸).
    const matrixViews={};
    for(const id of ['qms-44ux','qms-88ux']){
      await page.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
      await page.waitForSelector('.rt-pg-layout-matrix');
      matrixViews[id]=await page.locator('.rt-pg-vmode-card',{hasText:'MATRIX'}).first().evaluate(card=>({chips:card.querySelectorAll('[data-layout-chip]').length,outs:card.querySelectorAll('svg.rt-pg-layout-matrix rect.rt-pg-cell').length,lines:card.querySelectorAll('svg.rt-pg-layout-matrix path[stroke-width="2.4"]').length}));
    }
    check('QMS-44UX·88UX 06 MATRIX 카드에 칩 없이 크로스포인트 그림(출력 4·8칸, 선 4·8개)이 나옴',matrixViews['qms-44ux'].chips===0&&matrixViews['qms-44ux'].outs===4&&matrixViews['qms-44ux'].lines===4&&matrixViews['qms-88ux'].chips===0&&matrixViews['qms-88ux'].outs===8&&matrixViews['qms-88ux'].lines===8,JSON.stringify(matrixViews));
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
    await pc.click('.rt-cg-preview [data-action="preview-next"]');
    await pc.click('button[data-model="XDM-36"]');
    await pc.click('.rt-cg-preview [data-action="preview-next"]');
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
    await nextToLinks(pc);
    await pc.waitForLoadState('networkidle');
    // .rt-link-flow는 align-items:center라 노드마다 높이가 달라도(엔드포인트·전송기·카드 사진 높이가 제각각) 한 줄이면 top은 다르고
    // "세로 중심"(top+height/2)은 같다. top 자체를 비교하면 정상 상태에서도 오탐 FAIL이 나서(직접 확인함), 세로 중심으로 비교한다.
    const flowNodes=await pc.$$eval('.rt-link-flow .rt-link-flow-node',nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {top:r.top,center:r.top+r.height/2}}));
    const centers=flowNodes.map(node=>node.center);
    const flowSpread=centers.length?Math.max(...centers)-Math.min(...centers):Infinity;
    check('PC(1280px) 04 연결 흐름 노드가 한 줄로 나옴(세로 중심 차이 2px 이하)',flowSpread<=2,`노드 ${flowNodes.length}개, 세로 중심 차이 ${flowSpread.toFixed(1)}px, top 목록 ${JSON.stringify(flowNodes.map(node=>Math.round(node.top)))}`);
    // 0.175(사용자 지적 2026-09-29 "이 부분 개선이 필요해보여"): 케이블 점선 위에는 거리만 두고 긴 문장은 흐름 아래 한 줄로 옮겨, 전송기 사진과 겹치거나 잘리지 않는다.
    const flowFit=await pc.evaluate(()=>{const inside=(a,b)=>a.left>=b.left-1&&a.right<=b.right+1&&a.top>=b.top-1&&a.bottom<=b.bottom+1;const imgs=[...document.querySelectorAll('.rt-link-flow-node img')].map(img=>inside(img.getBoundingClientRect(),img.closest('.rt-link-flow-node').getBoundingClientRect()));const cable=document.querySelector('.rt-link-flow-cable'),label=cable?.querySelector('small');const names=[...document.querySelectorAll('.rt-link-flow-node strong')].map(el=>Math.round(el.getBoundingClientRect().height));return {imgs,cable:label?.textContent,cableFit:cable&&label?inside(label.getBoundingClientRect(),cable.getBoundingClientRect()):false,spec:document.querySelector('.rt-link-flow-spec')?.textContent||'',names,old:/CAT6a\/CAT7/.test(document.querySelector('#matrix-configurator').innerText)}});
    check('PC 04 연결 흐름: 사진은 상자 안, 케이블 점선 위는 "최대 100m"만(상자 안), 케이블 문장은 아래 한 줄에 "S/FTP CAT6A 필수", 이름은 한 줄, 옛 "CAT6a/CAT7" 표기 없음',flowFit.imgs.length>0&&flowFit.imgs.every(Boolean)&&flowFit.cable==='최대 100m'&&flowFit.cableFit&&/S\/FTP CAT6A 필수/.test(flowFit.spec)&&flowFit.names.every(h=>h<=22)&&!flowFit.old,JSON.stringify(flowFit));
    // 0.177(사용자 결정 2026-09-29 "둘 다 진행"): 04 왼쪽 목록은 카드마다 제목·연결 채널 한 줄 + [전송기 | 연결하지 않음] 선택 막대 한 줄이다.
    // 선택지는 한 줄(같은 top)에 놓이고, 설명 목록은 숨고, 카드 묶음 하나가 120px을 넘지 않는다. XDM-CT103/CR103 단자 설명도 "CAT6A S/FTP"로 통일했다.
    const compact=await pc.evaluate(async()=>{const groups=[...document.querySelectorAll('.rt-cg-link-group')];const res=await fetch('data/products/xdm-ct103-cr103.json').then(r=>r.text());return {groups:groups.length,maxHeight:Math.max(...groups.map(g=>Math.round(g.getBoundingClientRect().height))),oneLine:groups.every(g=>{const tops=[...g.querySelectorAll('.rt-cg-row')].map(b=>Math.round(b.getBoundingClientRect().top));return tops.length>1&&Math.max(...tops)-Math.min(...tops)<=1}),specsHidden:[...document.querySelectorAll('.rt-cg-link-group .rt-cg-row-specs')].every(el=>getComputedStyle(el).display==='none'),titled:[...document.querySelectorAll('.rt-cg-link-group .rt-cg-row')].every(b=>b.title),ctUftp:/U\/FTP로 연결/.test(res),ctSftp:(res.match(/S\/FTP CAT6A 케이블로 연결/g)||[]).length}});
    check('PC 04 왼쪽 목록이 카드마다 한 줄 선택 막대(선택지 한 줄·설명 숨김·마우스 설명 title·묶음 높이 120px 이하)이고, XDM-CT103/CR103 단자 설명은 "S/FTP CAT6A"(0.184 표기 통일)',compact.groups===18&&compact.maxHeight<=120&&compact.oneLine&&compact.specsHidden&&compact.titled&&!compact.ctUftp&&compact.ctSftp===2,JSON.stringify(compact));
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
    await mobile.click('.rt-cg-preview [data-action="preview-next"]');
    await mobile.click('button[data-model="SPX-M3236"]');
    await mobile.click('.rt-cg-preview [data-action="preview-next"]');
    await mobile.waitForLoadState('networkidle');
    const rows=await mobile.$$eval('.rt-rack-zone-input .rt-rack-slot',slots=>slots.map(slot=>slot.getBoundingClientRect()).map(rect=>[rect.top,rect.bottom]));
    const photoFits=await mobile.$eval('.rt-rack-photo',figure=>figure.getBoundingClientRect().right<=document.documentElement.clientWidth);
    check('터치 휴대폰에서 SPX-M3236 입력 슬롯 4개가 겹치지 않고 사진이 화면 폭 안에 들어감',rows.length===4&&rows.every((row,index)=>index===0||row[0]>=rows[index-1][1]-0.5)&&photoFits,JSON.stringify(rows.map(row=>row.map(Math.round))));
    await mobile.goto(home,{waitUntil:'networkidle'});
    await mobile.evaluate(()=>localStorage.clear());
    await mobile.goto(home,{waitUntil:'networkidle'});
    await mobile.click('button[data-family="XDM"]');
    await mobile.click('.rt-cg-preview [data-action="preview-next"]');
    await mobile.click('button[data-model="XDM-20"]');
    await mobile.click('.rt-cg-preview [data-action="preview-next"]');
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
    // 신호·조건의 긴 문장에 밀려 좁은 화면에서 한 글자씩 줄바꿈되던 문제(전수 조사로 발견). 31개 제품 전체를 여러 폭에서 확인해 재발을 막는다.
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
      check('입출력 단자 표에서 방향("입력"·"출력"·"입출력")·수량(숫자) 칸이 31개 제품·6개 화면 폭(320~1024px)에서 두 줄로 쪼개지지 않음',wrappedFixedCells.length===0,JSON.stringify(wrappedFixedCells));
    }
    // 0.142 AI 검색(사내 베타): 기본 공개 화면에는 버튼이 없고 ?ai=beta로 켠 브라우저에만 보인다. 서버는 가짜(route)로 대신해 로그인 토큰 수신·질문·답 표시를 확인한다.
    {
      const plain=await browser.newPage({viewport:{width:1280,height:900}});
      await plain.goto(home,{waitUntil:'networkidle'});
      check('AI 검색: 공개 사이트 기본 화면에는 AI 검색 버튼이 없음',await plain.locator('.rt-ai-open').count()===0);
      await plain.goto(`${home}?ai=beta#matrix-configurator`,{waitUntil:'networkidle'});
      const flagged={button:await plain.locator('.rt-ai-open').count(),url:plain.url()};
      await plain.click('.rt-ai-open');
      const notReady=await plain.locator('.rt-ai-panel .rt-ai-notice').first().textContent();
      check('AI 검색: ?ai=beta로 켜면 버튼이 생기고 주소의 ai=beta는 지워지며, 서버 주소가 없으면 준비 중 안내·보내기 잠김',flagged.button===1&&!flagged.url.includes('ai=beta')&&/준비되지 않았습니다/.test(notReady)&&await plain.locator('.rt-ai-form .rt-ai-send').isDisabled(),JSON.stringify(flagged));
      await plain.goto(`${home}#products`,{waitUntil:'networkidle'});
      check('AI 검색: 한 번 켠 브라우저는 다음 방문에도 버튼 유지',await plain.locator('.rt-ai-open').count()===1);
      await plain.goto(`${home}?ai=off`,{waitUntil:'networkidle'});
      check('AI 검색: ?ai=off로 버튼 끄기',await plain.locator('.rt-ai-open').count()===0);
      // 로그인 창이 opener를 잃으면 Worker가 ?ai=beta#ai-token=… 으로 돌려보낸다. 토큰을 저장하고 주소에서 지운 뒤 구성기 첫 화면을 연다.
      await plain.goto(`${home}?ai=beta#ai-token=abc.def`,{waitUntil:'networkidle'});
      const fragment=await plain.evaluate(()=>({hash:location.hash,search:location.search,token:localStorage.getItem('rtcom.ai.token.v1'),button:!!document.querySelector('.rt-ai-open'),configurator:!document.querySelector('.rt-configurator-view').hidden}));
      check('AI 검색: #ai-token= 으로 돌아온 토큰을 저장하고 주소에서 지움',fragment.hash==='#matrix-configurator'&&fragment.search===''&&/abc\.def/.test(fragment.token||'')&&fragment.button&&fragment.configurator,JSON.stringify(fragment));
      await plain.close();
      const aiContext=await browser.newContext({viewport:{width:390,height:844}});
      await aiContext.addInitScript(()=>{globalThis.RTCOM_AI_TEST_CONFIG={api:'https://ai-api.test',login:'https://ai-login.test'};try{localStorage.setItem('rtcom.ai.beta.v1','1')}catch(error){}});
      const asked=[];
      await aiContext.route('https://ai-api.test/**',async route=>{
        const request=route.request(),cors={'access-control-allow-origin':origin,'access-control-allow-headers':'authorization, content-type','access-control-allow-methods':'GET, POST, OPTIONS'};
        if(request.method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
        if(request.headers().authorization!=='Bearer test-token')return route.fulfill({status:401,headers:{...cors,'content-type':'application/json'},body:JSON.stringify({error:'login',message:'회사 메일로 다시 로그인해 주세요.'})});
        if(request.url().endsWith('/api/me'))return route.fulfill({status:200,headers:{...cors,'content-type':'application/json'},body:JSON.stringify({email:'sales1@seoulav1.co.kr',exp:Date.now()+3600e3})});
        asked.push(JSON.parse(request.postData()));
        const lines=[{t:'text',v:'### 추천\n- [[hd-13u]] 1:3 분배, [[qms-88ux]]와 비교\n'},{t:'text',v:'| 구분 | HD-13U | QMS-88UX |\n|---|---|---|\n| 출력 | **3** | 10 |\n\n<img src=x onerror=alert(1)>'},{t:'done',stop:'end_turn'}];
        return route.fulfill({status:200,headers:{...cors,'content-type':'application/x-ndjson'},body:lines.map(line=>JSON.stringify(line)).join('\n')+'\n'});
      });
      const ai=await aiContext.newPage();
      const aiErrors=[];ai.on('pageerror',error=>aiErrors.push(error.message));
      await ai.goto(home,{waitUntil:'networkidle'});
      await ai.click('.rt-ai-open');
      await ai.waitForSelector('.rt-ai-login [data-ai="login"]');
      await ai.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://evil.test',data:{type:'rtcom-ai-token',token:'evil',email:'x@evil.test'}})));
      const afterEvil=await ai.evaluate(()=>localStorage.getItem('rtcom.ai.token.v1'));
      await ai.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://ai-login.test',data:{type:'rtcom-ai-token',token:'test-token',email:'sales1@seoulav1.co.kr',exp:Date.now()+3600e3}})));
      const stored=await ai.evaluate(()=>localStorage.getItem('rtcom.ai.token.v1'));
      check('AI 검색: 로그인 창(허용 origin)에서 온 토큰만 받고 로그인 메일을 표시',afterEvil===null&&/test-token/.test(stored||'')&&(await ai.locator('.rt-ai-who').textContent())==='sales1@seoulav1.co.kr'&&await ai.locator('.rt-ai-login').count()===0,String(afterEvil));
      await ai.click('.rt-ai-modes [data-mode="compare"]');
      await ai.fill('.rt-ai-form textarea','HD-13U와 QMS-88UX 출력 수 비교');
      await ai.click('.rt-ai-form .rt-ai-send');
      await ai.waitForSelector('.rt-ai-assistant table');
      const rendered=await ai.evaluate(()=>{const answer=document.querySelector('.rt-ai-assistant'),links=[...answer.querySelectorAll('a.rt-ai-product')];return {links:links.map(link=>`${link.getAttribute('href')}=${link.textContent}`),h4:answer.querySelector('h4')?.textContent,strong:answer.querySelector('td strong')?.textContent,img:answer.querySelectorAll('img').length,raw:answer.textContent.includes('<img')}});
      check('AI 검색: 답의 [[제품id]]는 제품 상세 링크, 제목·표·굵게를 그리고 HTML은 글자로만 보임',rendered.links.join()==='#products/hd-13u=HD-13U,#products/qms-88ux=QMS-88UX'&&rendered.h4==='추천'&&rendered.strong==='3'&&rendered.img===0&&rendered.raw,JSON.stringify(rendered));
      check('AI 검색: 질문은 선택한 요청 유형(사양 비교)과 함께 전송',asked.length===1&&asked[0].mode==='compare'&&asked[0].question==='HD-13U와 QMS-88UX 출력 수 비교'&&Array.isArray(asked[0].history),JSON.stringify(asked));
      const panelBox=await ai.evaluate(()=>{const rect=document.querySelector('.rt-ai-panel').getBoundingClientRect();return {width:Math.round(rect.width),viewport:innerWidth,scroll:document.documentElement.scrollWidth}});
      check('AI 검색: 휴대폰에서 창이 화면 폭에 맞고 가로 스크롤 없음',Math.abs(panelBox.width-panelBox.viewport)<2&&panelBox.scroll<=panelBox.viewport,JSON.stringify(panelBox));
      await ai.screenshot({path:'docs/qa/ai-search-beta/mobile-answer.png'});
      await ai.setViewportSize({width:1400,height:900});
      await ai.screenshot({path:'docs/qa/ai-search-beta/desktop-answer.png'});
      await ai.keyboard.press('Escape');
      check('AI 검색: Esc로 창 닫기·스크립트 오류 없음',await ai.locator('.rt-ai-panel').isHidden()&&aiErrors.length===0,aiErrors.join(' | '));
      await aiContext.close();
    }
    // 0.143(사용자 요청 2026-09-29 "카드 정보를 클릭하면 상세 정보", "VDM,SPX 모두 동일하게"): 제품정보 04 카드 라인업 행을 누르면 카드 상세 팝업이 열리고, 행·팝업에 연동 전송기 표기가 없다.
    {
      const cardPage=await browser.newPage({viewport:{width:1280,height:1000}});
      const cardResult={};
      for(const id of ['xdm','spx','vdm']){
        await cardPage.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
        await cardPage.waitForSelector('.rt-pg-cardbtn');
        const rows=await cardPage.$$eval('.rt-pg-cardbtn',nodes=>nodes.map(node=>node.textContent.replace(/\s+/g,' ').trim()));
        await cardPage.locator('.rt-pg-cardbtn').first().click();
        const dialogText=await cardPage.locator('dialog.rt-card-info-modal').innerText();
        cardResult[id]={rows:rows.length,linkedInRows:rows.filter(text=>/↔|CTR100|CT103|CR103|FT101|FR101|CT104|CR104/.test(text)).length,linkedInPopup:dialogText.includes('연동 전송기'),hasSpec:/신호/.test(dialogText)};
        await cardPage.locator('dialog.rt-card-info-modal [data-card-info-close]').first().click();
      }
      check('제품정보 XDM·SPX·VDM 04 카드 라인업: 행을 누르면 카드 상세 팝업이 열리고 연동 전송기 표기가 없음',Object.values(cardResult).every(r=>r.rows>=4&&r.linkedInRows===0&&!r.linkedInPopup&&r.hasSpec),JSON.stringify(cardResult));
      await cardPage.close();
    }
    // 0.146(사용자 요청 2026-09-29 "QMS-44UX 매뉴얼에 나와 있는 분할이 다르다"): QMS-44UX QUAD 레이아웃 도해가 매뉴얼 21~22쪽대로 나오고, 이름이 같은 QMS-88UX 도해는 그대로다.
    {
      const shapePage=await browser.newPage({viewport:{width:1300,height:1000}});
      const cellCount=async(id,layout)=>{
        await shapePage.goto(`${home}#products/${id}`,{waitUntil:'networkidle'});
        await shapePage.waitForSelector('.rt-pg-layout-chip');
        const card=shapePage.locator('.rt-pg-vmode-card',{has:shapePage.locator(`.rt-pg-layout-chip[data-layout="${layout}"]`)}).first();
        await card.locator(`.rt-pg-layout-chip[data-layout="${layout}"]`).click();
        return card.locator('.rt-pg-layout-preview svg rect.rt-pg-cell').count();
      };
      const got={cascade:await cellCount('qms-44ux','CASCADE1'),pop:await cellCount('qms-44ux','4CH-POP'),mode1:await cellCount('qms-44ux','3CH-MODE1'),user2:await cellCount('qms-44ux','USER MODE 2'),user1:await cellCount('qms-44ux','USER MODE 1'),user88:await cellCount('qms-88ux','USER MODE 1')};
      check('QMS-44UX QUAD 도해가 매뉴얼대로(CASCADE1 4칸·4CH-POP 4칸·3CH-MODE1 3칸·USER MODE 1 4칸·USER MODE 2 4칸)이고 QMS-88UX USER MODE 1은 3칸 그대로',got.cascade===4&&got.pop===4&&got.mode1===3&&got.user1===4&&got.user2===4&&got.user88===3,JSON.stringify(got));
      // 0.156(사용자 결정 "메뉴얼 기준으로 해줘"): QMS-44UX DUAL PBP·PIP는 2칸 그림, 매뉴얼에 배치 설명이 없는 PBP-Full·User Mode는 그림 없이 안내 문구만.
      const noDraw=async(layout)=>{const card=shapePage.locator('.rt-pg-vmode-card',{has:shapePage.locator(`.rt-pg-layout-chip[data-layout="${layout}"]`)}).first();await card.locator(`.rt-pg-layout-chip[data-layout="${layout}"]`).click();return card.locator('.rt-pg-layout-preview').evaluate(el=>({cells:el.querySelectorAll('rect.rt-pg-cell').length,note:el.querySelector('[data-layout-nodrawing]')?.textContent||''}))};
      const dual44={pbp:await cellCount('qms-44ux','PBP'),pip:await cellCount('qms-44ux','PIP'),full:await noDraw('PBP-Full'),user:await noDraw('User Mode')};
      check('QMS-44UX DUAL PBP·PIP는 2칸 그림이고 PBP-Full·User Mode는 "매뉴얼에 배치 그림 없음" 안내만 나옴',dual44.pbp===2&&dual44.pip===2&&dual44.full.cells===0&&dual44.user.cells===0&&dual44.full.note==='매뉴얼에 배치 그림 없음'&&dual44.user.note==='매뉴얼에 배치 그림 없음',JSON.stringify(dual44));
      await shapePage.close();
    }
    // 0.147 (1) QMS-88UX 도해 재대조: 3-SIDE RIGHT 1번 60%·USER MODE 2 검은 여백. (2) 제품정보 인쇄/PDF는 제품 화면을 인쇄(구성기 검토 시트 숨김). (3) 장착 슬롯 호버 × 로 카드 빼기.
    {
      const p3=await browser.newPage({viewport:{width:1300,height:1000}});
      const pick=async(layout)=>{
        await p3.goto(`${home}#products/qms-88ux`,{waitUntil:'networkidle'});
        await p3.waitForSelector('.rt-pg-layout-chip');
        const card=p3.locator('.rt-pg-vmode-card',{has:p3.locator(`.rt-pg-layout-chip[data-layout="${layout}"]`)}).first();
        await card.locator(`.rt-pg-layout-chip[data-layout="${layout}"]`).click();
        return card.locator('.rt-pg-layout-preview svg');
      };
      const side=await pick('3-SIDE RIGHT');const sideW=await side.locator('rect.rt-pg-cell').first().getAttribute('data-w');
      const um2=await pick('USER MODE 2');const um2Black=await um2.locator('rect.rt-pg-layout-letterbox').count();
      check('QMS-88UX 도해가 매뉴얼 21쪽대로(3-SIDE RIGHT 1번 폭 60, USER MODE 2 검은 여백)',sideW==='60'&&um2Black===1,`${sideW}/${um2Black}`);
      await p3.goto(`${home}#products/ct104-u-cr104-u`,{waitUntil:'networkidle'});await p3.waitForSelector('.rt-pg-title');
      await p3.emulateMedia({media:'print'});
      const pr=await p3.evaluate(()=>({report:getComputedStyle(document.getElementById('print-report')).display,title:getComputedStyle(document.querySelector('.rt-pg-title')).display,toolbar:getComputedStyle(document.querySelector('.rt-pg-toolbar')).display}));
      check('제품정보에서 인쇄/PDF는 구성기 검토 시트(#print-report)를 숨기고 제품 화면을 인쇄함',pr.report==='none'&&pr.title!=='none'&&pr.toolbar==='none',JSON.stringify(pr));
      await p3.emulateMedia({media:'screen'});
      await p3.goto(home,{waitUntil:'networkidle'});await p3.evaluate(()=>localStorage.clear());await p3.goto(home,{waitUntil:'networkidle'});
      await p3.locator('button[data-family="XDM"]').first().click();await p3.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
      await p3.click('button[data-model="XDM-12"]');await p3.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
      await p3.locator('button[data-slot="in-1"]').click();await p3.locator('.rt-card-modal .rt-card-choice').nth(1).click();
      const xBefore=await p3.locator('button[data-slot="in-1"] .rt-rack-slot-x').isVisible();
      await p3.locator('button[data-slot="in-1"]').hover();const xHover=await p3.locator('button[data-slot="in-1"] .rt-rack-slot-x').isVisible();
      await p3.locator('button[data-slot="in-1"] .rt-rack-slot-x').click();await p3.waitForTimeout(200);
      const left=await p3.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements['in-1']||null);
      const modalOpen=await p3.locator('dialog.rt-card-modal[open]').count();
      check('장착 슬롯은 평소에는 × 가 안 보이고 마우스를 올리면 보이며, 누르면 카드가 빠지고 팝업은 열리지 않음',!xBefore&&xHover&&left===null&&modalOpen===0,JSON.stringify({xBefore,xHover,left,modalOpen}));
      // 0.165(사용자 결정 2026-09-29 "터치 화면에서는 × 버튼을 항상 보이게"): 마우스가 없는 화면(hasTouch·isMobile)은 × 가 늘 보이고, 손가락으로 누르면 카드가 빠진다(팝업은 열리지 않음).
      {
        const touchCtx=await browser.newContext({viewport:{width:820,height:1180},isMobile:true,hasTouch:true});
        const t=await touchCtx.newPage();
        await t.goto(home,{waitUntil:'networkidle'});await t.evaluate(()=>localStorage.clear());await t.goto(home,{waitUntil:'networkidle'});
        await t.locator('button[data-family="XDM"]').first().click();await t.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
        await t.click('button[data-model="XDM-12"]');await t.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
        await t.locator('button[data-slot="in-1"]').click();await t.locator('.rt-card-modal .rt-card-choice').nth(1).click();
        const media=await t.evaluate(()=>matchMedia('(hover:none),(pointer:coarse)').matches);
        const tx=t.locator('button[data-slot="in-1"] .rt-rack-slot-x');
        const shown=await tx.isVisible();const box=await tx.boundingBox();
        const emptyX=await t.locator('button[data-slot="in-2"] .rt-rack-slot-x').count();
        await tx.tap();await t.waitForTimeout(200);
        const gone=await t.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.placements['in-1']||null);
        const opened=await t.locator('dialog.rt-card-modal[open]').count();
        check('터치 화면에서는 장착 슬롯의 × 가 늘 보이고(20px 이상) 빈 슬롯에는 없으며, 누르면 카드가 빠지고 팝업은 열리지 않음',media&&shown&&box&&box.width>=19.5&&emptyX===0&&gone===null&&opened===0,JSON.stringify({media,shown,w:box&&box.width,emptyX,gone,opened}));
        await touchCtx.close();
      }
      // 0.173(사용자 결정 2026-09-29 "추천A대로 진행해줘"): 03 카드 슬롯에서 카드를 꽂고 "다음"을 누르면 같은 03 안의 ② 신호 입력으로 가고,
      // 포트마다 신호명을 적으면(Enter로 다음 칸) 자동 저장되며, 실행 취소로 되돌릴 수 있고, 한 번 더 "다음"을 누르면 04 전송기로 간다.
      {
        const s=await browser.newPage({viewport:{width:1300,height:1000}});const errs=[];s.on('pageerror',e=>errs.push(e.message));
        await s.goto(home,{waitUntil:'networkidle'});await s.evaluate(()=>localStorage.clear());await s.goto(home,{waitUntil:'networkidle'});
        await s.locator('button[data-family="XDM"]').first().click();await s.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
        await s.click('button[data-model="XDM-12"]');await s.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
        const noTabs=await s.locator('.rt-cards-sub').count();
        for(const [slot,cardId] of [['in-1','XDM-HIS100'],['in-2','XDM-HIS100'],['out-1','XDM-COS100'],['out-2','XDM-HOS100']]){await s.locator(`button[data-slot="${slot}"]`).click();await s.locator(`.rt-card-modal .rt-card-choice[data-card="${cardId}"]`).click()}
        const tabs=await s.locator('.rt-cards-sub [data-cards-sub]').count(),label=await s.locator('[data-action="next"] span').first().textContent();
        await s.click('[data-action="next"]');
        const inputs=s.locator('.rt-signal-input'),n=await inputs.count(),step=await s.locator('.rt-step[aria-current="step"]').getAttribute('data-jump');
        const tags=await s.locator('.rt-signal-slot strong').allTextContents(),ranges=await s.locator('.rt-signal-range').allTextContents();
        await inputs.nth(0).click();await s.keyboard.type('PC');await s.keyboard.press('Enter');await s.keyboard.type('PC2');await s.keyboard.press('Enter');
        const focused=await s.evaluate(()=>document.activeElement?.dataset.signalPort);
        const saved=await s.evaluate(()=>{const p=JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state.portAssignments;return [p['in-1:1'].assignedDevice,p['in-1:2'].assignedDevice]});
        const count=await s.locator('[data-signal-count] b').textContent();
        const [avbDownload]=await Promise.all([s.waitForEvent('download'),s.click('[data-action="av-builder"]')]);
        const avb=JSON.parse(require('node:fs').readFileSync(await avbDownload.path(),'utf8'));
        const avbOk=avbDownload.suggestedFilename()==='RTCOM-XDM-12-av-builder.json'&&avb.nodes.some(n=>n.id==='rtcom_matrix'&&n.data.inputs.length===8&&n.data.inputs[0].label==='HDMI #1-1 PC')&&Array.isArray(avb.edges);
        check('03 ② 신호 입력의 "AV 빌더용 파일 내려받기"가 AV 빌더 구성도 JSON(매트릭스 입력 8포트, 첫 포트 "HDMI #1-1 PC")을 내려받음',avbOk,JSON.stringify({file:avbDownload.suggestedFilename(),nodes:avb.nodes.length,edges:avb.edges.length}));
        // 0.174 B안(사용자 결정 "B가 내가 원하는거야"): "AV 빌더에서 바로 열기"는 AV 빌더를 새 탭(?import=rtcom)으로 열고 창 사이 메시지로 구성도를 넘긴다.
        // AV 빌더 주소 요청을 가짜 화면으로 바꿔(1) 준비→구성도→완료 흐름과 (2) 준비 신호가 없을 때 10초 뒤 파일 내려받기를 확인한다.
        let fakeMode='handshake';
        await s.context().route('https://seoul-visual-tech.github.io/**',route=>route.fulfill({contentType:'text/html',body:fakeMode==='handshake'?"<!doctype html><script>const o=window.opener;addEventListener('message',e=>{const m=e.data;if(m&&m.type==='rtcom:diagram'){window.__got={origin:e.origin,version:m.version,nodes:m.diagram.nodes.length,edges:m.diagram.edges.length,first:m.diagram.nodes.find(n=>n.id==='rtcom_matrix').data.inputs[0].label};o.postMessage({type:'av-builder:imported',nodes:m.diagram.nodes.length,edges:m.diagram.edges.length},'*')}});o.postMessage({type:'av-builder:ready'},'*');</script>":'<!doctype html><title>old builder</title>'}));
        const [pop]=await Promise.all([s.waitForEvent('popup'),s.click('[data-action="av-builder-open"]')]);
        await s.waitForFunction(()=>/AV 빌더에 구성을 넣었습니다/.test(document.querySelector('#save-status')?.textContent||''),null,{timeout:10000}).catch(()=>{});
        const got=await pop.evaluate(()=>({search:location.search,got:window.__got||null}));
        const doneText=await s.evaluate(()=>document.querySelector('#save-status')?.textContent||'');
        await pop.close();
        fakeMode='old';
        const [oldPop,fallback]=await Promise.all([s.waitForEvent('popup'),s.waitForEvent('download',{timeout:16000}),s.click('[data-action="av-builder-open"]')]);
        const fallbackText=await s.evaluate(()=>document.querySelector('#save-status')?.textContent||'');
        await oldPop.close();await s.context().unroute('https://seoul-visual-tech.github.io/**');
        check('03 ② "AV 빌더에서 바로 열기": 새 탭(?import=rtcom)에 준비 신호가 오면 구성도(version 1, 첫 포트 "HDMI #1-1 PC")를 보내고 완료를 표시하며, 준비 신호가 없으면 10초 뒤 같은 파일을 내려받음',got.search==='?import=rtcom'&&got.got&&got.got.version===1&&got.got.first==='HDMI #1-1 PC'&&got.got.nodes>0&&/AV 빌더에 구성을 넣었습니다 · 장비 \d+대/.test(doneText)&&fallback.suggestedFilename()==='RTCOM-XDM-12-av-builder.json'&&/자동 받기를 지원하지 않아 파일로 다운로드했습니다/.test(fallbackText),JSON.stringify({got,doneText,fallback:fallback.suggestedFilename(),fallbackText}));
        await s.click('[data-tool="undo"]');
        const afterUndo=await s.evaluate(()=>[...document.querySelectorAll('.rt-signal-input')].slice(0,2).map(i=>i.value));
        await s.click('[data-action="back"]');const backToSlots=await s.locator('.rt-rack-slot').count()>0&&await s.locator('.rt-signal-input').count()===0;
        await s.click('[data-cards-sub="signals"]');await s.click('[data-action="next"]');
        const toLinks=await s.locator('.rt-step[aria-current="step"]').getAttribute('data-jump');
        check('03 카드 슬롯: 카드가 없으면 전환 탭이 없고, 카드를 꽂으면 "다음"이 ② 신호 입력(16칸, HDMI #1·HDMI #2·HDBT #1·HDMI #2, IN 1~4)으로 가며, Enter로 다음 칸·자동 저장·실행 취소·이전(① 카드 장착)·04 전송기 이동이 동작',noTabs===0&&tabs===2&&label==='빈칸 2개 남음 · 그래도 다음'&&n===16&&step==='2'&&tags.join('|')==='HDMI #1|HDMI #2|HDBT #1|HDMI #2'&&ranges[0]==='IN 1~4'&&ranges[1]==='IN 5~8'&&focused==='in-1:3'&&saved.join('|')==='PC|PC2'&&count==='2'&&afterUndo.join('|')==='PC|'&&backToSlots&&toLinks==='3'&&errs.length===0,JSON.stringify({noTabs,tabs,label,n,step,tags,ranges,focused,saved,count,afterUndo,backToSlots,toLinks,errs}));
        await s.close();
      }
      // 0.162 카드 끌어 놓기 샘플(직원 제안, 사용자 승인 2026-09-29): 아래 카드 정보 버튼을 같은 방향 슬롯에 끌어 놓으면 장착·교체하고, 다른 방향 슬롯에는 놓이지 않으며, 누르면 상세 정보는 그대로 열린다.
      const saved=()=>p3.evaluate(()=>JSON.parse(localStorage.getItem('rtcom.configuration.v1')).state);
      const chipDraggable=await p3.locator('button.rt-card-info-chip[data-palette-card="XDM-HIS100"]').getAttribute('draggable');
      await p3.dragAndDrop('button.rt-card-info-chip[data-palette-card="XDM-HIS100"]','button[data-slot="in-2"]');await p3.waitForTimeout(200);
      await p3.dragAndDrop('button.rt-card-info-chip[data-palette-card="XDM-HIS100"]','button[data-slot="out-1"]');await p3.waitForTimeout(200);
      const wrongDir=(await saved()).placements['out-1']||null;
      await p3.dragAndDrop('button.rt-card-info-chip[data-palette-card="XDM-HOS100"]','button[data-slot="out-1"]');await p3.waitForTimeout(200);
      await p3.dragAndDrop('button.rt-card-info-chip[data-palette-card="XDM-CIS100"]','button[data-slot="in-2"]');await p3.waitForTimeout(200);
      const dragged=await saved();
      const palette={chipDraggable,wrongDir,in2:dragged.placements['in-2'],out1:dragged.placements['out-1'],link:dragged.links['in-2']?.device||null,modal:await p3.locator('dialog.rt-card-modal[open]').count()};
      check('카드 정보 버튼을 끌어 같은 방향 슬롯에 놓으면 장착·교체되고(CIS100은 기본 연동 전송기 연결), 입력 카드는 출력 슬롯에 놓이지 않음',palette.chipDraggable==='true'&&palette.wrongDir===null&&palette.in2==='XDM-CIS100'&&palette.out1==='XDM-HOS100'&&!!palette.link&&palette.modal===0,JSON.stringify(palette));
      // 0.163(사용자 요청 "하단에 이걸 배치해서 드래그하는 형태로"): 끌 수 있는 버튼은 내 구성 카드 행처럼 판넬 사진 타일이고, 장착한 카드에는 수량(× N)이 붙는다.
      const tiles=await p3.evaluate(()=>{const all=[...document.querySelectorAll('.rt-card-palette .rt-palette-tile')];return {count:all.length,withImg:all.filter(t=>t.querySelector('img')?.naturalWidth>0).length,hos:document.querySelector('.rt-palette-tile[data-palette-card="XDM-HOS100"] b')?.textContent||'',hi:document.querySelector('.rt-palette-tile[data-palette-card="XDM-HI100"] b')?.textContent||''}});
      check('끌어 놓기 버튼 12개가 모두 판넬 사진 타일이고, 장착한 XDM-HOS100에만 × 1 수량이 붙음',tiles.count===12&&tiles.withImg===12&&tiles.hos==='× 1'&&tiles.hi==='',JSON.stringify(tiles));
      // 0.167(시안 A, 사용자 선택 "이거 좋다 한번 해보자"): 색은 신호 배지 하나에만 쓴다. 타일·후면 장착 슬롯·범례·내 구성에 같은 배지, 내 구성 행은 "배지 · 모델명 · 장착 위치 · × N".
      const sig=await p3.evaluate(()=>{const bg=el=>el&&getComputedStyle(el).backgroundColor,tile=id=>document.querySelector(`.rt-palette-tile[data-palette-card="${id}"]`);const row=document.querySelector('.rt-config-summary .rt-summary-card[data-card-info="XDM-HOS100"]');return {hdmi:bg(tile('XDM-HIS100').querySelector('.rt-sig-badge')),sdi:bg(tile('XDM-SIS100').querySelector('.rt-sig-badge')),fiber:bg(tile('XDM-FIS100').querySelector('.rt-sig-badge')),tileBg:bg(tile('XDM-SIS100')),slot:document.querySelector('.rt-rack-slot[data-slot="out-1"] .rt-slot-tag')?.textContent.replace(/\s+/g,' ').trim()||'',slotBg:bg(document.querySelector('.rt-rack-slot[data-slot="out-1"] .rt-slot-tag-s')),legend:[...document.querySelectorAll('.rt-sig-legend .rt-sig-badge')].map(b=>b.textContent).join(','),rowText:row?.textContent.replace(/\s+/g,' ').trim(),rowImg:!!row?.querySelector('img')}});
      check('신호 배지 색이 신호마다 다르고 타일 바탕은 흰색, 후면 장착 슬롯 태그(OUT 1 | HOS100 | CH 1–4, HDMI 색)·범례·내 구성 행("HDMI XDM-HOS100 OUT 1 × 1")에 같은 신호 색이 보임',new Set([sig.hdmi,sig.sdi,sig.fiber]).size===3&&sig.tileBg==='rgb(255, 255, 255)'&&/^OUT 1 ?HOS100 ?CH 1–4$/.test(sig.slot)&&sig.slotBg===sig.hdmi&&sig.legend==='HDMI,DP,HDBT,FIBER,SDI'&&/^HDMI ?XDM-HOS100 ?OUT 1 ?× 1$/.test(sig.rowText)&&!sig.rowImg,JSON.stringify(sig));
      await p3.locator('button.rt-card-info-chip[data-palette-card="XDM-HIS100"]').click();
      const infoOpen=await p3.locator('dialog.rt-card-info-modal[open]').count();await p3.keyboard.press('Escape');
      check('끌 수 있는 카드 정보 버튼도 누르면 카드 상세 정보가 열림',infoOpen===1,String(infoOpen));
      const touch=await browser.newContext({viewport:{width:416,height:900},isMobile:true,hasTouch:true});const tp=await touch.newPage();
      await tp.goto(home,{waitUntil:'networkidle'});await tp.locator('button[data-family="XDM"]').first().click();await tp.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
      await tp.click('button[data-model="XDM-12"]');await tp.locator('.rt-cg-preview [data-action="preview-next"]').first().click();
      const touchChips=await tp.evaluate(()=>({chips:document.querySelectorAll('.rt-card-info-chip').length,draggable:document.querySelectorAll('.rt-card-info-chip[draggable]').length,tap:document.querySelectorAll('.rt-card-info-chip[data-tap-card]').length}));
      check('휴대폰(터치)에서는 카드 타일을 끌 수 없고 눌러서 고르는 타일로 바뀜(0.193 눌러서 옮기기)',touchChips.chips>0&&touchChips.draggable===0&&touchChips.tap===touchChips.chips,JSON.stringify(touchChips));
      // 0.193 눌러서 옮기기(사용자 결정 2026-09-30): 타일 선택 → 다른 방향 슬롯은 안내만 → 같은 방향 슬롯에 장착 → 취소 → 팝업 "이동"으로 다른 슬롯으로 옮김.
      const filled=()=>tp.evaluate(()=>[...document.querySelectorAll('.rt-rack-slot-filled')].map(b=>b.dataset.slot));
      await tp.locator('button[data-tap-card="XDM-HIS100"]').click();
      const picked=await tp.evaluate(()=>({on:document.querySelector('.rt-tap-tile-on')?.dataset.tapCard,banner:document.querySelector('.rt-tap-banner')?.innerText||''}));
      await tp.locator('button[data-slot="out-1"]').click();const wrong=await filled();
      await tp.locator('button[data-slot="in-1"]').click();const placed=await filled();
      await tp.locator('[data-tap-cancel]').click();const bannerGone=await tp.locator('.rt-tap-banner').count();
      await tp.locator('button[data-slot="in-1"]').click();await tp.locator('.rt-card-modal [data-tap-move]').click();
      const movingBanner=await tp.evaluate(()=>document.querySelector('.rt-tap-banner')?.innerText||'');
      await tp.locator('button[data-slot="in-3"]').click();const moved=await filled();
      check('휴대폰(터치) 눌러서 옮기기: 카드 타일을 고른 뒤 같은 방향 슬롯을 누르면 장착되고(다른 방향은 안 됨), 끝내기로 선택을 풀고, 장착한 카드는 팝업 "이동"으로 다른 슬롯에 옮겨짐',picked.on==='XDM-HIS100'&&/선택됨/.test(picked.banner)&&wrong.length===0&&placed.join()==='in-1'&&bannerGone===0&&/이동 중/.test(movingBanner)&&moved.join()==='in-3',JSON.stringify({picked,wrong,placed,bannerGone,movingBanner,moved}));
      await touch.close();
      await p3.close();
    }
    // 0.172 06 내보내기 개편(사용자 요청 2026-09-29): 형식은 구성 보고서(PDF)·장비 목록(CSV) 둘이고 구성 파일(JSON)은 "작업 저장" 보조 버튼이다.
    // 보고서 미리보기와 인쇄물은 같은 내용(후면 그림·장비 목록·슬롯 연결)이고, 인쇄물 글꼴은 사이트와 같은 Pretendard Variable이다.
    {
      const ex=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});const ep=await ex.newPage();
      await ep.goto(home,{waitUntil:'networkidle'});
      await ep.evaluate(()=>{const s=RtCore.initial();s.family='XDM';s.model='XDM-12';s.placements={'in-1':'XDM-HI100','out-1':'XDM-HOS100','out-2':'BLANK'};s.links={'in-1':{device:RtCore.psePair,count:4,distance:'30'}};s.step=5;s.maxStep=5;s.format='JSON';localStorage.setItem('rtcom.configuration.v1',JSON.stringify(RtCore.document(s)))});
      await ep.reload({waitUntil:'networkidle'});
      const view=await ep.evaluate(()=>({formats:[...document.querySelectorAll('.rt-format')].map(b=>b.dataset.format).join(','),pressed:document.querySelector('.rt-format[aria-pressed="true"]')?.dataset.format,backup:!!document.querySelector('.rt-export-save [data-tool="backup"]'),pre:document.querySelectorAll('.rt-export pre').length,rack:document.querySelectorAll('.rt-report-paper .rt-rack-photo .rt-rack-slot-filled').length,buttons:document.querySelectorAll('.rt-report-paper button').length,slots:document.querySelectorAll('.rt-report-paper .rt-rp-page2 tbody tr').length}));
      check('06 내보내기: 형식은 PDF·CSV 둘(예전 JSON 선택은 PDF로 보임), JSON은 작업 저장 버튼, 코드 미리보기 없음, 보고서 미리보기에 누를 수 없는 후면 그림(카드 2장)과 슬롯 6행',view.formats==='PDF,CSV'&&view.pressed==='PDF'&&view.backup&&view.pre===0&&view.rack===2&&view.buttons===0&&view.slots===6,JSON.stringify(view));
      await ep.fill('input[data-report-field="project"]','테스트 프로젝트');
      const meta=await ep.evaluate(()=>({saved:JSON.parse(localStorage.getItem('rtcom.report.v1')).project,shown:document.querySelector('.rt-rp-meta b')?.textContent,focus:document.activeElement?.dataset.reportField,undo:document.querySelector('[data-tool=undo]').disabled}));
      check('보고서 표지 칸에 입력하면 이 브라우저에 저장되고 미리보기에 바로 보이며 입력 칸 커서가 유지됨(실행 취소 기록에는 쌓이지 않음)',meta.saved==='테스트 프로젝트'&&meta.shown==='테스트 프로젝트'&&meta.focus==='project'&&meta.undo,JSON.stringify(meta));
      await ep.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await ep.emulateMedia({media:'print'});
      const printed=await ep.evaluate(()=>({report:getComputedStyle(document.getElementById('print-report')).display,main:getComputedStyle(document.querySelector('.rt-configurator-view')).display,font:getComputedStyle(document.querySelector('#print-report .rt-rp-title')).fontFamily,loaded:document.fonts.check('700 12px "Pretendard Variable"'),rack:document.querySelectorAll('#print-report .rt-rack-slot-filled').length,codes:/G08|UNVERIFIED_DRAFT|M01/.test(document.getElementById('print-report').textContent)}));
      check('인쇄하면 구성 보고서만 보이고(구성기 화면 숨김) 글꼴은 Pretendard Variable, 후면 그림 포함, 내부 근거 코드(G08·M01·UNVERIFIED_DRAFT) 없음',printed.report==='block'&&printed.main==='none'&&/^"Pretendard Variable"/.test(printed.font)&&printed.loaded&&printed.rack===2&&!printed.codes,JSON.stringify(printed));
      await ep.emulateMedia({media:'screen'});
      await ep.click('[data-format="CSV"]');
      const [csvFile]=await Promise.all([ep.waitForEvent('download'),ep.click('[data-tool="export"]')]);
      const csvText=fs.readFileSync(await csvFile.path(),'utf8');
      check('CSV는 날짜가 붙은 파일 이름으로 받아지고 머리행이 구분·모델·비고·수량·장착 위치이며 영문 상태 코드가 없음',/^RTCOM-XDM-12-draft-\d{8}\.csv$/.test(csvFile.suggestedFilename())&&/"구분","모델","비고","수량","장착 위치"/.test(csvText)&&!/UNVERIFIED_DRAFT/.test(csvText),csvFile.suggestedFilename());
      await ex.close();
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
