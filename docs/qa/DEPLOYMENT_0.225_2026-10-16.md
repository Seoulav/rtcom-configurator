# 0.225.0 배포 기록 (2026-10-16)

- 병합: PR #345 → main `006ae2e` (squash, `expectedHeadSha`로 push한 커밋 `216ae0b`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`216ae0b`), 병합 직전 main(`751c055`, 0.224.0) 변동 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 38897820970(`006ae2e`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.225`, `CLAUDE.md` 404
  - 공개 `src/layout-sim.js`가 main과 같음(바이트 비교)
- 검증: `node --test tests/*.test.cjs` 113/113, 제품 33개 검증 통과, `package-site` 성공, e2e 243/243, `unify_notation.cjs` 바뀔 곳 0건, `check-version.cjs --against origin/main` 통과(0.224 → 0.225), `git diff --check` 이상 없음
- 기록은 0.226 PR에 함께 넣음(문서만 따로 올리지 않음)
