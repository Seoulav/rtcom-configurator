# RTCOM AI 검색 — 사내 베타 (0.142.0)

## 1. 요청과 결정

- **요청(2026-09-29):** "시험삼아 알티컴 구성기 Claude ai검색을 넣을거야 우리 회사 직원만 쓸수 있게하고 잠궈서 test해보고 싶어. 나중에 av portal에서 구현시키기전에 beta test해보고 싶다."
- **사용자 결정(2026-09-29 질문 응답)**
  - 잠금 방식: **메일 인증 + 허용 명단.** 회사 메일 중에서도 지정한 사람만 들어옵니다.
  - 화면 위치: **공개 구성기 안의 숨은 버튼.**
  - 기능: **제품 질의응답·추천, 구성기 구성안 제안, 사양 비교** 세 가지.
- **추가 지시(2026-09-29):** "영업팀은 @seoulav1.co.kr 사용해서 이걸로 변경해줘". 허용 도메인 기본값을 `seoulav1.co.kr`로 두었습니다(`workers/ai-search/wrangler.toml`의 `ALLOWED_EMAIL_DOMAINS`).
  - `@seoulav.co.kr` 메일(본부 인원 등)도 넣으려면 두 Worker 모두 값을 `"seoulav1.co.kr,seoulav.co.kr"`로 바꿔 다시 배포합니다.

## 2. 구조

GitHub Pages는 누구나 보는 정적 사이트입니다. API 키를 숨길 곳이 없고 로그인 기능도 없습니다. 그래서 Cloudflare Worker 두 개를 중간에 둡니다. 두 Worker는 같은 코드(`workers/ai-search/src/core.js`)를 쓰고, `ROLE` 설정값으로 역할을 나눕니다.

```
구성기(공개, ?ai=beta로 켠 브라우저만 버튼 보임)
   │ ① "회사 메일로 로그인" → 새 창
   ▼
rtcom-ai-login.<계정>.workers.dev   ← Cloudflare Access로 통째로 잠금(허용 명단 + 메일 6자리 코드)
   · Access JWT를 팀 공개키로 다시 검증 → 도메인·허용 명단 확인 → 12시간 서명 토큰 발급
   · 토큰은 구성기 창(허용 origin)에만 postMessage로 넘김
   │ ② 토큰
   ▼
구성기 ──③ 질문 + Bearer 토큰──▶ rtcom-ai-api.<계정>.workers.dev
                                   · origin·토큰·도메인·허용 명단을 매번 확인, 시간당 30회 제한
                                   · 공개 자료 묶음(dist/data/ai-context.json)을 읽어 Claude에 전달
                                   · ANTHROPIC_API_KEY는 이 Worker 비밀값에만 있음
                                   │ ④
                                   ▼
                                Claude API(claude-opus-5-5) → 답을 한 줄씩(NDJSON) 흘려 보냄
```

- **Worker를 두 개로 나눈 이유:** Cloudflare Access는 workers.dev 주소를 통째로 잠급니다. 질문 주소까지 잠그면 다른 사이트(github.io)의 요청이 Access 로그인 쿠키를 싣지 못해 막힙니다.
  - 그래서 로그인 주소만 Access로 잠그고, 질문 주소는 Worker가 직접 서명 토큰으로 지킵니다.
- **공개 사이트에서 바뀐 것**
  - `src/ai-search.js`(숨은 버튼과 창)와 `data/ai-context.json`(공개 자료 묶음)이 늘었습니다.
  - 버튼은 `?ai=beta`를 붙여 한 번 연 브라우저에만 보이고, `?ai=off`로 끕니다.
  - 스크립트 코드는 누구나 볼 수 있지만, 로그인하지 못하면 아무 답도 받을 수 없습니다.
- **AI에 주는 자료**
  - `scripts/build-ai-context.cjs`가 공개 제품정보 31종과 구성기 카탈로그(프레임별 입력·출력 슬롯 수, 카드별 포트 수, 카드 사양, 연동 전송기)를 글로 줄입니다. 약 6.4만 자입니다.
  - 사진 좌표·출처 표기·검토 기록은 뺍니다.
  - 단가·노하우 같은 내부 정보는 이 저장소에 없으므로 AI에도 들어가지 않습니다.
  - 가격을 물으면 "담당자 확인"으로 안내하도록 지시문(`SYSTEM_PROMPT`)에 적었습니다.
- **모델:** `claude-opus-5-5`, effort `medium`.
  - 거절되면 Anthropic 권장 모델로 한 번 더 답하는 `fallbacks: "default"`를 켰습니다.
  - 모델은 `wrangler.toml`의 `MODEL`로 바꿉니다. 비용을 줄이려면 `claude-sonnet-5-5`로 바꿉니다.
- **캐시:** 지시문과 제품 데이터는 질문마다 같으므로 프롬프트 캐시를 씁니다. 요청 유형(질의응답·구성안·비교)은 사용자 메시지 앞에 붙여 캐시가 깨지지 않게 했습니다.

## 3. 보안 설계

| 위협 | 막는 방법 |
|---|---|
| API 키 노출 | 키는 api Worker 비밀값(`wrangler secret`)에만 있습니다. 저장소·브라우저·응답에 나가지 않습니다(테스트로 확인). |
| 외부인 사용 | ① Access 허용 명단 + 메일 코드 ② Worker가 Access JWT 서명·aud·iss·만료를 다시 검증 ③ 도메인(`seoulav1.co.kr`)과 `ALLOWED_EMAILS`를 **둘 다** 만족해야 통과. 명단이 비면 모두 거부합니다. |
| 퇴사·권한 회수 | `ALLOWED_EMAILS`에서 빼면, 이미 받은 토큰이 있어도 다음 질문부터 막힙니다. `TOKEN_SECRET`을 바꾸면 모든 토큰이 한 번에 무효가 됩니다. |
| 토큰 가로채기 | 로그인 창은 허용 origin(`SITE_URL`·`EXTRA_ORIGINS`)에만 토큰을 넘깁니다. 구성기는 로그인 Worker origin에서 온 메시지만 받습니다. 서버 주소는 코드에 고정되어 URL로 바꿀 수 없습니다. |
| 다른 사이트에서 호출 | CORS가 허용 origin만 통과시킵니다(그 외 403). |
| 답에 섞인 HTML·스크립트 | 모든 글자를 먼저 이스케이프합니다. 그다음 제목·목록·표·굵게·`[[제품id]]` 링크(목록에 있는 id만)만 그립니다(e2e 확인). |
| 과다 사용·비용 | 1인 시간당 30회(Worker 인스턴스별 간이 제한), 질문 2,000자, 답 최대 8,000 토큰. **실제 상한은 Anthropic Console 월 지출 한도로 겁니다.** |

## 4. 예상 비용(추정, 실측은 Worker 로그의 usage로 확인)

- 제품 데이터 약 6.4만 자는 약 4~6만 토큰으로 추정합니다. 정확한 값은 첫 질문의 `cacheWrite`로 확인합니다.
- **Opus 5.5**
  - 5분 안에 이어지는 질문: 캐시 읽기 약 $0.01 + 답 약 $0.03, 곧 1건 약 $0.04(약 60원)입니다.
  - 5분 넘게 쉰 뒤 첫 질문: 캐시 쓰기가 더해져 약 $0.25~0.35입니다.
- **Sonnet 5.5**로 바꾸면 이어지는 질문은 약 $0.02, 첫 질문은 약 $0.12~0.17입니다.
- 베타 10명이 하루 5건씩 쓰면 월 약 1,100건입니다.
  - Opus 기준 월 약 $80~150, Sonnet 기준 약 $40~70입니다. 5분 넘게 쉰 뒤 첫 질문 비율에 따라 달라집니다.
  - Console 월 한도는 $100 정도로 시작하기를 권합니다.

## 5. 설정 절차(사용자가 한 번 합니다)

Cloudflare와 Anthropic 화면 문구는 개편으로 조금 다를 수 있습니다.

1. **Anthropic API 키**
   1. console.anthropic.com에서 회사 계정으로 로그인합니다.
   2. Workspace `rtcom-ai-beta`를 만들고 API 키를 발급합니다.
   3. 같은 Workspace에 월 지출 한도를 설정합니다.
   4. 키는 채팅·메일·저장소에 붙여 넣지 않습니다.
2. **Cloudflare 계정과 배포 도구**
   1. 무료 계정을 만듭니다. PC에 Node.js 20 이상이 있어야 합니다.
   2. 아래 명령으로 두 Worker를 배포합니다. 끝나면 `https://rtcom-ai-api.<계정>.workers.dev`, `https://rtcom-ai-login.<계정>.workers.dev` 두 주소가 나옵니다.
   ```bash
   cd workers/ai-search
   npm ci
   npx wrangler login
   npx wrangler deploy
   npx wrangler deploy --env login
   ```
3. **Zero Trust(Access)로 로그인 Worker 잠그기**
   1. Cloudflare 대시보드 → Zero Trust를 켭니다(Free 플랜, 50명까지 무료). 팀 이름을 정하면 `<팀이름>.cloudflareaccess.com`이 생깁니다.
   2. Workers & Pages → `rtcom-ai-login` → Settings → Domains & Routes → workers.dev에서 **Cloudflare Access**를 켭니다.
   3. 만들어진 Access 앱의 정책을 편집합니다.
      - Include → Emails에 베타 인원 메일을 하나씩 넣습니다(예: `홍길동@seoulav1.co.kr`).
      - 로그인 방법은 One-time PIN(메일 6자리 코드)입니다.
   4. 그 Access 앱의 **Application Audience (AUD) Tag**를 복사합니다.
   5. `rtcom-ai-api`에는 Access를 켜지 않습니다(토큰으로 지킴).
4. **비밀값 넣기**
   - `TOKEN_SECRET`은 32자 이상의 임의 문자열이고, 두 Worker에 같은 값을 넣습니다. `openssl rand -base64 48`으로 만들 수 있습니다.
   - `ALLOWED_EMAILS`는 쉼표로 구분하고, Access 정책과 같은 명단을 넣습니다.
   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   npx wrangler secret put TOKEN_SECRET
   npx wrangler secret put ALLOWED_EMAILS
   npx wrangler secret put TOKEN_SECRET --env login
   npx wrangler secret put ALLOWED_EMAILS --env login
   npx wrangler secret put ACCESS_AUD --env login
   npx wrangler secret put ACCESS_TEAM_DOMAIN --env login   # 예: <팀이름>.cloudflareaccess.com
   ```
5. **Claude에게 두 Worker 주소를 알려 주기.** 비밀값은 알려 주지 않습니다.
   - Claude가 `src/ai-search.js`의 `CONFIG`에 주소를 넣고 Pages에 배포합니다(다음 버전).
   - 그전까지 버튼을 켜면 "AI 서버가 아직 준비되지 않았습니다"만 보입니다.
6. **사용**
   1. `https://seoulav.github.io/rtcom-configurator/?ai=beta`를 한 번 열면 머리글에 **AI 검색 β** 버튼이 생깁니다.
   2. **회사 메일로 로그인** → 메일 입력 → 6자리 코드 입력 순서로 진행하면 창이 닫히고 질문할 수 있습니다. 로그인은 12시간 유지됩니다.

## 6. 운영

- **인원 추가·삭제**
  - Access 정책의 Emails와 두 Worker의 `ALLOWED_EMAILS` 비밀값을 함께 바꿉니다.
  - `ALLOWED_EMAILS`만 바꿔도 질문은 바로 막힙니다.
- **전원 즉시 차단:** 두 Worker의 `TOKEN_SECRET`을 새 값으로 바꿉니다. `ANTHROPIC_API_KEY`를 Console에서 비활성화해도 됩니다.
- **사용 기록:** 대시보드 → Workers → `rtcom-ai-api` → Logs, 또는 `npx wrangler tail`에서 봅니다.
  - `{"event":"ask", email, mode, input, output, cacheRead, cacheWrite}` 줄로 누가 어떤 유형을 몇 토큰 썼는지 남습니다.
  - 질문 본문은 기록하지 않습니다.
- **제품 데이터 갱신:** 제품 JSON이 바뀌어 Pages가 배포되면 `data/ai-context.json`도 새로 만들어집니다. Worker는 10분 안에 새 자료를 읽으므로 Worker를 다시 배포할 필요가 없습니다.

## 7. 되돌리기

- **개인 브라우저에서 버튼 끄기:** `?ai=off`를 붙여 엽니다.
- **사이트에서 제거:** `index.html`의 `src/ai-search.js` 태그, `scripts/package-site.cjs`의 두 줄(`src/ai-search.js`, `data/ai-context.json`), `src/styles.css` 끝의 0.142 블록을 지운 뒤 배포합니다. 구성기 저장 데이터(`rtcom.configuration.v1`)와는 무관합니다.
- **서버 제거:** `npx wrangler delete` 및 `npx wrangler delete --env login`을 실행하고, Access 앱과 API 키를 삭제합니다.

## 8. AV Portal로 옮길 때

- **API 약속**
  - `POST /api/ask`: `{mode:'ask'|'configure'|'compare', question, history:[{role,text}]}`.
  - 응답은 NDJSON(`{t:'text',v}` … `{t:'done',usage}` 또는 `{t:'error',v}`)입니다.
  - `GET /api/me`는 `{email,exp,model}`을 돌려줍니다.
- **옮기는 방법:** `core.js`의 지시문·요청 조립(`buildRequest`)·자료 묶음 생성기(`build-ai-context.cjs`)를 그대로 쓰고, 인증만 Portal 방식으로 바꾸면 됩니다.
- **베타에서 확인할 것**
  - 구성안 슬롯 계산 정확도
  - 사양 비교 누락
  - 가격 질문 거절
  - 실제 건당 토큰
- **2단계 후보:** 구성안을 구성기에 바로 불러오기(구조화 출력 JSON).

## 9. 검증(0.142.0)

- **단위 테스트** `tests/ai-search.test.cjs` 8건, 네트워크 없이 실행합니다.
  - 토큰 위조·만료
  - 도메인·명단(seoulav1.co.kr)
  - Access JWT 서명·aud·iss·만료
  - 로그인 origin 제한
  - CORS·401·명단 회수
  - NDJSON 중계와 요청 파라미터(모델, 캐시, fallbacks, thinking 미전송)
  - 거절·429·입력 오류·한도·자료 없음(503)
  - 자료 묶음이 항상 같은지(sha256)
  - 배포 목록
- **실제 Workers 실행 환경(`wrangler dev`, workerd)**
  - OPTIONS 204와 허용 origin을 확인했습니다.
  - 토큰이 없으면 401, 있으면 `/api/me` 200이었습니다.
  - `/api/ask`는 자료 묶음을 읽은 뒤 Anthropic에 요청했습니다. 가짜 키라 401을 받았고, "API 키 설정을 확인해야 합니다"로 안내되는 것까지 확인했습니다.
  - `wrangler deploy --dry-run` 번들은 api·login 모두 성공했습니다(gzip 106KiB).
- **브라우저 e2e** `scripts/e2e-smoke.cjs` 10건(가짜 서버 route 사용)
  - 기본 화면에 버튼 없음
  - `?ai=beta` 켜기·유지·`?ai=off` 끄기, `#ai-token=` 예비 경로
  - 서버 미설정 안내
  - 허용 origin 토큰만 수신
  - 제품 링크·표·굵게 표시와 HTML 이스케이프
  - 요청 유형 전송
  - 휴대폰 전체 폭·가로 스크롤 없음
  - Esc 닫기
- **화면:** `docs/qa/ai-search-beta/desktop-answer.png`, `mobile-answer.png`
- **실제 Claude 응답은 아직 시험하지 못했습니다.** 회사 API 키와 Cloudflare 설정 뒤 첫 질문에서 확인합니다.
