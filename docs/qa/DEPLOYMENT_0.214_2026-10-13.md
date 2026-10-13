# 0.214.0 배포 기록 (2026-10-13)

- **병합:** PR #325 → `main` squash 병합(`d9ded63`). 병합 전 `RTCOM checks / verify` 통과(마지막 커밋 `3a2c3f6`).
- **배포:** `Deploy RTCOM to GitHub Pages` run 38478903226 성공(`d9ded63`).
- **공개 주소 확인:**
  - `https://seoulav.github.io/rtcom-configurator/` 우측 상단 표기가 `CATALOG BASED · 0.214`입니다.
  - `CLAUDE.md`는 404입니다.
  - 공개 `data/products/xdm.json` 라인업에 XDM-288 표기가 0건입니다.
  - 공개 `src/app.js`에 새 WOS100 비디오 월 그림 코드(`rt-wall-panel`)가 있습니다.
- **내용:**
  - XDM-WOS100 구성도를 카드 4장 · 4K 디스플레이 4대(2×2)로 바꿨습니다.
  - XDM-288을 공개 라인업에서 지웠습니다.
  - 한국어 Stop 훅이 중간 진행 안내도 검사하게 했습니다.
