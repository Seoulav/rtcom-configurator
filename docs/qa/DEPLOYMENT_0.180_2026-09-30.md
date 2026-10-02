# 0.180.0 배포 기록 (2026-09-30)

- 병합: PR #258 → main `b319844` (squash, `expectedHeadSha`로 push한 커밋 `8111155`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`8111155`), main(`f16472f`, 0.179.0 배포 기록)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36671871160(`b319844`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.180`, `CLAUDE.md` 404
  - 공개 `output/design/assets/frames/vdm-64x-front-art.webp`가 main과 같음
- 검증: `node --test tests/*.test.cjs` 72/72, 제품 32개 검증 통과, `package-site` 성공, e2e 219/219, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
