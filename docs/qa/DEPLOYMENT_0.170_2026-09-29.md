# 0.170.0 배포 기록 (2026-09-29)

- 병합: PR #240 → main `7aba024` (squash, `expectedHeadSha`로 push한 커밋 `e4a7f9f`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`e4a7f9f`), main과 차이 없음(behind 0)
- 배포: `Deploy RTCOM to GitHub Pages` run 36568312060(`7aba024`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.170`, `CLAUDE.md` 404
  - 공개 `src/app.js`가 main과 같음
- 검증: `node --test tests/*.test.cjs` 68/68, 제품 32개 검증 통과, `package-site` 성공, e2e 207/207, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
