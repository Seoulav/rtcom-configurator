# 0.168.0 배포 기록 (2026-09-29)

- 병합: PR #236 → main `3b233aa` (squash, `expectedHeadSha`로 push한 커밋 `82e6c1c`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`82e6c1c`), main과 차이 없음(behind 0)
- 배포: `Deploy RTCOM to GitHub Pages` run 36564567871(`3b233aa`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.168`, `CLAUDE.md` 404
  - 공개 `src/styles.css`에 FIBER 배지 색 `#00AEC7` 포함
- 검증: `node --test tests/*.test.cjs` 68/68, 제품 32개 검증 통과, `package-site` 성공, e2e 207/207, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
