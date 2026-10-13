# 0.208.0 배포 기록 (2026-10-13)

## 대상

- PR #313 `0.208.0: 공개 JSON에 모듈형 장비 슬롯·카드 데이터 추가 (AV Portal·AV System Builder 요청)`
- 병합 커밋: `bc2fe5a` (squash, expectedHeadSha `0ebe6f6`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38344254936)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `bc2fe5a`): run 38344459758 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.208` |
| `/CLAUDE.md` | 404 |
| `data/products/xdm.json` · `spx.json` · `vdm.json` · `spx-r6.json` · `index.json` | main 파일과 sha256 일치 |
| 공개 `spx.json` 새 필드 | 메인프레임 5종 `slots`(1/1 · 2/2 · 4/3 · 3/6 · 3/10), 카드 4종 `slotType`·`compatibleFrames`·`io`(SPX-HOS10은 SPX-M810·M1620만) |
| 공개 `spx-r6.json` 새 필드 | `slots.shared` 6 |

## 참고

- AV Portal 동기화(`node beta/sync-rtcom.mjs`)는 AV Portal 쪽에서 합니다. 인계 내용은 `docs/handoff/AV_PORTAL_MODULAR_SLOTS.md`에 있습니다.
- 화면(제품정보·구성기)은 새 필드를 읽지 않아 바뀌지 않습니다. 로컬 `dist/` e2e는 236/236입니다.
