// 제품 링크를 카카오톡·슬랙 등에 보냈을 때 제품 이름·설명·사진이 미리보기로 나오게 하는 정적 페이지를 만든다.
// 이유: 사이트는 주소의 # 뒤(#products/hd-108u)로 화면을 바꾸는데, # 뒤는 서버와 링크 미리보기 수집기(카카오톡·슬랙·페이스북 등)에 전달되지 않는다.
// 그래서 # 앞의 주소(첫 화면)가 같으면 어떤 제품이든 같은 미리보기가 나온다.
//   · 0.272 share/<id>/ : 미리보기 정보만 담고 제품 상세로 이동하는 얇은 페이지(옛 공유 주소로 계속 동작).
//   · 0.273 product-<id>.html : index.html 전체(구성기·제품정보 앱)에 그 제품의 미리보기 정보만 바꿔 넣은 페이지. 앱이 제품 상세를 열 때
//     주소창을 이 파일 이름으로 바꾸므로(src/products.js syncProductAddress) 주소창 주소를 그대로 붙여도 그 제품 미리보기가 나온다.
//     index.html과 같은 폴더에 두어 상대 경로(src/·data/·output/)가 그대로 풀리고 별도의 base 태그가 필요 없다.
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
function productPageUrl(id,site=SITE_URL){return `${site}product-${id}.html`}

// 제목·설명·미리보기 메타 태그(Open Graph·트위터 카드) 묶음. url은 이 페이지 자신의 주소다.
function metaTags({id,productName,description,url,site=SITE_URL}){
  const title=`${productName} | RTCOM 제품정보`;
  const text=clip(plain(description),180);
  const image=shareImageUrl(id,site);
  return {title,html:`<meta name="description" content="${esc(text)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="RTCOM Configurator"><meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(text)}"><meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(productName)} 제품 사진">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(text)}"><meta name="twitter:image" content="${esc(image)}">`};
}

// 0.272 share/<id>/ : 미리보기 정보 + 제품 상세로 이동(자바스크립트).
function sharePageHtml({id,productName,description,site=SITE_URL}){
  const {title,html}=metaTags({id,productName,description,url:shareUrl(id,site),site});
  const target=`../../#products/${id}`;
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
${html}
<script>location.replace(${JSON.stringify(target)})</script></head>
<body><p>${esc(productName)} 제품 상세 페이지로 이동합니다. 자동으로 이동하지 않으면 <a href="${esc(target)}">여기를 눌러 이동</a>하세요.</p></body></html>
`;
}

// 0.273 product-<id>.html : 구성기·제품정보 앱 전체(index.html)에서 제목·설명·미리보기 태그만 그 제품 것으로 바꾼다.
// 이 주소(# 없이)로 들어오면 제품 상세가 바로 열리도록 해시가 없을 때만 #products/<id>를 붙이는 한 줄을 head에 넣는다.
function productPageHtml(template,{id,productName,description,site=SITE_URL}){
  const {title,html}=metaTags({id,productName,description,url:productPageUrl(id,site),site});
  const stripped=template
    .replace(/<title>[^<]*<\/title>/,'')
    .replace(/<meta (?:name="description"|property="og:[^"]*"|name="twitter:[^"]*") content="[^"]*">/g,'');
  if(!stripped.includes('</head>')||stripped.length>=template.length)throw new Error('index.html의 head 형식이 바뀌어 제품 페이지를 만들 수 없습니다.');
  const hashLine=`<script>if(!location.hash)history.replaceState(null,"",location.pathname+location.search+${JSON.stringify(`#products/${id}`)})</script>`;
  return stripped.replace('</head>',`<title>${esc(title)}</title>\n${html}\n${hashLine}</head>`);
}

function eachProduct(root,fn){
  const index=JSON.parse(fs.readFileSync(path.join(root,'data/products/index.json'),'utf8'));
  return index.products.map(item=>{
    const detail=JSON.parse(fs.readFileSync(path.join(root,`data/products/${item.id}.json`),'utf8'));
    fn({id:item.id,productName:item.productName,description:detail.lead||item.korean||detail.subtitle||item.productName});
    return item.id;
  });
}

// 색인(data/products/index.json)의 모든 제품에 대해 dist/share/<id>/index.html(0.272)과 dist/product-<id>.html(0.273)을 쓴다. 만든 제품 id 목록을 돌려준다.
function writeSharePages(output,{root='.',site=SITE_URL}={}){
  const template=fs.readFileSync(path.join(root,'index.html'),'utf8');
  return eachProduct(root,product=>{
    const share=path.join(output,'share',product.id,'index.html');
    fs.mkdirSync(path.dirname(share),{recursive:true});
    fs.writeFileSync(share,sharePageHtml({...product,site}));
    fs.writeFileSync(path.join(output,`product-${product.id}.html`),productPageHtml(template,{...product,site}));
  });
}

module.exports={SITE_URL,SHARE_IMAGE_DIR,sharePageHtml,productPageHtml,writeSharePages,shareImageUrl,shareUrl,productPageUrl};
