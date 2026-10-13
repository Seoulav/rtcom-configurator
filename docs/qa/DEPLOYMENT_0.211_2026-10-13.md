# 0.211.0 배포 기록 (2026-10-13)

## 대상

- PR #320 `0.211.0: XDM-WOS100·HOS100 차이를 출력 동기(싱크)로 명시, WOS100 카드 사이 동기(LED S-BOX)`
- 병합 커밋: `925c03d` (squash, expectedHeadSha `438362f`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38374252943)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `925c03d`): run 38374562902 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.211` |
| `/CLAUDE.md` | 404 |
| `data/products/xdm.json`, `src/app.js` · `card-specs.js` · `styles.css` | main 파일과 sha256 일치 |
| 공개 `src/app.js` | "2~3장으로 LED S-BOX 1·2" 문장 4곳 |

## 참고

- 로컬 `dist/` e2e는 238/238입니다.
