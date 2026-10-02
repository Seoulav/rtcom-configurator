# 0.175.0 배포 기록 (2026-09-29)

- 병합: PR #249 → main `1c310aa` (squash, `expectedHeadSha`로 push한 커밋 `2f6cb97`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`2f6cb97`), main(`3c9d4c6`, 0.174.0 배포 기록)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36575779902(`1c310aa`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.175`, `CLAUDE.md` 404
  - 공개 `src/app.js`·`src/styles.css`가 main과 같음("S/FTP CAT6A 필수" 5곳 포함)
- 검증: `node --test tests/*.test.cjs` 72/72, 제품 32개 검증 통과, `package-site` 성공, e2e 215/215, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
