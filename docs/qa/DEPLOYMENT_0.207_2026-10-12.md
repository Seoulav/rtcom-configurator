# 0.207.0 배포 기록 (2026-10-12)

## 대상

- PR #311 `0.207.0: XDM-WOS100 레이어 팝업 · 출력 1개 4K/60 소스 4개 · HOS100 컨셉 + Analog Way 데이터시트 믹싱`
- 병합 커밋: `83fe3e6` (squash, expectedHeadSha `d72d6fc`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38298723334)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `83fe3e6`): run 38298966029 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.207` |
| `/CLAUDE.md` | 404 |
| `src/app.js` · `src/products.js` · `src/card-specs.js` · `src/styles.css` · `data/products/xdm.json` | main 파일과 sha256 일치 |

## 참고

- 화면 동작은 로컬 `dist/` e2e(236/236)와 PC 1280px·휴대폰 390px 화면으로 확인했습니다(`docs/qa/xdm-wos100-one-output-layers-0.207/`). 이 환경의 Playwright는 프록시 인증서 문제로 공개 주소를 열지 못해, 공개 주소는 curl로만 확인했습니다.
- 브라우저 캐시 때문에 예전 그림(2×2 비디오 월)이 보이면 새로 고침(Ctrl+F5)하면 됩니다.
