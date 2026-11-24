// 공유 미리보기 이미지(1200×630 JPEG)를 만든다. 카카오톡·슬랙·페이스북 같은 곳에 링크를 붙였을 때 제품 이름과 사진이 보이게 하는 용도다.
// 결과는 output/design/assets/share/<제품id>.jpg 와 site.jpg(사이트 첫 화면용)이며 저장소에 넣는다(사이트 배포 때 이 파일을 그대로 복사한다).
// 제품 사진·이름·설명이 바뀌면 다시 실행한다: NODE_PATH=$(npm root -g) node scripts/tools/make_share_cards.cjs
// (playwright가 필요하다. 배포 빌드(package-site.cjs)는 이 도구를 실행하지 않고 만들어 둔 이미지만 복사한다.)
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const outDir=path.join(root,'output/design/assets/share');
const productDir=path.join(root,'output/design/assets/products');
const fontFile=path.join(root,'fonts/PretendardVariable.woff2');
const index=JSON.parse(fs.readFileSync(path.join(root,'data/products/index.json'),'utf8'));
const esc=text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dataUri=file=>{
  const ext=path.extname(file).slice(1).toLowerCase().replace('jpg','jpeg');
  return `data:image/${ext};base64,${fs.readFileSync(file).toString('base64')}`;
};
const groupLabel=index.groups;

// 카드 한 장의 HTML. 위쪽에 이름·설명, 아래쪽에 흰 판 위의 제품 사진(가로로 긴 사진도 잘리지 않게 contain)을 둔다.
function cardHtml({title,subtitle,chip,photos}){
  const size=title.length>26?54:title.length>22?62:74;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face{font-family:"Pretendard Variable";font-weight:45 920;src:url("file://${fontFile}") format("woff2-variations")}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{font-family:"Pretendard Variable","Malgun Gothic",sans-serif;color:#1f2532;background:linear-gradient(135deg,#e6efff 0%,#f1ecff 55%,#fdeff5 100%);display:flex;flex-direction:column;padding:44px 56px}
.top{height:54px;display:flex;align-items:center;justify-content:space-between;flex:none}
.brand{display:flex;align-items:center;gap:14px;font-size:27px;font-weight:700}
.brand b{color:#0057D8}
.mark{width:54px;height:54px;border-radius:15px;background:linear-gradient(135deg,#3370e6,#6d5cf0);color:#fff;font-size:30px;display:flex;align-items:center;justify-content:center}
.chip{height:44px;padding:0 22px;border-radius:999px;background:#fff;color:#0057D8;font-size:23px;font-weight:700;display:flex;align-items:center;box-shadow:0 2px 10px rgba(31,37,50,.08)}
h1{flex:none;margin-top:26px;font-size:${size}px;line-height:1.12;font-weight:800;letter-spacing:-1.5px;max-height:${size*2.3}px;overflow:hidden}
.sub{flex:none;margin-top:14px;font-size:30px;line-height:1.3;font-weight:500;color:#4a5568;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.panel{flex:1 1 0;min-height:0;margin-top:28px;border-radius:28px;background:#fff;box-shadow:0 12px 36px rgba(31,37,50,.12);display:flex;align-items:center;justify-content:center;gap:28px;padding:22px 30px}
.panel img{max-width:100%;max-height:100%;object-fit:contain;flex:1 1 0;min-width:0;height:100%}
</style></head><body>
<div class="top"><div class="brand"><span class="mark">▦</span><span>RT<b>COM</b> Configurator</span></div>${chip?`<span class="chip">${esc(chip)}</span>`:''}</div>
<h1>${esc(title)}</h1>
<p class="sub">${esc(subtitle)}</p>
<div class="panel">${photos.map(src=>`<img src="${src}" alt="">`).join('')}</div>
</body></html>`;
}

async function main(){
  const {chromium}=require('playwright');
  fs.mkdirSync(outDir,{recursive:true});
  const jobs=index.products.map(item=>{
    const detail=JSON.parse(fs.readFileSync(path.join(root,`data/products/${item.id}.json`),'utf8'));
    return {name:item.id,title:item.productName,subtitle:detail.subtitle||item.english||'',chip:groupLabel[item.group]||'',photos:[dataUri(path.join(productDir,item.cardImage))]};
  });
  // 사이트 첫 화면용: 매트릭스 시리즈 세 장을 나란히 보여 준다.
  jobs.push({name:'site',title:'RTCOM Configurator',subtitle:'XDM·SPX·VDM 매트릭스 카드 구성과 알티컴 제품정보',chip:'알티컴 공개 사이트',photos:['xdm','spx','vdm'].map(name=>dataUri(path.join(root,`output/design/assets/${name}.jpg`)))});
  const browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  const tmp=path.join(os.tmpdir(),`rtcom-share-card-${process.pid}.html`);
  let count=0;
  for(const job of jobs){
    fs.writeFileSync(tmp,cardHtml(job));
    await page.goto(`file://${tmp}`);
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(outDir,`${job.name}.jpg`),type:'jpeg',quality:86,clip:{x:0,y:0,width:1200,height:630}});
    count++;
  }
  fs.rmSync(tmp,{force:true});
  await browser.close();
  console.log(`공유 미리보기 이미지 ${count}장 생성 → ${path.relative(root,outDir)}`);
}
if(require.main===module)main().catch(error=>{console.error(error);process.exit(1)});
module.exports={cardHtml};
