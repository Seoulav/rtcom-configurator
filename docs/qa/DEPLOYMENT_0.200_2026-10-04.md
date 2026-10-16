# 0.200.0 배포 기록 (2026-10-04)

- 병합: PR #298 → main `f112557` (squash, `expectedHeadSha`로 push한 커밋 `7cd2ba9`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`7cd2ba9`), 병합 직전 main(`58cd88a`, 0.199.0) 변동 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 37206031167(`f112557`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.200`, `CLAUDE.md` 404
  - 공개 `src/products.js`가 main과 같음(바이트 비교)
- 검증: `node --test tests/*.test.cjs` 86/86, 제품 32개 검증 통과, `package-site` 성공, e2e 230/230, `check-version.cjs --against origin/main` 통과(0.199 → 0.200), `git diff --check` 이상 없음
