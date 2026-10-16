# 0.212.0 배포 기록 (2026-10-13)

## 대상

- PR #322 `0.212.0: 알티컴 질문 6~11번·XDM-288 보드 수 사용자 답변 반영`
- 병합 커밋: `5023117` (squash, expectedHeadSha `3f1133f`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38403387158)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `5023117`): run 38403754707 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.212` |
| `/CLAUDE.md` | 404 |
| `data/products/xdm.json` · `vdm.json` · `spx.json`, `src/card-specs.js` | main 파일과 sha256 일치 |
| 공개 `vdm.json` | VDM-288X `slots` 72·72, 카드 단자 `REVIEW REQUIRED` 0건 |

## 참고

- 로컬 `dist/` e2e는 238/238입니다.
- AV Portal이 다시 동기화하면 288 프레임 2종의 슬롯과 카드 호환 목록, HOS4S-UW USB 행 삭제가 반영됩니다(`docs/handoff/AV_PORTAL_MODULAR_SLOTS.md`).
