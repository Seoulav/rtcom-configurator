# 0.115.0 배포 기록 (2026-09-28)

- 요청: "하단에 장착을 우측으로 배치하고 델리트키는 왼쪽에 배치해줘" (카드 선택 팝업 캡처, 2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/135 (squash 병합)
  - 병합 커밋: `91d5823aabf43a96b139039272a572e0badef085`
  - PR head: `23daabf1`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 110 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36485301899)
  - 결과: success (21:19:17Z → 21:19:48Z), 배포 커밋 `91d5823`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.115`
- 공개 파일 대조: `91d5823`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 303/303 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/qa/card-modal-foot-screens/foot-760.png`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 159/159
  - `git diff --check`: 통과

## 되돌리기

- main에서 `91d5823`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
