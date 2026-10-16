# 0.224.0 배포 기록 (2026-10-16)

- 병합: PR #343 → main `5040483` (squash, `expectedHeadSha`로 push한 커밋 `70df2c2`에 고정)
- 병합 전 확인: main이 0.223.0(`cb1820d`, 다른 세션 작업 0.202~0.223)으로 바뀌어 작업 브랜치에 병합하고 번호를 0.202 → 0.224로 다시 정함. RTCOM checks `verify` 통과(`70df2c2`), 병합 직전 main 변동 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 38894744259(`5040483`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.224`, `CLAUDE.md` 404
  - 공개 `src/layout-sim.js`·`src/products.js`가 main과 같음(바이트 비교)
- 검증: `node --test tests/*.test.cjs` 109/109, 제품 33개 검증 통과, `package-site` 성공, e2e 241/241, `unify_notation.cjs` 바뀔 곳 0건, `check-version.cjs --against origin/main` 통과(0.223 → 0.224), `git diff --check` 이상 없음
