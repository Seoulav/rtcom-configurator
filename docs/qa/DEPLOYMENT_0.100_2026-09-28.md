# 0.100.0 배포 기록 (2026-09-28)

- 사용자 지적: "8분할시 비율유지는 안되는거 같은 메뉴얼 확인해서 수정해"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/104 (squash 병합, 병합 커밋 `e1404d0`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 83 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36418696603) — success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.100`
- `src/products.js`·`src/styles.css` 공개 파일이 `main`(e1404d0) 빌드 결과와 SHA-256 일치
- 병합 전 검증: `node --test` 45/45, `build-product-index --check` 30개, `package-site` 통과, `git diff --check` 통과, `e2e-smoke`는 playwright 없음으로 건너뜀

## 영향

- QMS-88UX 06 화면 구성 모드 "8분할(16:9 비율)" 미리보기에 짙은 레터박스 막대가 보임(매뉴얼 KV.04 23쪽 Output Option 5 예시와 같은 모양)
- 다른 레이아웃 미리보기(QUAD·PBP·PIP·USER MODE 등)는 변화 없음
- 버전 표기 0.99 → 0.100

## 되돌리기

- main에서 `e1404d0`을 revert한 뒤 다시 배포합니다.
