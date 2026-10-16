# 0.210.0 배포 기록 (2026-10-13)

## 대상

- PR #318 `0.210.0: 알티컴 확인 답 반영(WOS100 포트·오디오, COS100 PHX, 커스텀 EDID, XDM-288)`
- 병합 커밋: `d44eadd` (squash, expectedHeadSha `e3e07b0`)
- PR 검사 `RTCOM checks / verify`: 성공 (run 38367078277)

## 배포

- `Deploy RTCOM to GitHub Pages` (`pages.yml`, workflow_dispatch, main `d44eadd`): run 38367380853 성공

## 공개 주소 확인 (curl)

| 항목 | 결과 |
|---|---|
| `https://seoulav.github.io/rtcom-configurator/` 버전 표기 | `CATALOG BASED · 0.210` |
| `/CLAUDE.md` | 404 |
| `data/products/xdm.json` · `xdm-psu.json`, `src/core.js` · `app.js` · `card-specs.js` | main 파일과 sha256 일치 |
| 공개 `xdm.json` 새 값 | XDM-COS100 Power 행 수량 4·VERIFIED·출처 U5, XDM-288 요약 "주문 생산 모델", 05 주요 기능 "커스텀 EDID 출고 지원" |

## 참고

- 로컬 `dist/` e2e는 237/237입니다.
- 매뉴얼·안내서 PDF 4건은 사용자가 공개를 결정했으나 원본 파일을 받지 못해 이번 배포에 없습니다(`docs/handoff/OPEN_ITEMS.md`).
