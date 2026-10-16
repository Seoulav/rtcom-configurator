# 0.201.0 배포 기록 (2026-10-04)

- 병합: PR #300 → main `4525264` (squash, `expectedHeadSha`로 push한 커밋 `dc89f6f`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`dc89f6f`), 병합 직전 main(`c20b362`, 0.200.0) 변동 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 37243191748(`4525264`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.201`, `CLAUDE.md` 404
  - 공개 `src/products.js`가 main과 같음(바이트 비교)
- 검증: `node --test tests/*.test.cjs` 87/87, 제품 32개 검증 통과, `package-site` 성공, e2e 231/231, `check-version.cjs --against origin/main` 통과(0.200 → 0.201), `unify_notation.cjs` 바뀔 곳 0건, `git diff --check` 이상 없음
