# 0.182.0 배포 기록 (2026-09-30)

- 병합: PR #261 → main `bb90d66` (squash, `--match-head-commit`으로 push한 커밋 `b9de1ec`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`b9de1ec`), main(`c72765f`, 0.181.0)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36673740174(`bb90d66`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.182`, `CLAUDE.md` 404
  - 공개 `data/products/xdm.json`·`vdm.json`에 4096 없음, `src/card-specs.js`의 4096은 주석 1건만 남음
- 검증: `node --test tests/*.test.cjs` 74/74, 제품 32개 검증 통과, `package-site` 성공, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음. e2e는 playwright가 없어 건너뜀(exit 2)
