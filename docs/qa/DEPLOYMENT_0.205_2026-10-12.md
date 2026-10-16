# 0.205.0 배포 기록 (2026-10-12)

## 대상

- PR #306 `0.205.0: XDM-WOS100·HOS100 기능 팝업 확장 · HOS100 멀티뷰 레이아웃`
- 병합 커밋: `e1cc480` (squash, expectedHeadSha `934143a`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38262198352)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `e1cc480`): run 38262519038 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.205` |
| `/CLAUDE.md` | 404 |
| `src/app.js` · `src/products.js` · `src/card-specs.js` · `src/styles.css` | main 파일과 sha256 일치 |

## 참고

- 화면 동작은 로컬 `dist/` e2e(235/235)와 PC 1280px·휴대폰 390px 화면으로 확인했습니다. 이 환경의 Playwright는 프록시 인증서 문제로 공개 주소를 열지 못해, 공개 주소는 curl로만 확인했습니다.
- 브라우저 캐시 때문에 예전 버튼이 보이면 새로 고침(Ctrl+F5)하면 됩니다.
