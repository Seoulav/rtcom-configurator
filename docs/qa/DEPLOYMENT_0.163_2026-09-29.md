# 0.163.0 배포 기록 (2026-09-29)

- 병합: PR #228 → main `3d61704` (squash, `expectedHeadSha`로 push한 커밋 `66100cb`에 고정)
- 배포: `Deploy RTCOM to GitHub Pages` run 36556055771, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.163`, `CLAUDE.md` 404
  - 공개 `src/app.js`가 main과 같음(`rt-palette-tile` 포함)
- 검증: `node --test tests/*.test.cjs` 67/67, 제품 32개 검증 통과, `package-site` 성공, e2e 205/205, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
