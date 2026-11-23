// 제품마다 "공유 주소" 페이지(share/<제품id>/index.html)를 만든다(0.272).
// 이유: 사이트는 주소의 # 뒤(#products/hd-108u)로 화면을 바꾸는데, # 뒤는 서버와 링크 미리보기 수집기(카카오톡·슬랙·페이스북 등)에 전달되지 않는다.
// 그래서 어떤 제품 주소를 붙여도 미리보기는 첫 화면 정보만 읽는다. 이 페이지는 제품 이름·설명·사진을 미리보기용 메타 태그(Open Graph)로 담고,
// 사람이 열면 곧바로 제품 상세(#products/<id>)로 보낸다. 제품 상세의 "링크 공유" 버튼이 이 주소를 복사한다.
// 미리보기 이미지(output/design/assets/share/<id>.jpg, 1200×630)는 scripts/tools/make_share_cards.cjs로 만들어 저장소에 둔 파일을 쓴다.
const fs=require('node:fs');
const path=require('node:path');

// 공개 사이트 주소. 미리보기 수집기는 상대 주소를 읽지 못하므로 og:url·og:image는 절대 주소여야 한다. 다른 주소로 배포하면 RTCOM_SITE_URL로 바꾼다.
const SITE_URL=`${(process.env.RTCOM_SITE_URL||'https://seoulav.github.io/rtcom-configurator/').replace(/\/+$/,'')}/`;
const SHARE_IMAGE_DIR='output/design/assets/share';

const esc=text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// 제품 JSON의 lead는 **굵게** 표시가 들어 있어 미리보기 문장에서는 표시만 뺀다.
const plain=markdown=>String(markdown||'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
const clip=(text,max)=>text.length>max?`${text.slice(0,max-1).trimEnd()}…`:text;

function shareImageUrl(id,site=SITE_URL){return `${site}${SHARE_IMAGE_DIR}/${id}.jpg`}
function shareUrl(id,site=SITE_URL){return `${site}share/${id}/`}

function sharePageHtml({id,productName,description,site=SITE_URL}){
  const title=`${productName} | RTCOM 제품정보`;
  const text=clip(plain(description),180);
  const image=shareImageUrl(id,site);
  const target=`../../#products/${id}`;
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="${esc(text)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="RTCOM Configurator"><meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(text)}"><meta property="og:url" content="${esc(shareUrl(id,site))}">
<meta property="og:image" content="${esc(image)}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(productName)} 제품 사진">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(text)}"><meta name="twitter:image" content="${esc(image)}">
<script>location.replace(${JSON.stringify(target)})</script></head>
<body><p>${esc(productName)} 제품 상세 페이지로 이동합니다. 자동으로 이동하지 않으면 <a href="${esc(target)}">여기를 눌러 이동</a>하세요.</p></body></html>
`;
}

// 색인(data/products/index.json)의 모든 제품에 대해 dist/share/<id>/index.html을 쓴다. 만든 제품 id 목록을 돌려준다.
function writeSharePages(output,{root='.',site=SITE_URL}={}){
  const index=JSON.parse(fs.readFileSync(path.join(root,'data/products/index.json'),'utf8'));
  const ids=[];
  for(const item of index.products){
    const detail=JSON.parse(fs.readFileSync(path.join(root,`data/products/${item.id}.json`),'utf8'));
    const target=path.join(output,'share',item.id,'index.html');
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,sharePageHtml({id:item.id,productName:item.productName,description:detail.lead||item.korean||detail.subtitle||item.productName,site}));
    ids.push(item.id);
  }
  return ids;
}

module.exports={SITE_URL,SHARE_IMAGE_DIR,sharePageHtml,writeSharePages,shareImageUrl,shareUrl};
