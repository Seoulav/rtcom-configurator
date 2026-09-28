# 0.99.0 배포 기록 (2026-09-28)

- 요청: "COS카드 쪽만 수정하면 될거 같아 COS PHNIX픽에 전원연결되는거 이거든", "xdm-psu만 03 Singal flow 확대해서 볼 수 있게해줘", "이것만 확대 버튼이 만드는건 어때?" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/102 (squash 병합)
  - 병합 커밋: `13e37b877c4ad8d6f1fd127903d7440feaa8d3f6`
  - PR head: `7d4f9ead`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 81 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36417873693)
  - 결과: success (11:48:33Z → 11:49:04Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.99`
- 공개 파일 대조: `13e37b8`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 272/272 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `docs/qa/PSU_SIGNAL_FLOW_QA_2026-09-28.md`, `scripts/e2e-smoke.cjs`, `.claude/settings.json`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 151/151
  - `git diff --check`: 통과

## 되돌리기

- main에서 `13e37b8`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
