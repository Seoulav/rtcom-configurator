# 0.178.0 배포 기록 (2026-09-29)

- 병합: PR #254 → main `a37a894` (squash, `expectedHeadSha`로 push한 커밋 `b4289eb`에 고정)
- 병합 전 확인: RTCOM checks `verify` 통과(`b4289eb`), main(`bb5e63a`, 0.177.0)과 차이 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36636895224(`a37a894`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.178`, `CLAUDE.md` 404
  - 공개 `src/styles.css`·`src/products.js`·`data/products/xdm-ctr100.json`이 main과 같음
- 검증: `node --test tests/*.test.cjs` 72/72, 제품 32개 검증 통과, `package-site` 성공, e2e 219/219, `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
- 남은 확인: 삼성 인터넷 다크 모드에서 카드 썸네일이 보이는지 사용자 휴대폰으로 확인(`docs/implementation/FRAME_HEIGHT_DARK_0.178.md` §4)
