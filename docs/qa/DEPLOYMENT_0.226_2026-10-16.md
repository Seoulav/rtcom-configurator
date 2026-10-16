# 0.226.0 배포 기록 (2026-10-16)

- 병합: PR #346 → main `068e98a` (squash, `expectedHeadSha`로 push한 커밋 `c95bdb9`에 고정)
- 병합 전 확인: PR 첫 커밋(`3920701`)이 main의 0.225 squash와 충돌(`mergeable_state: dirty`)해 GitHub 검사가 시작되지 않음 → origin/main을 브랜치에 병합(충돌 파일은 main 쪽이 브랜치의 0.225 커밋과 동일함을 확인한 뒤 브랜치 쪽 유지)하고 다시 push. RTCOM checks `verify` 통과(`c95bdb9`), 병합 직전 main(`006ae2e`, 0.225.0) 변동 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 38899767327(`068e98a`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.226`, `CLAUDE.md` 404
  - 공개 `src/layout-sim.js`가 main과 같음(바이트 비교)
- 검증: `node --test tests/*.test.cjs` 114/114, 제품 33개 검증 통과, `package-site` 성공, e2e 244/244, `unify_notation.cjs` 바뀔 곳 0건, `check-version.cjs --against origin/main` 통과(0.225 → 0.226), `git diff --check` 이상 없음
