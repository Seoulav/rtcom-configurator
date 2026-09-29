# 0.142.0 배포 기록 (2026-09-29)

- 사용자 요청: "시험삼아 알티컴 구성기 Claude ai검색을 넣을거야 우리 회사 직원만 쓸수 있게하고 잠궈서 test해보고 싶어 나중에 av portal에서 구현시키기전에 beta test해보고 싶다."
- 사용자 결정: 메일 인증 + 허용 명단, 공개 구성기 안 숨은 버튼, 질의응답·추천 / 구성안 제안 / 사양 비교. 추가 지시 "영업팀은 @seoulav1.co.kr 사용해서 이걸로 변경해줘".
- 병합·배포: `CLAUDE.md` 규칙(사용자 결정 2026-09-28)에 따름
- PR: https://github.com/Seoulav/rtcom-configurator/pull/186 (squash 병합, 병합 커밋 `32573c5`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` 수동 실행(run 156, 성공)
- 버전 번호: 같은 브랜치 이름을 쓰는 다른 세션이 0.140(#183)·0.141(#184)을 먼저 병합해 이 기능은 0.142.0으로 올렸습니다. 그 세션의 문서 PR #185가 병합된 뒤 푸시해 PR이 섞이지 않게 했습니다.

## 변경 요약

- 공개 사이트: `src/ai-search.js`(`?ai=beta`로 켠 브라우저에만 "AI 검색 β" 버튼), `data/ai-context.json`(공개 자료 묶음) 추가. 서버 주소(`CONFIG`)는 비어 있어 버튼을 켜도 "AI 서버가 아직 준비되지 않았습니다"만 보입니다.
- 배포하지 않는 것: `workers/ai-search/`(Cloudflare Worker 코드, 사용자가 `wrangler`로 직접 배포), 설정 문서.
- 상세: `docs/implementation/AI_SEARCH_BETA.md`

## 검증

```
node --test tests/*.test.cjs        # 62/62 pass (AI 검색 단위 8건 포함)
node scripts/build-product-index.cjs --check   # 제품 31개 검증 통과
node scripts/package-site.cjs       # Static site prepared in dist/
node scripts/e2e-smoke.cjs          # 187/187 passed (AI 검색 10건 포함)
git diff --check                    # 통과
wrangler dev(workerd)               # OPTIONS 204, 토큰 없음 401, /api/me 200, /api/ask → Anthropic 401(가짜 키) 안내
wrangler deploy --dry-run           # api·login 번들 성공(gzip 106KiB)
```

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.142`
- 병합 커밋 `32573c5` 빌드 산출물 337개 파일(`.nojekyll` 제외)이 공개 파일과 SHA-256 모두 일치
- 공개 주소에서 404: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/DEPLOYMENT_0.141_2026-09-29.md`, `input_doc/README.md`, `workers/ai-search/wrangler.toml`, `workers/ai-search/src/core.js`, `docs/implementation/AI_SEARCH_BETA.md`
- 공개 주소에서 200: `src/ai-search.js`, `data/ai-context.json`(schema `rtcom.ai-context.v1`)
- 공개 주소 브라우저 확인은 이 작업 환경의 프록시 인증서를 브라우저가 신뢰하지 않아 하지 못했습니다(TLS 검증은 끄지 않음). 같은 빌드를 로컬 e2e로 확인했고 공개 파일 해시가 일치합니다.

## 남은 일

`docs/handoff/OPEN_ITEMS.md` "AI 검색 사내 베타" 항목: 사용자의 Anthropic API 키·Cloudflare Worker·Access 설정 → Worker 주소 전달 → `CONFIG` 채워 다음 버전 배포.

## 되돌리기

`index.html`의 `src/ai-search.js` 태그와 `scripts/package-site.cjs`의 두 줄(`src/ai-search.js`, `data/ai-context.json`)을 지우고 배포합니다.
