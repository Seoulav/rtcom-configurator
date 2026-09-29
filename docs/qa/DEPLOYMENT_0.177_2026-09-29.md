# 0.177.0 배포 기록 (2026-09-29)

- 병합: PR #252 → main `f291f77` (squash, `expectedHeadSha`로 push한 커밋 `e3330ec`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`e3330ec`), main(`e8a65f6`, 0.176.0)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36578840772(`f291f77`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.177`, `CLAUDE.md` 404
  - 공개 `src/styles.css`·`data/products/xdm-ct103-cr103.json`이 main과 같음
- 검증: `node --test tests/*.test.cjs` 72/72, 제품 32개 검증 통과, `package-site` 성공, e2e 216/216, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
