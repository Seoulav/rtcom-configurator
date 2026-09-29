// 0.140 AI 검색(사내 베타): Worker 인증(Access JWT·서명 토큰·허용 명단)·질문 중계·공개 자료 묶음을 네트워크 없이 검사한다.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
const {buildAiContext}=require('../scripts/build-ai-context.cjs');

const load=()=>import(path.join(__dirname,'../workers/ai-search/src/core.js'));
const SECRET='x'.repeat(40);
const SITE='https://seoulav.github.io/rtcom-configurator/';
const TEAM='seoulav.cloudflareaccess.com',AUD='aud-tag-123';
const baseEnv=(extra={})=>({SITE_URL:SITE,TOKEN_SECRET:SECRET,ALLOWED_EMAIL_DOMAINS:'seoulav1.co.kr',ALLOWED_EMAILS:'sales1@seoulav1.co.kr, Sales2@seoulav1.co.kr',...extra});
const b64=value=>Buffer.from(typeof value==='string'?value:JSON.stringify(value)).toString('base64url');

async function accessFixture(){
  const pair=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const jwk={...await webcrypto.subtle.exportKey('jwk',pair.publicKey),kid:'k1'};
  const sign=async(claims,kid='k1')=>{const head=b64({alg:'RS256',kid}),body=b64(claims);const sig=Buffer.from(await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,Buffer.from(`${head}.${body}`))).toString('base64url');return `${head}.${body}.${sig}`};
  const calls=[];
  const fetchImpl=async url=>{calls.push(url);return new Response(JSON.stringify({keys:[jwk]}),{status:200})};
  return {sign,fetchImpl,calls};
}
const claims=(extra={})=>({aud:[AUD],iss:`https://${TEAM}`,email:'sales1@seoulav1.co.kr',exp:Math.floor(Date.now()/1000)+600,...extra});

function fakeClient({events=[{type:'content_block_delta',delta:{type:'text_delta',text:'### 추천\n'}},{type:'content_block_delta',delta:{type:'text_delta',text:'[[hd-13u]]'}}],final={stop_reason:'end_turn',model:'claude-opus-5-5',usage:{input_tokens:10,output_tokens:5,cache_read_input_tokens:40000}},error=null}={}){
  const seen=[];
  return {seen,client:{beta:{messages:{stream(params){seen.push(params);if(error)throw error;return {async *[Symbol.asyncIterator](){for(const event of events)yield event},finalMessage:async()=>final}}}}}};
}
const contextFetch=async url=>url.endsWith('data/ai-context.json')?new Response(JSON.stringify({schema:'rtcom.ai-context.v1',sha256:'abc',text:'# 알티컴 공개 제품 데이터'}),{status:200}):new Response('no',{status:404});
const readLines=async response=>(await response.text()).trim().split('\n').map(line=>JSON.parse(line));

test('0.140 AI 검색: 서명 토큰은 위조·만료·다른 비밀값을 거부한다',async()=>{
  const {issueToken,verifyToken}=await load();
  const now=Date.now(),token=await issueToken('Sales1@seoulav1.co.kr',SECRET,now,12);
  assert.deepEqual(await verifyToken(token,SECRET,now),{email:'sales1@seoulav1.co.kr',exp:now+12*3600*1000});
  assert.equal(await verifyToken(token,'y'.repeat(40),now),null);
  assert.equal(await verifyToken(token,SECRET,now+13*3600*1000),null);
  const [body,sig]=token.split('.');
  const forged=Buffer.from(JSON.stringify({v:1,e:'boss@seoulav1.co.kr',x:now+1e9})).toString('base64url');
  assert.equal(await verifyToken(`${forged}.${sig}`,SECRET,now),null);
  assert.equal(await verifyToken(`${body}.${sig}.x`,SECRET,now),null);
  await assert.rejects(()=>issueToken('a@seoulav1.co.kr','short'),/32/);
});

test('0.140 AI 검색: 영업팀 도메인(seoulav1.co.kr)과 허용 명단을 모두 만족해야 들어온다',async()=>{
  const {emailAllowed}=await load();
  assert.equal(emailAllowed('sales1@seoulav1.co.kr',baseEnv()),true);
  assert.equal(emailAllowed('SALES2@SEOULAV1.CO.KR',baseEnv()),true);
  assert.equal(emailAllowed('other@seoulav1.co.kr',baseEnv()),false,'명단에 없으면 거부');
  assert.equal(emailAllowed('sales1@seoulav.co.kr',baseEnv({ALLOWED_EMAILS:'sales1@seoulav.co.kr'})),false,'허용 도메인이 아니면 명단에 있어도 거부');
  assert.equal(emailAllowed('sales1@seoulav1.co.kr',baseEnv({ALLOWED_EMAILS:''})),false,'명단이 비면 모두 거부');
  assert.equal(emailAllowed('',baseEnv()),false);
  const toml=fs.readFileSync(path.join(__dirname,'../workers/ai-search/wrangler.toml'),'utf8');
  assert.equal((toml.match(/ALLOWED_EMAIL_DOMAINS = "seoulav1\.co\.kr"/g)||[]).length,2,'api·login 두 Worker 모두 seoulav1.co.kr');
  assert.doesNotMatch(toml,/sk-ant|ANTHROPIC_API_KEY\s*=|TOKEN_SECRET\s*=|ALLOWED_EMAILS\s*=/,'비밀값·허용 명단은 wrangler.toml에 적지 않는다');
});

test('0.140 AI 검색: Cloudflare Access JWT를 팀 공개키·aud·iss·만료로 다시 검증한다',async()=>{
  const {verifyAccessJwt,resetCaches}=await load();resetCaches();
  const {sign,fetchImpl,calls}=await accessFixture();
  const env=baseEnv({ACCESS_TEAM_DOMAIN:TEAM,ACCESS_AUD:AUD});
  assert.equal(await verifyAccessJwt(await sign(claims()),env,fetchImpl),'sales1@seoulav1.co.kr');
  assert.equal(calls[0],`https://${TEAM}/cdn-cgi/access/certs`);
  assert.equal(await verifyAccessJwt(await sign(claims({aud:['other']})),env,fetchImpl),null);
  assert.equal(await verifyAccessJwt(await sign(claims({iss:'https://evil.cloudflareaccess.com'})),env,fetchImpl),null);
  assert.equal(await verifyAccessJwt(await sign(claims({exp:Math.floor(Date.now()/1000)-5})),env,fetchImpl),null);
  const good=await sign(claims()),[h,p]=good.split('.');
  assert.equal(await verifyAccessJwt(`${h}.${b64(claims({email:'boss@seoulav1.co.kr'}))}.${good.split('.')[2]}`,env,fetchImpl),null,'본문을 바꾸면 서명 불일치');
  assert.equal(await verifyAccessJwt(`${h}.${p}`,env,fetchImpl),null);
  assert.equal(await verifyAccessJwt(good,{...env,ACCESS_AUD:''},fetchImpl),null,'aud 설정이 없으면 거부');
  assert.equal(await verifyAccessJwt(null,env,fetchImpl),null);
});

test('0.140 AI 검색: 로그인 Worker는 명단 확인 뒤 구성기 창에만 토큰을 넘긴다',async()=>{
  const {handle,verifyToken,resetCaches}=await load();resetCaches();
  const {sign,fetchImpl}=await accessFixture();
  const env=baseEnv({ROLE:'login',ACCESS_TEAM_DOMAIN:TEAM,ACCESS_AUD:AUD,EXTRA_ORIGINS:'http://localhost:4173'});
  const call=async(jwt,query='')=>handle(new Request(`https://rtcom-ai-login.example.workers.dev/login${query}`,{headers:jwt?{'cf-access-jwt-assertion':jwt}:{}}),env,{fetch:fetchImpl});
  const ok=await call(await sign(claims()));
  assert.equal(ok.status,200);assert.equal(ok.headers.get('cache-control'),'no-store');
  const html=await ok.text();
  assert.match(html,/window\.opener\.postMessage\(d,o\)/);
  assert.match(html,/"https:\/\/seoulav\.github\.io"/,'기본 전달 대상은 공개 사이트 origin');
  const token=html.match(/"token":"([^"]+)"/)[1];
  assert.equal((await verifyToken(token,SECRET)).email,'sales1@seoulav1.co.kr');
  assert.match(await (await call(await sign(claims()),'?origin=http%3A%2F%2Flocalhost%3A4173')).text(),/"http:\/\/localhost:4173"/);
  assert.equal((await call(await sign(claims()),'?origin=https%3A%2F%2Fevil.example')).status,403);
  assert.equal((await call(await sign(claims({email:'other@seoulav1.co.kr'})))).status,403);
  assert.equal((await call(null)).status,403);
  assert.equal((await handle(new Request('https://rtcom-ai-login.example.workers.dev/api/ask'),env,{fetch:fetchImpl})).status,404,'로그인 Worker는 질문을 받지 않는다');
});

test('0.140 AI 검색: API Worker는 origin·토큰·명단을 확인하고 답을 NDJSON으로 흘려 보낸다',async()=>{
  const {handle,issueToken,resetCaches,SYSTEM_PROMPT}=await load();resetCaches();
  const env=baseEnv({ROLE:'api'});
  const token=await issueToken('sales1@seoulav1.co.kr',SECRET);
  const {client,seen}=fakeClient();
  const deps={fetch:contextFetch,createClient:()=>client};
  const request=(pathname,init={})=>new Request(`https://rtcom-ai-api.example.workers.dev${pathname}`,{...init,headers:{origin:'https://seoulav.github.io',...(init.headers||{})}});
  const pre=await handle(request('/api/ask',{method:'OPTIONS'}),env,deps);
  assert.equal(pre.status,204);assert.equal(pre.headers.get('access-control-allow-origin'),'https://seoulav.github.io');
  assert.match(pre.headers.get('access-control-allow-headers'),/authorization/);
  assert.equal((await handle(request('/api/me',{headers:{origin:'https://evil.example',authorization:`Bearer ${token}`}}),env,deps)).status,403);
  assert.equal((await handle(request('/api/me'),env,deps)).status,401);
  const me=await handle(request('/api/me',{headers:{authorization:`Bearer ${token}`}}),env,deps);
  assert.equal(me.status,200);assert.equal((await me.json()).email,'sales1@seoulav1.co.kr');
  assert.equal((await handle(request('/api/me',{headers:{authorization:`Bearer ${token}`}}),{...env,ALLOWED_EMAILS:'sales2@seoulav1.co.kr'},deps)).status,401,'명단에서 빠지면 남은 토큰도 바로 막힌다');
  const body={mode:'configure',question:'HDMI 입력 24, 출력 16 구성안',history:[{role:'assistant',text:'먼저 온 답'},{role:'user',text:'이전 질문'},{role:'assistant',text:'이전 답'}]};
  const answer=await handle(request('/api/ask',{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify(body)}),env,deps);
  assert.equal(answer.status,200);assert.match(answer.headers.get('content-type'),/ndjson/);
  const events=await readLines(answer);
  assert.deepEqual(events.filter(e=>e.t==='text').map(e=>e.v).join(''),'### 추천\n[[hd-13u]]');
  assert.equal(events.at(-1).t,'done');assert.equal(events.at(-1).usage.cacheRead,40000);
  const params=seen[0];
  assert.equal(params.model,'claude-opus-5-5');
  assert.deepEqual(params.output_config,{effort:'medium'});
  assert.equal(params.system[0].text,SYSTEM_PROMPT);
  assert.deepEqual(params.system[1].cache_control,{type:'ephemeral'},'제품 데이터는 캐시');
  assert.equal(params.fallbacks,'default');assert.deepEqual(params.betas,['server-side-fallback-2026-07-01']);
  assert.equal(params.thinking,undefined,'Opus 5.5는 thinking 설정을 보내지 않는다');
  assert.deepEqual(params.messages.map(m=>m.role),['user','assistant','user'],'앞의 assistant는 버리고 user부터 번갈아');
  assert.equal(params.messages.at(-1).content,'[요청 유형: 구성안 제안]\nHDMI 입력 24, 출력 16 구성안');
  assert.doesNotMatch(JSON.stringify(params),/sk-ant/);
});

test('0.140 AI 검색: 거절·API 오류·입력 오류·시간당 한도를 사용자 말로 알린다',async()=>{
  const {handle,issueToken,resetCaches,parseAsk}=await load();resetCaches();
  const env=baseEnv({ROLE:'api',RATE_PER_HOUR:'2'});
  const token=await issueToken('sales1@seoulav1.co.kr',SECRET);
  const ask=(client,payload={question:'질문'})=>handle(new Request('https://x.workers.dev/api/ask',{method:'POST',headers:{origin:'https://seoulav.github.io',authorization:`Bearer ${token}`},body:JSON.stringify(payload)}),env,{fetch:contextFetch,createClient:()=>client});
  const refusal=await readLines(await ask(fakeClient({events:[],final:{stop_reason:'refusal',usage:{}}}).client));
  assert.equal(refusal[0].t,'error');
  const limited=Object.assign(new Error('rate'),{status:429});
  const failed=await readLines(await ask(fakeClient({error:limited}).client));
  assert.match(failed[0].v,/요청이 많아/);
  assert.equal((await ask(fakeClient().client)).status,429,'시간당 한도(2회) 초과');
  resetCaches();
  assert.equal((await ask(fakeClient().client,{question:''})).status,400);
  assert.equal((await ask(fakeClient().client,{question:'가'.repeat(2001)})).status,400);
  assert.throws(()=>parseAsk(null));
  assert.equal(parseAsk({mode:'bogus',question:'q'}).mode,'ask');
  resetCaches();
  const noContext=await handle(new Request('https://x.workers.dev/api/ask',{method:'POST',headers:{origin:'https://seoulav.github.io',authorization:`Bearer ${token}`},body:'{"question":"q"}'}),env,{fetch:async()=>new Response('x',{status:500}),createClient:()=>fakeClient().client});
  assert.equal(noContext.status,503);
});

test('0.140 AI 검색: 공개 자료 묶음은 전 제품·구성기 카탈로그를 담고 좌표·출처는 빼며 항상 같은 결과를 낸다',()=>{
  const a=buildAiContext(),b=buildAiContext();
  assert.equal(a.sha256,b.sha256,'같은 데이터면 같은 글(프롬프트 캐시 유지)');
  const index=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/products/index.json'),'utf8'));
  assert.equal(a.products.length,index.products.length);
  for(const item of index.products)assert.ok(a.text.includes(`[[${item.id}]]`),item.id);
  for(const model of ['XDM-72','SPX-M1620','VDM-256X','XDM-HIS100','CIS4-U'])assert.ok(a.text.includes(model),model);
  assert.match(a.text,/프레임 XDM-72: .*입력 슬롯 18 · 출력 슬롯 18/);
  assert.match(a.text,/연동 전송기 XDM-CTR100 · TX/);
  assert.doesNotMatch(a.text,/"x1"|\.webp|verificationSummary|"source"/);
  assert.ok(a.text.length<120000,`자료 묶음이 너무 크다: ${a.text.length}`);
});

test('0.140 AI 검색: 공개 사이트에는 숨은 버튼 스크립트만 싣고 Worker 코드는 배포하지 않는다',()=>{
  const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const html=read('index.html');
  assert.ok(html.indexOf('src/ai-search.js')>0&&html.indexOf('src/ai-search.js')<html.indexOf('src/catalog.js'),'라우터보다 먼저 #ai-token을 읽도록 맨 앞');
  const pkg=read('scripts/package-site.cjs');
  assert.match(pkg,/'src\/ai-search\.js'/);assert.match(pkg,/data\/ai-context\.json/);assert.doesNotMatch(pkg,/'workers\//,'Worker 코드는 복사 목록에 없다');
  const script=read('src/ai-search.js');
  assert.match(script,/if\(store\.get\(FLAG_KEY\)!=='1'\)return;/,'?ai=beta로 켠 브라우저에만 버튼');
  assert.doesNotMatch(script,/get\('(api|login)'\)/,'서버 주소는 URL로 바꿀 수 없다');
  assert.match(script,/event\.origin!==new URL\(CONFIG\.login\)\.origin/,'로그인 창 origin만 토큰을 받는다');
  assert.doesNotMatch(read('src/app.js'),/rtcom\.ai/,'구성기 저장 키(rtcom.configuration.v1)와 분리');
});
