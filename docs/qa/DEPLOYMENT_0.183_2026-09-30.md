# 0.183.0 배포 기록 (2026-09-30)

- 병합: PR #262 → main `7140a43` (squash, `--match-head-commit`으로 push한 커밋 `0f2c107`에 고정, 제목은 `--subject`로 0.183.0 지정)
- 병합 전 확인: RTCOM checks `verify` 통과(`0f2c107`), 충돌 없음(`CLEAN`), main(`9d593fc`, 0.182.0 배포 기록)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36684580003(`7140a43`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.183`, `CLAUDE.md` 404
  - 공개 `src/products.js`에 `data-frame-configure`(슬롯 구성기 버튼) 있음, 공개 `data/products/vdm.json`에 "DVI 1.0" 없음
- 검증: `node --test tests/*.test.cjs` 75/75, 제품 32개 검증 통과, `package-site` 성공, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음(e2e는 이 PC에 playwright가 없어 건너뜀, GitHub `verify`에서 통과)
