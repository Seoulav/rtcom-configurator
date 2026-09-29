# 0.151.0 배포 기록 (2026-09-29)

- 병합: PR #205 → main `acec978` (squash)
- 배포: `Deploy RTCOM to GitHub Pages` run 36548935354, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.151`, `CLAUDE.md` 404
  - `src/products.js`에 `openProductFrameInfo`(03 메인프레임 정면·후면 팝업) 있음
  - `xdm-catalog-p9.webp`·`vdm-catalog-p9.webp` 200, `xdm-catalog.pdf` sha256 앞 16자리 `d8d4c6019a9af2bc`로 main과 같음
- 참고: `tests/ai-search.test.cjs` 6개는 Windows에서만 실패함(이전부터 있던 문제, 이번 변경과 관계없음)
