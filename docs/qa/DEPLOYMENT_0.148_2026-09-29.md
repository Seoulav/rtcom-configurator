# 0.148.0 배포 기록 (2026-09-29)

- 병합: PR #198 → main `5015e6b` (squash)
- 배포: `Deploy RTCOM to GitHub Pages` run 36547084450, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.148`
  - `CLAUDE.md` 404
  - `data/products/qms-88ux.json` HDCP = "HDCP 2.2 지원"
  - `data/products/qms-44ux.json`에 "미니 USB" 없음
- 참고: `tests/ai-search.test.cjs` 6개는 Windows에서만 실패함(ERR_UNSUPPORTED_ESM_URL_SCHEME, 이전부터 있던 문제)
