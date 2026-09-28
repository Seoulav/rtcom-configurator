# 0.92.0 배포 기록 (2026-09-28)

- 사용자 요청: "SPX사진 배경이 블랙이라서 이거 흰색이나 투명으로 가능해", "거리 ft표기는 모든 전송기 제품 사양에 있다면 일괄삭제"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/90 (squash 병합, 병합 커밋 `d044368`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 68 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36408582624) — success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.92`
- 공개 파일 대조: `spx-rx-tx-tx.webp`·`spx-rx-tx-rx.webp`가 `main`(d044368) 빌드 결과와 SHA-256 일치
- 병합 전 검증: `node --test` 43/43, `build-product-index --check` 30개, `package-site` 통과, `git diff --check` 통과, `e2e-smoke`는 playwright 없음으로 건너뜀

## 영향

- SPX-TX/SPX-RX 단자 지도 사진 배경이 검은색에서 흰색으로 바뀜(제품 몸체 색은 유지)
- CT101-U/CR101-U·CT104-U/CR104-U·FT101-U/FR101-U·FT103-U-H/FR103-U·SPX-TX/SPX-RX·SPX 6개 제품의 전송거리 표기에서 ft(피트) 병기가 사라짐(미터·킬로미터만 남음)
- 버전 표기 0.91 → 0.92

## 되돌리기

- main에서 `d044368`을 revert한 뒤 다시 배포합니다.
