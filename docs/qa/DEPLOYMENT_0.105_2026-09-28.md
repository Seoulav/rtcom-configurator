# 0.105.0 배포 기록 (2026-09-28)

- 요청: "XDM-PSU 이부분에 ㅁ-ㅁ 모양을 뭔가 POWER SUPPLY형상이 없어서 이거 수정가능해?", "02 PORTMAP을 앞면 뒤면을 아래 시그널 플로우 그대로 사용 및 계승해서 앞면 뒷면 만들어줘" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/114 (squash 병합)
  - 병합 커밋: `5d8a9fcbac217928f6facaf8ed5496606e4f19fc`
  - PR head: `8c0c9cc1`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 91 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36428670029)
  - 결과: success (13:26:50Z → 13:27:17Z)

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.105`
- 공개 파일 대조: `5d8a9fc`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 274/274 일치했습니다(`.nojekyll` 제외). 늘어난 2개는 새 앞면·뒷면 그림입니다.
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `docs/qa/PSU_PANEL_ART_QA_2026-09-28.md`, `scripts/tools/draw_xdm_psu_panels.cjs`, `.claude/settings.json`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 152/152
  - `git diff --check`: 통과

## 되돌리기

- main에서 `5d8a9fc`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
