# 0.96.0 배포 기록 (2026-09-28)

- 사용자 요청: "QMS-44, 88 모두 글이 너무 많아 좀 더 요약해줘"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/96 (squash 병합, 병합 커밋 `9fa19d0`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 75 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36412831105) — success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.96`
- `data/products/qms-88ux.json` 공개 파일이 `main`(9fa19d0) 빌드 결과와 SHA-256 일치
- 병합 전 검증: `node --test` 44/44, `build-product-index --check` 30개, `package-site` 통과, `git diff --check` 통과, `e2e-smoke`는 playwright 없음으로 건너뜀

## 영향

- QMS-88UX 06 화면 구성 모드 QUAD·DUAL 카드 설명 문장이 짧아짐(각 6줄→3줄, 5줄→3줄 수준)
- QMS-44UX 06 화면 구성 모드 QUAD 카드 설명도 두 줄로 나눠 짧아짐
- 레이아웃 칩 목록·미리보기 그림은 변화 없음
- 버전 표기 0.95 → 0.96

## 되돌리기

- main에서 `9fa19d0`을 revert한 뒤 다시 배포합니다.
