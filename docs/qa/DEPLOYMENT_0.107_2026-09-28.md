# 0.107.0 배포 기록 (2026-09-28)

- 요청: "OBHD-2C 사진 속 깨진 글자 복원해주고" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/118 (squash 병합)
  - 병합 커밋: `c2a4686eedc2df905ca65269f6e1fb4859354bd3`
  - PR head: `3fb401f8`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 95 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36431017127)
  - 결과: success (13:46:30Z → 13:47:11Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.107`
- 공개 파일 대조: `c2a4686`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 274/274 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `docs/handoff/OPEN_ITEMS.md`, `docs/qa/OBHD2C_SILK_RESTORE_QA_2026-09-28.md`, `.claude/settings.json`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 152/152
  - `git diff --check`: 통과

## 되돌리기

- main에서 `c2a4686`을 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
