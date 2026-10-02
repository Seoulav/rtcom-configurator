# 0.184.0 배포 기록 (2026-09-30)

- 병합: PR #265 → main `e4dc482` (squash, `expectedHeadSha`로 push한 커밋 `28fea81`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`28fea81`), main(`7140a43`, 0.183.0)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36790091058(`e4dc482`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.184`, `CLAUDE.md` 404
  - 공개 `data/products/hd-13u.json`·`src/products.js`가 main과 같음
- 검증: `node --test tests/*.test.cjs` 76/76, 제품 32개 검증 통과, `package-site` 성공, e2e 219/219, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
