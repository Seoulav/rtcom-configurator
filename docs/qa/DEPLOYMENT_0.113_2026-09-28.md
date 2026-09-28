# 0.113.0 배포 기록 (2026-09-28)

- 요청: "후면 장착시 프레임을 XDM,SPx,모두 프레임을 너가 만들어 변경해줘", "다 끝나면 병합 배포해줘" (2026-09-28)
- PR: https://github.com/Seoulav/rtcom-configurator/pull/131 (squash 병합)
  - 병합 커밋: `11f623e19319cae8302795574c4c9c34fe5f88cb`
  - PR head: `254c43df`
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 106 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36439327364)
  - 결과: success (14:53:03Z → 14:53:35Z), 배포 커밋 `11f623e`

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.113`
- 공개 파일 대조: `11f623e`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 303/303 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 5개는 모두 404였습니다: `CLAUDE.md`, `AGENTS.md`, `docs/qa/XDM_SPX_REAR_ART_QA_2026-09-28.md`, `scripts/tools/draw_xdm_spx_rear_frames.cjs`, `input_doc/README.md`
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 46/46
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 157/157
  - `git diff --check`: 통과

## 되돌리기

- main에서 `11f623e`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다(원래 후면 사진 파일은 남아 있어 그대로 돌아갑니다).
