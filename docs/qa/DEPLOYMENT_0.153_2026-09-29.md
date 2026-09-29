# 0.153.0 배포 기록 (2026-09-29)

- 병합: PR #208 → main `cc303a0` (squash)
- 배포: `Deploy RTCOM to GitHub Pages` run 36550041670, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.153`, `CLAUDE.md` 404
  - `src/app.js`에 "내 구성" 랙 높이 표기(`frameRackU[state.model]`) 있음
  - `spx-m1620-rear-art.webp` sha256 앞 16자리 `fafda82da5a8e0b6`로 main과 같음
- 참고: `tests/ai-search.test.cjs` 6개는 Windows에서만 실패함(이전부터 있던 문제)
