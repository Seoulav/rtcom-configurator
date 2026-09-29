# 0.174.0 배포 기록 (2026-09-29)

- 병합: PR #247 → main `30224d4` (squash). 병합 전 GitHub `RTCOM checks / verify` 통과(head `b0e4a72`)
- 배포: `Deploy RTCOM to GitHub Pages` run 36573682137, 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.174`, `CLAUDE.md` 404
  - 공개 `src/app.js`에 `av-builder-open`("AV 빌더에서 바로 열기") 있음
- 남은 일: AV 빌더 쪽 받기 코드(`docs/handoff/AV_BUILDER_RTCOM_IMPORT.md`). 그전까지는 10초 뒤 파일 내려받기로 동작합니다.
