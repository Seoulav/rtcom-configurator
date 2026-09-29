# 0.155.0 배포 기록 (2026-09-29)

- 병합: PR #211 → main `c3c4ce0` (squash). 다른 세션의 0.154.0(PR #210)과 겹쳐 0.155.0으로 다시 매김.
- 배포: `Deploy RTCOM to GitHub Pages` run 36551445624, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.155`, `CLAUDE.md` 404
  - `src/products.js`에 `WALL_SPECS` 있음, `data/products/qms-88ux.json` WALL 레이아웃에 "2×2 + 2×2" 있음
- 검증: e2e 194/194 통과(임시 폴더의 playwright-core + Edge). `tests/ai-search.test.cjs` 6개는 Windows 전용 실패(이전부터 있던 문제)
