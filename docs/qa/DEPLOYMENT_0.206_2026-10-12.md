# 0.206.0 배포 기록 (2026-10-12)

## 대상

- PR #309 `0.206.0: 한국어 응답 강제 훅 · HOS100 분할 예시 모니터 그림 · HIS100 자막`
- 병합 커밋: `8513fdf` (squash, expectedHeadSha `e1c1e77`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38265471785)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `8513fdf`): run 38265784102 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.206` |
| `/CLAUDE.md` | 404 |
| `src/app.js` · `src/products.js` · `src/card-specs.js` · `src/styles.css` | main 파일과 sha256 일치 |

## 참고

- 한국어 응답 강제 장치(`.claude/settings.json`, `scripts/korean-reply-hook.cjs`)는 Claude Code 작업 환경 설정이라 `dist/`에 들어가지 않고 공개 사이트에는 영향이 없습니다. 이 저장소를 여는 Claude Code 세션에서만 동작합니다.
- 화면 동작은 로컬 `dist/` e2e(235/235)와 PC 1280px·휴대폰 390px 화면으로 확인했습니다. 이 환경의 Playwright는 프록시 인증서 문제로 공개 주소를 열지 못해, 공개 주소는 curl로만 확인했습니다.
- 브라우저 캐시 때문에 예전 그림이 보이면 새로 고침(Ctrl+F5)하면 됩니다.
