# 0.179.0 배포 기록 (2026-09-29)

- 병합: PR #256 → main `fcb0e72` (squash, `expectedHeadSha`로 push한 커밋 `dc3e4ae`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`dc3e4ae`), main(`e34a0c8`, 0.178.0 배포 기록)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36638527335(`fcb0e72`)
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.179`, `CLAUDE.md` 404
  - 공개 `src/app.js`·`output/design/assets/frames/vdm-64x-rear-art.webp`가 main과 같음
- 검증: `node --test tests/*.test.cjs` 72/72, 제품 32개 검증 통과, `package-site` 성공, e2e 219/219, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
