// RTCOM AI 검색(사내 베타) Worker 본체. Anthropic SDK를 직접 부르지 않고 deps.createClient()로 받아 테스트에서 가짜 클라이언트를 넣는다.
// 같은 코드를 두 Worker로 배포한다(docs/implementation/AI_SEARCH_BETA.md).
//  - ROLE=login(rtcom-ai-login): workers.dev 전체를 Cloudflare Access로 잠근다. Access JWT를 다시 검증하고 허용 명단을 확인한 뒤,
//    12시간짜리 서명 토큰을 만들어 구성기 창(opener)에 postMessage로 넘긴다.
//  - ROLE=api(rtcom-ai-api): 공개 주소지만 모든 요청에 서명 토큰이 있어야 하고, 허용 명단에서 빠진 사람은 토큰이 남아 있어도 바로 막힌다.
// API 키(ANTHROPIC_API_KEY)는 api Worker 비밀값에만 있고, 브라우저로 나가지 않는다.

export const DEFAULTS = {model:'claude-opus-5-5', effort:'medium', maxTokens:8000, tokenHours:12, ratePerHour:30, contextTtlMs:10*60*1000};
export const MODES = {ask:'질의응답·추천', configure:'구성안 제안', compare:'사양 비교'};
const LIMITS = {bodyBytes:40000, question:2000, historyTurns:8, historyText:8000};

export const SYSTEM_PROMPT = `당신은 서울영상테크 사내 베타 "RTCOM AI 검색"입니다. 사용자는 서울영상테크 영업·기술 직원이며, 알티컴(RTCOM) 제품을 고객에게 제안하려고 질문합니다.

규칙
1. 답의 근거는 뒤에 붙은 "알티컴 공개 제품 데이터"뿐입니다. 데이터에 없는 사양·기능·호환성은 추측하지 말고 "공개 데이터에 없음 — 제조사 확인 필요"라고 적습니다.
2. 가격·단가·납기·재고·할인은 데이터에 없으므로 답하지 않고 담당자 확인을 안내합니다.
3. 제품을 처음 언급할 때 [[제품id]] 형식을 씁니다(예: [[hd-13u]]). 데이터에 있는 id만 씁니다. 프레임·카드 모델명(XDM-72, XDM-HIS100 등)은 그대로 씁니다.
4. 한국어 존댓말로, 결론을 먼저 쓰고 근거는 짧은 목록으로 씁니다. 실무자가 바로 쓸 수 있게 간결하게 씁니다.
5. 형식은 제목 "### ", 목록 "- " 또는 "1. ", 강조 **굵게**, 표는 마크다운 표(| 구분 | ... |)만 씁니다. HTML·코드 블록·이미지는 쓰지 않습니다.
6. 질문이 알티컴 제품·AV 시스템 구성과 관계없으면 이 도구의 범위를 짧게 안내합니다.

요청 유형
- 질의응답·추천: 조건에 맞는 제품을 1~3개 추천하고, 맞는 이유와 설치 전에 확인할 점을 적습니다.
- 구성안 제안: 필요한 입력·출력 수와 신호 종류를 먼저 정리합니다. 그다음 프레임 모델, 입력·출력 카드 종류와 장수, 연동 전송기와 수량, 남는 슬롯(블랭크 커버)을 표로 제안합니다. 카드 1장은 슬롯 1칸이고, 장수는 필요한 포트 수 ÷ 카드당 포트 수를 올림해 계산합니다. 입력·출력 슬롯 수를 넘지 않는지 확인하고, 조건이 모자라면 가정을 밝히고 진행합니다. 마지막 줄에 "매트릭스 구성기에서 슬롯 배치를 확인하세요."를 씁니다.
- 사양 비교: 비교할 제품의 주요 사양을 표로 나란히 적고, 선택 기준을 2~3줄로 정리합니다.`;

const encoder = new TextEncoder();
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromB64url = text => Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((text.length+3)%4)), c=>c.charCodeAt(0));
const jsonPart = value => b64url(encoder.encode(JSON.stringify(value)));
const readPart = text => JSON.parse(new TextDecoder().decode(fromB64url(text)));
const list = value => String(value||'').split(/[\s,;]+/).map(item=>item.trim().toLowerCase()).filter(Boolean);

async function hmac(secret, data) {
  if (!secret || secret.length < 32) throw new Error('TOKEN_SECRET must be at least 32 characters');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}
const sameText = (a, b) => { if (a.length !== b.length) return false; let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0; };

export async function issueToken(email, secret, now = Date.now(), hours = DEFAULTS.tokenHours) {
  const body = jsonPart({v:1, e:email.toLowerCase(), x:now + hours*3600*1000});
  return `${body}.${await hmac(secret, body)}`;
}

export async function verifyToken(token, secret, now = Date.now()) {
  const [body, signature, extra] = String(token||'').split('.');
  if (!body || !signature || extra !== undefined) return null;
  if (!sameText(signature, await hmac(secret, body))) return null;
  try { const data = readPart(body); return data.v === 1 && typeof data.e === 'string' && data.x > now ? {email:data.e, exp:data.x} : null; } catch { return null; }
}

// 회사 메일 도메인(ALLOWED_EMAIL_DOMAINS)과 허용 명단(ALLOWED_EMAILS)을 모두 만족해야 한다. 명단이 비어 있으면 아무도 못 들어온다(fail closed).
export function emailAllowed(email, env) {
  const address = String(email||'').toLowerCase(), domain = address.split('@')[1];
  return Boolean(domain) && list(env.ALLOWED_EMAIL_DOMAINS).includes(domain) && list(env.ALLOWED_EMAILS).includes(address);
}

const certCache = new Map();
// Cloudflare Access가 붙여 주는 Cf-Access-Jwt-Assertion을 팀 공개키로 다시 검증한다(Access 설정이 빠져도 Worker가 뚫리지 않게).
export async function verifyAccessJwt(jwt, env, fetchImpl = fetch, now = Date.now()) {
  const team = String(env.ACCESS_TEAM_DOMAIN||'').replace(/^https?:\/\//,'').replace(/\/+$/,'');
  if (!jwt || !team || !env.ACCESS_AUD) return null;
  const [head, payload, signature] = jwt.split('.');
  if (!head || !payload || !signature) return null;
  let header, claims;
  try { header = readPart(head); claims = readPart(payload); } catch { return null; }
  if (header.alg !== 'RS256') return null;
  let keys = certCache.get(team);
  if (!keys || keys.expires < now || !keys.list.some(key=>key.kid===header.kid)) {
    const response = await fetchImpl(`https://${team}/cdn-cgi/access/certs`);
    if (!response.ok) return null;
    keys = {list:(await response.json()).keys||[], expires:now + 3600*1000};
    certCache.set(team, keys);
  }
  const jwk = keys.list.find(key=>key.kid===header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, fromB64url(signature), encoder.encode(`${head}.${payload}`));
  const audience = [].concat(claims.aud||[]);
  if (!valid || !audience.includes(env.ACCESS_AUD) || claims.iss !== `https://${team}` || !(claims.exp*1000 > now) || (claims.nbf && claims.nbf*1000 > now + 60000)) return null;
  return typeof claims.email === 'string' ? claims.email.toLowerCase() : null;
}

export function allowedOrigins(env) {
  const site = env.SITE_URL ? [new URL(env.SITE_URL).origin] : [];
  return [...new Set([...site, ...list(env.EXTRA_ORIGINS)])];
}

const secureHeaders = {'cache-control':'no-store', 'x-content-type-options':'nosniff', 'referrer-policy':'no-referrer'};
const json = (status, value, headers = {}) => new Response(JSON.stringify(value), {status, headers:{...secureHeaders, 'content-type':'application/json; charset=utf-8', ...headers}});
const scriptJson = value => JSON.stringify(value).replace(/</g,'\\u003c');

function loginPage(message, token, origin, siteUrl) {
  const script = token ? `<script>(function(){var d=${scriptJson(token)},o=${scriptJson(origin)};if(window.opener){window.opener.postMessage(d,o);setTimeout(function(){window.close()},300)}else{location.replace(${scriptJson(siteUrl)}+'?ai=beta#ai-token='+encodeURIComponent(d.token))}})()</script>` : '';
  return new Response(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>RTCOM AI 검색 로그인</title><style>body{font:15px/1.6 system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#f3f6fb;color:#1f2532}main{max-width:360px;padding:28px;border-radius:18px;background:#fff;box-shadow:0 10px 30px #1f253214}</style></head><body><main><h1 style="font-size:18px;margin:0 0 8px">RTCOM AI 검색 · 사내 베타</h1><p>${message}</p></main>${script}</body></html>`,
    {status:token ? 200 : 403, headers:{...secureHeaders, 'content-type':'text/html; charset=utf-8', 'content-security-policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none'"}});
}

async function handleLogin(request, env, deps) {
  const url = new URL(request.url);
  if (url.pathname !== '/login' && url.pathname !== '/') return new Response('Not found', {status:404, headers:secureHeaders});
  const email = await verifyAccessJwt(request.headers.get('cf-access-jwt-assertion'), env, deps.fetch, deps.now());
  if (!email) return loginPage('회사 메일 인증(Cloudflare Access)을 확인하지 못했습니다. 창을 닫고 다시 시도해 주세요.');
  if (!emailAllowed(email, env)) return loginPage('베타 허용 명단에 없는 메일입니다. 관리자에게 등록을 요청해 주세요.');
  const origins = allowedOrigins(env), origin = url.searchParams.get('origin') || origins[0];
  if (!origins.includes(origin)) return loginPage('허용되지 않은 사이트에서 요청한 로그인입니다.');
  const token = await issueToken(email, env.TOKEN_SECRET, deps.now(), Number(env.TOKEN_HOURS)||DEFAULTS.tokenHours);
  const exp = (await verifyToken(token, env.TOKEN_SECRET, deps.now())).exp;
  return loginPage('로그인되었습니다. 이 창은 자동으로 닫힙니다.', {type:'rtcom-ai-token', token, email, exp}, origin, env.SITE_URL);
}

// 같은 Worker 인스턴스 안에서만 세는 간이 제한이다. 비용 상한은 Anthropic Console 월 한도로 건다.
const usage = new Map();
export function rateLimited(email, limit, now) {
  const recent = (usage.get(email)||[]).filter(time=>time > now - 3600*1000);
  if (recent.length >= limit) { usage.set(email, recent); return true; }
  recent.push(now); usage.set(email, recent); return false;
}

let contextCache = null;
async function loadContext(env, deps) {
  const now = deps.now();
  if (contextCache && contextCache.expires > now && contextCache.url === env.SITE_URL) return contextCache.value;
  const url = new URL('data/ai-context.json', env.SITE_URL).href;
  const response = await deps.fetch(url, {cf:{cacheTtl:600}});
  if (!response.ok) throw new Error(`context ${response.status}`);
  const value = await response.json();
  if (value.schema !== 'rtcom.ai-context.v1' || typeof value.text !== 'string') throw new Error('context schema');
  contextCache = {value, url:env.SITE_URL, expires:now + DEFAULTS.contextTtlMs};
  return value;
}
export const resetCaches = () => { contextCache = null; usage.clear(); certCache.clear(); };

export function parseAsk(body) {
  if (!body || typeof body !== 'object') throw new Error('요청 형식이 잘못되었습니다.');
  const mode = Object.hasOwn(MODES, body.mode) ? body.mode : 'ask';
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > LIMITS.question) throw new Error(`질문은 1~${LIMITS.question}자로 입력해 주세요.`);
  const history = [];
  for (const turn of (Array.isArray(body.history) ? body.history : []).slice(-LIMITS.historyTurns*2)) {
    if (!turn || !['user','assistant'].includes(turn.role) || typeof turn.text !== 'string' || !turn.text.trim()) continue;
    const text = turn.text.slice(0, LIMITS.historyText);
    if (history.length && history.at(-1).role === turn.role) history.at(-1).content += `\n\n${text}`;
    else history.push({role:turn.role, content:text});
  }
  while (history.length && history[0].role !== 'user') history.shift();
  if (history.length && history.at(-1).role !== 'assistant') history.pop();
  return {mode, question, messages:[...history, {role:'user', content:`[요청 유형: ${MODES[mode]}]\n${question}`}]};
}

export function buildRequest(env, context, messages) {
  return {
    model:env.MODEL || DEFAULTS.model,
    max_tokens:Number(env.MAX_TOKENS) || DEFAULTS.maxTokens,
    output_config:{effort:env.EFFORT || DEFAULTS.effort},
    // 지시문과 제품 데이터는 질문마다 똑같아서 캐시한다. 요청 유형은 사용자 메시지 앞에 붙여 캐시를 깨지 않는다.
    system:[{type:'text', text:SYSTEM_PROMPT}, {type:'text', text:context.text, cache_control:{type:'ephemeral'}}],
    messages,
    // 안전 분류기가 거절하면 Anthropic이 권장 모델로 한 번 더 답하게 한다.
    betas:['server-side-fallback-2026-07-01'],
    fallbacks:'default'
  };
}

function errorText(error) {
  const status = error?.status;
  if (status === 429) return '요청이 많아 잠시 뒤에 다시 시도해 주세요.';
  if (status === 401 || status === 403) return 'AI 서버의 API 키 설정을 확인해야 합니다. 관리자에게 알려 주세요.';
  if (status === 400) return '요청을 처리하지 못했습니다. 질문을 조금 바꿔 다시 시도해 주세요.';
  return 'AI 서버에 연결하지 못했습니다. 잠시 뒤에 다시 시도해 주세요.';
}

async function streamAnswer(client, params, writer, log) {
  const send = event => writer.write(encoder.encode(`${JSON.stringify(event)}\n`));
  try {
    const stream = client.beta.messages.stream(params);
    for await (const event of stream) if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') await send({t:'text', v:event.delta.text});
    const message = await stream.finalMessage();
    if (message.stop_reason === 'refusal') await send({t:'error', v:'이 질문에는 답하지 못했습니다. 질문을 바꿔 다시 시도해 주세요.'});
    if (message.stop_reason === 'max_tokens') await send({t:'notice', v:'답이 길어 중간에서 끊겼습니다. 범위를 좁혀 다시 물어 주세요.'});
    const u = message.usage || {};
    const summary = {input:u.input_tokens||0, output:u.output_tokens||0, cacheRead:u.cache_read_input_tokens||0, cacheWrite:u.cache_creation_input_tokens||0};
    log({...summary, model:message.model, stop:message.stop_reason});
    await send({t:'done', stop:message.stop_reason, model:message.model, usage:summary});
  } catch (error) {
    log({error:error?.status || String(error?.message||error).slice(0,120)});
    await send({t:'error', v:errorText(error)}).catch(()=>{});
  } finally {
    await writer.close().catch(()=>{});
  }
}

async function handleApi(request, env, deps) {
  const url = new URL(request.url), origin = request.headers.get('origin');
  const cors = allowedOrigins(env).includes(origin) ? {'access-control-allow-origin':origin, 'vary':'Origin'} : {'vary':'Origin'};
  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:{...cors, 'access-control-allow-methods':'GET, POST, OPTIONS', 'access-control-allow-headers':'authorization, content-type', 'access-control-max-age':'600'}});
  if (!['/api/me','/api/ask'].includes(url.pathname)) return json(404, {error:'not_found'}, cors);
  if (!cors['access-control-allow-origin']) return json(403, {error:'origin'}, cors);
  const session = await verifyToken((request.headers.get('authorization')||'').replace(/^Bearer\s+/i,''), env.TOKEN_SECRET, deps.now());
  if (!session || !emailAllowed(session.email, env)) return json(401, {error:'login', message:'회사 메일로 다시 로그인해 주세요.'}, cors);
  if (url.pathname === '/api/me') return request.method === 'GET' ? json(200, {email:session.email, exp:session.exp, model:env.MODEL||DEFAULTS.model}, cors) : json(405, {error:'method'}, cors);
  if (request.method !== 'POST') return json(405, {error:'method'}, cors);
  if (rateLimited(session.email, Number(env.RATE_PER_HOUR)||DEFAULTS.ratePerHour, deps.now())) return json(429, {error:'rate', message:'한 시간 질문 한도를 넘었습니다. 잠시 뒤에 다시 시도해 주세요.'}, cors);
  const raw = await request.text();
  if (encoder.encode(raw).length > LIMITS.bodyBytes) return json(413, {error:'size', message:'질문이 너무 깁니다.'}, cors);
  let ask;
  try { ask = parseAsk(JSON.parse(raw)); } catch (error) { return json(400, {error:'input', message:error instanceof SyntaxError ? '요청 형식이 잘못되었습니다.' : error.message}, cors); }
  let context;
  try { context = await loadContext(env, deps); } catch { return json(503, {error:'context', message:'제품 데이터를 불러오지 못했습니다. 잠시 뒤에 다시 시도해 주세요.'}, cors); }
  const {readable, writable} = new TransformStream();
  const log = detail => console.log(JSON.stringify({event:'ask', email:session.email, mode:ask.mode, chars:ask.question.length, context:context.sha256?.slice(0,12), ...detail}));
  const done = streamAnswer(deps.createClient(env), buildRequest(env, context, ask.messages), writable.getWriter(), log);
  deps.ctx?.waitUntil?.(done);
  return new Response(readable, {status:200, headers:{...secureHeaders, ...cors, 'content-type':'application/x-ndjson; charset=utf-8'}});
}

export async function handle(request, env, deps = {}) {
  const full = {fetch:deps.fetch || ((...args)=>fetch(...args)), now:deps.now || (()=>Date.now()), createClient:deps.createClient, ctx:deps.ctx};
  try {
    return env.ROLE === 'login' ? await handleLogin(request, env, full) : await handleApi(request, env, full);
  } catch (error) {
    console.log(JSON.stringify({event:'fatal', message:String(error?.message||error).slice(0,200)}));
    return json(500, {error:'server'});
  }
}
