# 0.91.0 배포 기록 (2026-09-28)

- 사용자 요청: 같은 사진 재확인("1번 맞아") 후 "적용시켜줘"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/87 (squash 병합, 병합 커밋 `b909b78`)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 66 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36407402728) — success

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.91`
- `output/design/assets/products/xdm-ctr100-pse-front.webp` 공개 파일과 `main`(b909b78) 빌드 결과의 SHA-256이 일치합니다.
- 병합 전 검증: `node --test` 43/43, `build-product-index --check` 30개, `package-site` 통과, `git diff --check` 통과

## 영향

- `data/products/xdm-ctr100-pse.json`의 Front 이미지 데이터(원본 파일·해상도 표기)만 갱신했습니다. 화면상 보이는 사진 내용은 이전과 같습니다(이 사진은 현재 03 단자 지도 합성본에 가려 화면에 직접 렌더링되지 않습니다).
- 버전 표기 0.90 → 0.91

## 되돌리기

- main에서 `b909b78`을 revert한 뒤 다시 배포합니다.
