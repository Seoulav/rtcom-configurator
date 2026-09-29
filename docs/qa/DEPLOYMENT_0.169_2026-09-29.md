# 0.169.0 배포 기록 (2026-09-29)

- 병합: PR #238 → main `1fa5e5b` (squash, `expectedHeadSha`로 push한 커밋 `74dfd60`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`74dfd60`), main과 차이 없음(behind 0)
- 배포: `Deploy RTCOM to GitHub Pages` run 36565536755(`1fa5e5b`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.169`, `CLAUDE.md` 404
  - 공개 `src/styles.css`에 FIBER 배지 흰 글자 규칙 포함
- 검증: `node --test tests/*.test.cjs` 68/68, 제품 32개 검증 통과, `package-site` 성공, e2e 207/207, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
- 참고: 아쿠아 바탕(`#00AEC7`) 흰 글자 대비 2.67:1(권장 4.5:1 미만), 사용자 결정으로 흰색 사용·얇은 그림자로 보완
