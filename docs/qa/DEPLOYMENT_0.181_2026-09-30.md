# 0.181.0 배포 기록 (2026-09-30)

- 병합: PR #259 → main `c72765f` (squash, `--match-head-commit`으로 push한 커밋 `0f93f0b`에 고정). 표시된 커밋 제목은 첫 커밋 문구("0.180.0 …")이지만 내용은 0.181.0입니다(그 사이 main에 다른 세션의 0.180.0, PR #258이 먼저 병합되어 이 브랜치에 main을 병합하고 번호를 0.181.0으로 올림).
- 병합 전 확인: RTCOM checks `verify` 통과(`0f93f0b`), 충돌 없음(`mergeable`, `CLEAN`)
- 배포: `Deploy RTCOM to GitHub Pages` run 36673050440(`c72765f`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.181`, `CLAUDE.md` 404
  - 공개 `data/products/spx.json`에 "1080p 60m" 한 행, 공개 `src/products.js`에 `frameSlotText` 있음
- 검증: `node --test tests/*.test.cjs` 74/74, 제품 32개 검증 통과, `package-site` 성공, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음(e2e는 이 PC에 playwright가 없어 건너뜀, GitHub `verify`에서 통과)
