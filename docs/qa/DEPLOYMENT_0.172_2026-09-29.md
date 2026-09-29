# 0.172.0 배포 기록 (2026-09-29)

- 병합: PR #245 → main `96af806` (squash, `expectedHeadSha`로 push한 커밋 `c3a494e`에 고정)
- 병합 전 확인: 작업 중 main이 0.171.0(`481fe11`, 다른 세션)으로 바뀌어 작업 브랜치에 병합하고 번호를 0.170 → 0.172로 다시 정함(후면 슬롯 번호·신호 태그 충돌 1곳 해소). RTCOM checks `verify` 통과(`c3a494e`), 병합 직전 main 변동 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36572051673(`96af806`)
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.172`, `CLAUDE.md` 404
  - 공개 `index.html`·`src/app.js`·`src/core.js`·`src/styles.css`가 main과 같음(SHA-256 비교), `#print-report`·`reportHtml` 포함 확인
- 검증: `node --test tests/*.test.cjs` 69/69, 제품 32개 검증 통과, `package-site` 성공, e2e 211/211, `check-version.cjs --against origin/main` 통과(0.171 → 0.172), `git diff --check` 이상 없음
