# 0.120.0 배포 기록 (2026-09-28)

- 요청: "VDM카드를 정교하게 맞춰줘" (VDM-16X 카드 장착 캡처, 2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/145 (squash 병합)
  - 병합 커밋: `4177e0fbfcc3c856e88b6f764320e0e6c8079321`
  - PR head: `b126bed6`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 121 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36493994618)
  - 결과: success (22:42:47Z → 22:43:17Z), 배포 커밋 `4177e0f`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.120`
- 공개 파일 대조: `4177e0f`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 304/304 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/vdm-card-fit-screens/vdm-16x.png`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 164/164
  - `git diff --check`: 통과

## 슬롯 칸 비율(세로:가로, 목표 5.7)

| 프레임 | 0.119 | 0.120 |
|---|---|---|
| VDM-16X | 6.18 | 5.70 |
| VDM-64X | 5.06 | 5.70 |
| VDM-128X | 3.89 | 5.70 |
| VDM-180X | 8.16 | 5.70 |
| VDM-256X | 5.17 | 5.70 |
| VDM-8X·32X·48X·80X | 5.57~5.77 | 5.70 |

## 되돌리기

- main에서 `4177e0f`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
